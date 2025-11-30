export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SignupStep1Request {
  username: string;
  email: string;
}

export interface VerifyOTPRequest {
  userId: string;
  otp: string;
}

export interface SetPasswordRequest {
  userId: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  userId: string;
  otp: string;
  password: string;
  confirmPassword: string;
}

export interface EmailChangeRequest {
  newEmail: string;
  password: string;
}

export interface VerifyEmailChangeRequest {
  userId: string;
  otp: string;
}

export interface ConfirmEmailChangeRequest {
  confirmToken: string;
  otp: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  signup: (data: SignupStep1Request) => Promise<string>;
  verifyOTP: (data: VerifyOTPRequest) => Promise<void>;
  setPassword: (data: SetPasswordRequest) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  requestEmailChange: (data: EmailChangeRequest) => Promise<string>;
  verifyEmailChangeOTP: (data: VerifyEmailChangeRequest) => Promise<string>;
  confirmEmailChange: (data: ConfirmEmailChangeRequest) => Promise<void>;
}
