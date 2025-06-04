import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import log from './logging.js'; // Explicitly import the logger

export function initializeEnv(envFilePath) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const envPath = path.resolve(__dirname, envFilePath);
    dotenv.config({ path: envPath });
    log.info(`Environment variables initialized.`, { context: 'Startup' });
}
