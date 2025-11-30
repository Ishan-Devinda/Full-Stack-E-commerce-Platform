import axios from "axios";
import {
  AuthResponse,
  SignupStep1Request,
  VerifyOTPRequest,
  SetPasswordRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  EmailChangeRequest,
  VerifyEmailChangeRequest,
  ConfirmEmailChangeRequest,
} from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (typeof window !== "undefined") {
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            const response = await axios.post(
              `${API_BASE_URL}/auth/refresh-token`,
              {
                refreshToken,
              }
            );

            const { accessToken, refreshToken: newRefreshToken } =
              response.data;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  // Signup flow
  signup: (data: SignupStep1Request) => api.post("/auth/signup", data),

  verifyOTP: (data: VerifyOTPRequest) => api.post("/auth/verify-otp", data),

  setPassword: (data: SetPasswordRequest) =>
    api.post("/auth/set-password", data),

  // Login
  login: (data: LoginRequest) => api.post<AuthResponse>("/auth/login", data),

  // Google OAuth
  googleAuth: () => {
    if (typeof window !== "undefined") {
      window.open(`${API_BASE_URL}/auth/google`, "_self");
    }
  },

  // Forgot password flow
  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post("/auth/forgot-password", data),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post("/auth/reset-password-with-otp", data),

  // Email change flow
  requestEmailChange: (data: EmailChangeRequest) =>
    api.post("/auth/request-email-change", data),

  verifyEmailChangeOTP: (data: VerifyEmailChangeRequest) =>
    api.post("/auth/verify-email-change-otp", data),

  confirmEmailChange: (data: ConfirmEmailChangeRequest) =>
    api.post("/auth/confirm-email-change-with-otp", data),

  resendEmailChangeOTP: () => api.post("/auth/resend-email-change-otp"),

  cancelEmailChange: () => api.post("/auth/cancel-email-change"),

  // Logout
  logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken }),
};

export default api;
