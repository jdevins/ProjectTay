import express from 'express';
import { expressjwt } from 'express-jwt'; 
import { userLogin } from './user/userLogin.js';
import { listUsers,findUserByID,findUserByName } from './models/userModel.js'; 
import { validateUsername,registerUser } from './user/userRegister.js'; 
import token from './utilities/jwt_handler.js';
import { banFilter } from './utilities/banned_text.js'; 
import Redis from './utilities/redis_helper.js'; 
import './utilities/logging.js'; // Logging available globally
import { initializeEnv } from './utilities/env_helper.js'; 

log.info('Server is starting...', {context: 'Startup'});

// Initialize environment variables
initializeEnv('./config/.env.auth.development');

const app = express();

// Log incoming requests
app.use((req, res, next) => {
    log.info(`Request: ${req.method} ${req.url}`, { context: 'Routes' });
    res.on('finish', () => {
        log.info(`Response: ${res.statusCode} for ${req.method} ${req.url}`);
    });
    next();
});

// JWT Middleware - AUTH Tokens only
const secret = process.env.SECRET_AUTH_TOKEN_DEV_KEY;
const jwtMiddleware = expressjwt({ secret, algorithms: ['HS256'] });

// Other Middleware
app.use(express.json()); // Parse JSON bodies

app.post('/auth/login', async (req, res) => {
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

app.post('/auth/token/verify', async (req, res) => {
  const tokenValue = req.body.token;
 
  if (!tokenValue) {
    return res.status(400).json({ valid: false, error: 'Token is required.' });
  }

  let isRefresh = false; // Default to false

  if (req.query.isRefreshToken) {
    try {
      isRefresh = JSON.parse(req.query.isRefreshToken.toLowerCase());
    } catch (parseError) {
      log.warn('Invalid isRefreshToken query parameter.', { context: 'Route' });
      return res.status(400).json({ valid: false, error: 'Invalid isRefreshToken query parameter.' });
    }
  }
  try {
    const decoded = await token.verifyToken(tokenValue, isRefresh); 
    if (decoded) {
      //Success
      return res.status(200).json({ valid: true, expires: decoded.exp, username: decoded.username });
    } else {
      return res.status(401).json({ valid: false, error: 'Invalid token.' });
    }
  } catch (error) {
    log.error('Error during token verification:', { error: error.message, stack: error.stack });
    return res.status(500).json({ valid: false, error: 'Error performing token validation.' });
  }
});

app.post('/auth/token/refresh', async (req, res) => {
  const refreshToken = req.body.token;

  const decoded = await token.verifyToken(refreshToken, true);
  if (!decoded) {
    return res.status(401).json({ valid: false, error: 'Invalid refresh token.' });
  }
  if (decoded.type == 'refresh') {
    const authToken = await token.generateAuthToken(decoded.username);
    const newRefreshToken = await token.generateRefreshToken(decoded.username);
    if (!authToken || !newRefreshToken) {
      return res.status(401).json({ valid: false, error: 'Error generating new tokens.' });
    }
    return res.status(200).json({ authToken, refreshToken: newRefreshToken });
  }
  res.send({ refreshToken });
});

app.get('/auth/protected', jwtMiddleware, (req, res) => {
  res.status(200).send('This is a protected route. You are authenticated with a Bearer token!');
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

app.get('/auth/user/:id', async (req, res) => {
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

app.post('/auth/user', async (req, res) => {
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
    res.status(409).json({ error: 'Username already taken.' }); // Changed from 400 to 409
  }
});

app.get('/auth/utils/validate/username', async (req, res) => {
  const username = req.body.username; 

  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  try {
    const isAvailable = await findUserByName(username);
    if (isAvailable) {
      return res.status(200).json({ username: username, available: false });
    }

    const isBanned = banFilter(username); 
    if (isBanned) {
      return res.status(200).json({ username: username, allowed: false });
    } else {
      return res.status(200).json({ username: username, allowed: true });
    }
  } catch (error) {
    console.error('Error checking username availability:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/auth/redis/test', async (req, res) => {
  const redisInstance = new Redis(); // Create a new instance of the Redis class
  const key = 'testKey';
  const value = 'testValue';
  try {
    await redisInstance.connectRedisWithRetry();
    await redisInstance.set(key, value); 
    const retrievedValue = await redisInstance.get(key);
    await redisInstance.delete(key); 
    res.status(200).json({ message: 'Redis test successful', retrievedValue });
  } catch (error) {
    global.redisDown = true; 
    console.error('Error interacting with Redis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Handle 404
app.use((req, res) => {
  res.status(404).send("404: In fairness, do any of us know where we're going?");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  log.info(`Auth is up on ${PORT}, Go for it!`, { context: 'Startup'});
});
