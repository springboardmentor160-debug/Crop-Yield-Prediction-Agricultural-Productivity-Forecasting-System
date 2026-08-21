// lib/auth.ts
// This file was missing from the project — both lib/api.ts and the auth
// page import from it. Drop this in at that exact path.

export interface SessionUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

// Alias for backward compatibility with existing imports
export const getStoredUser = getUser;

export function setSession(token: string, user: SessionUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function logoutAndRedirect() {
  clearSession();
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

// Single source of truth for "where does each role land" — the auth page
// and the analyst layout guard both use this so they can never drift apart.
export function redirectPathForRole(role: string): string {
  switch (role) {
    case "Admin":
      return "/admin";
    case "Analyst":
      return "/analyst/dashboard";
    default:
      return "/dashboard";
  }
}
