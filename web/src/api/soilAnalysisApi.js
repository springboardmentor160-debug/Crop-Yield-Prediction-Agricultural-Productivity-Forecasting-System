import apiClient from "./apiClient";

const soilAnalysisApi = {
  get(url, config) {
    return apiClient.get(
      `/soil-analysis${url}`,
      config
    );
  },

  post(url, data, config) {
    return apiClient.post(
      `/soil-analysis${url}`,
      data,
      config
    );
  },

  put(url, data, config) {
    return apiClient.put(
      `/soil-analysis${url}`,
      data,
      config
    );
  },

  patch(url, data, config) {
    return apiClient.patch(
      `/soil-analysis${url}`,
      data,
      config
    );
  },

  delete(url, config) {
    return apiClient.delete(
      `/soil-analysis${url}`,
      config
    );
  },
};

export default soilAnalysisApi;