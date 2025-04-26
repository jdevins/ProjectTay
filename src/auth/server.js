import express from 'express';
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { expressjwt } from 'express-jwt'; 
import { userLogin } from './user/userLogin.js';
import { listUsers } from './models/userModel.js'; 
import { validateUsername,registerUser } from './user/userRegister.js'; 
import { verifyToken} from './utilities/jwt_handler.js';
import { banFilter } from './utilities/banned_text.js'; // Import the banFilter function


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

// Other Middleware
app.use(express.json()); // Parse JSON bodies


app.post('/auth/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const token = await userLogin(username, password); 
    
    if (token) {
      return res.status(200).json({ token: token });
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

app.post('/auth/refreshToken', async (req, res) => {
  res.send('Not Implemented (yet!)');
});

app.get('/auth/protected', jwtMiddleware, (req, res) => {
  res.send('This is a protected route. You are authenticated with a Bearer token!');
});


app.get('/auth/users', jwtMiddleware, async (req, res) => {
  // List all users
   try {
      const users = await listUsers(); // Assuming you have a function to list users
      res.status(200).send(users);
    }
    catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.post('/auth/users/create', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  //Prevent empty username and password from proceeding.
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  
  // Check if username is acceptable (e.g., not empty, valid format, etc.)
  const validation = await validateUsername(username);
  if (!validation) {
    return res.status(400).json({ error: validation.infraction });
  }

  const isBanned = banFilter(username); // Check if the username is banned
  if (isBanned) {
    return res.status(400).json({ error: 'Username is banned.' });
  }

  // Begin Registering
  const response = await registerUser(username, password);
  if (response) {
    res.status(201).json({ message: 'User registered successfully.' });
  } else {
    res.status(400).json({ error: 'Username already taken.' });
  }
})

app.get('/auth/checkbannedUsername', async (req, res) => {
  const username = req.body.username; 
  const bannedUsernames = banFilter(username); 
  if (bannedUsernames === true) {
    res.status(200).json({ username: username, allowed: true });
  } else if (bannedUsernames === false) {
    res.status(200).json({ username: username, allowed: false });
  } else {
    res.status(400).json({ error: 'Error checking banned usernames.' });
  }
});

//Handle 404
app.use((req, res) => {
  res.status(404).send("404: In fairness, do any of us know where we're going?");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
