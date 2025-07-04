import jwt from 'jsonwebtoken';
import Redis from '../../_shared/redis_helper.js'; // Adjust the path as needed
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
        const expiresIn = this.authExp; //1 hour by default
        const token = jwt.sign(
            { username, tokenType },
            this.authSecret,
            {
                expiresIn,
                issuer: this.issuer,
                audience: this.audience,
                jwtid: crypto.randomUUID()
            }
        );
        const tokenExp = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        log.info("Auth token issued");
        return { token, tokenExp }; 
    }
    
    async generateRefreshToken(username) {
        const tokenType = 'refresh';
        const expiresIn = this.refreshExp; 
        const token = jwt.sign(
            { username, tokenType },
            this.refreshSecret,
            {
                expiresIn,
                issuer: this.issuer,
                audience: this.audience,
                jwtid: crypto.randomUUID()
            }
        );
        const tokenExp = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        log.info("Refresh token issued");
        return { token, tokenExp };
    }

    // Token verification
    async verifyToken(token, isRefresh) {

        const secret = isRefresh ? this.refreshSecret : this.authSecret;

        try {
            const verified = jwt.verify(token, secret);
            console.log("Verified token payload:", verified); // Add this line for debugging
            //Check claims
            if (verified.aud !== this.audience) {
                log.warn("Invalid audience:", verified.aud);
                return { valid: false, error: 'Invalid audience.' };
            }
            if (verified.iss !== this.issuer) {
                log.warn("Invalid issuer:", verified.iss);
                return { valid: false, error: 'Invalid issuer.' };
            }
            if (isRefresh && verified.tokenType !== 'refresh') {
                return { valid: false, error: 'Not a refresh token' };
            }
            
            //Success
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

    async refreshAuthToken(refreshToken) {
        // Verify the refresh token
        const verified = await this.verifyToken(refreshToken, true);
        if (!verified || verified.valid === false) {
            log.warn('Refresh token invalid or expired.');
            return { success: false, error: verified.error || 'Invalid refresh token' };
        }

        // Generate new auth token
        const { username } = verified;
        const { token: newAuthToken, tokenExp } = await this.generateAuthToken(username);
        
        log.info('Auth token refreshed using valid refresh token.');
        return { success: true, token: newAuthToken, tokenExp };
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

    async revokeToken(token) {
        const key = `REVOKED.TOKEN:${token}`;
        const expiration = 62 * 60; // 1 hour (2 min buffer)
        try {
            await Redis.set(key, token); 
            await Redis.expire(key, expiration);
            log.info(`Token revoked and cached for 1 hour.`);
        } catch (error) {
            log.error('Error revoking token:', error);
        }
    }
}


const token = new Token();
export default token;
