import { createClient } from 'redis';


const client = new createClient({ host:'localhost', port:6379 });
client.on('error', (err) => console.error('Redis Client Error', err)); 
await client.connect();
console.log('Redis client connected successfully');

async function set_redis_kv(key,value) {
    try {
        await client.set(key, value);
        console.log('Key set successfully:', key, value);
    } catch (error) {
        console.error('Error setting key in Redis:', error);
    }
}

async function get_redis_kv(key) {
    try {
        const value = await client.get(key);
        console.log('Key retrieved successfully:', key, value);
        return value;
    } catch (error) {
        console.error('Error getting key from Redis:', error);
    }
}

export { set_redis_kv, get_redis_kv };