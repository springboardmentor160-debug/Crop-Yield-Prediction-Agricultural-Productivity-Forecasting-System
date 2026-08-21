import apiClient from "./apiClient";

const recommendationApi = {
  get(url, config) {
    return apiClient.get(
      `/crop-recommendation${url}`,
      config
    );
  },

  post(url, data, config) {
    return apiClient.post(
      `/crop-recommendation${url}`,
      data,
      config
    );
  },

  put(url, data, config) {
    return apiClient.put(
      `/crop-recommendation${url}`,
      data,
      config
    );
  },

  patch(url, data, config) {
    return apiClient.patch(
      `/crop-recommendation${url}`,
      data,
      config
    );
  },

  delete(url, config) {
    return apiClient.delete(
      `/crop-recommendation${url}`,
      config
    );
  },
};

export default recommendationApi;