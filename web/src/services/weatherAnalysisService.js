import weatherAnalysisApi from "../api/weatherAnalysisApi";

export async function getWeatherAnalysisOptions() {
  const response = await weatherAnalysisApi.get(
    "/options"
  );

  return response.data;
}

export async function getWeatherAnalysis({
  state,
  startYear,
  endYear,
}) {
  const response = await weatherAnalysisApi.get(
    "",
    {
      params: {
        state,
        start_year: startYear,
        end_year: endYear,
      },
    }
  );

  return response.data;
}