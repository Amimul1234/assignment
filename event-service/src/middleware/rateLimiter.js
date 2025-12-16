const rateLimit = require('express-rate-limit');
const redis = require('../config/redis');
require('dotenv').config();

class RedisStore {
    constructor(options) {
        this.client = options.client;
        this.prefix = options.prefix || 'rl:';
    }

    async increment(key) {
        const redisKey = `${this.prefix}${key}`;
        const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
        const windowSeconds = Math.ceil(windowMs / 1000);

        try {
            if (this.client.isOpen === false) {
                await this.client.connect().catch(() => {
                });
            }

            const count = await this.client.incr(redisKey);
            if (count === 1) {
                await this.client.expire(redisKey, windowSeconds);
            }

            const ttl = await this.client.ttl(redisKey);
            const resetTime = ttl > 0
                ? new Date(Date.now() + (ttl * 1000))
                : new Date(Date.now() + windowMs);

            return {
                totalHits: count,
                resetTime: resetTime,
            };
        } catch (err) {
            console.error('Redis store error:', err.message || err);
            return {
                totalHits: 1,
                resetTime: new Date(Date.now() + windowMs),
            };
        }
    }

    async decrement(key) {
        const redisKey = `${this.prefix}${key}`;
        await this.client.decr(redisKey);
    }

    async resetKey(key) {
        const redisKey = `${this.prefix}${key}`;
        await this.client.del(redisKey);
    }
}

const createRateLimiter = () => {
    return rateLimit({
        store: new RedisStore({
            client: redis,
            prefix: 'rl:event-service:',
        }),
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });
};

module.exports = createRateLimiter;

