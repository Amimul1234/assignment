const redis = require('../config/redis');

class LockService {
    constructor() {
        this.defaultTTL = 10;
    }

    async acquireLock(key, ttl = this.defaultTTL) {
        try {
            const lockKey = `lock:${key}`;
            const result = await redis.setNX(lockKey, '1');

            if (result) {
                await redis.expire(lockKey, ttl);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Lock acquire error:', error);
            return false;
        }
    }

    async releaseLock(key) {
        try {
            const lockKey = `lock:${key}`;
            await redis.del(lockKey);
        } catch (error) {
            console.error('Lock release error:', error);
        }
    }

    getEventLockKey(eventId) {
        return `event:${eventId}`;
    }
}

module.exports = new LockService();

