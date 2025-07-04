import express from 'express';
import { expressjwt } from 'express-jwt';  
import { banFilter } from '../utilities/banned_text.js'; 
import Redis from '../../_shared/redis_helper.js'; 

const router = express.Router();

//Parsing Middleware

router.use(express.json()); // Middleware to parse JSON bodies
router.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

// JWT Middleware - AUTH Tokens only
const secret = process.env.SECRET_AUTH_TOKEN_DEV_KEY;
export const jwtMiddleware = expressjwt({ secret, algorithms: ['HS256'] });


// Redis Test Endpoint
router.get('/auth/utils/redis/test',jwtMiddleware, async (req, res) => {
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

router.get('/auth/utils/checkusername', async (req, res) => {
  const username = req.query.username; // Changed from req.body.username

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

export default router;