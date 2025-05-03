import jwt from 'jsonwebtoken';
import redis from './redis_helper.js';

class Token {
    constructor() {
        this.authSecret = process.env.SECRET_AUTH_TOKEN_DEV_KEY;
        this.authExp = process.env.ACCESS_TOKEN_EXPIRATION;
        this.refreshSecret = process.env.SECRET_REFRESH_TOKEN_DEV_KEY;
        this.refreshExp = process.env.REFRESH_TOKEN_EXPIRATION;
    }

    async generateAuthToken(username) {
        const tokenType = 'auth';
        const expiresIn = this.authExp; 
        const token = jwt.sign({ username, tokenType }, this.authSecret, { expiresIn }); // Removed 'exp' from payload
        return { authToken:token, expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() }; // Calculate expiration time
    }

    async generateRefreshToken(username) {
        console.log("Generating refresh token for user:", username);
        const tokenType = 'refresh';
        const expiresIn = this.refreshExp;
        const token = jwt.sign({ username, tokenType }, this.refreshSecret, { expiresIn }); // Removed 'exp' from payload
        console.log("Refresh token issued:", token);
        return { refreshToken:token, expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() }
    }

    async verifyToken(token, isRefresh) {
        const secret = isRefresh ? this.refreshSecret : this.authSecret;
        log.info(`Using ${isRefresh ? 'refreshSecret' : 'authSecret'}`);
        try {
            const decoded = jwt.verify(token, secret); // Verify the token's signature
            log.info("Token is valid and not expired.");
            return decoded;
        } catch (error) {
            log.error('Token verification failed:', error.message);
            return { valid: false, error: error.message }; // Return the error message
        }
    }
    
    async decodeToken(token) {
        try {
            const decoded = jwt.decode(token);
            return {
                username: decoded.username,
                type: decoded.tokenType,
                exp: new Date(decoded.exp * 1000),
                iat: new Date(decoded.iat * 1000),
            };
        } catch (error) {
            console.error('Token decoding failed:', error);
            return false;
        }
    }
    
    async cacheAuthToken(userId, authToken) {
        const key = `AUTH:Token:${userId}`; // Create a unique key for the user
        const expiration = 62 * 60; // 1 hour (2 min buffer)

        try {
            await redis.set(key, authToken); // Cache the token
            await redis.expire(key, expiration); // Set expiration
            console.log(`Auth token cached for user ${userId} with 1-hour expiration.`);
        } catch (error) {
            console.error('Error caching auth token:', error);
        }
    }
}

const token = new Token();
export default token;
