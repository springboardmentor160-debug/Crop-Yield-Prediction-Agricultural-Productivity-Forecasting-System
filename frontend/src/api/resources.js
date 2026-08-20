import client from "./client";

export const authApi = {
  login: (email, password) => client.post("/auth/login", { email, password }),
  register: (payload) => client.post("/auth/register", payload),
  me: () => client.get("/auth/me"),
};

export const farmsApi = {
  list: () => client.get("/farms"),
  get: (id) => client.get(`/farms/${id}`),
  create: (payload) => client.post("/farms", payload),
  update: (id, payload) => client.put(`/farms/${id}`, payload),
  remove: (id) => client.delete(`/farms/${id}`),
};

export const cropsApi = {
  list: (farmId) => client.get("/crops", { params: farmId ? { farm_id: farmId } : {} }),
  get: (id) => client.get(`/crops/${id}`),
  create: (payload) => client.post("/crops", payload),
  update: (id, payload) => client.put(`/crops/${id}`, payload),
  remove: (id) => client.delete(`/crops/${id}`),
};

export const weatherApi = {
  list: (farmId) => client.get("/weather", { params: { farm_id: farmId } }),
  trend: (farmId) => client.get("/weather/trend", { params: { farm_id: farmId } }),
  create: (payload) => client.post("/weather", payload),
};

export const soilApi = {
  list: (farmId) => client.get("/soil", { params: { farm_id: farmId } }),
  healthIndex: (farmId) => client.get("/soil/health-index", { params: { farm_id: farmId } }),
  create: (payload) => client.post("/soil", payload),
};

export const predictionsApi = {
  run: (cropId) => client.post("/predictions", { crop_id: cropId }),
  forCrop: (cropId) => client.get(`/predictions/crop/${cropId}`),
  recommendations: (predictionId) => client.get(`/predictions/${predictionId}/recommendations`),
};

export const recommendationsApi = {
  all: () => client.get("/recommendations"),
  forCrop: (cropId) => client.get(`/recommendations/crop/${cropId}`),
};

export const analyticsApi = {
  summary: () => client.get("/analytics/summary"),
  farmComparison: () => client.get("/analytics/farm-comparison"),
};

export const usersApi = {
  list: () => client.get("/users"),
  deactivate: (id) => client.patch(`/users/${id}/deactivate`),
  activate: (id) => client.patch(`/users/${id}/activate`),
};
