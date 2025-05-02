import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import redis from './redis_helper.js';

class Token {
    constructor() {
        // Initialize environment variables
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const envPath = path.resolve(__dirname, '../config/.env.auth.development');
        dotenv.config({ path: envPath });

        this.authSecret = process.env.SECRET_AUTH_TOKEN_DEV_KEY;
        this.refreshSecret = process.env.SECRET_REFRESH_TOKEN_DEV_KEY;
    }

    async generateToken(username) {
        console.log("Generating auth token for user:", username);
        const tokenType = 'auth';
        const token = jwt.sign({ username, tokenType }, this.authSecret, { expiresIn: '1h' });
        console.log("New token issued:", token);
        return token;
    }

    async generateRefreshToken(username) {
        console.log("Generating refresh token for user:", username);
        const tokenType = 'refresh';
        const token = jwt.sign({ username, tokenType }, this.refreshSecret, { expiresIn: '4h' });
        console.log("Refresh token issued:", token);
        return token;
    }

    async verifyToken(token, isRefresh) {
        const secret = isRefresh ? this.refreshSecret : this.authSecret;
        console.log(`Using ${isRefresh ? 'refreshSecret' : 'authSecret'}`);
        try {
            const decodedToken = this.decodeToken(token);

            if (decodedToken.exp * 1000 < Date.now()) {
                console.log(decodedToken.type, "token is expired.");
                return false;
            }

            console.log("Token is valid and not expired.");
            return decodedToken;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }

    decodeToken(token) {
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
