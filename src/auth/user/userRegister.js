import bcrypt from 'bcrypt';
import { User } from '../models/userModel.js'; 
import { insertUser } from '../models/userModel.js';
import { userExist } from './userExist.js'; // Import the userExist function


export async function registerUser(username,password) {
    const user = username;
    const pass = password;

    // Validate input
    if (!user || !pass) {
        return false;
    }

    try {
        // Check if user already exists
        const existingUser = await userExist(user); 
        if (existingUser) {
            return false;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(pass, 10);

        // Create and save the user
        const newUser = new User(username, hashedPassword);
        console.log("New User:", newUser); 
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

