const pool = require('../src/config/database');

async function migrate() {
    try {
        await pool.query('CREATE SCHEMA IF NOT EXISTS event_service');

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

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date)
        `);

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();

