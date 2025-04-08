import pg from 'pg'
import dotenv from 'dotenv';

dotenv.config();
const { Client } = pg;


//Connect to Database
export async function connect() { 
    const client = new Client({
        host: process.env.DB_SERVER,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'api'
    });
    
    try {
        console.log(process.env.DB_PASSWORD);
        await client.connect();
        console.log("Database Connection Opened");
        return client;
    } catch (error) {
        throw error;
    }

/* export async function test_connection() {
    
    try {
        await connect();
            const check = await db_client.query('Select Now() as timestamp');
            const result = check.rows[0];
            if (result != undefined)
                return ({type: "Database",status: "Successful", timestamp: result.timestamp});
            else 
                return ({type: "Database",status: "Database Connection Failed", timestamp: now()});
        } catch (error) {
            console.error("Error connecting".error);
        } finally {
            await db_client.end();
            console.log("Test Database Connection Closed");
        }
  } */
}
