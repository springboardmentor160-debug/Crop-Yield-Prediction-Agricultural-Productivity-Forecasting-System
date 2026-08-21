/**
 * YieldSense AI  -  Auth Types
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  display_name: string;
  role: "farmer" | "admin";
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface AuthResponse {
  uid: string;
  email: string;
  display_name: string;
  role: string;
  token: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type UserRole = "farmer" | "admin";
