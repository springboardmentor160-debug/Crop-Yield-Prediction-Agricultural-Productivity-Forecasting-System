"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function WeatherPage() {
  const router = useRouter();
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [rainfall, setRainfall] = useState<any>(null);
  const [location, setLocation] = useState("Bhubaneswar");
  const [loading, setLoading] = useState(true);
  const [farms, setFarms] = useState<any[]>([]);

  const locations = ["Bhubaneswar", "Mumbai", "Delhi", "Chennai", "Kolkata", "Pune"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadWeather();
    api.getFarms().then(setFarms).catch(() => {});
  }, [location]);

  const loadWeather = async () => {
    setLoading(true);
    try {
      const [w, f, r, advisory] = await Promise.all([
        api.getWeather(location),
        api.getWeatherForecast(location),
        api.getRainfallTrend(),
        api.getWeatherAdvisory(location),
      ]);
      setWeather({ ...w, agricultural_advisory: advisory.advisory });
      setForecast(f);
      setRainfall(r);
    } catch { router.push("/"); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-5xl mb-3">🌤️</div>
        <div className="text-green-600 text-xl font-medium">Loading weather data...</div>
      </div>
    </div>
  );

  const conditionIcon = (cond: string) => {
    if (cond?.includes("Rain")) return "🌧️";
    if (cond?.includes("Cloud")) return "☁️";
    if (cond?.includes("Sun")) return "☀️";
    return "🌤️";
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-green-700 text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
          >
            ← Dashboard
          </button>
          <span className="text-2xl">🌤️</span>
          <span className="text-xl font-bold">Weather Analysis</span>
        </div>
        <select
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="border border-green-300 bg-white text-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Weather Intelligence</h1>
          <p className="text-gray-500 text-sm">{weather?.location} — Real-time climate analysis</p>
        </div>

        {/* Current Weather */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-6 text-white mb-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-6xl font-extrabold leading-none">{weather?.temperature_c}°C</div>
              <div className="text-lg text-green-100 mt-2">{weather?.condition}</div>
              <div className="text-sm text-green-50 mt-1">{weather?.agricultural_advisory}</div>
            </div>
            <div className="text-7xl">{conditionIcon(weather?.condition)}</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-7">
            {[
              { label: "Humidity", value: `${weather?.humidity_percent}%`, icon: "💧" },
              { label: "Rainfall", value: `${weather?.rainfall_mm || weather?.precipitation} mm`, icon: "🌧️" },
              { label: "Wind Speed", value: `${weather?.wind_speed_kmh} km/h`, icon: "💨" },
              { label: "Feels Like", value: `${weather?.feels_like}°C`, icon: "☀️" },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-lg font-bold">{s.value}</div>
                <div className="text-xs text-green-100 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Forecast */}
        {forecast && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📅 7-Day Forecast</h3>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
              {forecast?.forecast?.map((day: any, i: number) => (
                <div key={i} className="border rounded-xl p-3 text-center hover:shadow-md transition">
                  <div className="text-xs text-gray-500 font-semibold mb-2">{day.date}</div>
                  <div className="text-xl mb-2">{conditionIcon(day.condition)}</div>
                  <div className="text-sm font-bold text-gray-800">{day.max_temp}°</div>
                  <div className="text-xs text-gray-400">{day.min_temp}°</div>
                  <div className="text-xs text-green-600 mt-1">{day.rainfall_mm}mm</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rainfall Trend */}
        {rainfall && (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Monthly Rainfall Pattern</h3>
            <div className="flex items-end gap-2 h-36">
              {Object.entries(rainfall.monthly_rainfall_mm).map(([month, val]) => {
                const value = val as number;
                const maxRain = 320;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="text-[10px] text-gray-400">{value}mm</div>
                    <div
                      className={`w-full rounded-t ${value > 200 ? "bg-green-600" : "bg-green-300"}`}
                      style={{ height: `${(value / maxRain) * 110}px` }}
                    />
                    <div className="text-[10px] text-gray-400">{month}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-6 mt-4 pt-4 border-t text-sm">
              <div><span className="text-gray-400">Annual Total: </span><span className="text-green-700 font-bold">{rainfall.annual_total_mm}mm</span></div>
              <div><span className="text-gray-400">Peak Month: </span><span className="text-green-700 font-bold">{rainfall.peak_month}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}