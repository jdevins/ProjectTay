import bcrypt from 'bcrypt';
import { User } from '../models/user'; // Assuming a User model exists
const bcrypt = require('bcrypt');
const { User } = require('../models/user'); // Assuming a User model exists

async function registerUser(req, res) {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        // Check if user already exists
        //const existingUser = await User.findOne({ username });
        const existingUser = await userExist(username); 
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the user
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}

module.exports = { registerUser };