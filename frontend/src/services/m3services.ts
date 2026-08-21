/**
 * YieldSense AI  -  Analytics, Recommendations, Risk, History, Report Services (Milestone 3)
 */

import api from "./api";
import type { DashboardSummary, AnalyticsData } from "@/types/analytics";
import type {
  RecommendationRequest,
  RecommendationResponse,
  RiskAssessmentRequest,
  RiskAssessmentResponse,
  PredictionHistoryResponse,
  PredictionHistoryItem,
  ReportRequest,
  ReportResponse,
  ReportSummary,
  ReportListResponse,
} from "@/types/m3types";

// ============================================================
// Analytics Service
// ============================================================

export const analyticsService = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await api.get<DashboardSummary>("/analytics/dashboard");
    return response.data;
  },

  async getAnalyticsData(): Promise<AnalyticsData> {
    const response = await api.get<AnalyticsData>("/analytics/");
    return response.data;
  },
};

// ============================================================
// Recommendation Service
// ============================================================

export const recommendationService = {
  async generateRecommendations(data: RecommendationRequest): Promise<RecommendationResponse> {
    const response = await api.post<RecommendationResponse>("/recommendations/", data);
    return response.data;
  },
};

// ============================================================
// Risk Service
// ============================================================

export const riskService = {
  async assessRisk(data: RiskAssessmentRequest): Promise<RiskAssessmentResponse> {
    const response = await api.post<RiskAssessmentResponse>("/risk/assess", data);
    return response.data;
  },
};

// ============================================================
// History Service
// ============================================================

export const historyService = {
  async getHistory(page: number = 1, limit: number = 20): Promise<PredictionHistoryResponse> {
    const response = await api.get<PredictionHistoryResponse>("/history/", {
      params: { page, limit },
    });
    return response.data;
  },

  async getPrediction(id: string): Promise<PredictionHistoryItem> {
    const response = await api.get<PredictionHistoryItem>(`/history/${id}`);
    return response.data;
  },

  async deletePrediction(id: string): Promise<void> {
    await api.delete(`/history/${id}`);
  },
};

// ============================================================
// Report Service
// ============================================================

export const reportService = {
  async generateReport(data: ReportRequest): Promise<ReportResponse> {
    const response = await api.post<ReportResponse>("/reports/", data);
    return response.data;
  },

  async getReports(): Promise<ReportListResponse> {
    const response = await api.get<ReportListResponse>("/reports/");
    return response.data;
  },

  async getReport(id: string): Promise<ReportResponse> {
    const response = await api.get<ReportResponse>(`/reports/${id}`);
    return response.data;
  },

  async deleteReport(id: string): Promise<void> {
    await api.delete(`/reports/${id}`);
  },

  async downloadPdf(reportId: string, filename?: string): Promise<void> {
    const response = await api.get(`/export/pdf/${reportId}`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `YieldSense_Report_${reportId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async downloadHistoryCsv(): Promise<void> {
    const response = await api.get("/export/csv/history", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "YieldSense_Prediction_History.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async downloadReportCsv(reportId: string): Promise<void> {
    const response = await api.get(`/export/csv/report/${reportId}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `YieldSense_Report_${reportId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
