import { createClient } from 'redis';
import { DbKvStore } from '../models/dbKVmodel.js'; // Import KeyValueStore class

class Redis {
    constructor() {
        this.client = null;
        this.redisDown = global.redisDown; // Check if Redis is down globally
    }

    async connectRedisWithRetry(retries = 0, delay = 2000) {
        try {
            this.client = new createClient({ 
                host: 'localhost', 
                port: 6379 
            });
            this.client.on('error', (err) => {
                log.error('Redis Client Error:', err.code);
                if (err.code === 'ECONNREFUSED') {
                    log.error('Redis connection refused:', err);
                } else {
                    lof.error('Redis Client Error:', err);
                }
            });

            await this.client.connect();
            log.info('Redis client connected successfully');
        } catch (error) {
            if (retries > 0) {
                log.warn(`Redis connection failed. Retrying in ${delay}ms... (${retries} retries left)`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                await this.connectRedisWithRetry(retries - 1, delay);
            } else {
                log.error('Failed to connect to Redis after multiple attempts. Exiting retry loop:', error);
                this.client = null; 
            }
        }
    }

    async fallbackToDB() {
        console.warn('Redis client is not initialized. Falling back to DB storage.');
        return await DbKvStore[method](...args);
    }

    async set(key, value) {
        if (!this.client) {
            return await this.fallbackToDB('set', key, value);
        }
        try {
            await this.client.set(key, value);
            console.log('Key set successfully in Redis:', key, value);
        } catch (error) {
            console.error('Error setting key in Redis. Falling back to DB:', error);
            return await this.fallbackToDB('set', key, value);
        }
    }

    async get(key) {
        if (!this.client) {
            return await this.fallbackToDB('get', key);
        }
        try {
            const value = await this.client.get(key);
            console.log('Key retrieved successfully from Redis:', key, value);
            return value;
        } catch (error) {
            console.error('Error getting key from Redis. Falling back to DB:', error);
            return await this.fallbackToDB('get', key);
        }
    }

    async delete(key) {
        if (!this.client) {
            return await this.fallbackToDB('delete', key);
        }
        try {
            await this.client.del(key);
            console.log('Key deleted successfully from Redis:', key);
        } catch (error) {
            console.error('Error deleting key in Redis. Falling back to DB:', error);
            return await this.fallbackToDB('delete', key);
        }
    }

    async expire(key, seconds) {
        if (!this.client) {
            console.warn('Redis client is not initialized. Skipping expire operation.');
            return;
        }
        try {
            await this.client.expire(key, seconds);
            console.log('Key expiration set successfully:', key, seconds);
        } catch (error) {
            console.error('Error setting key expiration in Redis:', error);
        }
    }

    async increment(key) {
        if (!this.client) {
            console.warn('Redis client is not initialized. Skipping increment operation.');
            return null;
        }
        try {
            const value = await this.client.incr(key);
            console.log('Key incremented successfully:', key, value);
            return value;
        } catch (error) {
            console.error('Error incrementing key in Redis:', error);
        }
    }

    async decrement(key) {
        if (!this.client) {
            console.warn('Redis client is not initialized. Skipping decrement operation.');
            return null;
        }
        try {
            const value = await this.client.decr(key);
            console.log('Key decremented successfully:', key, value);
            return value;
        } catch (error) {
            console.error('Error decrementing key in Redis:', error);
        }
    }

    async closeConnection() {
        if (this.client) {
            try {
                await this.client.quit();
                log.info('Redis connection closed gracefully.');
            } catch (error) {
                log.error('Error closing Redis connection:', error);
            }
        }
    }
}

const redis = new Redis(); // Create an instance of the Redis class

// Graceful shutdown
process.on('SIGINT', async () => {
    log.info('SIGINT received. Closing Redis connection...');
    await redis.closeConnection(); 
    process.exit(0);
});

process.on('SIGTERM', async () => {
    log.info('SIGTERM received. Closing Redis connection...');
    await redis.closeConnection(); 
    process.exit(0);
});

export default Redis;