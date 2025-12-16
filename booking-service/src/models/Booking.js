const pool = require('../config/database');

class Booking {
    static async create(userId, eventId, seats) {
        const query = `
            INSERT INTO bookings (user_id, event_id, seats, status)
            VALUES ($1, $2, $3, 'confirmed') RETURNING *
        `;
        const result = await pool.query(query, [userId, eventId, seats]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = 'SELECT * FROM bookings WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async findAll() {
        const query = 'SELECT * FROM bookings ORDER BY created_at DESC';
        const result = await pool.query(query);
        return result.rows;
    }

    static async findByUserId(userId) {
        const query = 'SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC';
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    static async findByUserAndEvent(userId, eventId) {
        const query = 'SELECT * FROM bookings WHERE user_id = $1 AND event_id = $2';
        const result = await pool.query(query, [userId, eventId]);
        return result.rows[0];
    }
}

module.exports = Booking;

