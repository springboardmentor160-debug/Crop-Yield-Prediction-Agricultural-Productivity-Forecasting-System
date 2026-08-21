/**
 * YieldSense AI  -  Analytics Types (Milestone 3)
 */

export interface RecentPredictionItem {
  id: string;
  crop: string;
  season: string;
  area: number;
  predicted_yield: number;
  total_production: number;
  confidence: string;
  risk_level?: string | null;
  risk_score?: number | null;
  farm_name?: string | null;
  created_at: string;
}

export interface RecentFarmItem {
  id: string;
  name: string;
  location: string;
  crop: string;
  area: number;
  created_at: string;
}

export interface DashboardSummary {
  // Farm stats
  total_farms: number;
  total_area: number;
  unique_crops: number;
  crop_list: string[];

  // Prediction stats
  total_predictions: number;
  avg_predicted_yield: number | null;
  latest_prediction: RecentPredictionItem | null;

  // Risk overview
  latest_risk_level: string | null;
  latest_risk_score: number | null;
  high_risk_count: number;

  // Recent activity
  recent_predictions: RecentPredictionItem[];
  recent_farms: RecentFarmItem[];

  // Model info
  model_name: string | null;
  model_accuracy: number | null;
  model_status: string;
}

export interface YieldTrendPoint {
  date: string;
  predicted_yield: number;
  crop: string;
  season: string;
  area: number;
}

export interface CropYieldPoint {
  crop: string;
  avg_yield: number;
  count: number;
  total_production: number;
}

export interface SeasonYieldPoint {
  season: string;
  avg_yield: number;
  count: number;
}

export interface RainfallYieldPoint {
  rainfall: number;
  yield_value: number;
  crop: string;
  temperature: number;
}

export interface FarmYieldPoint {
  farm_name: string;
  avg_yield: number;
  count: number;
  total_production: number;
}

export interface AnalyticsData {
  yield_trend: YieldTrendPoint[];
  crop_comparison: CropYieldPoint[];
  season_comparison: SeasonYieldPoint[];
  rainfall_vs_yield: RainfallYieldPoint[];
  farm_comparison: FarmYieldPoint[];
  total_predictions: number;
  avg_yield: number | null;
  best_crop: string | null;
  best_season: string | null;
  productivity_score: number | null;
  data_range_days: number;
}
