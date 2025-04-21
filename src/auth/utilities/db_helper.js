import pg from 'pg'
import dotenv from 'dotenv';

dotenv.config();
const { Client } = pg;


//Connect to Database
export async function connect() { 
    
    console.log('Connecting to the database...');
    const client = new Client({
        host:       process.env.DB_SERVER,
        port:       parseInt(process.env.DB_PORT),
        user:       process.env.DB_USER,
        password:   process.env.DB_PASSWORD,
        database:   'auth'
    });
    
    try {
        await client.connect();
        console.log('Connected to the database successfully!');
        return client;
    } catch (error) {
        throw error;
    }
}