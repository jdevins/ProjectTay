import jwt from 'jsonwebtoken';
import Redis from './redis_helper.js';
import crypto from 'crypto';

class Token {
    constructor() { 
    
        this.authSecret     = process.env.SECRET_AUTH_TOKEN_DEV_KEY;
        this.authExp        = process.env.ACCESS_TOKEN_EXPIRATION;
        this.refreshSecret  = process.env.SECRET_REFRESH_TOKEN_DEV_KEY;
        this.refreshExp     = process.env.REFRESH_TOKEN_EXPIRATION;
        this.issuer         = process.env.EXPECTED_ISSUER; 
        this.audience       = process.env.EXPECTED_AUDIENCE;
        this.jti            = crypto.randomUUID(); 
    
}
    //Not DRY but keeps them distinct across all references.
    async generateAuthToken(username) {
        const tokenType = 'auth';
        const expiresIn = this.authExp; // 1d,30d, etc.
        const token = jwt.sign(
            { username, tokenType, issuer: this.issuer, audience: this.audience, jti: this.jti }, 
            this.authSecret, 
            { expiresIn }
        ); 
        const tokenExp = new Date(Date.now() + 60 * 60 * 1000).toISOString(); 
        log.info("Auth token issued");
        return { token, tokenExp }; 
    }

    //Not DRY but keeps them distinct across all references.
    async generateRefreshToken(username) {
        const tokenType = 'refresh';
        const expiresIn = this.refreshExp;
        const token = jwt.sign(
            { username, tokenType, issuer: this.issuer, audience: this.audience,jti: this.jti }, 
            this.refreshSecret, 
            { expiresIn }
        ); 
        const tokenExp = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        log.info("Refresh token issued:");
        return { token, tokenExp };
    }

    async verifyToken(token, isRefresh) {
        log.info("Verifying token:", token);
        const secret = isRefresh ? this.refreshSecret : this.authSecret;

        try {
            const verified = jwt.verify(token, secret); // Verify signature and expiration

            // Additional validation
            if (verified.aud !== this.audience) {
                return { valid: false, error: 'Invalid audience.' };
            }
            if (verified.iss !== this.issuer) {
                return { valid: false, error: 'Invalid issuer.' };
            }
            if (isRefresh && verified.tokenType !== 'refresh') {
                return { valid: false, error: 'Not a refresh token' };
            }

            // Check for revocation
            const isRevoked = await Redis.get(`REVOKED.TOKEN:${token}`);
            if (isRevoked) {
                return { valid: false, error: 'Token has been revoked.' };
            }

            return verified;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                log.warn("Token is expired.");
                return { valid: false, error: 'Token is expired' };
            } else if (error.name === 'JsonWebTokenError') {
                log.error("Invalid token signature.");
                return { valid: false, error: 'Invalid token signature' };
            } else {
                log.error("Token verification failed:", error.message);
                return { valid: false, error: error.message };
            }
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
            log.error('Token decoding failed:', error);
            return false;
        }
    }
    
    async cacheAuthToken(userId, authToken) {
        const key = `Token.Auth:${userId}`; 
        const expiration = 62 * 60; // 1 hour (2 min buffer)

        try {
            await Redis.set(key, authToken); 
            await Redis.expire(key, expiration);
            console.log(`Auth token cached for user ${userId} with 1-hour expiration.`);
        } catch (error) {
            console.error('Error caching auth token:', error);
        }
    }

    async revokeToken(token) {
        const key = `REVOKED.TOKEN:${token}`;
        const expiration = 62 * 60; // 1 hour (2 min buffer)
        try {
            await Redis.set(key, token); 
            await Redis.expire(key, expiration);
            console.log(`Token revoked and cached for 1 hour.`);
        } catch (error) {
            console.error('Error revoking token:', error);
        }
    }
}


const token = new Token();
export default token;
