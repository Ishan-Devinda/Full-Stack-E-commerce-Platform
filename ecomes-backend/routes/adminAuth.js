const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { generateTokens } = require("../middleware/auth");

const router = express.Router();

// Admin login
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check if user is admin
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin only." });
      }
      ``;

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      if (!user.isVerified) {
        return res
          .status(400)
          .json({ message: "Please verify your email first" });
      }

      const { accessToken, refreshToken } = generateTokens(user._id);

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Server error during admin login" });
    }
  }
);

// Create admin user (one-time setup)
router.post("/create-admin", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin user already exists" });
    }

    // Create admin user
    const adminUser = new User({
      username,
      email,
      password,
      role: "admin",
      isVerified: true, // Auto-verify admin
    });

    await adminUser.save();

    res.status(201).json({
      message: "Admin user created successfully",
      user: {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ message: "Server error creating admin user" });
  }
});

module.exports = router;
