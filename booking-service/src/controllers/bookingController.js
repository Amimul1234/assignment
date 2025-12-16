const Booking = require('../models/Booking');
const userService = require('../services/userService');
const eventService = require('../services/eventService');
const lockService = require('../services/lockService');
const {publishBookingEvent} = require('../config/nats');
const pool = require('../config/database');

class BookingController {
    async createBooking(req, res, next) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const {userId, eventId, seats} = req.body;

            const user = await userService.getUser(userId);
            if (!user) {
                await client.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            const lockKey = lockService.getEventLockKey(eventId);
            const lockAcquired = await lockService.acquireLock(lockKey, 10);

            if (!lockAcquired) {
                await client.query('ROLLBACK');
                return res.status(409).json({
                    success: false,
                    message: 'Another booking is in progress for this event. Please try again.',
                });
            }

            try {
                // Get event with row-level lock (FOR UPDATE)
                const eventQuery = 'SELECT * FROM events WHERE id = $1 FOR UPDATE';
                const eventResult = await client.query(eventQuery, [eventId]);
                const event = eventResult.rows[0];

                if (!event) {
                    await client.query('ROLLBACK');
                    await lockService.releaseLock(lockKey);
                    return res.status(404).json({
                        success: false,
                        message: 'Event not found',
                    });
                }

                // Check if user already has a booking for this event (within transaction)
                const existingBookingQuery = 'SELECT * FROM bookings WHERE user_id = $1 AND event_id = $2';
                const existingBookingResult = await client.query(existingBookingQuery, [userId, eventId]);
                if (existingBookingResult.rows.length > 0) {
                    await client.query('ROLLBACK');
                    await lockService.releaseLock(lockKey);
                    return res.status(409).json({
                        success: false,
                        message: 'You already have a booking for this event',
                    });
                }

                // Check seat availability
                if (event.available_seats < seats) {
                    await client.query('ROLLBACK');
                    await lockService.releaseLock(lockKey);
                    return res.status(400).json({
                        success: false,
                        message: `Only ${event.available_seats} seats available`,
                    });
                }

                // Decrement available seats atomically
                const updateQuery = `
                    UPDATE events
                    SET available_seats = available_seats - $1,
                        updated_at      = CURRENT_TIMESTAMP
                    WHERE id = $2
                      AND available_seats >= $1 RETURNING *
                `;
                const updateResult = await client.query(updateQuery, [seats, eventId]);

                if (updateResult.rows.length === 0) {
                    await client.query('ROLLBACK');
                    await lockService.releaseLock(lockKey);
                    return res.status(400).json({
                        success: false,
                        message: 'Seats no longer available',
                    });
                }

                // Create booking (within transaction)
                const bookingQuery = `
                    INSERT INTO bookings (user_id, event_id, seats, status)
                    VALUES ($1, $2, $3, 'confirmed') RETURNING *
                `;
                const bookingResult = await client.query(bookingQuery, [userId, eventId, seats]);
                const booking = bookingResult.rows[0];

                await client.query('COMMIT');
                await lockService.releaseLock(lockKey);

                publishBookingEvent({
                    id: booking.id,
                    userId: booking.user_id,
                    eventId: booking.event_id,
                    seats: booking.seats,
                    status: booking.status,
                    createdAt: booking.created_at,
                }).catch(err => {
                    console.error('Failed to publish booking event:', err);
                });

                res.status(201).json({
                    success: true,
                    data: booking,
                });
            } catch (error) {
                await client.query('ROLLBACK');
                await lockService.releaseLock(lockKey);
                throw error;
            }
        } catch (error) {
            next(error);
        } finally {
            client.release();
        }
    }

    async getBookingById(req, res, next) {
        try {
            const {id} = req.params;
            const booking = await Booking.findById(id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found',
                });
            }

            res.json({
                success: true,
                data: booking,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllBookings(req, res, next) {
        try {
            const bookings = await Booking.findAll();
            res.json({
                success: true,
                data: bookings,
            });
        } catch (error) {
            next(error);
        }
    }

    async getBookingsByUser(req, res, next) {
        try {
            const {userId} = req.params;
            const bookings = await Booking.findByUserId(userId);
            res.json({
                success: true,
                data: bookings,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BookingController();

