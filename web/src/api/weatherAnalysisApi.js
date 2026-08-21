import axios from "axios";

import { getToken } from "../utils/token";

const backendUrl =
  import.meta.env.VITE_BACKEND_URL;

if (!backendUrl) {
  throw new Error(
    "VITE_BACKEND_URL is missing. Check web/.env."
  );
}

const weatherAnalysisApi = axios.create({
  baseURL:
    `${backendUrl.replace(/\/+$/, "")}/weather-analysis`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

weatherAnalysisApi.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

weatherAnalysisApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default weatherAnalysisApi;