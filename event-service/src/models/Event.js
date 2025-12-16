const pool = require('../config/database');

class Event {
    static async create(title, totalSeats, eventDate) {
        const query = `
            INSERT INTO events (title, total_seats, available_seats, event_date)
            VALUES ($1, $2, $2, $3) RETURNING *
        `;
        const result = await pool.query(query, [title, totalSeats, eventDate]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = 'SELECT * FROM events WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async findByIdForUpdate(id) {
        const query = 'SELECT * FROM events WHERE id = $1 FOR UPDATE';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async findAll() {
        const query = 'SELECT * FROM events ORDER BY event_date ASC';
        const result = await pool.query(query);
        return result.rows;
    }

    static async update(id, updates) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (updates.title !== undefined) {
            fields.push(`title = $${paramCount++}`);
            values.push(updates.title);
        }
        if (updates.totalSeats !== undefined) {
            fields.push(`total_seats = $${paramCount++}`);
            values.push(updates.totalSeats);
        }
        if (updates.availableSeats !== undefined) {
            fields.push(`available_seats = $${paramCount++}`);
            values.push(updates.availableSeats);
        }
        if (updates.eventDate !== undefined) {
            fields.push(`event_date = $${paramCount++}`);
            values.push(updates.eventDate);
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
            UPDATE events
            SET ${fields.join(', ')}
            WHERE id = $${paramCount} RETURNING *
        `;
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async delete(id) {
        const query = 'DELETE FROM events WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async decrementAvailableSeats(id, seats) {
        const query = `
            UPDATE events
            SET available_seats = available_seats - $1,
                updated_at      = CURRENT_TIMESTAMP
            WHERE id = $2
              AND available_seats >= $1 RETURNING *
        `;
        const result = await pool.query(query, [seats, id]);
        return result.rows[0];
    }
}

module.exports = Event;

