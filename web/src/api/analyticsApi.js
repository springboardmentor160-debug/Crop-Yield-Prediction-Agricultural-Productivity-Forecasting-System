import apiClient from "./apiClient";

const analyticsApi = {
  get(url, config) {
    return apiClient.get(
      `/analytics${url}`,
      config
    );
  },

  post(url, data, config) {
    return apiClient.post(
      `/analytics${url}`,
      data,
      config
    );
  },

  put(url, data, config) {
    return apiClient.put(
      `/analytics${url}`,
      data,
      config
    );
  },

  patch(url, data, config) {
    return apiClient.patch(
      `/analytics${url}`,
      data,
      config
    );
  },

  delete(url, config) {
    return apiClient.delete(
      `/analytics${url}`,
      config
    );
  },
};

export default analyticsApi;