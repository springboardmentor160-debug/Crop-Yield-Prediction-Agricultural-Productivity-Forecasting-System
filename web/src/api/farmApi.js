import apiClient from "./apiClient";

const farmApi = {
  get(url, config) {
    return apiClient.get(
      `/farms${url}`,
      config
    );
  },

  post(url, data, config) {
    return apiClient.post(
      `/farms${url}`,
      data,
      config
    );
  },

  put(url, data, config) {
    return apiClient.put(
      `/farms${url}`,
      data,
      config
    );
  },

  patch(url, data, config) {
    return apiClient.patch(
      `/farms${url}`,
      data,
      config
    );
  },

  delete(url, config) {
    return apiClient.delete(
      `/farms${url}`,
      config
    );
  },
};

export default farmApi;