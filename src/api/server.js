import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import bodyParser from "body-parser";
import cors from "cors"; 
import dotenv from 'dotenv';
import { check_online_status } from "./scripts/check_online_status.js";
import openai_routes from "./routes/openai_routes.js";
import { connect } from "./utils/db_helper.js";
import { set_redis_kv,get_redis_kv  } from "./middleware/redis.js";

//PATH ES6 Support
const __filename  = fileURLToPath(import.meta.url);
const __dirname   = path.dirname(__filename);

// Construct the path to .env file
const envPath = path.resolve(__dirname, './config/.env.api.development');
dotenv.config({ path: envPath });

//Initiate Server
const app = express();
const ENV_URL = process.env.ENV_URL;
const PORT    = process.env.PORT;
app.disable('x-powered-by');

// Middleware
app.use(bodyParser.json()); 
app.use(cors());

// General Routes
app.get('/api', (req, res) => {res.send("Yep I'm here!");});
app.get('/api/pulse', (req, res) => {res.send("API Server is up!");});
app.get('/api/kv', async (req, res) => {
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
});

//Database Status
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
  });
  
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
  console.log("you hit Admin endpoint");
  res.send("Admin Utilities");
  });

// 404 Handler
  app.use((req, res) => {
    res.status(404).send("404: In fairness, do any of us know where we're going?");
  });

// Port Listener
  app.listen(PORT, () => {
    console.log(`API server running at ${ENV_URL}${PORT}/`);
  });