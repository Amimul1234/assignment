const User = require('../models/User');
const redis = require('../config/redis');

class UserController {
    async createUser(req, res, next) {
        try {
            const {name, email} = req.body;

            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email already exists',
                });
            }

            const user = await User.create(name, email);

            await redis.del('users:all');

            res.status(201).json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserById(req, res, next) {
        try {
            const {id} = req.params;
            const cacheKey = `user:${id}`;

            const cached = await redis.get(cacheKey);
            if (cached) {
                return res.json({
                    success: true,
                    data: JSON.parse(cached),
                    cached: true,
                });
            }

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            await redis.setEx(cacheKey, 300, JSON.stringify(user));

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllUsers(req, res, next) {
        try {
            const cacheKey = 'users:all';

            const cached = await redis.get(cacheKey);
            if (cached) {
                return res.json({
                    success: true,
                    data: JSON.parse(cached),
                    cached: true,
                });
            }

            const users = await User.findAll();

            await redis.setEx(cacheKey, 120, JSON.stringify(users));

            res.json({
                success: true,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();

