const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const redis = require('../config/redis');
const {getNatsClient} = require('../config/nats');

router.get('/', async (req, res) => {
    res.json({
        status: 'ok',
        service: 'booking-service',
        timestamp: new Date().toISOString(),
    });
});

router.get('/ready', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        await redis.ping();

        const nats = await getNatsClient();
        if (!nats) {
            throw new Error('NATS not connected');
        }

        res.json({
            status: 'ready',
            service: 'booking-service',
            checks: {
                database: 'ok',
                redis: 'ok',
                nats: 'ok',
            },
        });
    } catch (error) {
        res.status(503).json({
            status: 'not ready',
            service: 'booking-service',
            error: error.message,
        });
    }
});

router.get('/live', (req, res) => {
    res.json({
        status: 'alive',
        service: 'booking-service',
    });
});

module.exports = router;

