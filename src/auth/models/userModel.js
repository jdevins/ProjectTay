import { connect } from '../utilities/db_helper.js'; 

export class User {
    constructor(username, hashedPassword) {
        this.username = username;
        this.hashedPassword = hashedPassword;
    }
}

export async function insertUser(newUser) {
    console.log("BEGIN Inserting user:", newUser); 
    // Check if the user already exists 

    const query = `
        INSERT INTO users (username, password, created_timestamp) 
        VALUES ($1, $2, NOW())
            ON CONFLICT (username) DO NOTHING 
            RETURNING uuid, username, created_timestamp;
        `;
    const values = [newUser.username, newUser.hashedPassword];
    
    console.log("Query:", query, values);
    console.log("Values:", values);

    //Connect o DB
    const client = await connect();  
    console.log.apply("connected to db");
    //Run Query
    try {
        console.log("Running query:", query, values);
        const qry_result = await client.query(query, values);
        console.log("Query Result:", qry_result);
        return qry_result.rows;
    } catch (error) {
        throw error;
    } finally {
        //Close Connection
        await client.end();
    }
}


