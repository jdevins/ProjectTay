// Server.js is the entry point for the application. It creates an Express server and listens on port 3000.
import express from "express";
import path from "path";
import bodyParser from "body-parser"; // Import body-parser to parse JSON request bodies
import cors from "cors"; // Import cors to enable Cross-Origin Resource Sharing (CORS)
import { getFunFact } from "./scripts/openai.js";

const app = express();
const PORT = 3000;
const __dirname = path.resolve();

app.use(cors()); // Use cors middleware to enable Cross-Origin Resource Sharing (CORS)
app.use(bodyParser.json()); // Use body-parser middleware to parse JSON request bodies

// Serve static files from the directories
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