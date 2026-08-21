/**
 * YieldSense AI  -  Admin Service
 *
 * API client methods for Admin Control Center & System Administration.
 */

import api from "./api";

export interface AdminStats {
  total_users: number;
  farmers_count: number;
  admin_count: number;
  total_farms: number;
  total_predictions: number;
  total_reports: number;
  model_name: string | null;
  model_accuracy: number | null;
  model_status: string;
  system_status: string;
  version: string;
}

export interface SystemUser {
  uid: string;
  email: string;
  display_name: string;
  role: "farmer" | "admin";
  created_at: string;
  is_active: boolean;
}

export interface SystemPrediction {
  id: string;
  user_id: string;
  crop: string;
  season: string;
  state: string;
  area: number;
  predicted_yield: number;
  total_production: number;
  model_used: string;
  confidence: string;
  risk_level?: string;
  created_at: string;
}

export const adminService = {
  async getAdminStats(): Promise<AdminStats> {
    const response = await api.get<AdminStats>("/admin/stats");
    return response.data;
  },

  async listUsers(): Promise<SystemUser[]> {
    const response = await api.get<SystemUser[]>("/admin/users");
    return response.data;
  },

  async listSystemPredictions(): Promise<SystemPrediction[]> {
    const response = await api.get<SystemPrediction[]>("/admin/predictions");
    return response.data;
  },

  async updateUserRole(targetUid: string, role: "farmer" | "admin"): Promise<void> {

    await api.put(`/admin/users/${targetUid}/role`, { role });
  },
};
