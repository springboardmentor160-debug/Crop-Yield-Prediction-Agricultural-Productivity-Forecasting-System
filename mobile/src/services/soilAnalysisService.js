import apiClient from "../api/apiClient";

export async function getSoilAnalysisOptions() {
  const response = await apiClient.get(
    "/soil-analysis/options"
  );

  return response.data;
}

export async function getSoilAnalysis(state) {
  const response = await apiClient.get(
    "/soil-analysis",
    {
      params: {
        state,
      },
    }
  );

  return response.data;
}