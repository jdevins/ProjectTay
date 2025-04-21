import { connect } from "../utilities/db_helper.js";
import { generateToken,verifyToken } from "../utilities/jwt_handler.js";
import bcrypt from 'bcrypt';


export async function userLogin(username,password) {
    console.log('Verifying User...', username);
    var passToken = '';
    console.log(typeof passToken);

    //Connect
    const client = await connect();

    //Query
    const query = `SELECT password FROM users 
                        WHERE username = $1;`
    const values = [username];

    try {
        const results = await client.query(query, values);

        if (results.rows.length > 0) {
            const hash = results.rows[0].password;
            passToken = hash.toString();
            console.log("Retrieved passToken:", passToken);
            console.log(typeof passToken);
        } else {
            return false;
        }
    } catch (error) {
        console.error('No User Found:', error);
        throw error;
    } finally {
        console.log('Closing database connection...'); 
        client.end();
    }   

    // Check if the password matches the hashed password in the database
    const isValid = await bcrypt.compare(password,passToken);
    
    if (isValid) {
        console.log('Password is valid!');
        // Generate a JWT token for the user
        //const token = generateToken(username);
        //console.log('Generated token:', token);
        //return token; // Return the generated token
        return true;
    } else {
        console.log('Invalid password!');
        return false; // Invalid password
    }
}
            
