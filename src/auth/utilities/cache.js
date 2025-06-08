import { createClient as createRedisClient } from 'redis';
import { DbKvStore } from '../models/dbKVmodel.js'; // Import KeyValueStore class
import log from './logging.js'; // Import the logger for logging errors and info

// Redis (preferred) and Postgres (fallback)

const redisClient = global.redisClient;
const pgPool = global.pgPool;
const redis_down = global.redis_down || false;

// CREATE TABLE cache (key TEXT PRIMARY KEY, value TEXT, expires_at TIMESTAMPTZ);

export async function setCache(key, value, ttlSeconds = 3600) {
    if (!redis_down && redisClient) {
        try {
            await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
            return true;
        } catch (err) {
            global.redis_down = true;
            // fallback to postgres
        }
    }
    // Fallback to Postgres
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    await pgPool.query(
        `INSERT INTO kv_store(key, value, exp)
         VALUES($1, $2, $3)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at`,
        [key, JSON.stringify(value), expiresAt]
    );
    return true;
}

export async function getCache(key) {
    if (!redis_down && redisClient) {
        try {
            const val = await redisClient.get(key);
            if (val !== null) return JSON.parse(val);
        } catch (err) {
            global.redis_down = true;
            // fallback to postgres
        }
    }
    // Fallback to Postgres
    const res = await pgPool.query(
        `SELECT value, exp FROM cache WHERE key = $1`,
        [key]
    );
    if (res.rowCount === 0) return null;
    const { value, expires_at } = res.rows[0];
    if (expires_at && new Date(expires_at) < new Date()) {
        // expired, delete
        await pgPool.query(`DELETE FROM cache WHERE key = $1`, [key]);
        return null;
    }
    return JSON.parse(value);
}

export async function expireCache(key) {
    if (!redis_down && redisClient) {
        try {
            await redisClient.del(key);
            return true;
        } catch (err) {
            global.redis_down = true;
            // fallback to postgres
        }
    }
    // Fallback to Postgres
    await pgPool.query(`DELETE FROM cache WHERE key = $1`, [key]);
    return true;
}