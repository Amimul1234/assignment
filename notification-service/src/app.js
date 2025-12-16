const express = require('express');
const cors = require('cors');
require('dotenv').config();

const {subscribeToBookings} = require('./config/nats');
const notificationService = require('./services/notificationService');
const healthRoutes = require('./routes/healthRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/health', healthRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.json({
        service: 'notification-service',
        version: '1.0.0',
        status: 'running',
    });
});

subscribeToBookings(async (bookingData) => {
    await notificationService.sendBookingConfirmation(bookingData);
}).catch(err => {
    console.error('Failed to start NATS subscription:', err);
    process.exit(1);
});

app.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
    console.log('Listening for booking events...');
});

module.exports = app;

