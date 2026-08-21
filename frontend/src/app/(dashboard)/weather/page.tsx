/**
 * YieldSense AI  -  Weather Page
 *
 * Live weather data with farm location selector and 7-day forecast.
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Cloud, Thermometer, Droplets, Wind, Sun,
  CloudRain, MapPin, Search, RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { predictionService } from "@/services/predictionService";
import { farmService } from "@/services/farmService";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { WeatherResponse, WeatherForecastDay } from "@/types/prediction";
import type { Farm } from "@/types/farm";

export default function WeatherPage() {
  const [lat, setLat] = useState("28.6139");
  const [lon, setLon] = useState("77.2090");
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState<Farm[]>([]);

  useEffect(() => {
    const loadFarms = async () => {
      try {
        const data = await farmService.listFarms(1, 100);
        setFarms(data.farms);
      } catch { /* ignore */ }
    };
    loadFarms();
  }, []);

  const fetchWeather = async () => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (isNaN(latNum) || isNaN(lonNum)) {
      toast.error("Please enter valid coordinates");
      return;
    }
    setLoading(true);
    try {
      const data = await predictionService.getWeatherForecast(latNum, lonNum, 7);
      setWeather(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  };

  const selectFarm = (farmId: string) => {
    const farm = farms.find((f) => f.id === farmId);
    if (farm) {
      setLat(String(farm.latitude));
      setLon(String(farm.longitude));
    }
  };

  const getWeatherIcon = (description: string) => {
    const lower = description.toLowerCase();
    if (lower.includes("rain") || lower.includes("drizzle")) return <CloudRain className="h-8 w-8 text-blue-500" />;
    if (lower.includes("cloud") || lower.includes("overcast")) return <Cloud className="h-8 w-8 text-gray-400" />;
    return <Sun className="h-8 w-8 text-amber-500" />;
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Cloud className="h-7 w-7 text-blue-500" />
          Weather Data
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Real-time weather and 7-day forecast for your farm locations
        </p>
      </div>

      {/* Location Input */}
      <Card padding="md">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          {farms.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Farm Location</label>
              <select
                onChange={(e) => selectFarm(e.target.value)}
                className="form-select"
              >
                <option value="">Select farm</option>
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                ))}
              </select>
            </div>
          )}
          <Input label="Latitude" type="number" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="e.g. 28.6139" />
          <Input label="Longitude" type="number" value={lon} onChange={(e) => setLon(e.target.value)} placeholder="e.g. 77.2090" />
          <Button onClick={fetchWeather} isLoading={loading}>
            <Search className="h-4 w-4" /> Get Weather
          </Button>
        </div>
      </Card>

      {loading && <LoadingSpinner text="Fetching weather data..." />}

      {weather && !loading && (
        <>
          {/* Current Weather */}
          <Card padding="md" className="bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-800">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="text-center sm:text-left">
                {getWeatherIcon(weather.current.description)}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {weather.current.temperature}°C
                </p>
                <p className="text-sm text-gray-500 mt-1">{weather.current.description}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-center sm:justify-start">
                  <MapPin className="h-3 w-3" /> {weather.latitude.toFixed(2)}°N, {weather.longitude.toFixed(2)}°E
                </p>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <Droplets className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{weather.current.humidity}%</p>
                  <p className="text-xs text-gray-400">Humidity</p>
                </div>
                <div>
                  <CloudRain className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{weather.current.rainfall} mm</p>
                  <p className="text-xs text-gray-400">Rainfall</p>
                </div>
                <div>
                  <Wind className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{weather.current.wind_speed}</p>
                  <p className="text-xs text-gray-400">km/h</p>
                </div>
              </div>
            </div>
          </Card>

          {/* 7-Day Forecast */}
          {weather.forecast.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                7-Day Forecast
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                {weather.forecast.map((day, i) => (
                  <Card key={day.date} padding="sm" className={i === 0 ? "border-blue-200 dark:border-blue-800" : ""}>
                    <div className="text-center space-y-2 py-2">
                      <p className="text-xs font-medium text-gray-500">
                        {i === 0 ? "Today" : new Date(day.date).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}
                      </p>
                      <div className="flex justify-center">{getWeatherIcon(day.description)}</div>
                      <div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(day.temp_max)}°</span>
                        <span className="text-sm text-gray-400 mx-1">/</span>
                        <span className="text-sm text-gray-400">{Math.round(day.temp_min)}°</span>
                      </div>
                      {day.rainfall > 0 && (
                        <p className="text-xs text-blue-500 flex items-center justify-center gap-0.5">
                          <Droplets className="h-3 w-3" /> {day.rainfall} mm
                        </p>
                      )}
                      <p className="text-xs text-gray-400 truncate">{day.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!weather && !loading && (
        <Card padding="md" className="text-center">
          <div className="py-12">
            <Cloud className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">Enter coordinates or select a farm to view weather data</p>
          </div>
        </Card>
      )}
    </div>
  );
}
