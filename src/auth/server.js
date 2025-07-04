import express from 'express';
import { expressjwt } from 'express-jwt'; 
import '../_shared/logging.js'; // Logging available globally
import { initializeEnv } from '../_shared/env_helper.js'; 
import authRouter from './routes/authRouter.js';
import userRouter from './routes/userRouter.js';
import utilityRouter from './routes/utilityRouter.js';

log.info('Auth starting...', {context: 'Startup'});

// Initialize environment variables
initializeEnv('./config/.env.auth.development');

const app = express();

//Logging All Requests/Responses with Elapsed Time
app.use((req, res, next) => {
    const start = Date.now();
    log.info(`Request: ${req.method} ${req.url}`, { context: 'Routes' });
    res.on('finish', () => {
        const elapsed = Date.now() - start;
        log.info(`Response: ${res.statusCode} for ${req.method} ${req.url} (${elapsed}ms)`);
    });
    next();
});

// JWT Middleware - AUTH Tokens only
const secret = process.env.SECRET_AUTH_TOKEN_DEV_KEY;
export const jwtMiddleware = expressjwt({ secret, algorithms: ['HS256'] });

// Parse JSON bodies for all incoming requests
app.use(express.json());

// Use routers
app.use('/auth/tokens', authRouter);
app.use('/auth/users', userRouter);
app.use('/auth/utility', utilityRouter);

app.get('/auth/routes', (req, res) => {
  const routes = [];
  const jwtProtectedPaths = [
    // Add paths here that use jwtMiddleware
    // Example: '/auth/user', '/auth/utility'
    '/auth/user',
    '/auth/utility'
  ];

  function getRoutes(stack, parentPath = '') {
    stack.forEach(layer => {
      if (layer.route && layer.route.path) {
        const methods = Object.keys(layer.route.methods).filter(m => layer.route.methods[m]);
        methods.forEach(method => {
          const fullPath = parentPath + layer.route.path;
          routes.push({
            method: method.toUpperCase(),
            route: fullPath,
            jwtRequired: jwtProtectedPaths.some(p => fullPath.startsWith(p))
          });
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        getRoutes(layer.handle.stack, parentPath + (layer.regexp.source !== '^\\/?$' ? layer.regexp.source.replace(/\\\//g, '/').replace(/[\^\$\?]/g, '') : ''));
      }
    });
  }

  getRoutes(app._router.stack);

  res.json(routes);
});

//Handle 404
app.use((req, res) => {
  res.status(404).send("404: In fairness, do any of us know where we're going?");
});

// Port
const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  log.info(`Auth is up on ${PORT}`, { context: 'Startup'});
});

  process.on('SIGTERM', () => {
          server.close(() => {
            log.info('Auth server SIGTERM', { context: 'Shutdown' });
            process.exit(0);
          });
        });
  
  process.on('SIGINT', () => {
          server.close(() => {
            log.info('Auth server SIGINT', { context: 'Shutdown' });
            process.exit(0);
          });
        });
