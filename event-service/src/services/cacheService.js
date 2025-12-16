const redis = require('../config/redis');

class CacheService {
    constructor() {
        this.defaultTTL = 300;
    }

    async get(key) {
        try {
            const cached = await redis.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    async set(key, value, ttl = this.defaultTTL) {
        try {
            await redis.setEx(key, ttl, JSON.stringify(value));
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    async del(key) {
        try {
            await redis.del(key);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }

    async delPattern(pattern) {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(keys);
            }
        } catch (error) {
            console.error('Cache delete pattern error:', error);
        }
    }

    getEventKey(id) {
        return `event:${id}`;
    }

    getEventsListKey() {
        return 'events:all';
    }
}

module.exports = new CacheService();

