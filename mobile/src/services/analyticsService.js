import apiClient from "../api/apiClient";

export async function getAnalyticsDashboard() {
  const response = await apiClient.get(
    "/analytics/dashboard"
  );

  return response.data;
}