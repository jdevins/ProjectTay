import {connect }   from '../utilities/db_helper.js'; // Import the connect function from db_helper.js

    async function init() {   
        const client = await connect();
        const query = `
            CREATE TABLE IF NOT EXISTS kv_store (
                id SERIAL PRIMARY KEY,
                key TEXT NOT NULL UNIQUE,
                value TEXT,
                expire_at TIMESTAMP;
            )
        `;
        try {
            await client.query(query);
            console.log('KeyValueStore initialized successfully');
        } catch (error) {
            console.error('Error initializing KeyValueStore:', error);
        } finally {
            client.release();
        }
    }

    init().catch((error) => {
        console.error('Error during initialization:', error);
    });

    