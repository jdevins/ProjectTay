import express from 'express';
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { expressjwt } from 'express-jwt'; // Updated import for express-jwt
import { registerUser } from './models/userModel.js'; // Import the registerUser function

//PATH ES6 Support
const __filename  = fileURLToPath(import.meta.url);
const __dirname   = path.dirname(__filename);

// Construct the path to .env file
const envPath = path.resolve(__dirname, './config/.env.api.development');
dotenv.config({ path: envPath });

const app = express();


// JWT Support
const secret = process.env.SECRET-AUTH-DEV; // You should store this securely
const jwtMiddleware = expressjwt({ secret, algorithms: ['HS256'] });

app.use(express.json()); // Parse JSON bodies

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // In a real-world app, you'd validate the user against your database
  if (username === 'user' && password === 'password') {
    // Generate a JWT token
    const token = jwt.sign({ username }, secret, { expiresIn: '1h' });
    return res.json({ token });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

app.get('/protected', jwtMiddleware, (req, res) => {
  res.send('This is a protected route. You are authenticated with a Bearer token!');
});

app.post('/register', async (req, res) => {
  const response = await registerUser(req.body.username, req.body.password);
  if (response) {
    res.status(201).json({ message: 'User registered successfully.' });
  } else {
    res.status(400).json({ error: 'Username already taken.' });
  }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
