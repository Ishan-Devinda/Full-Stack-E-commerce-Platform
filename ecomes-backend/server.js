require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const passport = require("passport");

require("./config/passport");

const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/uploadRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminAuthRoutes = require("./routes/adminAuth");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Basic middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));

// Rate limiting - apply only to /auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message:
    "Too many authentication attempts from this IP, please try again after 15 minutes",
});
app.use("/auth", authLimiter);

// Passport middleware
app.use(passport.initialize());

// Routes
app.use("/auth", authRoutes);
app.use("/upload", uploadRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/admin/auth", adminAuthRoutes);
app.use("/api/products", productRoutes);
app.use("/api/user", userRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// 404 handler - FIXED: Remove the "*" pattern
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error.message);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: error.errors,
    });
  }

  if (error.name === "MongoError" && error.code === 11000) {
    return res.status(400).json({
      message: "Duplicate entry found",
    });
  }

  res.status(500).json({
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(
      `📊 MongoDB: ${
        mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
      }`
    );
  });
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server gracefully...");
  await mongoose.connection.close();
  console.log("✅ MongoDB connection closed");
  process.exit(0);
});

// Start the application
startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
