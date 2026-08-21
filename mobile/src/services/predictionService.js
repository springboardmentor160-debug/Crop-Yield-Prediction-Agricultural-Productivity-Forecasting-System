import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import apiClient from "../api/apiClient";
import { tokenStorage } from "../storage/tokenStorage";

function getReportsBaseUrl() {
  const apiBaseUrl =
    apiClient.defaults.baseURL?.replace(/\/+$/, "");

  if (!apiBaseUrl) {
    throw new Error(
      "Mobile API base URL is not configured."
    );
  }

  return `${apiBaseUrl}/reports/predictions`;
}

function buildReportFilename(format) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  return `yield_predictions_${timestamp}.${format}`;
}

function getMimeType(format) {
  return format === "pdf"
    ? "application/pdf"
    : "text/csv";
}

async function downloadPredictionReport(
  format,
  params = {}
) {
  const token = await tokenStorage.get();

  if (!token) {
    throw new Error(
      "Your session has expired. Please log in again."
    );
  }

  const queryString = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      queryString.append(key, String(value));
    }
  });

  const reportsBaseUrl = getReportsBaseUrl();

  const requestUrl = queryString.toString()
    ? `${reportsBaseUrl}/${format}?${queryString}`
    : `${reportsBaseUrl}/${format}`;

  const filename = buildReportFilename(format);

  const destinationUri =
    `${FileSystem.cacheDirectory}${filename}`;

  const result = await FileSystem.downloadAsync(
    requestUrl,
    destinationUri,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: getMimeType(format),
      },
    }
  );

  if (
    result.status < 200 ||
    result.status >= 300
  ) {
    throw new Error(
      `Report download failed with status ${result.status}.`
    );
  }

  const sharingAvailable =
    await Sharing.isAvailableAsync();

  if (!sharingAvailable) {
    throw new Error(
      "File sharing is not available on this device."
    );
  }

  await Sharing.shareAsync(result.uri, {
    mimeType: getMimeType(format),
    dialogTitle:
      format === "pdf"
        ? "Share Prediction PDF Report"
        : "Share Prediction CSV Report",
    UTI:
      format === "pdf"
        ? "com.adobe.pdf"
        : "public.comma-separated-values-text",
  });

  return {
    uri: result.uri,
    filename,
  };
}

export const predictionService = {
  async createPrediction(payload) {
    const response = await apiClient.post(
      "/predictions",
      payload
    );

    return response.data;
  },

  async getPredictions(params = {}) {
    const response = await apiClient.get(
      "/predictions",
      {
        params,
      }
    );

    return response.data;
  },

  async getPrediction(id) {
    const response = await apiClient.get(
      `/predictions/${id}`
    );

    return response.data;
  },

  async getPredictionSummary(params = {}) {
    const response = await apiClient.get(
      "/predictions/summary",
      {
        params,
      }
    );

    return response.data;
  },

  async getModelInformation() {
    const response = await apiClient.get(
      "/predictions/model/info"
    );

    return response.data;
  },

  async exportPredictionsCsv(params = {}) {
    return downloadPredictionReport(
      "csv",
      params
    );
  },

  async exportPredictionsPdf(params = {}) {
    return downloadPredictionReport(
      "pdf",
      params
    );
  },
};