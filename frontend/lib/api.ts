const API_BASE = "http://127.0.0.1:8000/api/v1";

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error("Something went wrong");
    return null;
  }

  if (!res.ok) throw new Error(data.detail || data.message || "Something went wrong");
  return data;
}

export const api = {
  // ── Auth ──────────────────────────────────────
  register: (body: object) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: object) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  // ── User ──────────────────────────────────────
  getProfile: () => request("/users/me"),
  updateProfile: (body: object) =>
    request("/users/me", { method: "PUT", body: JSON.stringify(body) }),

  // ── Farms ─────────────────────────────────────
  getFarms: () => request("/farms/"),
  getFarm: (id: number) => request(`/farms/${id}`),
  createFarm: (body: object) =>
    request("/farms/", { method: "POST", body: JSON.stringify(body) }),
  updateFarm: (id: number, body: object) =>
    request(`/farms/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteFarm: (id: number) =>
    request(`/farms/${id}`, { method: "DELETE" }),

  // ── Crops ─────────────────────────────────────
  getCrops: (farmId: number) => request(`/data/farms/${farmId}/crops`),
  addCrop: (farmId: number, body: object) =>
    request(`/data/farms/${farmId}/crops`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // ── Yield Prediction ──────────────────────────
  predict: (body: object) =>
    request("/predictions/predict", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getPredictionHistory: () => request("/predictions/history"),
  getFarmPredictions: (farmId: number) =>
    request(`/predictions/farm/${farmId}`),
  getModelMetrics: () => request("/predictions/model/metrics"),
  getAvailableCrops: () => request("/predictions/crops/available"),

  // ── Weather ───────────────────────────────────
  getWeather: (location: string) =>
    request(`/weather/current?location=${encodeURIComponent(location)}`),
  getWeatherForecast: (location: string) =>
    request(`/weather/forecast?location=${encodeURIComponent(location)}`),
  getRainfallTrend: () => request("/weather/rainfall-trend"),
  getClimateAnalysis: (location: string) =>
    request(`/weather/climate-analysis?location=${location}`),
  getWeatherImpact: (rainfall: number, temperature: number, crop: string) =>
    request(
      `/weather/impact-assessment?rainfall_mm=${rainfall}&temperature_c=${temperature}&crop_type=${encodeURIComponent(crop)}`
    ),
  getWeatherAlerts: (location: string) =>
    request(`/weather/alerts?location=${encodeURIComponent(location)}`),
  getWeatherAdvisory: (location: string) =>
    request(`/weather/advisory?location=${encodeURIComponent(location)}`),

  // ── Soil ──────────────────────────────────────
  analyzeSoil: (body: object) =>
    request("/soil/analyze", { method: "POST", body: JSON.stringify(body) }),
  getSoilTypes: () => request("/soil/types"),
  getSoilFertilityGuide: () => request("/soil/fertility-guide"),
  getSoilCropRecommendation: (body: object) =>
    request("/soil/crop-recommendation", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getSoilHistory: () => request("/soil/history"),
  getFarmSoilHistory: (farmId: number) => request(`/soil/history/${farmId}`),
  getSoilHealthScore: (farmId: number) => request(`/soil/health-score/${farmId}`),

  // ── Recommendations ──────────────────────────
  getRecommendations: () => request("/recommendations/"),
  generateRecommendations: (body: object) =>
    request("/recommendations/generate", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // ── Risk ──────────────────────────────────────
  getRiskAssessment: (params: string) => request(`/risk/assessment?${params}`),
  getDiseaseRisk: (
    cropType: string,
    rainfall: number,
    temperature: number,
    humidity: number
  ) =>
    request(
      `/risk/disease?crop_type=${encodeURIComponent(cropType)}&rainfall_mm=${rainfall}&temperature_c=${temperature}&humidity=${humidity}`
    ),
  getProfitRisk: (cropType: string, area: number, expectedYield: number) =>
    request(
      `/risk/profit?crop_type=${encodeURIComponent(cropType)}&area_hectares=${area}&expected_yield_tons=${expectedYield}`
    ),

  // ── Analytics ─────────────────────────────────
  getDashboardAnalytics: () => request("/analytics/dashboard"),
  getDashboardSummary: () => request("/analytics/dashboard/summary"),
  getYieldTrends: () => request("/analytics/yield-trends"),
  getCropPerformance: () => request("/analytics/crop-performance"),
  getFarmComparison: () => request("/analytics/farm-comparison"),
  getProductivity: () => request("/analytics/productivity"),
  getRiskDistribution: () => request("/analytics/risk-distribution"),
  getSoilHealthAnalytics: () => request("/analytics/soil-health"),
  getWeatherImpactAnalytics: () => request("/analytics/weather-impact"),
  getRecentPredictionAnalytics: (limit = 10) =>
    request(`/analytics/recent-predictions?limit=${limit}`),
  getModelPerformanceAnalytics: () => request("/analytics/model-performance"),

  // ── Analyst ──────────────────────────────────
  getAnalystDashboard: () => request("/analyst/dashboard"),
  getAnalystYieldTrends: () => request("/analyst/yield-trends"),
  getAnalystCropPerformance: () => request("/analyst/crop-performance"),
  getAnalystFarmComparison: () => request("/analyst/farm-comparison"),
  getAnalystProductivity: () => request("/analyst/productivity"),
  getAnalystRiskDistribution: () => request("/analyst/risk-distribution"),
  getAnalystRecentPredictions: (limit = 10) =>
    request(`/analyst/recent-predictions?limit=${limit}`),
  getAnalystReports: (days = 30) => request(`/analyst/reports?days=${days}`),

  // ── Admin ────────────────────────────────────
  getAdminDashboard: () => request("/admin/dashboard"),
  getAdminUsers: () => request("/admin/users"),
  getAdminFarms: () => request("/admin/farms"),
  getAdminPredictions: () => request("/admin/predictions"),
  getAdminReports: () => request("/admin/reports"),
  getAdminStats: () => request("/admin/stats"),
  getAdminSystemHealth: () => request("/admin/system"),
  getAdminModelMetrics: () => request("/admin/model"),
  getAdminActivity: () => request("/admin/activity"),
  exportAdminCsv: () => request("/admin/reports/export/csv"),

  // ── Notifications & Alerts ───────────────────
  getNotifications: () => request("/notifications/"),
  getUnreadNotificationCount: () => request("/notifications/unread-count"),
  markNotificationRead: (id: number) =>
    request(`/notifications/${id}/read`, { method: "PUT" }),
  markAllNotificationsRead: () =>
    request("/notifications/read-all", { method: "PUT" }),
  deleteNotification: (id: number) =>
    request(`/notifications/${id}`, { method: "DELETE" }),
  getAlerts: () => request("/alerts/"),

  // ── Reports ──────────────────────────────────
  getPredictionReport: () => request("/reports/prediction-summary"),
  getFarmReport: () => request("/reports/farm-report"),
  getSoilReport: () => request("/reports/soil-report"),
  exportCsv: (reportType: string) =>
    request(`/reports/export/csv?report_type=${encodeURIComponent(reportType)}`),
  exportPdf: (reportType: string) =>
    request(`/reports/export/pdf?report_type=${encodeURIComponent(reportType)}`),
  
  // ── GIS ──────────────────────────────────────
  getFarmLocations: () => request("/gis/farms/locations"),
  getWeatherOverlay: () => request("/gis/weather-overlay"),
  getSoilZones: () => request("/gis/soil-zones"),
  getNearbyStations: (lat: number, lng: number) =>
    request(`/gis/nearby-stations?lat=${lat}&lng=${lng}`),

  // ── Advisor ──────────────────────────────────
  advisorChat: (message: string) =>
    request("/advisor/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  getAdvisorTasks: () => request("/advisor/tasks"),
  getAdvisorInsights: () => request("/advisor/insights"),
  getAdvisorCalendar: (cropType: string) =>
    request(`/advisor/calendar?crop_type=${encodeURIComponent(cropType)}`),
};







