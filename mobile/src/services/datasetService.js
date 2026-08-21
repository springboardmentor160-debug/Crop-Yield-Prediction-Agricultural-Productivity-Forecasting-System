import apiClient from "../api/apiClient";

export const datasetService = {
  async getHistoricalYield(params = {}) {
    const response = await apiClient.get(
      "/datasets/historical-yield",
      {
        params,
      }
    );

    return response.data;
  },

  async getHistoricalYieldSummary(params = {}) {
    const response = await apiClient.get(
      "/datasets/historical-yield/summary",
      {
        params,
      }
    );

    return response.data;
  },

  async getSoil(params = {}) {
    const response = await apiClient.get("/datasets/soil", {
      params,
    });

    return response.data;
  },

  async getSoilSummary() {
    const response = await apiClient.get(
      "/datasets/soil/summary"
    );

    return response.data;
  },

  async getWeather(params = {}) {
    const response = await apiClient.get(
      "/datasets/weather",
      {
        params,
      }
    );

    return response.data;
  },

  async getWeatherSummary(params = {}) {
    const response = await apiClient.get(
      "/datasets/weather/summary",
      {
        params,
      }
    );

    return response.data;
  },

  async getFarmOptions() {
    const response = await apiClient.get(
      "/datasets/farm-options"
    );

    return response.data;
  },
};