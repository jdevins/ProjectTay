// Server.js is the entry point for the application. It creates an Express server and listens on port 3000.
import express from "express";
import path from "path";
import bodyParser from "body-parser"; // Import body-parser to parse JSON request bodies
import cors from "cors"; // Import cors to enable Cross-Origin Resource Sharing (CORS)
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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
app.use(bodyParser.json()); // Use body-parser middleware to parse JSON request bodies
app.use(cors()); // Use cors middleware to enable Cross-Origin Resource Sharing (CORS)

// Routes
app.get("/", (req, res) => {res.send("You made it.");});
app.get("/api/status", (req, res) => {res.send("Things are looking good!");});
app.get("/api/v1/openai/chatcompletion", (req, res) => {res.send("Fake Chat Completion");});

// 404 Handler
app.use((req, res) => {
  res.status(404).send("Status404");
});

// Port Listener
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}/`);
});