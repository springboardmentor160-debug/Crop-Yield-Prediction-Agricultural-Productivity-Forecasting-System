/**
 * YieldSense AI  -  Auth Context
 *
 * Provides authentication state and methods throughout the app.
 * Wraps Firebase onAuthStateChanged for session persistence.
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import type { UserProfile } from "@/types/user";
import type { RegisterCredentials } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile | null>;
  signup: (credentials: RegisterCredentials) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from backend with single retry for auth transition
  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const data = await userService.getProfile();
      setProfile(data);
      return data;
    } catch {
      // Retry once after 300ms delay in case token was in transition during sign-in
      await new Promise((r) => setTimeout(r, 300));
      try {
        const data = await userService.getProfile();
        setProfile(data);
        return data;
      } catch {
        setProfile(null);
        return null;
      }
    }
  }, []);


  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchProfile]);

  const login = async (email: string, password: string): Promise<UserProfile | null> => {
    // Ensure clean state before login
    if (auth.currentUser) {
      await authService.logout();
    }
    const firebaseUser = await authService.login(email, password);
    setUser(firebaseUser);
    const userProfile = await fetchProfile();
    return userProfile;
  };

  const signup = async (credentials: RegisterCredentials): Promise<UserProfile | null> => {
    // Ensure any existing user session is completely signed out first
    if (auth.currentUser) {
      await authService.logout();
    }
    setUser(null);
    setProfile(null);

    // Register via backend (creates Firebase user + Firestore doc)
    await authService.register(credentials);
    // Then login client-side with new user credentials
    const firebaseUser = await authService.login(credentials.email, credentials.password);
    setUser(firebaseUser);
    const userProfile = await fetchProfile();
    return userProfile;
  };


  const logout = async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
  };


  const resetPassword = async (email: string) => {
    await authService.forgotPassword(email);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        signup,
        logout,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
