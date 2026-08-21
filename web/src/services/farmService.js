import farmApi from "../api/farmApi";

export const farmService = {
  async createFarm(payload) {
    const response = await farmApi.post("", payload);
    return response.data;
  },

  async getFarms(params = {}) {
    const response = await farmApi.get("", { params });
    return response.data;
  },

  async getFarm(farmId) {
    const response = await farmApi.get(`/${farmId}`);
    return response.data;
  },

  async updateFarm(farmId, payload) {
    const response = await farmApi.put(`/${farmId}`, payload);
    return response.data;
  },

  async deactivateFarm(farmId) {
    const response = await farmApi.patch(`/${farmId}/deactivate`);
    return response.data;
  },

  async reactivateFarm(farmId) {
    const response = await farmApi.patch(`/${farmId}/reactivate`);
    return response.data;
  },

  async softDeleteFarm(farmId) {
    const response = await farmApi.delete(`/${farmId}`);
    return response.data;
  },

  async getSummary(params = {}) {
    const response = await farmApi.get("/summary", { params });
    return response.data;
  },

  async getAdminFarms(params = {}) {
    const response = await farmApi.get("/admin/all", { params });
    return response.data;
  },
};