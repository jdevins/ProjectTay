    import jwt from 'jsonwebtoken';
    import dotenv from 'dotenv';
    import path from 'path';
    import { fileURLToPath } from 'url';
    
    
    //PATH ES6 Support
    const __filename  = fileURLToPath(import.meta.url);
    const __dirname   = path.dirname(__filename);
    
    // Construct the path to .env file
    const envPath = path.resolve(__dirname, '../config/.env.auth.development');
    dotenv.config({ path: envPath });
    
    //Secret Key
    const secret = process.env.SECRET_JWT_DEV_KEY;

    // Generate a JWT token
    export async function generateToken(username) {
        console.log("Generating token for user:", username); 
        const token = jwt.sign({ username }, secret, { expiresIn: '1h' });
        console.log("New token issued:", token); 
        return token;
    }
    
    // Verify a JWT token  
    export async function verifyToken(token) {
        try {
            const decoded = jwt.verify(token, secret);
            console.log("Decoded token:", decoded);
            //return decoded;
            if (!decoded) {
                return false;
              }
              // Check if the token is expired
              if (decoded.exp * 1000 < Date.now()) {
                return 'expired';
              }
              // Token is valid and not expired
              console.log("Token is valid and not expired.");
              return (decoded);
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;;
        }
    }
    