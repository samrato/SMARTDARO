const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

redisConnection.on('connect', () => {
    console.log('✅ Redis cache is connected successfully');
});

redisConnection.on('error', (err) => {
    console.error('❌ Redis cache connection error:', err);
});

const getCache = async (key) => {
    try {
        const val = await redisConnection.get(key);
        return val ? JSON.parse(val) : null;
    } catch (err) {
        console.error("Cache Read Error:", err);
        return null;
    }
};

const setCache = async (key, val, ttlSeconds = 300) => {
    try {
        await redisConnection.set(key, JSON.stringify(val), 'EX', ttlSeconds);
    } catch (err) {
        console.error("Cache Write Error:", err);
    }
};

const deleteCache = async (key) => {
    try {
        await redisConnection.del(key);
    } catch (err) {
        console.error("Cache Delete Error:", err);
    }
};

const clearPattern = async (pattern) => {
    try {
        let cursor = '0';
        do {
            const reply = await redisConnection.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = reply[0];
            const keys = reply[1];
            if (keys && keys.length > 0) {
                await redisConnection.del(...keys);
            }
        } while (cursor !== '0');
    } catch (err) {
        console.error("Cache Clear Error:", err);
    }
};

module.exports = {
    redisConnection,
    getCache,
    setCache,
    deleteCache,
    clearPattern
};
