import React from "react";
import { Thermometer, CloudRain, Wind, Sun, AlertTriangle, ShieldCheck } from "lucide-react";

interface WeatherCardProps {
  weatherData?: {
    temperature?: number;
    avg_temp?: number;
    rainfall?: number;
    humidity?: number;
    summary?: string;
    temperature_status?: string;
    rainfall_status?: string;
    future_readiness?: string;
    score?: number;
  };
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weatherData }) => {
  const temp = weatherData?.temperature ?? weatherData?.avg_temp ?? 27.5;
  const rain = weatherData?.rainfall ?? 1200;
  const humidity = weatherData?.humidity ?? 65;
  
  // Derive Climate Condition, Suitability, Season Recommendation
  const climateCondition = weatherData?.temperature_status 
    ? `${weatherData.temperature_status} (${weatherData.rainfall_status || "Stable"})`
    : "Stable Temperature & Rainfall";

  const score = weatherData?.score ?? 82.5;
  let suitability = "Optimal";
  let suitabilityColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  if (score < 50) {
    suitability = "Poor";
    suitabilityColor = "text-rose-400 bg-rose-500/10 border-rose-500/30";
  } else if (score < 75) {
    suitability = "Sub-optimal";
    suitabilityColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
  }

  const seasonRecommendation = rain > 1000
    ? "Kharif / Monsoon crop planting recommended"
    : "Rabi / Winter crop planting recommended";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Weather Analysis</h3>
            <p className="text-[11px] text-slate-400">Climate vectors & suitability</p>
          </div>
        </div>
        <span className="text-[11px] px-2 py-0.5 bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded-full font-medium">
          Climate Vector
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 text-center">
          <Thermometer className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <span className="text-[11px] text-slate-400 block">Temperature</span>
          <span className="text-base font-bold text-slate-100">{temp}°C</span>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 text-center">
          <CloudRain className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <span className="text-[11px] text-slate-400 block">Rainfall</span>
          <span className="text-base font-bold text-slate-100">{rain} mm</span>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 text-center">
          <Wind className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <span className="text-[11px] text-slate-400 block">Humidity</span>
          <span className="text-base font-bold text-slate-100">{humidity}%</span>
        </div>
      </div>

      <div className="space-y-3 bg-slate-800/40 rounded-lg p-3 border border-slate-800 text-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Climate Condition</span>
          <span className="font-semibold text-slate-200">{climateCondition}</span>
        </div>
        <div className="border-t border-slate-850 pt-2 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Weather Suitability</span>
            <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold ${suitabilityColor}`}>
              {suitability}
            </span>
          </div>
          <span className="text-[11px] text-blue-300 font-mono">Score: {score}%</span>
        </div>
        <div className="border-t border-slate-850 pt-2">
          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Season Recommendation</span>
          <span className="font-semibold text-slate-200">{seasonRecommendation}</span>
        </div>
      </div>
    </div>
  );
};
export default WeatherCard;
