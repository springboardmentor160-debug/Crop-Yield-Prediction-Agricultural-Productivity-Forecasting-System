/**
 * YieldSense AI  -  Prediction Service
 *
 * API calls for prediction, weather, and soil analysis.
 */

import api from "./api";
import type {
  PredictionRequest,
  PredictionResponse,
  ModelInfo,
  WeatherResponse,
  SoilAnalysisRequest,
  SoilAnalysisResponse,
} from "@/types/prediction";

export const predictionService = {
  /**
   * Predict crop yield using the ML model.
   */
  async predictYield(data: PredictionRequest): Promise<PredictionResponse> {
    const response = await api.post<PredictionResponse>("/prediction/predict-yield", data);
    return response.data;
  },

  /**
   * Get information about the loaded ML model.
   */
  async getModelInfo(): Promise<ModelInfo> {
    const response = await api.get<ModelInfo>("/prediction/model-info");
    return response.data;
  },

  /**
   * Get current weather for a location.
   */
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherResponse> {
    const response = await api.get<WeatherResponse>("/weather/", {
      params: { lat, lon },
    });
    return response.data;
  },

  /**
   * Get weather forecast for a location.
   */
  async getWeatherForecast(lat: number, lon: number, days: number = 7): Promise<WeatherResponse> {
    const response = await api.get<WeatherResponse>("/weather/forecast", {
      params: { lat, lon, days },
    });
    return response.data;
  },

  /**
   * Analyze soil health.
   */
  async analyzeSoil(data: SoilAnalysisRequest): Promise<SoilAnalysisResponse> {
    const response = await api.post<SoilAnalysisResponse>("/soil/analyze", data);
    return response.data;
  },
};
