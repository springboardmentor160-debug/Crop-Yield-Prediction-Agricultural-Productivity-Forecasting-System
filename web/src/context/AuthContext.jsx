import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import authApi from "../api/authApi";
import { AuthContext } from "./auth-context";
import {
  getToken,
  removeToken,
  saveToken,
} from "../utils/token";



export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const response = await authApi.get("/me");

      setUser(response.data);

      return response.data;
    } catch (error) {
      removeToken();
      setUser(null);

      throw error;
    }
  }, []);

  useEffect(() => {
    const initializeAuthentication = async () => {
      try {
        await loadCurrentUser();
      } catch {
        // Invalid or expired token was already removed.
      } finally {
        setInitializing(false);
      }
    };

    initializeAuthentication();
  }, [loadCurrentUser]);

  const login = useCallback(async (credentials) => {
    const loginResponse = await authApi.post(
      "/login",
      credentials
    );

    saveToken(loginResponse.data.access_token);

    try {
      const userResponse = await authApi.get("/me");

      setUser(userResponse.data);

      return userResponse.data;
    } catch (error) {
      removeToken();
      setUser(null);

      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.post("/logout");
    } finally {
      removeToken();
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    return loadCurrentUser();
  }, [loadCurrentUser]);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      isFarmer: user?.role === "farmer",
      login,
      logout,
      refreshUser,
      updateUser,
    }),
    [
      user,
      initializing,
      login,
      logout,
      refreshUser,
      updateUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}