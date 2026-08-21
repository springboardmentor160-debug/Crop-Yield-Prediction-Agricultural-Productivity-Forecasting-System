import apiClient from "./apiClient";

const authApi = {
  get(url, config) {
    return apiClient.get(`/auth${url}`, config);
  },

  post(url, data, config) {
    return apiClient.post(`/auth${url}`, data, config);
  },

  put(url, data, config) {
    return apiClient.put(`/auth${url}`, data, config);
  },

  patch(url, data, config) {
    return apiClient.patch(`/auth${url}`, data, config);
  },

  delete(url, config) {
    return apiClient.delete(`/auth${url}`, config);
  },
};

export default authApi;