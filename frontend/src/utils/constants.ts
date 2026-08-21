/**
 * YieldSense AI  -  Constants
 */

export const APP_NAME = "YieldSense AI";
export const APP_DESCRIPTION =
  "AI-powered Crop Yield Prediction and Agricultural Productivity Forecasting System";

const getApiBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
  const trimmed = url.replace(/\/+$/, "");
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
};

export const API_BASE_URL = getApiBaseUrl();

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  FARMS: "/farms",
  FARM_NEW: "/farms/new",
  FARM_DETAIL: (id: string) => `/farms/${id}`,
  PROFILE: "/profile",
  SETTINGS: "/settings",
  NOTIFICATIONS: "/notifications",
  PREDICTION: "/prediction",
  WEATHER: "/weather",
  SOIL: "/soil",
  REPORTS: "/reports",
  // Milestone 3
  ANALYTICS: "/analytics",
  HISTORY: "/history",
  ADMIN: "/admin",
} as const;



export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.FORGOT_PASSWORD,
];

export const CROP_OPTIONS = [
  "Apple", "Banana", "Blackgram", "Cashew", "Cassava", "Castor",
  "Chickpea", "Coconut", "Coffee", "Coriander", "Cotton", "Cumin",
  "Grapes", "Jute", "Kidneybeans", "Lentil", "Maize", "Mango",
  "Mothbeans", "Mungbean", "Muskmelon", "Orange", "Papaya",
  "Pigeonpeas", "Pomegranate", "Potatoes", "Rice", "Rubber",
  "Safflower", "Sesame", "Sorghum", "Soybeans", "Sweet potatoes",
  "Tobacco", "Watermelon", "Wheat", "Yams", "Other",
];

export const ROLE_OPTIONS = [
  { value: "farmer", label: "Farmer" },
  { value: "admin", label: "Administrator" },
];
