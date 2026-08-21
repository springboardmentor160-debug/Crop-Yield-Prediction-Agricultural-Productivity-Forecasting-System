import datasetApi from "../api/datasetApi";

export const datasetService = {
  async importHistoricalYield(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await datasetApi.post(
      "/historical-yield/import",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  async importSoil(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await datasetApi.post("/soil/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  async importWeather(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await datasetApi.post("/weather/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  async getHistoricalYield(params = {}) {
    const response = await datasetApi.get("/historical-yield", {
      params,
    });

    return response.data;
  },

  async getSoil(params = {}) {
    const response = await datasetApi.get("/soil", {
      params,
    });

    return response.data;
  },

  async getWeather(params = {}) {
    const response = await datasetApi.get("/weather", {
      params,
    });

    return response.data;
  },

  async getHistoricalYieldSummary(params = {}) {
    const response = await datasetApi.get(
      "/historical-yield/summary",
      {
        params,
      }
    );

    return response.data;
  },

  async getSoilSummary() {
    const response = await datasetApi.get("/soil/summary");
    return response.data;
  },

  async getWeatherSummary(params = {}) {
    const response = await datasetApi.get("/weather/summary", {
      params,
    });

    return response.data;
  },
    async getFarmOptions() {
      const response = await datasetApi.get("/farm-options");

      return response.data;
    },
};