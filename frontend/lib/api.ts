import { getToken, logoutAndRedirect } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

function getHeaders(options: RequestInit = {}) {
  const headers = new Headers(options.headers as HeadersInit | undefined);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

async function request(endpoint: string, options: RequestInit = {}) {
  const headers = getHeaders(options);
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const contentType = res.headers.get("content-type") || "";
  const rawBody = await res.text();
  const data = rawBody ? (contentType.includes("application/json") ? JSON.parse(rawBody) : rawBody) : null;

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      logoutAndRedirect();
    }
    const message =
      data && typeof data === "object" && "detail" in data
        ? String((data as { detail?: unknown }).detail)
        : res.statusText || "Something went wrong";
    throw new Error(message);
  }

  return data;
}

// Separate helper for file downloads (CSV/Excel/PDF) since those responses
// are blobs, not JSON - reusing `request` would try to .json() a binary body.
async function requestBlob(endpoint: string): Promise<Blob> {
  const headers = getHeaders();
  const res = await fetch(`${API_BASE}${endpoint}`, { headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 || res.status === 403) {
      logoutAndRedirect();
    }
    throw new Error(data.detail || "Export failed");
  }
  return res.blob();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export const api = {
  // ── Auth
  register: (body: object) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: object) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  // ── User
  getProfile: () => request("/users/me"),
  updateProfile: (body: object) => request("/users/me", { method: "PUT", body: JSON.stringify(body) }),


 // ── Farms
  getFarms: () => request("/farms/"),
  getFarm: (id: number) => request(`/farms/${id}`),
  createFarm: (body: object) => request("/farms/", { method: "POST", body: JSON.stringify(body) }),
  updateFarm: (id: number, body: object) => request(`/farms/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteFarm: (id: number) => request(`/farms/${id}`, { method: "DELETE" }),

  // ── Crops
  getCrops: (farmId: number) => request(`/data/farms/${farmId}/crops`),
  addCrop: (farmId: number, body: object) => request(`/data/farms/${farmId}/crops`, { method: "POST", body: JSON.stringify(body) }),

  // ── Yield Prediction
  predict: (body: object) => request("/predictions/predict", { method: "POST", body: JSON.stringify(body) }),
  getPredictionHistory: () => request("/predictions/history"),
  getFarmPredictions: (farmId: number) => request(`/predictions/farm/${farmId}`),
  getModelMetrics: () => request("/predictions/model/metrics"),
  getAvailableCrops: () => request("/predictions/crops/available"),

  // ── Weather
  // ── Weather
getCurrentWeather: (location: string = "Bhubaneswar") =>
  request(`/weather/current?location=${encodeURIComponent(location)}`),

getWeatherForecast: (location: string = "Bhubaneswar") =>
  request(`/weather/forecast?location=${encodeURIComponent(location)}`),

getHourlyWeather: (location: string = "Bhubaneswar") =>
  request(`/weather/hourly?location=${encodeURIComponent(location)}`),

getWeatherHistory: (
  location: string = "Bhubaneswar",
  days: number = 30
) =>
  request(
    `/weather/history?location=${encodeURIComponent(location)}&days=${days}`
  ),

getWeatherAlerts: (location: string = "Bhubaneswar") =>
  request(`/weather/alerts?location=${encodeURIComponent(location)}`),

getWeatherRisk: (location: string = "Bhubaneswar") =>
  request(`/weather/risk?location=${encodeURIComponent(location)}`),

getWeatherAdvisory: (location: string = "Bhubaneswar") =>
  request(`/weather/advisory?location=${encodeURIComponent(location)}`),

getWeatherDashboard: (location: string = "Bhubaneswar") =>
  request(`/weather/dashboard?location=${encodeURIComponent(location)}`),
  // ── Soil
  analyzeSoil: (body: object) => request("/soil/analyze", { method: "POST", body: JSON.stringify(body) }),
  getSoilTypes: () => request("/soil/types"),
  getSoilFertilityGuide: () => request("/soil/fertility-guide"),
  getSoilCropRecommendation: (body: object) => request("/soil/crop-recommendation", { method: "POST", body: JSON.stringify(body) }),
  getSoilHistory: () => request("/soil/history"),
  getFarmSoilHistory: (farmId: number) => request(`/soil/history/${farmId}`),
  getSoilHealthScore: (farmId: number) => request(`/soil/health-score/${farmId}`),

  // ── Analytics
  getDashboardAnalytics: () => request("/analytics/dashboard"),
  getYieldTrends: () => request("/analytics/yield-trends"),
  getFarmComparison: () => request("/analytics/farm-comparison"),
  getCropPerformance: () => request("/analytics/crop-performance"),
  getProductivity: () => request("/analytics/productivity"),

  getRiskDistribution: () => request("/analytics/risk-distribution"),
  getSoilHealth: () => request("/analytics/soil-health"),
  getWeatherImpact: () => request("/analytics/weather-impact"),
  getRecentPredictions: () => request("/analytics/recent-predictions"),
  getModelPerformance: () => request("/analytics/model-performance"),

  // ── Recommendations
  getRecommendations: () => request("/recommendations/"),
  generateRecommendations: (body: object) => request("/recommendations/generate", { method: "POST", body: JSON.stringify(body) }),
  getCropRecommendations: (ph: number, n: number, rain: number, temp: number) =>
    request(`/recommendations/crop?soil_ph=${ph}&nitrogen=${n}&rainfall=${rain}&temperature=${temp}`),
  getIrrigationPlan: (crop: string, temp: number, rain: number, area: number) =>
    request(`/recommendations/irrigation?crop_type=${crop}&temperature_c=${temp}&rainfall_mm=${rain}&area_hectares=${area}`),
  getFertilizerPlan: (crop: string, n: number, p: number, k: number, area: number) =>
    request(`/recommendations/fertilizer?crop_type=${crop}&nitrogen=${n}&phosphorus=${p}&potassium=${k}&area_hectares=${area}`),

  // ── Risk Assessment
  getRiskAssessment: (rain: number, temp: number, crop: string, ph: number) =>
    request(`/risk/assessment?rainfall_mm=${rain}&temperature_c=${temp}&crop_type=${crop}&soil_ph=${ph}`),
  getDiseaseRisk: (crop: string, rain: number, temp: number, humidity: number) =>
    request(`/risk/disease?crop_type=${crop}&rainfall_mm=${rain}&temperature_c=${temp}&humidity=${humidity}`),
  getProfitRisk: (crop: string, area: number, yield_tons: number) =>
    request(`/risk/profit?crop_type=${crop}&area_hectares=${area}&expected_yield_tons=${yield_tons}`),

  // ── Reports (farmer-scoped)
  getPredictionReport: () => request("/reports/prediction-summary"),
  getFarmReport: () => request("/reports/farm-report"),
  getWeatherReport: () => request("/reports/weather-report"),
  getSoilReport: () => request("/reports/soil-report"),
  exportCSV: () => request("/reports/export/csv"),

  // ── AI Advisor
  chatWithAdvisor: (message: string) => request("/advisor/chat", { method: "POST", body: JSON.stringify({ message }) }),
  getDailyTasks: () => request("/advisor/tasks"),
  getAIInsights: () => request("/advisor/insights"),
  getCropCalendar: (crop: string) => request(`/advisor/calendar?crop_type=${crop}`),

  // ── Alerts
  getAlerts: () => request("/alerts/"),
  markAlertRead: (id: number) => request(`/alerts/read/${id}`, { method: "PUT" }),
  markAllAlertsRead: () => request("/alerts/read-all", { method: "PUT" }),
  deleteAlert: (id: number) => request(`/alerts/${id}`, { method: "DELETE" }),

  // ── Analyst
  getAnalystDashboard: () => request("/analyst/dashboard"),
  getAnalystYieldTrends: () => request("/analyst/yield-trends"),
  getAnalystCropPerformance: () => request("/analyst/crop-performance"),
  getAnalystWeatherImpact: () => request("/analyst/weather-impact"),
  getAnalystSoilAnalysis: () => request("/analyst/soil-analysis"),
  getAnalystFarmComparison: () => request("/analyst/farm-comparison"),
  getAnalystRiskDistribution: () => request("/analyst/risk-distribution"),
  getAnalystProductivity: () => request("/analyst/productivity"),
  getAnalystReports: (days: number = 30) => request(`/analyst/reports?days=${days}`),

  // ── Admin: dashboard & stats
  getAdminDashboard: () => request("/admin/dashboard"),
  getSystemStats: () => request("/admin/stats"),

  // ── Admin: users
  getAllUsers: () => request("/admin/users"),
  getUser: (id: number) => request(`/admin/users/${id}`),
  createUser: (body: object) => request("/admin/users", { method: "POST", body: JSON.stringify(body) }),
  updateUser: (id: number, body: object) => request(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  updateUserRole: (id: number, role: string) => request(`/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
  deleteUser: (id: number) => request(`/admin/users/${id}`, { method: "DELETE" }),

  // ── Admin: farms
  getAllFarmsAdmin: () => request("/admin/farms"),
  getFarmAdmin: (id: number) => request(`/admin/farms/${id}`),
  updateFarmAdmin: (id: number, body: object) => request(`/admin/farms/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteFarmAdmin: (id: number) => request(`/admin/farms/${id}`, { method: "DELETE" }),

  // ── Admin: predictions
 getAllPredictionsAdmin: () =>
  request("/admin/predictions"),
  getPredictionAdmin: (id: number) => request(`/admin/predictions/${id}`),
  deletePredictionAdmin: (id: number) => request(`/admin/predictions/${id}`, { method: "DELETE" }),

  // ── Admin: notifications
  getAllNotificationsAdmin: () => request("/admin/notifications"),
  markAdminNotificationRead: (id: number) =>
    request(`/admin/notifications/${id}/read`, { method: "PUT" }),
  deleteAdminNotification: (id: number) =>
    request(`/admin/notifications/${id}`, { method: "DELETE" }),

  // ── Admin: reports
  getAdminReports: () => request("/admin/reports"),
  downloadAdminReportCSV: async () => downloadBlob(await requestBlob("/admin/reports/export/csv"), "yieldsense_report.csv"),
  downloadAdminReportExcel: async () => downloadBlob(await requestBlob("/admin/reports/export/excel"), "yieldsense_report.xlsx"),
  downloadAdminReportPDF: async () => downloadBlob(await requestBlob("/admin/reports/export/pdf"), "yieldsense_report.pdf"),

  // ── Admin: monitoring
  getSystemHealth: () => request("/admin/system"),
  getDatabaseInfo: () => request("/admin/database"),
  getLogs: (limit: number = 50) => request(`/admin/logs?limit=${limit}`),
  getActivity: (limit: number = 50) => request(`/admin/activity?limit=${limit}`),

  // ── Admin: AI model
  getAdminModelInfo: () => request("/admin/model"),
  retrainModel: () => request("/admin/model/retrain", { method: "POST" }),
  getModelHistory: () => request("/admin/model/history"),



  getAnalystRecentPredictions: (limit: number = 10) => request(`/analyst/recent-predictions?limit=${limit}`),




  // GIS
  getFarmLocations: () => request("/gis/farms/locations"),
  getSoilZones: () => request("/gis/soil-zones"),
  getNearbyStations: () => request("/gis/nearby-stations"),

// Notifications
  getNotifications: () => request("/notifications/"),
  getUnreadCount: () => request("/notifications/unread-count"),
  markNotificationRead: (id: number) => request(`/notifications/${id}/read`, { method: "PUT" }),
  markAllNotificationsRead: () => request("/notifications/read-all", { method: "PUT" }),
  deleteNotification: (id: number) => request(`/notifications/${id}`, { method: "DELETE" }),

// Analyst

// Admin


 



  
  // ── Health
  health: () => request("/health"),
};