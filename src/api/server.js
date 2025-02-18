// Server.js is the entry point for the application. It creates an Express server and listens on port 3000.
import express from "express";
import path from "path";
import bodyParser from "body-parser"; // Import body-parser to parse JSON request bodies
import cors from "cors"; // Import cors to enable Cross-Origin Resource Sharing (CORS)

const app = express();
const PORT = 3000;
const __dirname = path.resolve();

app.use(cors()); // Use cors middleware to enable Cross-Origin Resource Sharing (CORS)


// Routes
app.get("api/status", (req, res) => {res.send("Things are looking good!");});


// 404 Handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public/404.html"));
});

// Port Listener
app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});