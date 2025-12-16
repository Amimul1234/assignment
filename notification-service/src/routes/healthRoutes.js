const express = require('express');
const router = express.Router();
const {connectNats} = require('../config/nats');

router.get('/', async (req, res) => {
    res.json({
        status: 'ok',
        service: 'notification-service',
        timestamp: new Date().toISOString(),
    });
});

router.get('/ready', async (req, res) => {
    try {
        const nats = await connectNats();
        if (!nats) {
            throw new Error('NATS not connected');
        }

        res.json({
            status: 'ready',
            service: 'notification-service',
            checks: {
                nats: 'ok',
            },
        });
    } catch (error) {
        res.status(503).json({
            status: 'not ready',
            service: 'notification-service',
            error: error.message,
        });
    }
});

router.get('/live', (req, res) => {
    res.json({
        status: 'alive',
        service: 'notification-service',
    });
});

module.exports = router;

