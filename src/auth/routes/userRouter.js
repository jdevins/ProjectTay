import express from 'express';
import '../utilities/logging.js';
import { expressjwt } from 'express-jwt';  
import { userLogin } from '../user/userLogin.js';
import { listUsers,findUserByID,findUserByName } from '../models/userModel.js'; 
import { validateUsername,registerUser } from '../user/userRegister.js'; 

const router = express.Router();

//Parsing Middleware

router.use(express.json()); // Middleware to parse JSON bodies
router.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

// JWT Middleware - AUTH Tokens only
const secret = process.env.SECRET_AUTH_TOKEN_DEV_KEY;
export const jwtMiddleware = expressjwt({ secret, algorithms: ['HS256'] });


//Get Tokens with username and password
router.post('/login', async (req, res) => {
    log.info('Login request received.', { context: 'Routes' });
    if (!req.body.username || !req.body.password) {
        log.warn('Login failed: Missing username or password.');
        return res.status(400).json({ error: 'Username and password are required.' });
    } else {
      const username = req.body.username;
      const password = req.body.password;
      const tokens = await userLogin(username, password); 
    if (tokens) {
      return res.status(200).json(tokens);
    } else {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
  }
});

// Register New Users Endpoint
router.post('/register', async (req, res) => {
  console.log('<><><><>Register request received.', req.body);
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

  // Check if the username is banned
  const isBanned = banFilter(username); 
  if (isBanned) {
    return res.status(400).json({ error: 'Username is banned.' });
  }

  // Begin Registration Process
  const response = await registerUser(username, password);
  if (response) {
    res.status(201).json({ message: 'User registered successfully.' });
  } else {
    res.status(409).json({ error: 'Username already taken.' }); // Changed from 400 to 409
  }
});

router.get('/', jwtMiddleware, async (req, res) => {
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

router.get('/:id', jwtMiddleware, async (req, res) => {
  console.log('Fetching user by ID:', req.params.id);
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }
  try {
    const user = await findUserByID(userId); // Assuming you have a function to list users
    res.status(200).send(user);
  }
  catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;