/**
 * YieldSense AI  -  Auth Service
 *
 * Client-side authentication service using Firebase Auth.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import api from "./api";
import type { RegisterCredentials } from "@/types/auth";

export const authService = {
  /**
   * Register a new user via the backend API.
   * The backend creates the Firebase user and Firestore profile.
   */
  async register(credentials: RegisterCredentials) {
    const response = await api.post("/auth/register", credentials);
    return response.data;
  },

  /**
   * Login using Firebase client SDK.
   */
  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  /**
   * Logout the current user.
   */
  async logout() {
    await signOut(auth);
  },

  /**
   * Send a password reset email.
   */
  async forgotPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  },

  /**
   * Get the current user's Firebase ID token.
   */
  async getToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  },

  /**
   * Get the current Firebase user.
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  },
};
