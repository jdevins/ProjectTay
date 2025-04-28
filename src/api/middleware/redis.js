import { createClient } from 'redis';


const client = new createClient({ host:'localhost', port:6379 });
client.on('error', (err) => console.error('Redis Client Error', err)); 

await client.connect();
console.log('Redis client connected successfully');


//create standard key format
 
//Modify to use key prefixes and composite keys
// const prefix = 'myapp:'; // Example prefix for all keys
// const compositeKey = `${prefix}${key}`; 
// const value = await client.set(compositeKey, 'myValue'); 
// const value = await client.get(compositeKey); 



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


async function delete_redis_kv(key) {
    try {
        await client.del(key);
        console.log('Key deleted successfully:', key);
    } catch (error) {
        console.error('Error deleting key in Redis:', error);
    }
}

async function expire_redis_kv(key, seconds) {
    try {
        await client.expire(key, seconds);
        console.log('Key expiration set successfully:', key, seconds);
    } catch (error) {
        console.error('Error setting key expiration in Redis:', error);
    }
}

async function increment_redis_kv(key) {
    try {
        const value = await client.incr(key);
        console.log('Key incremented successfully:', key, value);
        return value;
    } catch (error) {
        console.error('Error incrementing key in Redis:', error);
    }
}

async function decrement_redis_kv(key) {
    try {
        const value = await client.decr(key);
        console.log('Key decremented successfully:', key, value);
        return value;
    } catch (error) {
        console.error('Error decrementing key in Redis:', error);
    }
}

module.exports = { 
    set_redis_kv, 
    get_redis_kv,
    delete_redis_kv,
    expire_redis_kv,
    increment_redis_kv,
    decrement_redis_kv
};