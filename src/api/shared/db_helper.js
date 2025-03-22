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
        console.log("Database Connection Opened");
    
    //Call with Connect(true) to test connection    
    if (bool == true) {            
        try {
            const check = await db_client.query('Select Now() as timestamp');
            const result = check.rows[0];
            console.log(result);
            if (result != undefined)
            return ({type: "Database",status: "Successful", timestamp: result.timestamp});
        else 
            return ({type: "Database",status: "Database Connection Failed", timestamp: now()});
        } catch (error) {
            console.error("Error connecting".error);
        } finally {
            await db_client.end();
            console.log("Database Connection Closed");
        }
  }
}
