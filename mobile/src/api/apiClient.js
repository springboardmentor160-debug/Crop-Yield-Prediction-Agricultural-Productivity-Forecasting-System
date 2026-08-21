import { create } from "axios";

import { config } from "../constants/config";
import { tokenStorage } from "../storage/tokenStorage";

const apiClient = create({
  baseURL: config.apiBaseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await tokenStorage.remove();
    }

    return Promise.reject(error);
  }
);

export default apiClient;