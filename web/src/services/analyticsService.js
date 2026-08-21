import analyticsApi from "../api/analyticsApi";

export async function getAnalyticsDashboard() {
  const response = await analyticsApi.get("/dashboard");
  return response.data;
}