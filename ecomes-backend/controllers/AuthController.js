import AuthService from "../services/AuthService.js";
import { successResponse, errorResponse } from "../utils/responseUtil.js";

const authService = new AuthService();

class AuthController {
  // Handles user signup with email and username
  async signupController(req, res, next) {
    try {
      const dto = req.body;
      const response = await authService.signupService(dto);

      if (response && response.success) {
        return successResponse(res, response.message, response.data, 201);
      } else {
        return errorResponse(res, response.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }

  // Handles OTP verification for email confirmation
  async verifyOtpController(req, res, next) {
    try {
      const dto = req.body;
      const response = await authService.verifyOtpService(dto);

      if (response && response.success) {
        return successResponse(res, response.message, response.data);
      } else {
        return errorResponse(res, response.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }

  // Handles password setup after email verification
  async setPasswordController(req, res, next) {
    try {
      const dto = req.body;
      const response = await authService.setPasswordService(dto);

      if (response && response.success) {
        return successResponse(res, response.message, response.data);
      } else {
        return errorResponse(res, response.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }

  // Handles user login with email and password
  async loginController(req, res, next) {
    try {
      const dto = req.body;
      const response = await authService.loginService(dto);

      if (response && response.success) {
        return successResponse(res, response.message, response.data);
      } else {
        return errorResponse(res, response.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }

  // Handles token refresh
  async refreshTokenController(req, res, next) {
    try {
      const dto = req.body;
      const response = await authService.refreshTokenService(dto);

      if (response && response.success) {
        return successResponse(res, response.message, response.data);
      } else {
        return errorResponse(res, response.message, 401);
      }
    } catch (error) {
      next(error);
    }
  }

  // Handles user logout
  async logoutController(req, res, next) {
    try {
      const dto = req.body;
      const response = await authService.logoutService(dto);

      if (response && response.success) {
        return successResponse(res, response.message, response.data);
      } else {
        return errorResponse(res, response.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }

  // Handles forgot password request
  async forgotPasswordController(req, res, next) {
    try {
      const dto = req.body;
      const response = await authService.forgotPasswordService(dto);

      if (response && response.success) {
        return successResponse(res, response.message, response.data);
      } else {
        return errorResponse(res, response.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }

  // Handles password reset with OTP
  async resetPasswordWithOtpController(req, res, next) {
    try {
      const dto = req.body;
      const response = await authService.resetPasswordWithOtpService(dto);

      if (response && response.success) {
        return successResponse(res, response.message, response.data);
      } else {
        return errorResponse(res, response.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }

  // Handles Google OAuth initiation
  async googleAuthController(req, res, next) {
    try {
      const response = await authService.googleAuthService();

      if (response && response.success) {
        // For OAuth, we need to initiate the passport authentication
        return res.redirect(response.data.redirectUrl);
      } else {
        return errorResponse(res, response.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }

  // Handles Google OAuth callback
  async googleCallbackController(req, res, next) {
    try {
      const response = await authService.googleCallbackService(req.user);

      if (response && response.success) {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const redirectUrl = `${frontendUrl}/auth/success?accessToken=${response.data.accessToken}&refreshToken=${response.data.refreshToken}&userId=${response.data.user._id}&email=${response.data.user.email}&username=${response.data.user.username}`;

        return res.redirect(redirectUrl);
      } else {
        return errorResponse(res, response.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }

  // Handles email change request
  async requestEmailChangeController(req, res, next) {
    try {
      const dto = { ...req.body, userId: req.user._id };
      const response = await authService.requestEmailChangeService(dto);

      if (response && response.success) {
        return successResponse(res, response.message, response.data);
      } else {
        return errorResponse(res, response.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }

  // Handles email change OTP verification
  async verifyEmailChangeOtpController(req, res, next) {
    try {
      const dto = { ...req.body, userId: req.user._id };
      const response = await authService.verifyEmailChangeOtpService(dto);

      if (response && response.success) {
        return successResponse(res, response.message, response.data);
      } else {
        return errorResponse(res, response.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }

  // Handles final email change confirmation
  async confirmEmailChangeWithOtpController(req, res, next) {
    try {
      const dto = req.body;
      const response = await authService.confirmEmailChangeWithOtpService(dto);

      if (response && response.success) {
        return successResponse(res, response.message, response.data);
      } else {
        return errorResponse(res, response.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }

  // Handles resending email change OTP
  async resendEmailChangeOtpController(req, res, next) {
    try {
      const dto = { userId: req.user._id };
      const response = await authService.resendEmailChangeOtpService(dto);

      if (response && response.success) {
        return successResponse(res, response.message, response.data);
      } else {
        return errorResponse(res, response.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }

  // Handles email change cancellation
  async cancelEmailChangeController(req, res, next) {
    try {
      const dto = { userId: req.user._id };
      const response = await authService.cancelEmailChangeService(dto);

      if (response && response.success) {
        return successResponse(res, response.message, response.data);
      } else {
        return errorResponse(res, response.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
