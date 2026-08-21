import apiClient from "./apiClient";

const predictionApi = {
  defaults: {
    get baseURL() {
      return `${apiClient.defaults.baseURL}/predictions`;
    },
  },

  get(url, config) {
    return apiClient.get(
      `/predictions${url}`,
      config
    );
  },

  post(url, data, config) {
    return apiClient.post(
      `/predictions${url}`,
      data,
      config
    );
  },

  put(url, data, config) {
    return apiClient.put(
      `/predictions${url}`,
      data,
      config
    );
  },

  patch(url, data, config) {
    return apiClient.patch(
      `/predictions${url}`,
      data,
      config
    );
  },

  delete(url, config) {
    return apiClient.delete(
      `/predictions${url}`,
      config
    );
  },
};

export default predictionApi;