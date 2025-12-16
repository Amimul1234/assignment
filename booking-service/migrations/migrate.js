const pool = require('../src/config/database');

async function migrate() {
    try {
        await pool.query('CREATE SCHEMA IF NOT EXISTS booking_service');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings
            (
                id
                SERIAL
                PRIMARY
                KEY,
                user_id
                INTEGER
                NOT
                NULL,
                event_id
                INTEGER
                NOT
                NULL,
                seats
                INTEGER
                NOT
                NULL,
                status
                VARCHAR
            (
                50
            ) DEFAULT 'confirmed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE
            (
                user_id,
                event_id
            )
                )
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id)
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(event_id)
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS events
            (
                id
                SERIAL
                PRIMARY
                KEY,
                title
                VARCHAR
            (
                255
            ) NOT NULL,
                total_seats INTEGER NOT NULL,
                available_seats INTEGER NOT NULL,
                event_date TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
        `);

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();

