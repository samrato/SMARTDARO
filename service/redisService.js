const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

redisConnection.on('connect', () => {
    console.log('✅ Redis is connected successfully');
});

redisConnection.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
});

module.exports = redisConnection;
