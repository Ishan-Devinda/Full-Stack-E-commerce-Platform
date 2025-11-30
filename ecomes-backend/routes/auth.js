const express = require("express");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const jwt = require("jsonwebtoken"); // ✅ ADD THIS IMPORT
const User = require("../models/User");
const { generateTokens, auth } = require("../middleware/auth");
const {
  sendOTPEmail,
  sendEmailChangeOTPEmail,
  sendEmailChangeNotificationEmail,
  sendNewEmailConfirmationOTP,
  sendPasswordResetOTPEmail,
} = require("../utils/emailService");

const router = express.Router();

// Input validation rules
const signupValidation = [
  body("username")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
];

const passwordValidation = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

// Step 1: Sign up with email and username
router.post("/signup", signupValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or username already exists",
      });
    }

    // Create unverified user
    const user = new User({ username, email });
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, username);

    if (!emailSent) {
      await User.findByIdAndDelete(user._id);
      return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    }

    res.status(201).json({
      message: "OTP sent to your email",
      userId: user._id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// Step 2: Verify OTP
router.post(
  "/verify-otp",
  [
    body("userId").isMongoId(),
    body("otp").isLength({ min: 6, max: 6 }).isNumeric(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, otp } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "User already verified" });
      }

      const isValidOTP = user.verifyOTP(otp);
      if (!isValidOTP) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Mark user as verified and clear OTP
      user.isVerified = true;
      user.otp = undefined;
      await user.save();

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ message: "Server error during OTP verification" });
    }
  }
);

// Step 3: Set password
router.post(
  "/set-password",
  [body("userId").isMongoId(), ...passwordValidation],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, password } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (!user.isVerified) {
        return res
          .status(400)
          .json({ message: "Please verify your email first" });
      }

      // Set password and generate tokens
      user.password = password;

      const { accessToken, refreshToken } = generateTokens(user._id);

      // Store refresh token in database
      user.refreshTokens = user.refreshTokens || [];
      user.refreshTokens.push({
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await user.save();

      res.json({
        message: "Password set successfully",
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Set password error:", error);
      res.status(500).json({ message: "Server error setting password" });
    }
  }
);

// Email/password login
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

      if (!user.password) {
        return res
          .status(400)
          .json({ message: "Please use Google authentication" });
      }

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

      // Store refresh token in database
      user.refreshTokens = user.refreshTokens || [];
      user.refreshTokens.push({
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await user.save();

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  }
);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// router.get(
//   "/google/callback",
//   passport.authenticate("google", { session: false }),
//   (req, res) => {
//     const { accessToken, refreshToken } = generateTokens(req.user._id);

//     res.json({
//       accessToken,
//       refreshToken,
//       user: {
//         id: req.user._id,
//         username: req.user.username,
//         email: req.user.email,
//       },
//     });
//   }
// );

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const { accessToken, refreshToken } = generateTokens(req.user._id);

    // Redirect to frontend success page with tokens
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const redirectUrl = `${frontendUrl}/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${req.user._id}&email=${req.user.email}&username=${req.user.username}`;

    //console.log("Redirecting to:", redirectUrl);
    res.redirect(redirectUrl);
  }
);

// Refresh token
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    console.log("Refresh token received:", refreshToken);

    if (!refreshToken) {
      console.log("No refresh token provided");
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    console.log("Token decoded successfully, user ID:", decoded.userId);

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log("User not found for ID:", decoded.userId);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    console.log("User found:", user.email);
    console.log("User refresh tokens:", user.refreshTokens);

    const tokenExists = user.refreshTokens.some(
      (rt) => rt.token === refreshToken
    );
    console.log("Token exists in database:", tokenExists);

    if (!user || !tokenExists) {
      console.log("Token not found in user record");
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id
    );

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter(
      (rt) => rt.token !== refreshToken
    );
    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await user.save();

    console.log("Tokens refreshed successfully");
    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Refresh token error:", error.message);
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const decoded = jwt.decode(refreshToken);
      const user = await User.findById(decoded.userId);

      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          (rt) => rt.token !== refreshToken
        );
        await user.save();
      }
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error during logout" });
  }
});

// Forgot password - Send OTP to email
router.post(
  "/forgot-password",
  [body("email").isEmail().normalizeEmail()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({
          message: "If the email exists, a password reset OTP has been sent",
        });
      }

      // Generate OTP for password reset
      const otp = user.generateOTP();
      await user.save();

      // Send OTP email
      const emailSent = await sendPasswordResetOTPEmail(
        email,
        otp,
        user.username
      );

      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send OTP email" });
      }

      res.json({
        message: "If the email exists, a password reset OTP has been sent",
        userId: user._id,
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res
        .status(500)
        .json({ message: "Server error during password reset request" });
    }
  }
);

// Verify OTP and reset password
router.post(
  "/reset-password-with-otp",
  [
    body("userId").isMongoId(),
    body("otp").isLength({ min: 6, max: 6 }).isNumeric(),
    body("password")
      .isLength({ min: 8 })
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, otp, password } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Verify OTP
      const isValidOTP = user.verifyOTP(otp);
      if (!isValidOTP) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Update password and clear OTP
      user.password = password;
      user.otp = undefined;

      // Invalidate all refresh tokens for security
      user.refreshTokens = [];

      await user.save();

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Server error during password reset" });
    }
  }
);

// Request email change - Send OTP to current email for verification
router.post(
  "/request-email-change",
  [body("newEmail").isEmail().normalizeEmail(), body("password").exists()],
  auth,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { newEmail, password } = req.body;
      const user = await User.findById(req.user._id);

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid password" });
      }

      // Check if new email already exists
      const emailExists = await User.findOne({ email: newEmail });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Generate OTP for email change verification
      const otp = user.generateOTP();

      // Store new email temporarily
      user.newEmail = newEmail;
      await user.save();

      // Send OTP to current email for verification
      const emailSent = await sendEmailChangeOTPEmail(
        user.email,
        otp,
        user.username,
        newEmail
      );

      if (!emailSent) {
        user.newEmail = undefined;
        user.otp = undefined;
        await user.save();
        return res
          .status(500)
          .json({ message: "Failed to send verification OTP" });
      }

      res.json({
        message: "Verification OTP sent to your current email address",
        userId: user._id,
      });
    } catch (error) {
      console.error("Request email change error:", error);
      res
        .status(500)
        .json({ message: "Server error during email change request" });
    }
  }
);

// Verify OTP for email change
router.post(
  "/verify-email-change-otp",
  [
    body("userId").isMongoId(),
    body("otp").isLength({ min: 6, max: 6 }).isNumeric(),
  ],
  auth,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, otp } = req.body;

      // Verify the user is changing their own email
      if (userId !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (!user.newEmail) {
        return res
          .status(400)
          .json({ message: "No email change request found" });
      }

      // Verify OTP
      const isValidOTP = user.verifyOTP(otp);
      if (!isValidOTP) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Check if new email is still available
      const emailExists = await User.findOne({ email: user.newEmail });
      if (emailExists) {
        user.newEmail = undefined;
        user.otp = undefined;
        await user.save();
        return res
          .status(400)
          .json({ message: "Email is no longer available" });
      }

      // Store the email change request with a confirmation token
      const confirmToken = jwt.sign(
        {
          userId: user._id,
          newEmail: user.newEmail,
          type: "email_change_confirm",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      user.emailChangeToken = confirmToken;
      user.otp = undefined; // Clear OTP after verification
      await user.save();

      // Send confirmation OTP to new email address
      const confirmOTP = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = {
        code: confirmOTP,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      };
      await user.save();

      const emailSent = await sendNewEmailConfirmationOTP(
        user.newEmail,
        confirmOTP,
        user.username
      );

      if (!emailSent) {
        user.newEmail = undefined;
        user.emailChangeToken = undefined;
        user.otp = undefined;
        await user.save();
        return res
          .status(500)
          .json({ message: "Failed to send confirmation OTP" });
      }

      res.json({
        message: "Confirmation OTP sent to new email address",
        confirmToken: confirmToken,
      });
    } catch (error) {
      console.error("Verify email change OTP error:", error);
      res
        .status(500)
        .json({ message: "Server error during email change verification" });
    }
  }
);

// Confirm email change with OTP sent to new email
router.post(
  "/confirm-email-change-with-otp",
  [
    body("confirmToken").notEmpty(),
    body("otp").isLength({ min: 6, max: 6 }).isNumeric(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { confirmToken, otp } = req.body;

      // Verify token
      const decoded = jwt.verify(confirmToken, process.env.JWT_SECRET);

      if (decoded.type !== "email_change_confirm") {
        return res.status(400).json({ message: "Invalid confirmation token" });
      }

      const user = await User.findOne({
        _id: decoded.userId,
        emailChangeToken: confirmToken,
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid confirmation token" });
      }

      // Verify OTP sent to new email
      const isValidOTP = user.verifyOTP(otp);
      if (!isValidOTP) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Check if new email is still available
      const emailExists = await User.findOne({ email: decoded.newEmail });
      if (emailExists && emailExists._id.toString() !== user._id.toString()) {
        return res
          .status(400)
          .json({ message: "Email is no longer available" });
      }

      // Update email and clear all tokens
      const oldEmail = user.email;
      user.email = decoded.newEmail;
      user.newEmail = undefined;
      user.emailChangeToken = undefined;
      user.otp = undefined;

      // Invalidate all refresh tokens for security
      user.refreshTokens = [];

      await user.save();

      // Send notification to old email
      await sendEmailChangeNotificationEmail(oldEmail, user.username);

      res.json({
        message: "Email changed successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(400)
          .json({ message: "Confirmation token has expired" });
      }
      if (error.name === "JsonWebTokenError") {
        return res.status(400).json({ message: "Invalid confirmation token" });
      }
      console.error("Confirm email change error:", error);
      res.status(500).json({ message: "Server error during email change" });
    }
  }
);

// Resend OTP for email change
router.post("/resend-email-change-otp", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || !user.newEmail) {
      return res
        .status(400)
        .json({ message: "No pending email change request" });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP to current email
    const emailSent = await sendEmailChangeOTPEmail(
      user.email,
      otp,
      user.username,
      user.newEmail
    );

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to resend OTP" });
    }

    res.json({
      message: "OTP resent successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Server error resending OTP" });
  }
});

// Cancel email change request
router.post("/cancel-email-change", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Clear email change data
    user.newEmail = undefined;
    user.emailChangeToken = undefined;
    user.otp = undefined;
    await user.save();

    res.json({ message: "Email change request cancelled" });
  } catch (error) {
    console.error("Cancel email change error:", error);
    res.status(500).json({ message: "Server error cancelling email change" });
  }
});

module.exports = router;
