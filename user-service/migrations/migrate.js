const pool = require('../src/config/database');

async function migrate() {
    try {
        await pool.query('CREATE SCHEMA IF NOT EXISTS user_service');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users
            (
                id
                SERIAL
                PRIMARY
                KEY,
                name
                VARCHAR
            (
                255
            ) NOT NULL,
                email VARCHAR
            (
                255
            ) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
        `);

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();

