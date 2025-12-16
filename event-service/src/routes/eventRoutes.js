const express = require('express');
const router = express.Router();
const {body, param} = require('express-validator');
const eventController = require('../controllers/eventController');
const validate = require('../middleware/validate');

router.post(
    '/',
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('totalSeats').isInt({min: 1}).withMessage('Total seats must be a positive integer'),
        body('eventDate').isISO8601().withMessage('Valid event date is required'),
    ],
    validate,
    eventController.createEvent
);

router.get('/', eventController.getAllEvents);

router.get(
    '/:id',
    [param('id').isInt({min: 1}).withMessage('Valid event ID is required')],
    validate,
    eventController.getEventById
);

router.put(
    '/:id',
    [
        param('id').isInt({min: 1}).withMessage('Valid event ID is required'),
        body('title').optional().trim().notEmpty(),
        body('totalSeats').optional().isInt({min: 1}),
        body('eventDate').optional().isISO8601(),
    ],
    validate,
    eventController.updateEvent
);

router.delete(
    '/:id',
    [param('id').isInt({min: 1}).withMessage('Valid event ID is required')],
    validate,
    eventController.deleteEvent
);

module.exports = router;

