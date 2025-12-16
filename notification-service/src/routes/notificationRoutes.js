const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');

router.get('/', (req, res) => {
    const notifications = notificationService.getAllNotifications();
    res.json({
        success: true,
        data: notifications,
    });
});

router.get('/user/:userId', (req, res) => {
    const {userId} = req.params;
    const notifications = notificationService.getNotificationsByUserId(parseInt(userId));
    res.json({
        success: true,
        data: notifications,
    });
});

module.exports = router;

