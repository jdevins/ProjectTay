    import jwt from 'jsonwebtoken';
    import dotenv from 'dotenv';
    import path from 'path';
    import { fileURLToPath } from 'url';
import { decode } from 'punycode';
    
    
    //PATH ES6 Support
    const __filename  = fileURLToPath(import.meta.url);
    const __dirname   = path.dirname(__filename);
    
    // Construct the path to .env file
    const envPath = path.resolve(__dirname, '../config/.env.auth.development');
    dotenv.config({ path: envPath });
    
    //Secret Key
    const authSecret = process.env.SECRET_AUTH_TOKEN_DEV_KEY;
    const refreshSecret = process.env.SECRET_REFRESH_TOKEN_DEV_KEY;

    // Generate a JWT token
    export async function generateToken(username) {
        console.log("Generating auth token for user:", username); 
        const tokenType = 'auth';
        const token = jwt.sign({ username,tokenType }, authSecret, { expiresIn: '1h' });
        console.log("New token issued:", token); 
        return token;
    }
    
    // Generate a JWT token
    export async function generateRefreshToken(username) {
        console.log("Generating refresh token for user:", username); 
        const tokenType = 'refresh';
        const token = jwt.sign({ username,tokenType }, refreshSecret, { expiresIn: '4h' });
        console.log("Refresh token issued:", token); 
        return token;
    }

    // Verify a JWT token  
    export async function verifyToken(token,isRefresh) {
  
        if (isRefresh===true) {
            console.log("Using refreshsecret");
            var secret = refreshSecret;
        } else {
            console.log("Using authsecret");
            var secret = authSecret;
        }
        try {

            //TODO: CHECK BLACKLIST
                //Check Redis
                //Check DB
                //Return

            const decodedToken = decodeToken(token);
/*            const decoded = jwt.verify(token, secret);
             console.log("Decoded token:", decoded);
            if (!decoded) {
                return false;
              }

              const decodedToken ={
                username: decoded.username,
                type: decoded.tokenType,
                exp: new Date(decoded.exp * 1000),
                iat: new Date(decoded.iat * 1000),
                } */

              // Check if the token is expired
              if (decoded.exp * 1000 < Date.now()) {
                console.log( token.type," token is expired.");
                return false;
              }
              // Token is valid and not expired
              console.log("Token is valid and not expired.");
              return (decodedToken);
        
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;;
        }
    }

    export async function decodeToken(token) {
        try {
            const decoded = jwt.decode(token);
            const decodedToken = {
                username: decoded.username,
                type: decoded.tokenType,
                exp: new Date(decoded.exp * 1000),
                iat: new Date(decoded.iat * 1000),
                }
            return decodedToken;
        } catch (error) {
            console.error('Token decoding failed:', error);
            return false;
        }
    }
    