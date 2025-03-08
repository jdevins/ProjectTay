import pg from 'pg'
import dotenv from 'dotenv';
dotenv.config();
const { Client } = pg;


//Connect to Database
export async function connect(bool) { 
    const db_client = new Client({
        host: process.env.DB_SERVER,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'api'
        });
    
   
        await db_client.connect();
    
    //Call with Connect(true) to test connection    
    if (bool == true) {            
        try {
            const check = await db_client.query('Select Now()');
            const result = check.rows[0];
            console.log("Database Connected at:",result);
            return (result);
        } catch (error) {
            console.error("Error connecting".error);
        } finally {
            await db_client.end();
            console.log("DB Connection Closed");
        }
  }
}
  //connect();
