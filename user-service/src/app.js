const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const createRateLimiter = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(logger);

const rateLimiter = createRateLimiter();
app.use('/api/', rateLimiter);

app.use('/api/users', userRoutes);
app.use('/health', healthRoutes);

app.get('/', (req, res) => {
    res.json({
        service: 'user-service',
        version: '1.0.0',
        status: 'running',
    });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});

module.exports = app;

