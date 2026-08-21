/**
 * YieldSense AI  -  Farm Service
 *
 * API calls for farm CRUD operations.
 */

import api from "./api";
import type { Farm, FarmCreate, FarmUpdate, FarmListResponse, FarmStats } from "@/types/farm";

export const farmService = {
  async listFarms(page: number = 1, limit: number = 10): Promise<FarmListResponse> {
    const response = await api.get("/farms/", { params: { page, limit } });
    return response.data;
  },

  async getFarm(id: string): Promise<Farm> {
    const response = await api.get(`/farms/${id}`);
    return response.data;
  },

  async createFarm(data: FarmCreate): Promise<Farm> {
    const response = await api.post("/farms/", data);
    return response.data;
  },

  async updateFarm(id: string, data: FarmUpdate): Promise<Farm> {
    const response = await api.put(`/farms/${id}`, data);
    return response.data;
  },

  async deleteFarm(id: string): Promise<void> {
    await api.delete(`/farms/${id}`);
  },

  async getStats(): Promise<FarmStats> {
    const response = await api.get("/farms/stats");
    return response.data;
  },
};
