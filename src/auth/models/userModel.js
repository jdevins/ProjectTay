import { connect } from '../utilities/db_helper.js'; 
import bcrypt from 'bcrypt'; 

export class User {
    constructor(username, password) {
        this.username = username;
        this.password = password || '';
    }
}

export async function listUsers() {
    const client = await connect();
    const query = 'SELECT username,created_timestamp FROM users';
    
    try {
        const res = await client.query(query);
        const users = res.rows;
        console.log("Users:", { users: users }); 
        return  { users: users }; 
    } catch (error) {
        throw error;
    } finally {
        client.end();
    }   
}

export async function findUserByName(username) {
    const client = await connect();
    const query = 'SELECT * FROM users WHERE username = $1';
    const values = [username];

    try {
        const res = await client.query(query, values);
        return res.rows.length > 0; // Return true if user exists, false otherwise
    } catch (error) {
        throw error;
    } finally {
        client.end();
    }   
}

export async function insertUser(newUser) {
    console.log("BEGIN Inserting user:", newUser); 
    // Check if the user already exists 

    const query = `
        INSERT INTO users (username, password, created_timestamp) 
        VALUES ($1, $2, NOW())
            ON CONFLICT (username) DO NOTHING 
            RETURNING uuid;
        `;
    const values = [newUser.username, newUser.hashedPassword];
    
    //Connect o DB
    const client = await connect();  
    console.log("Connected to db");
    //Run Query
    try {
        const qry_result = await client.query(query, values);
        if(qry_result.rowCount !== 0) {
            return qry_result.rows[0].uuid; // Return the UUID of the inserted user
        } else {
            return false;
        }
    } catch (error) {
        throw error;
    } finally {
        await client.end();
    }
}

export async function confirmPassword(username,password) {
        console.log('Checking Password...', password);
        var hashedPassword = '';
    
        //Connect
        const client = await connect();
    
        //Query for password
        const query = `SELECT password FROM users 
                            WHERE username = $1;`
        const values = [username];
    
        try {
            const results = await client.query(query, values);
    
            if (results.rows.length > 0) {
                const result = results.rows[0].password;
                hashedPassword = result.toString();
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error verifying username:', error);
            return error;
        } finally {
            console.log('Closing database connection...'); 
            client.end();
        }   
    
        // Check if the password matches the hashed password in the database
        console.log("HashedPass", hashedPassword);
        const isValid = await bcrypt.compare(password, hashedPassword);
        if (!isValid) {
            return false;
        }
            return true; // Password is valid

    }      

export async function hashPassword(password) {
    const saltRounds = 10; // Number of rounds for hashing
    const rawPassword = password; // Replace with the password you want to hash

    try {
        const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);
        return hashedPassword;
    } catch (error) {
        throw error;
    }
}

