import { create } from "axios";
import { config } from "../constants/config";
import { tokenStorage } from "../storage/tokenStorage";

const backendRootUrl =
  config.apiBaseUrl.replace(/\/api\/?$/, "");

const weatherApi = create({
  baseURL: `${backendRootUrl}/weather-analysis`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

weatherApi.interceptors.request.use(
  async (requestConfig) => {
    const token = await tokenStorage.get();

    if (token) {
      requestConfig.headers.Authorization =
        `Bearer ${token}`;
    }

    return requestConfig;
  },
  (error) => Promise.reject(error)
);

weatherApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await tokenStorage.remove();
    }

    return Promise.reject(error);
  }
);

export async function getWeatherAnalysisOptions() {
  const response = await weatherApi.get(
    "/options"
  );

  return response.data;
}

export async function getWeatherAnalysis({
  state,
  startYear,
  endYear,
}) {
  const response = await weatherApi.get("", {
    params: {
      state,
      start_year: startYear,
      end_year: endYear,
    },
  });

  return response.data;
}