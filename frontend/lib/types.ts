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
}
