/**
 * YieldSense AI  -  Recommendation, Risk, Report, History Types (Milestone 3)
 */

// ============================================================
// Recommendation Types
// ============================================================

export interface RecommendationRequest {
  crop: string;
  temperature: number;
  annual_rainfall: number;
  humidity?: number;
  soil_ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  predicted_yield?: number;
  season?: string;
  area?: number;
  state?: string;
}

export interface CropRecommendationItem {
  crop: string;
  suitability: string; // "Excellent", "Good", "Fair"
  reason: string;
}

export interface FertilizerRecommendation {
  nutrient: string;
  current_level: number;
  target_level: number;
  recommendation: string;
  reason: string;
  application_rate: string;
}

export interface RecommendationResponse {
  crop_recommendations: CropRecommendationItem[];
  fertilizer_recommendations: FertilizerRecommendation[];
  irrigation_advice: string;
  irrigation_frequency: string;
  irrigation_reason: string;
  harvest_suggestions: string[];
  season_planning: string;
  optimal_sowing_window: string;
  expected_harvest_window: string;
  best_practices: string[];
  yield_improvement_tips: string[];
  estimated_yield_improvement: string;
  reasons: string[];
  confidence: string;
  disclaimer: string;
}

// ============================================================
// Risk Types
// ============================================================

export interface RiskAssessmentRequest {
  crop: string;
  temperature: number;
  annual_rainfall: number;
  humidity?: number;
  soil_ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  predicted_yield?: number;
  season?: string;
}

export interface RiskItem {
  name: string;
  category: string;
  severity: string;
  severity_score: number;
  reason: string;
  mitigation: string;
  affected_aspects: string[];
}

export interface RiskAssessmentResponse {
  overall_risk_level: string;
  risk_score: number;
  risk_category: string;
  risks: RiskItem[];
  warnings: string[];
  mitigations: string[];
  priority_level: string;
  priority_reason: string;
  crop: string;
  detected_risk_count: number;
  risk_color: string;
}

// ============================================================
// History Types
// ============================================================

export interface PredictionHistoryItem {
  id: string;
  crop: string;
  season: string;
  state: string;
  area: number;
  predicted_yield: number;
  total_production: number;
  prediction_unit: string;
  model_used: string;
  confidence: string;
  model_accuracy?: number | null;
  temperature: number;
  annual_rainfall: number;
  humidity?: number | null;
  soil_ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  fertilizer_usage: number;
  pesticide_usage: number;
  farm_id?: string | null;
  farm_name?: string | null;
  risk_level?: string | null;
  risk_score?: number | null;
  weather_summary?: Record<string, unknown> | null;
  soil_summary?: Record<string, unknown> | null;
  created_at: string;
}

export interface PredictionHistoryResponse {
  predictions: PredictionHistoryItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ============================================================
// Report Types
// ============================================================

export interface ReportRequest {
  prediction_id: string;
  farm_id?: string;
  report_type?: string;
  title?: string;
}

export interface ReportSummary {
  id: string;
  title: string;
  report_type: string;
  status: string;
  farm_name?: string | null;
  crop?: string | null;
  created_at: string;
}

export interface ReportResponse {
  id: string;
  title: string;
  report_type: string;
  status: string;
  farm_id?: string | null;
  farm_name?: string | null;
  prediction_id?: string | null;
  data?: Record<string, unknown> | null;
  created_at: string;
}

export interface ReportListResponse {
  reports: ReportSummary[];
  total: number;
}
