"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, BarChart2, PieChart, Activity, AlertTriangle, CheckCircle2, CloudRain, Thermometer, Layers } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface DashboardChartsProps {
  stats?: {
    totalFarms?: number;
    totalPredictions?: number;
    avgYield?: number;
    soilHealth?: string;
    weatherStatus?: string;
  };
  historicalRecords?: any[];
  cropRecords?: any[];
  predictionLogs?: any[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  stats,
  historicalRecords = [],
  cropRecords = [],
  predictionLogs = [],
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalFarms = stats?.totalFarms ?? 0;
  const totalPredictions = stats?.totalPredictions ?? 0;
  const avgYield = stats?.avgYield ?? 0;
  const soilHealth = stats?.soilHealth ?? "N/A";
  const weatherStatus = stats?.weatherStatus ?? "N/A";

  // 1. Historical Yield Trend Line Chart
  const yieldTrend = (historicalRecords && historicalRecords.length > 0)
    ? Object.entries(
        historicalRecords.reduce((acc: any, r: any) => {
          const y = r.year ? String(r.year) : "N/A";
          acc[y] = acc[y] || [];
          acc[y].push(r.yield_amount || 0);
          return acc;
        }, {})
      )
        .map(([year, yields]: [string, any]) => ({
          name: year,
          yield: Math.round(yields.reduce((a: number, b: number) => a + b, 0) / yields.length),
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  // 2. Seasonal Comparison Bar Chart
  const seasonalData = (cropRecords && cropRecords.length > 0)
    ? Object.entries(
        cropRecords.reduce((acc: any, r: any) => {
          const s = r.season || "Other";
          const y = r.previous_yield || (r.production_amount / (r.area_cultivated || 1)) || 0;
          if (y > 0) {
            acc[s] = acc[s] || [];
            acc[s].push(y);
          }
          return acc;
        }, {})
      )
        .map(([season, yields]: [string, any]) => ({
          season,
          yield: Math.round(yields.reduce((a: number, b: number) => a + b, 0) / yields.length),
        }))
    : [];

  // 3. Crop Comparison Bar Chart
  const cropComparisonData = (cropRecords && cropRecords.length > 0)
    ? Object.entries(
        cropRecords.reduce((acc: any, r: any) => {
          const crop = r.crop_name || "Unknown";
          const y = r.previous_yield || (r.production_amount / (r.area_cultivated || 1)) || 0;
          if (y > 0) {
            acc[crop] = acc[crop] || [];
            acc[crop].push(y);
          }
          return acc;
        }, {})
      )
        .map(([cropName, yields]: [string, any]) => ({
          cropName,
          yield: Math.round(yields.reduce((a: number, b: number) => a + b, 0) / yields.length),
        }))
        .slice(0, 8)
    : [];

  // 4. Crop Distribution Share Pie Chart
  const cropDist = (cropRecords && cropRecords.length > 0)
    ? (() => {
        const counts = cropRecords.reduce((acc: any, r: any) => {
          const crop = r.crop_name || "Unknown";
          acc[crop] = (acc[crop] || 0) + 1;
          return acc;
        }, {});
        const total = Object.values(counts).reduce((a: any, b: any) => a + b, 0) as number;
        const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
        return Object.keys(counts).map((crop, idx) => ({
          name: crop,
          value: Math.round((counts[crop] / total) * 100),
          color: colors[idx % colors.length],
        }));
      })()
    : [];

  // Calculate stats for risk alert widgets
  const latestPrediction = predictionLogs && predictionLogs.length > 0 ? predictionLogs[0] : null;
  const latestCrop = cropRecords && cropRecords.length > 0 ? cropRecords[0] : null;

  const latestRainfall = latestPrediction?.rainfall ?? latestCrop?.rainfall ?? null;

  const latestTemp = latestPrediction?.avg_temp ?? latestCrop?.temperature ?? null;

  const latestPh = latestPrediction?.soil_ph ?? null;

  return (
    <div className="space-y-6">
      {/* Top Key Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center h-24">
          <span className="text-xs text-slate-400 font-medium block mb-1">Total Farms</span>
          <span className="text-2xl font-extrabold text-slate-100">{totalFarms}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center h-24">
          <span className="text-xs text-slate-400 font-medium block mb-1">Total Predictions</span>
          <span className="text-2xl font-extrabold text-emerald-400">{totalPredictions}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center h-24">
          <span className="text-xs text-slate-400 font-medium block mb-1">Average Yield</span>
          <span className="text-2xl font-extrabold text-blue-400">
            {avgYield.toLocaleString()} <span className="text-xs font-normal">kg/ha</span>
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center h-24">
          <span className="text-xs text-slate-400 font-medium block mb-1">Soil Health</span>
          <span className="text-2xl font-extrabold text-emerald-400">{soilHealth}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 col-span-2 sm:col-span-1 flex flex-col items-center justify-center text-center h-24">
          <span className="text-xs text-slate-400 font-medium block mb-1">Weather Status</span>
          <span className="text-2xl font-extrabold text-amber-400">{weatherStatus}</span>
        </div>
      </div>

      {/* Risk Alert Widgets */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <h3 className="text-xs font-bold text-slate-450 mb-4 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Agricultural Risk Assessment Alerts
        </h3>
        {latestRainfall === null || latestTemp === null || latestPh === null ? (
          <div className="rounded-lg border border-slate-800 bg-slate-800/30 p-4 text-sm text-slate-400">
            Add a prediction with rainfall, temperature, and soil pH to generate data-backed risk alerts.
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Drought Risk */}
          <div className={`border rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all ${
            latestRainfall < 200
              ? "bg-rose-950/40 border-rose-500/30 text-rose-200"
              : latestRainfall < 500
              ? "bg-amber-950/40 border-amber-500/30 text-amber-200"
              : "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CloudRain className={`w-4 h-4 ${latestRainfall < 500 ? "text-rose-455" : "text-emerald-450"}`} />
                Drought Stress
              </span>
              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                latestRainfall < 200
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : latestRainfall < 500
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}>
                {latestRainfall < 200 ? "High Risk" : latestRainfall < 500 ? "Warning" : "Optimal"}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {latestRainfall < 200
                ? "Critical drought level! Initiate drip irrigation immediately and check water reserves."
                : latestRainfall < 500
                ? "Moderate drought risk. Monitor soil moisture levels closely."
                : "Optimal moisture. Rainfall and irrigation levels are currently sufficient."}
            </p>
            <span className="text-[10px] text-slate-500 font-mono">
              Current Rainfall: {latestRainfall} mm
            </span>
          </div>

          {/* Card 2: Heat Stress */}
          <div className={`border rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all ${
            latestTemp > 35
              ? "bg-rose-950/40 border-rose-500/30 text-rose-200"
              : latestTemp > 30
              ? "bg-amber-950/40 border-amber-500/30 text-amber-200"
              : "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Thermometer className={`w-4 h-4 ${latestTemp > 30 ? "text-rose-455" : "text-emerald-450"}`} />
                Heat Stress
              </span>
              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                latestTemp > 35
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : latestTemp > 30
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}>
                {latestTemp > 35 ? "High Risk" : latestTemp > 30 ? "Warning" : "Optimal"}
              </span>
            </div>
            <p className="text-xs text-slate-350 leading-relaxed mb-3">
              {latestTemp > 35
                ? "Extreme temperatures! Consider shade netting or early-morning irrigation."
                : latestTemp > 30
                ? "Elevated temperature. Keep soil hydrated to avoid crop stress."
                : "Stable temperature. Temperature is within the normal crop growth range."}
            </p>
            <span className="text-[10px] text-slate-500 font-mono">
              Current Temperature: {latestTemp}°C
            </span>
          </div>

          {/* Card 3: Soil Acidification */}
          <div className={`border rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all ${
            latestPh < 5.8 || latestPh > 7.8
              ? "bg-rose-950/40 border-rose-500/30 text-rose-200"
              : latestPh < 6.2 || latestPh > 7.4
              ? "bg-amber-950/40 border-amber-500/30 text-amber-200"
              : "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Layers className={`w-4 h-4 ${latestPh < 6.2 || latestPh > 7.4 ? "text-amber-400" : "text-emerald-450"}`} />
                Soil pH Risk
              </span>
              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                latestPh < 5.8 || latestPh > 7.8
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : latestPh < 6.2 || latestPh > 7.4
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}>
                {latestPh < 5.8 || latestPh > 7.8 ? "High Risk" : latestPh < 6.2 || latestPh > 7.4 ? "Warning" : "Optimal"}
              </span>
            </div>
            <p className="text-xs text-slate-350 leading-relaxed mb-3">
              {latestPh < 5.8 || latestPh > 7.8
                ? "Suboptimal pH! Apply agricultural lime (for acidity) or sulfur (for alkalinity)."
                : latestPh < 6.2 || latestPh > 7.4
                ? "Soil pH is slightly off. Keep monitoring and plan organic amendments."
                : "Optimal pH. Soil condition is highly suitable for crop cultivation."}
            </p>
            <span className="text-[10px] text-slate-500 font-mono">
              Current pH: {latestPh}
            </span>
          </div>
        </div>
        )}
      </div>

      {/* Grid of 4 Agricultural Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Yield Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-800">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-slate-100">Historical Yield Trend (kg/ha)</h4>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yieldTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f1f5f9", borderRadius: "8px" }}
                    itemStyle={{ color: "#10b981" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="yield"
                    name="Yield (kg/ha)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 animate-pulse">Loading Chart...</div>
            )}
          </div>
        </div>

        {/* Chart 2: Seasonal Comparison */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-800">
            <BarChart2 className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-bold text-slate-100">Seasonal Yield Comparison</h4>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={seasonalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                  <XAxis dataKey="season" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f1f5f9", borderRadius: "8px" }}
                    itemStyle={{ color: "#3b82f6" }}
                  />
                  <Bar dataKey="yield" name="Yield (kg/ha)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 animate-pulse">Loading Chart...</div>
            )}
          </div>
        </div>

        {/* Chart 3: Crop Yield Comparison */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-800">
            <Activity className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-slate-100">Crop Yield Comparison (kg/ha)</h4>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cropComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                  <XAxis dataKey="cropName" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f1f5f9", borderRadius: "8px" }}
                    itemStyle={{ color: "#f59e0b" }}
                  />
                  <Bar dataKey="yield" name="Yield (kg/ha)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 animate-pulse">Loading Chart...</div>
            )}
          </div>
        </div>

        {/* Chart 4: Crop Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-800">
            <PieChart className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-bold text-slate-100">Crop Distribution Share</h4>
          </div>
          <div className="h-48 w-full flex flex-col sm:flex-row items-center justify-center">
            {mounted ? (
              <>
                <div className="w-full sm:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={cropDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {cropDist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f1f5f9", borderRadius: "8px" }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 flex flex-col justify-center space-y-2 mt-2 sm:mt-0 px-4">
                  {cropDist.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-300 font-semibold">{item.name}</span>
                      </div>
                      <span className="text-slate-400 font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-500 animate-pulse">Loading Chart...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
