const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Route imports
const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");
const requestRoutes = require("./routes/requests");
const reportRoutes = require("./routes/reports");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/reports", reportRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Backend + DB running 🚀");
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => {
    console.error("MongoDB error ❌", err.message);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle port-in-use error
server.on("error", err => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error("➡️ Stop the running server or use another port");
  } else {
    console.error("Server error ❌", err);
  }
});
