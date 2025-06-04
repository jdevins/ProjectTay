import * as winston from 'winston';
import 'winston-daily-rotate-file'; // Import the daily rotate file transport

const { combine, timestamp, printf, colorize } = winston.format;

// Initialize the logger
const log = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp() // Base format for all transports
    ),
    transports: [
        new winston.transports.Console({
            format: combine(
                colorize(),
                printf((info) => `${info.timestamp} [${info.level}] [${info.context || 'General'}]: ${info.message}`)
            )
        }),
        new winston.transports.File({
            filename: 'log_auth.log',
            format: printf((info) => JSON.stringify({
                timestamp: info.timestamp,
                level: info.level,
                context: info.context || 'General',
                message: info.message
            }))
        }),
        new winston.transports.DailyRotateFile({
            filename: 'log_%DATE%._auth.log', // Add date pattern to filename
            datePattern: 'YYYY-MM-DD', 
            dirname: './logs',
            maxFiles: '14d',
            format: printf((info) => JSON.stringify({
                timestamp: info.timestamp,
                level: info.level,
                context: info.context || 'General',
                message: info.message
            }))
        })
    ]
});

log.info('Logging initialized successfully.', { context: 'Startup' });

// Attach the logger to the global object
global.log = log;
export default log; // Export the logger for use in other modules


