// Webserver setup
import express from "express";
import path from "path";
import bodyParser from "body-parser";
import cors from "cors"; 
import { getFunFact } from "../api/openai.js";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

//PATH ES6 Support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct the path to your .env file
const envPath = path.resolve(__dirname, './config/.env.development');

// Configure dotenv with the custom path
dotenv.config({ path: envPath });

// Now you can access environment variables using process.env
console.log(process.env.PORT); 

//Express
const app = express();

//Set Environment Variables
const PORT = process.env.PORT;

// Middleware
app.use(cors()); // Use cors middleware to enable Cross-Origin Resource Sharing (CORS)
app.use(bodyParser.json()); // Use body-parser middleware to parse JSON request bodies

// Serve static files from directories
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, "css")));
app.use(express.static(path.join(__dirname, "files")));
app.use(express.static(path.join(__dirname, "scripts")));
console.log("Server Directory is",__dirname);

// Routes
app.get("/", (req, res) => {res.send("Placeholder");});
app.get("/index", (req, res) => {res.sendFile(path.join(__dirname, "/index.html"));});
app.get("/status", (req, res) => {res.sendFile(path.join(__dirname, "/status.html"));});
app.post("/ai/funfact", async (req, res) => {
  const { fun_fact } = req.body; 
  try {
    const funFactResponse = await getFunFact(fun_fact); // Call the funfact function
    res.json(funFactResponse); // Send the fun fact as a JSON response
  } catch (error) {
    console.error("Error fetching fun fact:", error);
    res.status(500).send("Failed to fetch fun fact");
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "/404.html"));
});

//favicon
app.get("../favicon.ico", (req, res) => {res.sendFile(path.join(__dirname, "../files/favicon.png"));});

// Port Listener
app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});