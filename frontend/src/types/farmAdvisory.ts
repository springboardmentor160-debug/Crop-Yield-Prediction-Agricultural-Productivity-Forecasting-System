/**
 * YieldSense AI  -  Farm Advisory Types (Week 6)
 */

export interface IdentifiedRisk {
  type: string;        // "Yield Risk", "Rainfall Risk", "Soil Risk"
  severity: string;    // "Low", "Medium", "High"
  reason: string;
  advice: string;
}

export interface DataSources {
  soil_ph_available: boolean;
  predicted_yield_available: boolean;
  avg_yield_available: boolean;
  rainfall_deviation_available: boolean;
  prediction_count: number;
}

export interface MetricsUsed {
  soil_ph?: number | null;
  predicted_yield?: number | null;
  avg_yield?: number | null;
  rainfall_deviation?: number | null;
  crop?: string | null;
}

export interface FarmAdvisoryResponse {
  farm_id: string;
  farm_name: string;
  crop: string;
  recommendations: string[];
  risk_level: string;        // "Low", "Medium", "High"
  risk_score: number;
  risk_category: string;
  identified_risks: IdentifiedRisk[];
  detected_risk_count: number;
  priority_level: string;    // "Monitor", "Act Soon", "Act Now"
  priority_reason: string;
  data_sources: DataSources;
  metrics_used: MetricsUsed;
  generated_at: string;
  disclaimer: string;
}
