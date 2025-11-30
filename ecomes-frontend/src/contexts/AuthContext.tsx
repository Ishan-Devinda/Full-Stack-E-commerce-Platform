"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "@/services/api";
import {
  AuthContextType,
  User,
  LoginRequest,
  SignupStep1Request,
  VerifyOTPRequest,
  SetPasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  EmailChangeRequest,
  VerifyEmailChangeRequest,
  ConfirmEmailChangeRequest,
} from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      if (typeof window !== "undefined") {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("accessToken");

        if (userData && token) {
          setUser(JSON.parse(userData));
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authAPI.login(credentials);
      const { accessToken, refreshToken, user: userData } = response.data;

      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));
      }

      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const logout = async () => {
    try {
      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          await authAPI.logout(refreshToken);
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
      setUser(null);
    }
  };

  const signup = async (data: SignupStep1Request): Promise<string> => {
    try {
      const response = await authAPI.signup(data);
      return response.data.userId;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Signup failed");
    }
  };

  const verifyOTP = async (data: VerifyOTPRequest) => {
    try {
      await authAPI.verifyOTP(data);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "OTP verification failed"
      );
    }
  };

  const setPassword = async (data: SetPasswordRequest) => {
    try {
      const response = await authAPI.setPassword(data);
      const { accessToken, refreshToken, user: userData } = response.data;

      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));
      }

      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Password setup failed");
    }
  };

  const forgotPassword = async (email: string): Promise<string> => {
    try {
      const response = await authAPI.forgotPassword({ email });
      return response.data.userId;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Password reset request failed"
      );
    }
  };

  const resetPassword = async (data: ResetPasswordRequest) => {
    try {
      await authAPI.resetPassword(data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Password reset failed");
    }
  };

  const requestEmailChange = async (
    data: EmailChangeRequest
  ): Promise<string> => {
    try {
      const response = await authAPI.requestEmailChange(data);
      return response.data.userId;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Email change request failed"
      );
    }
  };

  const verifyEmailChangeOTP = async (
    data: VerifyEmailChangeRequest
  ): Promise<string> => {
    try {
      const response = await authAPI.verifyEmailChangeOTP(data);
      return response.data.confirmToken;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Email change verification failed"
      );
    }
  };

  const confirmEmailChange = async (data: ConfirmEmailChangeRequest) => {
    try {
      const response = await authAPI.confirmEmailChange(data);
      const { user: userData } = response.data;

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(userData));
      }
      setUser(userData);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Email change confirmation failed"
      );
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    signup,
    verifyOTP,
    setPassword,
    forgotPassword,
    resetPassword,
    requestEmailChange,
    verifyEmailChangeOTP,
    confirmEmailChange,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
