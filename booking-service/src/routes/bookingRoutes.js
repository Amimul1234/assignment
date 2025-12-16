const express = require('express');
const router = express.Router();
const {body, param} = require('express-validator');
const bookingController = require('../controllers/bookingController');
const validate = require('../middleware/validate');

router.post(
    '/',
    [
        body('userId').isInt({min: 1}).withMessage('Valid user ID is required'),
        body('eventId').isInt({min: 1}).withMessage('Valid event ID is required'),
        body('seats').isInt({min: 1}).withMessage('Seats must be a positive integer'),
    ],
    validate,
    bookingController.createBooking
);

router.get('/', bookingController.getAllBookings);

router.get(
    '/:id',
    [param('id').isInt({min: 1}).withMessage('Valid booking ID is required')],
    validate,
    bookingController.getBookingById
);

router.get(
    '/user/:userId',
    [param('userId').isInt({min: 1}).withMessage('Valid user ID is required')],
    validate,
    bookingController.getBookingsByUser
);

module.exports = router;

