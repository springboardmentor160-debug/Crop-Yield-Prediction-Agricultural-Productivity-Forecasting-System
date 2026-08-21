import apiClient from "../api/apiClient";

export const farmService = {
  async createFarm(payload) {
    const response = await apiClient.post("/farms", payload);
    return response.data;
  },

  async getFarms(params = {}) {
    const response = await apiClient.get("/farms", { params });
    return response.data;
  },

  async getFarm(farmId) {
    const response = await apiClient.get(`/farms/${farmId}`);
    return response.data;
  },

  async updateFarm(farmId, payload) {
    const response = await apiClient.put(`/farms/${farmId}`, payload);
    return response.data;
  },

  async deactivateFarm(farmId) {
    const response = await apiClient.patch(
      `/farms/${farmId}/deactivate`
    );

    return response.data;
  },

  async reactivateFarm(farmId) {
    const response = await apiClient.patch(
      `/farms/${farmId}/reactivate`
    );

    return response.data;
  },

  async softDeleteFarm(farmId) {
    const response = await apiClient.delete(`/farms/${farmId}`);
    return response.data;
  },

  async getSummary(params = {}) {
    const response = await apiClient.get("/farms/summary", {
      params,
    });

    return response.data;
  },

  async getAdminFarms(params = {}) {
    const response = await apiClient.get("/farms/admin/all", {
      params,
    });

    return response.data;
  },
};