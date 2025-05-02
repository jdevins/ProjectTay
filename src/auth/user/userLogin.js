//import { connect } from "../utilities/db_helper.js";
import { findUserByName,confirmPassword } from "../models/userModel.js"; // Import the findUserByName and confirmPassword functions
import token from '../utilities/jwt_handler.js'; // Import the generateToken function


export async function userLogin(username,password) {
    var authToken = '';
    var refreshToken = '';

    //console.log('Starting UserName Exists...', username);
    const isAvailable = await findUserByName(username);
    if (!isAvailable) {
        return false;
    }

    //console.log('Starting Check Password...');
    const pass = await confirmPassword(username,password);
    if (!pass) {
        return false;
    }

    //console.log('Issue Token...');
    authToken = await token.generateToken(username);
    if (!authToken) {
        return false;
    } 

    //console.log('Issue Refresh Token...');    
    refreshToken = await token.generateRefreshToken(username);
    if (!refreshToken) {
        return false;
    } 
    
    //Return Tokens
    //console.log("Token issued:", refreshToken);
    console.log("--Login Success--"); 
    return { authToken, refreshToken };

}

