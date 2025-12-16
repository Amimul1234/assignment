const axios = require('axios');

class EventService {
    constructor() {
        this.baseURL = process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
    }

    async getEvent(eventId) {
        try {
            const response = await axios.get(`${this.baseURL}/api/events/${eventId}`);
            return response.data.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return null;
            }
            throw new Error(`Failed to fetch event: ${error.message}`);
        }
    }

    async decrementSeats(eventId, seats) {
        try {
            const pool = require('../config/database');
            const query = `
                UPDATE events
                SET available_seats = available_seats - $1,
                    updated_at      = CURRENT_TIMESTAMP
                WHERE id = $2
                  AND available_seats >= $1 RETURNING *
            `;
            const result = await pool.query(query, [seats, eventId]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to decrement seats: ${error.message}`);
        }
    }
}

module.exports = new EventService();

