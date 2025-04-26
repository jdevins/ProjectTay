//import { connect } from "../utilities/db_helper.js";
import { findUserByName,confirmPassword } from "../models/userModel.js";
import { generateToken } from "../utilities/jwt_handler.js"; // Import the generateToken function


export async function userLogin(username,password) {
    console.log('Starting UserName Exists...', username);
    const exists = await findUserByName(username);
    if (!exists) {
        return false;
    }
    console.log('Starting Check Password...');
    const pass = await confirmPassword(username,password);
    if (!pass) {
        return false;
    }
    console.log('Issue Token...');
    const token = await generateToken(username);
    if (!token) {
        return false;
    } else {
        return token;
    }
}

