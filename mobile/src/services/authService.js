import authApi from "../api/authApi";

export const authService = {
  async register(payload) {
    const response = await authApi.post("/register", payload);
    return response.data;
  },

  async login(payload) {
    const response = await authApi.post("/login", payload);
    return response.data;
  },

  async logout() {
    const response = await authApi.post("/logout");
    return response.data;
  },

  async sendOtp(email) {
    const response = await authApi.post("/send-otp", { email });
    return response.data;
  },

  async verifyOtp(payload) {
    const response = await authApi.post("/verify-otp", payload);
    return response.data;
  },

  async forgotPassword(email) {
    const response = await authApi.post("/forgot-password", { email });
    return response.data;
  },

  async resetPassword(payload) {
    const response = await authApi.post("/reset-password", payload);
    return response.data;
  },

  async getCurrentUser() {
    const response = await authApi.get("/me");
    return response.data;
  },

  async updateProfile(payload) {
    const response = await authApi.put("/profile", payload);
    return response.data;
  },

  async changePassword(payload) {
    const response = await authApi.post("/change-password", payload);
    return response.data;
  },

  async getFarmerAccess() {
    const response = await authApi.get("/farmer-only");
    return response.data;
  },

  async getAdminAccess() {
    const response = await authApi.get("/admin-only");
    return response.data;
  },
};