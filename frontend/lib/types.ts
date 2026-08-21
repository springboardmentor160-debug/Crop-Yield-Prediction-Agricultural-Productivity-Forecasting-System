export interface User {
  id: number;
  full_name: string;
  email: string;
  role: "Farmer" | "Analyst" | "Admin" | string;
  created_at?: string;
}

export interface Farm {
  id: number;
  farm_name: string;
  latitude?: number | null;
  longitude?: number | null;
  soil_ph?: number | null;
  area_hectares?: number | null;
  soil_type?: string | null;
  location?: string | null;
  created_at: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Alert {
  id: number;
  type: string;
  title: string;
  message: string;
  priority: string;
  is_read: boolean;
  created_at?: string;
  icon?: string;
  time?: string;
}

export interface PredictionHistory {
  id: number;
  farm_id: number;
  crop_type: string;
  predicted_yield_tons_per_ha: number;
  confidence_score: number;
  risk_level: string;
  created_at: string;
}

export interface Recommendation {
  category?: string;
  title?: string;
  message: string;
  priority?: string;
  expected_benefit?: string;
  action?: string;
}

// ── Auth ──────────────────────────────────────────
export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ── Crops ─────────────────────────────────────────
export interface Crop {
  id: number;
  crop_name: string;
  hectares_planted?: number | null;
  season?: string | null;
  year?: number | null;
  created_at: string;
}

// ── Predictions ────────────────────────────────────
export interface PredictionRequest {
  farm_id: number;
  crop_type: string;
  rainfall_mm: number;
  temperature_c: number;
  humidity_percent?: number;
  soil_ph: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
}

export interface RecommendationItem {
  category: string;
  message: string;
  priority: string;
}

export interface PredictionOut {
  id: number;
  crop_type: string;
  predicted_yield_tons_per_ha: number;
  confidence_score: number;
  risk_level: string;
  recommendations: RecommendationItem[];
  created_at: string;
}

export interface PredictionHistoryOut {
  id: number;
  crop_type: string;
  rainfall_mm: number;
  temperature_c: number;
  soil_ph: number;
  predicted_yield_tons_per_ha: number;
  confidence_score: number;
  risk_level: string;
  created_at: string;
}

// ── Soil ────────────────────────────────────
export interface DeficiencyItem {
  nutrient: string;
  level: string;
  recommendation: string;
}

export interface SoilAnalysisOut {
  id: number;
  farm_id: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  soil_ph?: number;
  humidity?: number | null;
  temperature?: number | null;
  rainfall?: number | null;
  ph_category?: string | null;
  fertility_score?: number | null;
  fertility_index?: string | null;
  fertility_color?: string | null;
  deficiencies?: DeficiencyItem[] | null;
  suitable_crops?: string[] | null;
  soil_health_tips?: string[] | null;
  created_at: string;
  nutrients?: {
    nitrogen: { value: number; unit: string; status: string };
    phosphorus: { value: number; unit: string; status: string };
    potassium: { value: number; unit: string; status: string };
  };
}

// ── Weather ────────────────────────────────────
export interface CurrentWeather {
  location: string;
  country: string;
  temperature_c: number;
  feels_like: number;
  humidity_percent: number;
  wind_speed_kmh: number;
  rainfall_mm: number;
  weather_code: number;
  condition: string;
  latitude: number;
  longitude: number;
}

export interface WeatherForecast {
  date: string;
  max_temp: number;
  min_temp: number;
  rainfall_mm: number;
  weather_code: number;
  condition: string;
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  weather_code: number;
  condition: string;
  rain_probability: number;
}

export interface WeatherHistory {
  date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
}

export interface WeatherAlert {
  id: number;
  type: string;
  title: string;
  message: string;
  severity: string;
  created_at: string;
}

export interface WeatherRisk {
  risk_score: number;
  risk_level: string;
  risk_color: string;
  reasons: string[];
}

export interface WeatherAdvisory {
  recommendations: Array<{
    category: string;
    advice: string;
  }>;
}

export interface WeatherDashboard {
  current: CurrentWeather;
  forecast: WeatherForecast[];
  hourly: HourlyWeather[];
  alerts: WeatherAlert[];
  risk: WeatherRisk;
  advisory: WeatherAdvisory;
}

// ── Analytics ────────────────────────────────────
export interface DashboardAnalyticsResponse {
  total_users: number;
  total_farms: number;
  active_farms: number;
  total_predictions: number;
  total_area_hectares: number;
  average_yield: number;
  highest_yield: number;
  lowest_yield: number;
  average_confidence: number;
  average_soil_ph: number;
  average_fertility: number;
  best_crop?: string | null;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  model_accuracy: number;
  mae: number;
  rmse: number;
  training_samples: number;
  n_crops: number;
}

export interface YieldTrendItem {
  month: string;
  average_yield: number;
  maximum_yield: number;
  minimum_yield: number;
  prediction_count: number;
}

export interface YieldTrendResponse {
  yield_trend: YieldTrendItem[];
  total_predictions: number;
  average_yield: number;
  best_yield: number;
  worst_yield: number;
}

export interface CropPerformanceItem {
  crop: string;
  prediction_count: number;
  average_yield: number;
  highest_yield: number;
  lowest_yield: number;
  average_confidence: number;
  risk_level: string;
  latest_prediction: string;
  latest_yield: number;
}

export interface CropPerformanceResponse {
  crop_performance: CropPerformanceItem[];
  total_crop_types: number;
  best_crop?: string | null;
  highest_average_yield: number;
}

export interface FarmComparisonItem {
  rank: number;
  farm_id: number;
  farm_name: string;
  location?: string | null;
  area_hectares?: number | null;
  soil_ph?: number | null;
  soil_type?: string | null;
  prediction_count: number;
  average_yield: number;
  highest_yield: number;
  lowest_yield: number;
  average_confidence: number;
  productivity_score: number;
  crops: string[];
}

export interface FarmComparisonResponse {
  total_farms: number;
  farm_comparison: FarmComparisonItem[];
}

export interface ProductivityResponse {
  total_area_hectares: number;
  average_yield_tons_per_ha: number;
  estimated_production_tons: number;
  estimated_revenue_inr: number;
  productivity_score: number;
  performance_rating: string;
  excellent_farms: number;
  good_farms: number;
  average_farms: number;
  poor_farms: number;
}

export interface RiskDistributionResponse {
  total_predictions: number;
  low: number;
  medium: number;
  high: number;
  low_percent: number;
  medium_percent: number;
  high_percent: number;
}

export interface SoilHealthResponse {
  total_analyses: number;
  average_ph: number;
  average_fertility: number;
  healthy_soils: number;
  acidic_soils: number;
  alkaline_soils: number;
}

export interface WeatherImpactResponse {
  average_temperature: number;
  average_rainfall: number;
  average_humidity: number;
  average_yield: number;
}

export interface RecentPredictionItem {
  id: number;
  farm_id: number;
  crop_type: string;
  yield: number;
  confidence: number;
  risk: string;
  temperature: number;
  rainfall: number;
  humidity: number;
  created_at: string;
}

export interface ModelPerformanceResponse {
  accuracy_percent: number;
  mae: number;
  rmse: number;
  training_samples: number;
  n_crops: number;
  crops: string[];
  features: string[];
  status: string;
}

// ── Recommendations ────────────────────────────────────
export interface RecommendationsResponse {
  recommendations: Recommendation[];
  profit_estimate?: {
    estimated_yield_tons: number;
    price_per_ton_inr: number;
    estimated_revenue_inr: number;
    area_hectares: number;
  };
}

export interface CropRecommendationResponse {
  recommended_crops: Array<{
    crop: string;
    suitability: string;
    expected_yield: string;
    profit_potential: string;
  }>;
  soil_conditions: {
    ph: number;
    nitrogen: number;
    rainfall: number;
    temperature: number;
  };
}

export interface IrrigationPlanResponse {
  crop_type: string;
  daily_water_requirement_mm: number;
  weekly_water_liters: number;
  irrigation_schedule: Array<{
    day: string;
    water_liters: number;
    time: string;
    duration_minutes: number;
  }>;
  water_saving_tips: string[];
}

export interface FertilizerPlanResponse {
  crop_type: string;
  area_hectares: number;
  fertilizer_plan: Array<{
    nutrient: string;
    fertilizer: string;
    quantity_kg: number;
    timing: string;
    method: string;
  }>;
  total_cost_estimate_inr: number;
}

// ── Risk Assessment ────────────────────────────────────
export interface RiskAssessmentResponse {
  overall_risk_score: number;
  overall_risk_level: string;
  crop_type: string;
  risks: Array<{
    type: string;
    level: string;
    score: number;
    description: string;
    mitigation: string;
  }>;
  summary: string;
}

export interface DiseaseRiskResponse {
  crop_type: string;
  overall_disease_risk_percent: number;
  risk_level: string;
  diseases: Array<{
    disease: string;
    probability: number;
    severity: string;
    prevention: string;
  }>;
  general_advice: string;
}

export interface ProfitRiskResponse {
  crop_type: string;
  area_hectares: number;
  expected_yield_tons: number;
  price_per_ton_inr: number;
  total_cost_inr: number;
  expected_revenue_inr: number;
  expected_profit_inr: number;
  roi_percent: number;
  profit_risk_level: string;
  break_even_yield_tons: number;
}

// ── Reports ────────────────────────────────────
export interface PredictionReport {
  report_type: string;
  generated_at: string;
  generated_by: string;
  summary: {
    total_predictions: number;
    average_yield: number;
    high_risk_count: number;
    low_risk_count: number;
    crops_analyzed: string[];
  };
  predictions: Array<{
    id: number;
    crop_type: string;
    predicted_yield: number;
    confidence: number;
    risk_level: string;
    rainfall_mm: number;
    temperature_c: number;
    soil_ph: number;
    date: string;
  }>;
}

export interface FarmReport {
  report_type: string;
  generated_at: string;
  total_farms: number;
  total_area: number;
  farms: Array<{
    farm_name: string;
    location: string;
    area_hectares: number;
    soil_ph: number;
    total_predictions: number;
    avg_yield: number;
    created_date: string;
  }>;
}

export interface WeatherReport {
  report_type: string;
  generated_at: string;
  period: string;
  summary: {
    avg_temperature_c: number;
    total_rainfall_mm: number;
    peak_rain_month: string;
    dry_months: string[];
    weather_alerts: number;
  };
  monthly_data: Array<{
    month: string;
    temp: number;
    rain: number;
    humidity: number;
  }>;
}

export interface SoilReport {
  report_type: string;
  generated_at: string;
  overall_soil_health: string;
  health_score: number;
  parameters: {
    ph: { value: number; status: string; range: string };
    nitrogen: { value: number; unit: string; status: string };
    phosphorus: { value: number; unit: string; status: string };
    potassium: { value: number; unit: string; status: string };
    organic_carbon: { value: number; unit: string; status: string };
    moisture: { value: number; unit: string; status: string };
  };
  recommendations: string[];
}

// ── AI Advisor ────────────────────────────────────
export interface AdvisorChatResponse {
  response: string;
  suggestions?: string[];
}

export interface DailyTask {
  id: number;
  icon: string;
  task: string;
  time: string;
  priority: string;
  done: boolean;
}

export interface AIInsight {
  id: number;
  icon: string;
  title: string;
  insight: string;
  confidence: number;
}

export interface CropCalendarItem {
  month: string;
  activities: string[];
  crops: string[];
}

// ── Analyst ────────────────────────────────────
export interface AnalystDashboardResponse {
  total_farms: number;
  total_predictions: number;
  average_yield: number;
  high_risk_farms: number;
  recent_predictions: RecentPredictionItem[];
  yield_trends: YieldTrendItem[];
  crop_performance: CropPerformanceItem[];
  risk_distribution: RiskDistributionResponse;
}

export interface AnalystReportsResponse {
  period_days: number;
  total_predictions: number;
  average_yield: number;
  predictions: RecentPredictionItem[];
  yield_trends: YieldTrendItem[];
  crop_performance: CropPerformanceItem[];
  farm_comparison: FarmComparisonItem[];
  risk_distribution: RiskDistributionResponse;
  productivity: ProductivityResponse;
  soil_health: SoilHealthResponse;
  weather_impact: WeatherImpactResponse;
}

// ── Admin ────────────────────────────────────
export interface AdminDashboardResponse {
  system_health: {
    status: string;
    uptime: string;
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
  };
  model_metrics: ModelPerformanceResponse;
  stats: {
    total_users: number;
    total_farms: number;
    total_predictions: number;
    active_users_24h: number;
  };
}

export interface SystemStatsResponse {
  total_users: number;
  total_farms: number;
  total_predictions: number;
  active_users_24h: number;
  predictions_24h: number;
  api_calls_24h: number;
  error_rate: number;
}
