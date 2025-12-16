const redis = require('redis');
require('dotenv').config();

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;

const client = redis.createClient({
    socket: {
        host: redisHost,
        port: redisPort,
    },
});

client.on('error', (err) => {
    console.error('Redis Client Error', err);
});

client.on('connect', () => {
    console.log('Redis Client Connected');
});

client.connect().catch(console.error);

module.exports = client;

