/**
 * YieldSense AI  -  API Client
 *
 * Axios-based HTTP client with Firebase auth token injection.
 * Waits for Firebase auth to initialize before sending any request
 * to avoid the race condition where currentUser is null on first load.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { API_BASE_URL } from "@/utils/constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

/**
 * Returns the current Firebase user, waiting for auth to initialize
 * if it hasn't yet. This resolves the race condition where
 * auth.currentUser is null on first page load before Firebase
 * has restored the session from IndexedDB.
 */
function getCurrentUser(): Promise<User | null> {
  // If already resolved (user signed in or definitively signed out), return immediately
  if (auth.currentUser !== null) {
    return Promise.resolve(auth.currentUser);
  }

  // Wait for onAuthStateChanged to fire (fires once with the initial state)
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// Request interceptor  -  attach Firebase token (waits for auth ready)
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const token = await user.getIdToken(false);
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Token fetch failed  -  request proceeds without auth header
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// Response interceptor  -  normalize errors (handles JSON and Blob error responses)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    let message = "An unexpected error occurred";

    if (error.response?.data) {
      if (error.response.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);
          message = parsed.detail || message;
        } catch {
          message = error.message || message;
        }
      } else if (typeof error.response.data === "object") {
        message = error.response.data.detail || error.message || message;
      } else if (typeof error.response.data === "string") {
        message = error.response.data;
      }
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
