const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5175",
      "http://localhost:5174",
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : "",
      process.env.RAILWAY_STATIC_URL ? process.env.RAILWAY_STATIC_URL : "",
    ].filter(Boolean),
    methods: ["GET", "POST"],
  },
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Multiplayer Guessing Game Server is running",
  });
});

// Set up Socket.IO event handlers
require("./socketHandlers")(io);

// Serve static files in production
app.use(express.static(path.join(__dirname, "../client/dist")));

// Handle client routing, return all requests to the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Multiplayer Guessing Game Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to play`);
});

// Handle server shutdown gracefully
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
