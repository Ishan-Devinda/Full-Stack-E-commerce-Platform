import User from "../models/User.js";
import { generateTokens, verifyToken } from "../utils/tokenUtil.js";
import {
  sendOTPEmail,
  sendPasswordResetOTPEmail,
  sendEmailChangeOTPEmail,
  sendNewEmailConfirmationOTP,
  sendEmailChangeNotificationEmail,
} from "../utils/emailService.js";
import { hashPassword, comparePassword } from "../utils/passwordUtil.js";
import jwt from "jsonwebtoken";

class AuthService {
  // Handles user registration with email and username
  async signupService(dto) {
    try {
      const { username, email } = dto;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return {
          success: false,
          message: "User with this email or username already exists",
        };
      }

      // Create unverified user
      const user = new User({ username, email });
      const otp = user.generateOTP();
      await user.save();

      // Send OTP email
      const emailSent = await sendOTPEmail(email, otp, username);

      if (!emailSent) {
        await User.findByIdAndDelete(user._id);
        return {
          success: false,
          message: "Failed to send verification email",
        };
      }

      return {
        success: true,
        message: "OTP sent to your email",
        data: { userId: user._id },
      };
    } catch (error) {
      console.error("Signup service error:", error);
      return {
        success: false,
        message: "Server error during signup",
      };
    }
  }

  // Verifies OTP for email confirmation
  async verifyOtpService(dto) {
    try {
      const { userId, otp } = dto;

      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      if (user.isVerified) {
        return {
          success: false,
          message: "User already verified",
        };
      }

      const isValidOTP = user.verifyOTP(otp);
      if (!isValidOTP) {
        return {
          success: false,
          message: "Invalid or expired OTP",
        };
      }

      // Mark user as verified and clear OTP
      user.isVerified = true;
      user.otp = undefined;
      await user.save();

      return {
        success: true,
        message: "Email verified successfully",
        data: { userId: user._id },
      };
    } catch (error) {
      console.error("OTP verification service error:", error);
      return {
        success: false,
        message: "Server error during OTP verification",
      };
    }
  }

  // Sets password after email verification
  async setPasswordService(dto) {
    try {
      const { userId, password } = dto;

      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      if (!user.isVerified) {
        return {
          success: false,
          message: "Please verify your email first",
        };
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

      return {
        success: true,
        message: "Password set successfully",
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
          },
        },
      };
    } catch (error) {
      console.error("Set password service error:", error);
      return {
        success: false,
        message: "Server error setting password",
      };
    }
  }

  // Handles user login
  async loginService(dto) {
    try {
      const { email, password } = dto;

      const user = await User.findOne({ email });
      if (!user) {
        return {
          success: false,
          message: "Invalid credentials",
        };
      }

      if (!user.password) {
        return {
          success: false,
          message: "Please use Google authentication",
        };
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return {
          success: false,
          message: "Invalid credentials",
        };
      }

      if (!user.isVerified) {
        return {
          success: false,
          message: "Please verify your email first",
        };
      }

      const { accessToken, refreshToken } = generateTokens(user._id);

      // Store refresh token in database
      user.refreshTokens = user.refreshTokens || [];
      user.refreshTokens.push({
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await user.save();

      return {
        success: true,
        message: "Login successful",
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
          },
        },
      };
    } catch (error) {
      console.error("Login service error:", error);
      return {
        success: false,
        message: "Server error during login",
      };
    }
  }

  // Handles token refresh
  async refreshTokenService(dto) {
    try {
      const { refreshToken } = dto;

      if (!refreshToken) {
        return {
          success: false,
          message: "Refresh token required",
        };
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return {
          success: false,
          message: "Invalid refresh token",
        };
      }

      const tokenExists = user.refreshTokens.some(
        (rt) => rt.token === refreshToken
      );

      if (!user || !tokenExists) {
        return {
          success: false,
          message: "Invalid refresh token",
        };
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

      return {
        success: true,
        message: "Tokens refreshed successfully",
        data: { accessToken, refreshToken: newRefreshToken },
      };
    } catch (error) {
      console.error("Refresh token service error:", error.message);
      return {
        success: false,
        message: "Invalid refresh token",
      };
    }
  }

  // Handles user logout
  async logoutService(dto) {
    try {
      const { refreshToken } = dto;

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

      return {
        success: true,
        message: "Logged out successfully",
        data: {},
      };
    } catch (error) {
      console.error("Logout service error:", error);
      return {
        success: false,
        message: "Server error during logout",
      };
    }
  }

  // Handles forgot password request
  async forgotPasswordService(dto) {
    try {
      const { email } = dto;

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if email exists or not for security
        return {
          success: true,
          message: "If the email exists, a password reset OTP has been sent",
          data: {},
        };
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
        return {
          success: false,
          message: "Failed to send OTP email",
        };
      }

      return {
        success: true,
        message: "If the email exists, a password reset OTP has been sent",
        data: { userId: user._id },
      };
    } catch (error) {
      console.error("Forgot password service error:", error);
      return {
        success: false,
        message: "Server error during password reset request",
      };
    }
  }

  // Handles password reset with OTP
  async resetPasswordWithOtpService(dto) {
    try {
      const { userId, otp, password } = dto;

      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // Verify OTP
      const isValidOTP = user.verifyOTP(otp);
      if (!isValidOTP) {
        return {
          success: false,
          message: "Invalid or expired OTP",
        };
      }

      // Update password and clear OTP
      user.password = password;
      user.otp = undefined;

      // Invalidate all refresh tokens for security
      user.refreshTokens = [];

      await user.save();

      return {
        success: true,
        message: "Password reset successfully",
        data: {},
      };
    } catch (error) {
      console.error("Reset password service error:", error);
      return {
        success: false,
        message: "Server error during password reset",
      };
    }
  }

  // Handles Google OAuth initiation
  async googleAuthService() {
    try {
      // This would typically return the OAuth configuration
      // In practice, this is handled by Passport middleware
      return {
        success: true,
        message: "Google OAuth initiated",
        data: { redirectUrl: "/auth/google" },
      };
    } catch (error) {
      console.error("Google auth service error:", error);
      return {
        success: false,
        message: "Google authentication failed",
      };
    }
  }

  // Handles Google OAuth callback
  async googleCallbackService(user) {
    try {
      const { accessToken, refreshToken } = generateTokens(user._id);

      return {
        success: true,
        message: "Google authentication successful",
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
          },
        },
      };
    } catch (error) {
      console.error("Google callback service error:", error);
      return {
        success: false,
        message: "Google authentication callback failed",
      };
    }
  }

  // Handles email change request
  async requestEmailChangeService(dto) {
    try {
      const { userId, newEmail, password } = dto;

      const user = await User.findById(userId);

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return {
          success: false,
          message: "Invalid password",
        };
      }

      // Check if new email already exists
      const emailExists = await User.findOne({ email: newEmail });
      if (emailExists) {
        return {
          success: false,
          message: "Email already in use",
        };
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
        return {
          success: false,
          message: "Failed to send verification OTP",
        };
      }

      return {
        success: true,
        message: "Verification OTP sent to your current email address",
        data: { userId: user._id },
      };
    } catch (error) {
      console.error("Request email change service error:", error);
      return {
        success: false,
        message: "Server error during email change request",
      };
    }
  }

  // Handles email change OTP verification
  async verifyEmailChangeOtpService(dto) {
    try {
      const { userId, otp } = dto;

      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      if (!user.newEmail) {
        return {
          success: false,
          message: "No email change request found",
        };
      }

      // Verify OTP
      const isValidOTP = user.verifyOTP(otp);
      if (!isValidOTP) {
        return {
          success: false,
          message: "Invalid or expired OTP",
        };
      }

      // Check if new email is still available
      const emailExists = await User.findOne({ email: user.newEmail });
      if (emailExists) {
        user.newEmail = undefined;
        user.otp = undefined;
        await user.save();
        return {
          success: false,
          message: "Email is no longer available",
        };
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
        return {
          success: false,
          message: "Failed to send confirmation OTP",
        };
      }

      return {
        success: true,
        message: "Confirmation OTP sent to new email address",
        data: { confirmToken },
      };
    } catch (error) {
      console.error("Verify email change OTP service error:", error);
      return {
        success: false,
        message: "Server error during email change verification",
      };
    }
  }

  // Handles final email change confirmation
  async confirmEmailChangeWithOtpService(dto) {
    try {
      const { confirmToken, otp } = dto;

      // Verify token
      const decoded = jwt.verify(confirmToken, process.env.JWT_SECRET);

      if (decoded.type !== "email_change_confirm") {
        return {
          success: false,
          message: "Invalid confirmation token",
        };
      }

      const user = await User.findOne({
        _id: decoded.userId,
        emailChangeToken: confirmToken,
      });

      if (!user) {
        return {
          success: false,
          message: "Invalid confirmation token",
        };
      }

      // Verify OTP sent to new email
      const isValidOTP = user.verifyOTP(otp);
      if (!isValidOTP) {
        return {
          success: false,
          message: "Invalid or expired OTP",
        };
      }

      // Check if new email is still available
      const emailExists = await User.findOne({ email: decoded.newEmail });
      if (emailExists && emailExists._id.toString() !== user._id.toString()) {
        return {
          success: false,
          message: "Email is no longer available",
        };
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

      return {
        success: true,
        message: "Email changed successfully",
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
          },
        },
      };
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return {
          success: false,
          message: "Confirmation token has expired",
        };
      }
      if (error.name === "JsonWebTokenError") {
        return {
          success: false,
          message: "Invalid confirmation token",
        };
      }
      console.error("Confirm email change service error:", error);
      return {
        success: false,
        message: "Server error during email change",
      };
    }
  }

  // Handles resending email change OTP
  async resendEmailChangeOtpService(dto) {
    try {
      const { userId } = dto;
      const user = await User.findById(userId);

      if (!user || !user.newEmail) {
        return {
          success: false,
          message: "No pending email change request",
        };
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
        return {
          success: false,
          message: "Failed to resend OTP",
        };
      }

      return {
        success: true,
        message: "OTP resent successfully",
        data: { userId: user._id },
      };
    } catch (error) {
      console.error("Resend OTP service error:", error);
      return {
        success: false,
        message: "Server error resending OTP",
      };
    }
  }

  // Handles email change cancellation
  async cancelEmailChangeService(dto) {
    try {
      const { userId } = dto;
      const user = await User.findById(userId);

      // Clear email change data
      user.newEmail = undefined;
      user.emailChangeToken = undefined;
      user.otp = undefined;
      await user.save();

      return {
        success: true,
        message: "Email change request cancelled",
        data: {},
      };
    } catch (error) {
      console.error("Cancel email change service error:", error);
      return {
        success: false,
        message: "Server error cancelling email change",
      };
    }
  }
}

export default AuthService;
