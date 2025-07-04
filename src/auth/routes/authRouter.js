import express from 'express';
import { expressjwt } from 'express-jwt';  
import token from '../utilities/jwt_handler.js';

const router = express.Router();

//Parsing Middleware

router.use(express.json()); // Middleware to parse JSON bodies
router.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

// JWT Middleware - AUTH Tokens only
const secret = process.env.SECRET_AUTH_TOKEN_DEV_KEY;
export const jwtMiddleware = expressjwt({ secret, algorithms: ['HS256'] });


// Token Verification Endpoint
router.post('/verify', jwtMiddleware, async (req, res) => {
  const tokenValue = req.body.token;
 
  if (!tokenValue) {
    return res.status(403).json({ valid: false, error: 'Token is required.' });
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
    if (decoded && decoded.valid) {
      //Success
      return res.status(200).json({ valid: true, expires: decoded.exp, username: decoded.username, id: decoded.jti });
    } else {
      return res.status(401).json({ valid: false, error: 'Invalid token.' });
    }
  } catch (error) {
    log.error('Error during token verification:', { error: error.message, stack: error.stack });
    return res.status(500).json({ valid: false, error: 'Error performing token validation.' });
  }
});

// Refresh Token Endpoint
router.post('/refresh', jwtMiddleware, async (req, res) => {
  const refreshToken = req.body.refreshToken;
  const newTokens = await token.refreshAuthToken(refreshToken); // Refresh the auth token using the refresh token
  if (newTokens.success) {
    return res.status(200).json({ authToken: newTokens.token, expires: newTokens.tokenExp });
  } else {
    log.warn('Refresh token failed:', { error: newTokens.error });
    return res.status(401).json({ valid: false, error: newTokens.error || 'Invalid refresh token.' });
  }
});

export default router;