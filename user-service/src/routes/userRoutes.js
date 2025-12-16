const express = require('express');
const router = express.Router();
const {body, param} = require('express-validator');
const userController = require('../controllers/userController');
const validate = require('../middleware/validate');

router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
    ],
    validate,
    userController.createUser
);

router.get('/', userController.getAllUsers);

router.get(
    '/:id',
    [param('id').isInt({min: 1}).withMessage('Valid user ID is required')],
    validate,
    userController.getUserById
);

module.exports = router;

