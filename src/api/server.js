import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import bodyParser from "body-parser";
import cors from "cors"; 
import { check_online_status } from "./scripts/check_online_status.js";
import openai_routes from "./routes/openai_routes.js";
import { initializeEnv } from '../_shared/env_helper.js';
import '../_shared/logging.js'; // Logging available globally
import Redis from '../_shared/redis_helper.js';

//PATH ES6 Support
const __filename  = fileURLToPath(import.meta.url);
const __dirname   = path.dirname(__filename);

// Initialize environment variables
initializeEnv('./config/.env.api.development');

//Initiate Server
const app = express();
const ENV_URL = process.env.ENV_URL;
const PORT    = process.env.PORT;
log.info(`API Port = ${PORT}`, { context: 'Startup' });
app.disable('x-powered-by');

// Middleware
app.use(bodyParser.json()); 
app.use(cors());

// General Routes
app.get('/api', (req, res) => {res.send("Yep I'm here!");});
app.get('/api/pulse', (req, res) => {res.send("API Server is up!");});
/* app.get('/api/kv', async (req, res) => {
  try {
  set_redis_kv('test_key','test_value');
  get_redis_kv('test_key');
  res.send.json({ status:"Key Value Stored in Redis"});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send("Server error in Key Value Store");
  }
});
app.get('/api/kv/set/:key', async (req, res) => {
  try {
  set_redis_kv('test_key','test_value');
  get_redis_kv('test_key');
  res.send.json({ status:"Key Value Stored in Redis"});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send("Server error in Key Value Store");
  }
}); */

/* //Database Status
  app.get('/api/v1/dbcheck', async (req,res) => {
  try {
    let response = await connect();
    if (response){
      console.log('success',response.database);
      var data = {
        type: "DB Connection",
        status: 'Pass'
      } 
      res.send(data);
    } else {
      console.log('fail',response.database);
      var data = {
        type: "DB Connection",
        status: 'Fail'
      }
      res.status(500).send(data);
    }
  } catch (error) {
    res.status(500).send("Server error checking DB status");
  }
  }); */
  
// System status
  app.get('/api/v1/status', async (req, res) => {  
  try {
    let response = await check_online_status();
    res.set("content-type",'application/json');
    res.send(response);
  } catch (error) {
    res.status(500).send("Server error checking status");
  }});

// Router Routes
  app.use('/api/v1/openai', openai_routes);

//Admin Utilities
  app.get('/api/v1/admin', (req, res) => {
  log.info('You hit Admin endpoint', { context: 'Admin' });
  res.send('Admin Utilities');
  });

// 404 Handler
  app.use((req, res) => {
    res.status(404).send("404: In fairness, do any of us know where we're going?");
  });

// Port Listener
  const server = app.listen(PORT, () => {
  log.info(`API server running at ${ENV_URL}${PORT}/`, { context: 'Startup' });
  });

    process.on('SIGTERM', () => {
          server.close(() => {
            log.info('API server SIGTERM', { context: 'Shutdown' });
            process.exit(0);
          });
        });

  process.on('SIGINT', () => {
          server.close(() => {
            log.info('API server SIGINT', { context: 'Shutdown' });
            process.exit(0);
          });
        });
