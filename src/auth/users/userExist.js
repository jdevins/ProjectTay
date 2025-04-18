import { connect } from "./shared/db_helper.js";

export async function userExist(username){
    const client = await connect();
    const query = 'SELECT * FROM users WHERE username = $1';
    const values = [username];

    try {
        const res = await client.query(query, values);
        return res.rows.length > 0; // Return true if user exists, false otherwise
    } catch (error) {
        console.error('Error checking user existence:', error);
        throw error;
    } finally {
        client.release();
    }   

}