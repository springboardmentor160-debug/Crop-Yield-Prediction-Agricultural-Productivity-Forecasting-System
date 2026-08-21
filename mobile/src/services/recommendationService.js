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

  return `${apiBaseUrl}/reports/recommendations`;
}

function buildReportFilename(format) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  return `crop_recommendations_${timestamp}.${format}`;
}

function getMimeType(format) {
  return format === "pdf"
    ? "application/pdf"
    : "text/csv";
}

async function downloadRecommendationReport(
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
        ? "Share Recommendation PDF Report"
        : "Share Recommendation CSV Report",
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

export const recommendationService = {
  async createRecommendation(payload) {
    const response = await apiClient.post(
      "/crop-recommendation",
      payload
    );

    return response.data;
  },

  async getRecommendationHistory(params = {}) {
    const response = await apiClient.get(
      "/crop-recommendation/history",
      {
        params,
      }
    );

    return response.data;
  },

  async getRecommendation(recommendationId) {
    const response = await apiClient.get(
      `/crop-recommendation/${recommendationId}`
    );

    return response.data;
  },

  async exportRecommendationsCsv(params = {}) {
    return downloadRecommendationReport(
      "csv",
      params
    );
  },

  async exportRecommendationsPdf(params = {}) {
    return downloadRecommendationReport(
      "pdf",
      params
    );
  },
};