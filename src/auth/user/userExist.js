import { connect } from "../utilities/db_helper.js";

export async function userExist(username){
    console.log('Checking if user exists:', username); // Log the username being checked
    const client = await connect();
    const query = 'SELECT * FROM users WHERE username = $1';
    const values = [username];

    try {
        const res = await client.query(query, values);
        console.log('User existence check result:', res.rows.length > 0); // Log the result of the query
        return res.rows.length > 0; // Return true if user exists, false otherwise
    } catch (error) {
        console.error('Error checking user existence:', error);
        throw error;
    } finally {
        console.log('Closing database connection...'); // Log when closing the connection
        client.end();
    }   

}