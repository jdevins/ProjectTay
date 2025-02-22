// Webserver setup
import express from "express";
import path from 'path';
import bodyParser from "body-parser";
import cors from "cors"; 
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

//PATH Helpers
const __dirname = import.meta.dirname;
const __root = process.cwd();

// Construct the path to your .env file
const envvar = path.resolve(__dirname, './config/.env.web.development');
dotenv.config({ path: envvar });
console.log(envvar);

//Express
const app = express();

//Set Environment Variables
const PORT = process.env.PORT;

// Middleware
app.use(cors()); // Use cors middleware to enable Cross-Origin Resource Sharing (CORS)
app.use(bodyParser.json()); // Use body-parser middleware to parse JSON request bodies.

// Serve static files from directories
app.use(express.static(path.join(__dirname, "css")));
app.use(express.static(path.join(__dirname, "files")));
app.use(express.static(path.join(__dirname, "scripts")));
app.use(express.static(path.join(__root, "./node_modules/bootstrap/dist")));


// Routes
app.get("/", (req, res) => {res.send("Placeholder");});
app.get("/index", (req, res) => {res.sendFile(path.join(__dirname, "/views/index.html"));});
app.get("/status", (req, res) => {res.sendFile(path.join(__dirname, "/views/status.html"));});

// 404 Handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});

//favicon
app.get("../favicon.ico", (req, res) => {res.sendFile(path.join(__dirname, "../files/favicon.png"));});

// Port Listener
app.listen(PORT, () => {
  console.log(`Web server running at http://localhost:${PORT}/`);
});