//Create Client
const redis = require('redis');
const cacheHostName = process.env.AZURE_CACHE_FOR_REDIS_HOST_NAME;
const cachePassword = process.env.AZURE_CACHE_FOR_REDIS_ACCESS_KEY;

const cacheClient = redis.createClient({
    // rediss for TLS
    url: `rediss://${cacheHostName}:6380`,
    password: cachePassword
});

// Handle errors
cacheClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

// Export the client
module.exports = cacheClient;
