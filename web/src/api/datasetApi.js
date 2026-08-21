import apiClient from "./apiClient";

const datasetApi = {
  get(url, config) {
    return apiClient.get(
      `/datasets${url}`,
      config
    );
  },

  post(url, data, config) {
    return apiClient.post(
      `/datasets${url}`,
      data,
      config
    );
  },

  put(url, data, config) {
    return apiClient.put(
      `/datasets${url}`,
      data,
      config
    );
  },

  patch(url, data, config) {
    return apiClient.patch(
      `/datasets${url}`,
      data,
      config
    );
  },

  delete(url, config) {
    return apiClient.delete(
      `/datasets${url}`,
      config
    );
  },
};

export default datasetApi;