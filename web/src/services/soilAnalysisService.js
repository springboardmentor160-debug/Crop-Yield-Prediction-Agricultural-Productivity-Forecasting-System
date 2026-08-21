import soilAnalysisApi from "../api/soilAnalysisApi";

export async function getSoilAnalysisOptions() {
  const response =
    await soilAnalysisApi.get("/options");

  return response.data;
}

export async function getSoilAnalysis(state) {
  const response =
    await soilAnalysisApi.get("", {
      params: {
        state,
      },
    });

  return response.data;
}