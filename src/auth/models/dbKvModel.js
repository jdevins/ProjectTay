import { connect } from '../utilities/db_helper.js';

export class DbKvStore {
    static async set(key, value) {
        const client = await connect();
        const query = `
            INSERT INTO kv_store (key, value) 
            VALUES ($1, $2, $3) 
            ON CONFLICT (key) DO UPDATE SET value = $2
        `;

        const values = [key, value];
        try {
            await client.query(query, values);
            console.log('Key set successfully in DB:', key, value, expireAt);
        } catch (error) {
            console.error('Error setting key in DB:', error);
        } finally {
            client.release();
        }
    }

    static async get(key) {
        const client = await connect();
        const query = `
            SELECT value, expire_at 
            FROM kv_store 
            WHERE key = $1
        `;
        const values = [key];
        try {
            const result = await client.query(query, values);
            const row = result.rows[0];
            if (row) {
                if (row.expire_at && new Date(row.expire_at) < new Date()) {
                    console.warn('Key has expired:', key);
                    await this.delete(key); // Automatically delete expired key
                    return null;
                }
                return row.value;
            }
            return null;
        } catch (error) {
            console.error('Error getting key from DB:', error);
            return null;
        } finally {
            client.release();
        }
    }

    static async delete(key) {
        const client = await connect();
        const query = 'DELETE FROM kv_store WHERE key = $1';
        const values = [key];
        try {
            await client.query(query, values);
            console.log('Key deleted successfully from DB:', key);
        } catch (error) {
            console.error('Error deleting key from DB:', error);
        } finally {
            client.release();
        }
    }
}
