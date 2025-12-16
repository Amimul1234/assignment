const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const redis = require('../config/redis');

router.get('/', async (req, res) => {
    res.json({
        status: 'ok',
        service: 'event-service',
        timestamp: new Date().toISOString(),
    });
});

router.get('/ready', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        await redis.ping();

        res.json({
            status: 'ready',
            service: 'event-service',
            checks: {
                database: 'ok',
                redis: 'ok',
            },
        });
    } catch (error) {
        res.status(503).json({
            status: 'not ready',
            service: 'event-service',
            error: error.message,
        });
    }
});

router.get('/live', (req, res) => {
    res.json({
        status: 'alive',
        service: 'event-service',
    });
});

module.exports = router;

