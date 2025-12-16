const pool = require('../config/database');

class User {
    static async create(name, email) {
        const query = `
            INSERT INTO users (name, email)
            VALUES ($1, $2) RETURNING *
        `;
        const result = await pool.query(query, [name, email]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async findAll() {
        const query = 'SELECT * FROM users ORDER BY created_at DESC';
        const result = await pool.query(query);
        return result.rows;
    }

    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }
}

module.exports = User;

