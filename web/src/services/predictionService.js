import apiClient from "../api/apiClient";
import predictionApi from "../api/predictionApi";

function getDownloadFilename(
  contentDisposition,
  fallbackFilename
) {
  if (!contentDisposition) {
    return fallbackFilename;
  }

  const utf8Match = contentDisposition.match(
    /filename\*=UTF-8''([^;]+)/
  );

  if (utf8Match?.[1]) {
    return decodeURIComponent(
      utf8Match[1]
    );
  }

  const normalMatch = contentDisposition.match(
    /filename="?([^";]+)"?/
  );

  return normalMatch?.[1] || fallbackFilename;
}

function downloadBlob(blob, filename) {
  const downloadUrl =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = downloadUrl;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(downloadUrl);
}

async function downloadPredictionReport(
  format,
  params = {}
) {
  const response = await apiClient.get(
    `/reports/predictions/${format}`,
    {
      params,
      responseType: "blob",
    }
  );

  const filename = getDownloadFilename(
    response.headers[
      "content-disposition"
    ],
    `yield_predictions.${format}`
  );

  downloadBlob(
    response.data,
    filename
  );

  return filename;
}

export const predictionService = {
  async createPrediction(payload) {
    const response =
      await predictionApi.post(
        "",
        payload
      );

    return response.data;
  },

  async getPredictions(params = {}) {
    const response =
      await predictionApi.get("", {
        params,
      });

    return response.data;
  },

  async getPrediction(id) {
    const response =
      await predictionApi.get(
        `/${id}`
      );

    return response.data;
  },

  async getPredictionSummary(
    params = {}
  ) {
    const response =
      await predictionApi.get(
        "/summary",
        {
          params,
        }
      );

    return response.data;
  },

  async getModelInformation() {
    const response =
      await predictionApi.get(
        "/model/info"
      );

    return response.data;
  },

  async exportPredictionsCsv(
    params = {}
  ) {
    return downloadPredictionReport(
      "csv",
      params
    );
  },

  async exportPredictionsPdf(
    params = {}
  ) {
    return downloadPredictionReport(
      "pdf",
      params
    );
  },
};