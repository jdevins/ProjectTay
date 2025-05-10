import pg from 'pg';
import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from 'url';

//PATH ES6 Support
const __filename  = fileURLToPath(import.meta.url);
const __dirname   = path.dirname(__filename);

// Construct the path to .env file
const envPath = path.resolve(__dirname, '../config/.env.auth.development');
dotenv.config({ path: envPath });


dotenv.config();
const { Pool } = pg;

// Create a connection pool
const pool = new Pool({
    host:       process.env.DB_SERVER,
    port:       parseInt(process.env.DB_PORT),
    user:       process.env.DB_USER,
    password:   process.env.DB_PASSWORD,
    database:   'auth'
});

// Connect to Database
export async function connect() {
    try {
        const client = await pool.connect(); // Get a client from the pool
        log.info('___Connection acquired from pool!');
        return client;
    } catch (error) {
        log.error('___Error acquiring connection from pool:', error);
        throw error;
    }
}