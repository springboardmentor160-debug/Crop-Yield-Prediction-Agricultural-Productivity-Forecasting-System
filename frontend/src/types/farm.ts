/**
 * YieldSense AI  -  Farm Types
 */

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  area: number;
  crop: string;
  soil_ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  created_at: string;
  updated_at: string;
}

export interface FarmCreate {
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  area: number;
  crop: string;
  soil_ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

export interface FarmUpdate {
  name?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  area?: number;
  crop?: string;
  soil_ph?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
}

export interface FarmListResponse {
  farms: Farm[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface FarmStats {
  total_farms: number;
  total_area: number;
  unique_crops: number;
  crop_list: string[];
}
