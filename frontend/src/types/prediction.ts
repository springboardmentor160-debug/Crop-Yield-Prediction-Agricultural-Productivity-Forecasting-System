/**
 * YieldSense AI  -  Prediction Types
 */

export interface PredictionRequest {
  crop: string;
  season: string;
  state: string;
  area: number;
  temperature: number;
  annual_rainfall: number;
  humidity?: number;
  soil_ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  fertilizer_usage: number;
  pesticide_usage: number;
  production: number;
  latitude?: number;
  longitude?: number;
}

export interface WeatherSummary {
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  description: string;
  source: string;
}

export interface SoilSummary {
  health_score: number;
  health_label: string;
  ph_status: string;
  warnings: string[];
  suggestions: string[];
}

export interface PredictionResponse {
  predicted_yield: number;
  prediction_unit: string;
  total_production: number;
  crop: string;
  area: number;
  season: string;
  model_used: string;
  model_accuracy: number | null;
  confidence: string;
  weather_summary: WeatherSummary | null;
  soil_summary: SoilSummary | null;
  prediction_timestamp: string;
  // Milestone 3
  risk_assessment?: Record<string, unknown> | null;
  recommendations?: Record<string, unknown> | null;
  prediction_id?: string | null;
}

export interface ModelInfo {
  model_name: string | null;
  test_r2: number | null;
  test_mae: number | null;
  test_rmse: number | null;
  cv_mean_r2: number | null;
  num_features: number | null;
  feature_names: string[] | null;
  all_models_r2: Record<string, number> | null;
  status: string;
}

export interface WeatherCurrent {
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  description: string;
  cloud_cover: number | null;
}

export interface WeatherForecastDay {
  date: string;
  temp_max: number;
  temp_min: number;
  rainfall: number;
  humidity?: number;
  description: string;
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  current: WeatherCurrent;
  forecast: WeatherForecastDay[];
  source: string;
}

export interface NutrientRating {
  name: string;
  value: number;
  unit: string;
  status: string;
  color: string;
}

export interface SoilAnalysisRequest {
  soil_ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  moisture?: number;
  organic_matter?: number;
  crop?: string;
}

export interface SoilAnalysisResponse {
  health_score: number;
  health_label: string;
  ph_status: string;
  nutrient_ratings: NutrientRating[];
  suitability_rating: string | null;
  warnings: string[];
  suggestions: string[];
}
