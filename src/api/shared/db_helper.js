import pg from 'pg'
import dotenv from 'dotenv';
dotenv.config();

console.log("DB_SERVER", process.env.DB_SERVER);
const { Client } = pg;


export async function connect() { 
    const db_client = new Client({
        host: process.env.DB_SERVER,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'api'
        });
    
   
        await db_client.connect();
        try{
        const check = await db_client.query('Select Now()');
        console.log(check.rows[0]);
        return JSON.stringify(check.rows[0]);
    //return db_client;
    } catch (error) {
        console.error("Error connecting".error);
    } finally {
        await db_client.end();
        console.log("DB Connection Closed");
    }
  }
  connect();
