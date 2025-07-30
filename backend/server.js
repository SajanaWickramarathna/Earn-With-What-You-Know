const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const router = require("./router"); // Assuming this is your main API router
const path = require("path");


require('dotenv').config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Load API routes
app.use("/api", router);



// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    
  }
};

connectDB();

// Start Server (Listen on the HTTP server, not just the Express app)
const PORT = process.env.PORT || 3001; // Ensure this matches your frontend socket URL
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});