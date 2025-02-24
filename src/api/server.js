// API server on port 3000.
import express from "express";
import path from "path";
import bodyParser from "body-parser";
import cors from "cors"; 
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import checkOnlineStatus from "./scripts/checkOnlineStatus.js";

//PATH ES6 Support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct the path to your .env file
const envPath = path.resolve(__dirname, './config/.env.api.development');
dotenv.config({ path: envPath });

//Initiate Server
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(bodyParser.json()); 
app.use(cors());

// Routes
app.get("/", (req, res) => {res.send("You made it.  Check out our other services.");});
app.get("/api/status", async (req, res) => {  
  try {
    const status = await checkOnlineStatus();
    res.send(status);
  } catch (error) {
    res.status(500).send("Error checking status");
  }});
app.get("/api/v1/openai/chatcompletion", (req, res) => {res.send("Fake Chat Completion");});

// 404 Handler
app.use((req, res) => {
  res.status(404).send("404: Page not found");
});

// Port Listener
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}/`);
});