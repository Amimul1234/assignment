const express = require('express');
const cors = require('cors');
require('dotenv').config();

const eventRoutes = require('./routes/eventRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const createRateLimiter = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(logger);

const rateLimiter = createRateLimiter();
app.use('/api/', rateLimiter);

app.use('/api/events', eventRoutes);
app.use('/health', healthRoutes);

app.get('/', (req, res) => {
    res.json({
        service: 'event-service',
        version: '1.0.0',
        status: 'running',
    });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Event Service running on port ${PORT}`);
});

module.exports = app;

