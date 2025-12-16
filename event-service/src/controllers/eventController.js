const Event = require('../models/Event');
const cacheService = require('../services/cacheService');

class EventController {
    async createEvent(req, res, next) {
        try {
            const {title, totalSeats, eventDate} = req.body;

            const event = await Event.create(title, totalSeats, eventDate);

            await cacheService.del(cacheService.getEventsListKey());

            res.status(201).json({
                success: true,
                data: event,
            });
        } catch (error) {
            next(error);
        }
    }

    async getEventById(req, res, next) {
        try {
            const {id} = req.params;
            const cacheKey = cacheService.getEventKey(id);

            const cached = await cacheService.get(cacheKey);
            if (cached) {
                return res.json({
                    success: true,
                    data: cached,
                    cached: true,
                });
            }

            const event = await Event.findById(id);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found',
                });
            }

            await cacheService.set(cacheKey, event, 300);

            res.json({
                success: true,
                data: event,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllEvents(req, res, next) {
        try {
            const cacheKey = cacheService.getEventsListKey();

            const cached = await cacheService.get(cacheKey);
            if (cached) {
                return res.json({
                    success: true,
                    data: cached,
                    cached: true,
                });
            }

            const events = await Event.findAll();

            await cacheService.set(cacheKey, events, 120);

            res.json({
                success: true,
                data: events,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateEvent(req, res, next) {
        try {
            const {id} = req.params;
            const updates = req.body;

            const event = await Event.update(id, updates);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found',
                });
            }

            await cacheService.del(cacheService.getEventKey(id));
            await cacheService.del(cacheService.getEventsListKey());

            res.json({
                success: true,
                data: event,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteEvent(req, res, next) {
        try {
            const {id} = req.params;

            const event = await Event.delete(id);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found',
                });
            }

            await cacheService.del(cacheService.getEventKey(id));
            await cacheService.del(cacheService.getEventsListKey());

            res.json({
                success: true,
                message: 'Event deleted successfully',
                data: event,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new EventController();

