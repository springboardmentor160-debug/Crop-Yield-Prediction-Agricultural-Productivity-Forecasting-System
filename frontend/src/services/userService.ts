/**
 * YieldSense AI  -  User Service
 *
 * API calls for user profile operations.
 */

import api from "./api";
import type { UserProfile, UserUpdate } from "@/types/user";

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get("/users/profile");
    return response.data;
  },

  async updateProfile(data: UserUpdate): Promise<UserProfile> {
    const response = await api.put("/users/profile", data);
    return response.data;
  },
};
