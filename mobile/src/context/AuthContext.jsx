import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authService } from "../services/authService";
import { tokenStorage } from "../storage/tokenStorage";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    const token = await tokenStorage.get();

    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      await tokenStorage.remove();
      setUser(null);
      throw error;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await loadCurrentUser();
      } catch {
        // Invalid or expired token is removed inside loadCurrentUser.
      } finally {
        setInitializing(false);
      }
    };

    initializeAuth();
  }, [loadCurrentUser]);

  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials);

    await tokenStorage.save(result.access_token);

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      return currentUser;
    } catch (error) {
      await tokenStorage.remove();
      setUser(null);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      await tokenStorage.remove();
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    return loadCurrentUser();
  }, [loadCurrentUser]);

  const updateUserProfile = useCallback(async (payload) => {
    const updatedUser = await authService.updateProfile(payload);
    setUser(updatedUser);

    return updatedUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refreshUser,
      updateUserProfile,
    }),
    [
      user,
      initializing,
      login,
      logout,
      refreshUser,
      updateUserProfile,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}