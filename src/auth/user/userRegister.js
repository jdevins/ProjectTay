import bcrypt from 'bcrypt';
import { User } from '../models/userModel.js'; 
import { findUserByName,insertUser } from '../models/userModel.js';
//import { userExist } from './userExist.js'; // Import the userExist function */
var messages = [];

export async function validateUsername(username) {
    // Check if the username and password are acceptable  
    if (!username || username.length < 3 || username.length > 50) {
        messages.push('Username must be at least 3 characters long and at most 50 characters long.'); 
    } 
    if (username.includes(' ')) {
        messages.push('Username cannot contain spaces.');
    }
    const pattern = /^[a-zA-Z0-9._]+$/;
    if (!pattern.test(username)) {
        messages.push('Username contains invalid characters. Only letters, numbers, dots, and underscores are allowed.');
    }
    if (messages.length === 0) {
        return true; // Username is acceptable
    } else {
        return messages;
    } 
}

export async function registerUser(username,password) {

    // Validate input
    if (!username || !password) {
        return false;
    }

    try {
        // Check if user already exists
        const existingUser = await findUserByName(username); 
        if (existingUser) {
            return false;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the user
        const newUser = new User(username, hashedPassword);
        console.log("New User Registered:", newUser); 
        const insert = await insertUser(newUser); 
        if (!insert) {
            return false;
        } 
        return true;
    } catch (error) {
        console.error('Error registering user:', error);
        return false;
    }
}

