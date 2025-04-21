import express from 'express';
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { expressjwt } from 'express-jwt'; 
import { userLogin } from './user/userLogin.js'; 
import { registerUser } from './user/userRegister.js'; 
import { generateToken,verifyToken} from './utilities/jwt_handler.js';

//PATH ES6 Support
const __filename  = fileURLToPath(import.meta.url);
const __dirname   = path.dirname(__filename);

// Construct the path to .env file
const envPath = path.resolve(__dirname, './config/.env.auth.development');
dotenv.config({ path: envPath });

const app = express();

// JWT Support
const secret = process.env.SECRET_JWT_DEV_KEY;
const jwtMiddleware = expressjwt({ secret, algorithms: ['HS256'] });

app.use(express.json()); // Parse JSON bodies


app.post('/auth/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const is_validUser = await userLogin(username, password); 
  if (is_validUser) {
    const token = await generateToken(username); 
    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
});

app.post('/auth/verifyToken', async (req, res) => {
  console.log("Verifying token...");
  const token = req.body.token;
  try {
    const decoded = await verifyToken(token); 
    if (!decoded===false) {
      const expDate = new Date(decoded.exp * 1000);
      console.log("Token expiration date:", expDate);
      return res.status(200).json({ valid: true, expires: expDate });
    } else{
      return res.status(401).json({ valid: false, error: 'Invalid token.' });     
    }
  } catch (error) {
    return res.status(401).json({ valid: false, error: 'Error performing token validation' });
  }
});

app.get('/auth/protected', jwtMiddleware, (req, res) => {
  res.send('This is a protected route. You are authenticated with a Bearer token!');
});

app.post('/auth/register', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log("Registering user:", username, password);
  const response = await registerUser(username, password);
  if (response) {
    res.status(201).json({ message: 'User registered successfully.' });
  } else {
    res.status(400).json({ error: 'Username already taken.' });
  }
})

//Handle 404
app.use((req, res) => {
  res.status(404).send("404: In fairness, do any of us know where we're going?");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
