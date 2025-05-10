import { findUserByName,confirmPassword } from "../models/userModel.js";
import token from '../utilities/jwt_handler.js'; 

export async function userLogin(username,password) {
    var authToken = '';
    var refreshToken = '';

    //console.log('Starting UserName Exists...', username);
    const isAvailable = await findUserByName(username);
    if (!isAvailable) {
        return {error: "username not found"};
    }

    //console.log('Starting Check Password...');
    const pass = await confirmPassword(username,password);
    if (!pass) {
        return {error: "password invalid"};
    }

    //console.log('Issue Token...');
    authToken = await token.generateAuthToken(username);
    if (!authToken) {
        return {error: "token generation failed"};
    } 

    //console.log('Issue Refresh Token...');    
    refreshToken = await token.generateRefreshToken(username);
    if (!refreshToken) {
        return {error: "refresh token generation failed"};
    } 
    
    //Return Tokens
    console.log("--Login Success--"); 
    return {authToken:authToken, refreshToken:refreshToken}; 

}

