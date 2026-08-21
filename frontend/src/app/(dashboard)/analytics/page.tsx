/**
 * YieldSense AI  -  Analytics Dashboard Page (Week 5)
 *
 * Full analytics dashboard with:
 * - Productivity Score (latest yield vs historical avg)
 * - Farm Comparison chart
 * - Yield Trend line chart
 * - Crop Yield Comparison bar chart
 * - Season Performance bar chart
 * - Rainfall vs Yield scatter plot
 * - 5 summary metric cards
 *
 * All data is fetched live from the backend  -  no hardcoded values.
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp, BarChart3, Leaf, CloudRain, Info,
  RefreshCw, ArrowRight, Zap, Target, Sprout,
  Map, Activity,
} from "lucide-react";
import { analyticsService } from "@/services/m3services";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import YieldTrendChart from "@/components/charts/YieldTrendChart";
import CropComparisonChart from "@/components/charts/CropComparisonChart";
import FarmComparisonChart from "@/components/charts/FarmComparisonChart";
import { SeasonComparisonChart, RainfallVsYieldChart } from "@/components/charts/SeasonRainfallCharts";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/utils/constants";
import type { AnalyticsData } from "@/types/analytics";

// ============================================================
// Productivity Score Ring Component
// ============================================================

function ProductivityRing({ score }: { score: number }) {
  // Color logic: <70 = red, 70-99 = amber, 100-119 = green, >=120 = blue
  const getStyle = () => {
    if (score >= 120) return { color: "#2563eb", label: "Excellent", bg: "from-blue-500 to-indigo-500" };
    if (score >= 100) return { color: "#16a34a", label: "Above Average", bg: "from-green-500 to-emerald-500" };
    if (score >= 70)  return { color: "#d97706", label: "Near Average", bg: "from-amber-500 to-orange-500" };
    return              { color: "#dc2626", label: "Below Average", bg: "from-red-500 to-rose-500" };
  };

  const { color, label, bg } = getStyle();
  const clampedScore = Math.min(score, 200); // cap at 200 for visual display
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  // Arc representing score / 200 * circumference (200% = full circle)
  const dashOffset = circumference - (clampedScore / 200) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
          {/* Background track */}
          <circle
            cx="56" cy="56" r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            className="dark:stroke-gray-700"
          />
          {/* Score arc */}
          <circle
            cx="56" cy="56" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900 dark:text-white">{score.toFixed(0)}</span>
          <span className="text-xs text-gray-400">/ 200</span>
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${bg}`}>
        {label}
      </div>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const analyticsData = await analyticsService.getAnalyticsData();
      setData(analyticsData);
    } catch {
      setError("Failed to load analytics data. Make sure you have predictions saved.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.uid]);

  if (loading) return <LoadingSpinner text="Loading analytics..." />;

  return (
    <div className="space-y-8 animate-in">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="h-7 w-7 text-green-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Deep insights from your prediction history, farm performance, and agricultural productivity.
          </p>
        </div>
        <button
          id="analytics-refresh-btn"
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{error}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Go to the{" "}
                <Link href={ROUTES.PREDICTION} className="underline font-medium">
                  Prediction page
                </Link>{" "}
                to make your first crop yield prediction.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!data || data.total_predictions === 0 ? (
        <Card padding="lg" className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Prediction Data Yet
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Make your first crop yield prediction to start seeing analytics data, trends, and insights here.
          </p>
          <Link
            href={ROUTES.PREDICTION}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            Make First Prediction
          </Link>
        </Card>
      ) : (
        <>
          {/* ── Section 1: Key Metric Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: "card-total-predictions",
                label: "Total Predictions",
                value: data.total_predictions.toString(),
                sub: "Yield forecasts made",
                icon: <BarChart3 className="h-5 w-5" />,
                color: "from-purple-500 to-violet-500",
                bg: "bg-purple-50 dark:bg-purple-900/20",
              },
              {
                id: "card-avg-yield",
                label: "Average Yield",
                value: data.avg_yield ? `${data.avg_yield.toFixed(2)} t/ha` : " - ",
                sub: "Historical mean",
                icon: <TrendingUp className="h-5 w-5" />,
                color: "from-green-500 to-emerald-500",
                bg: "bg-green-50 dark:bg-green-900/20",
              },
              {
                id: "card-best-crop",
                label: "Best Performing Crop",
                value: data.best_crop || " - ",
                sub: "Highest avg yield",
                icon: <Leaf className="h-5 w-5" />,
                color: "from-amber-500 to-orange-500",
                bg: "bg-amber-50 dark:bg-amber-900/20",
              },
              {
                id: "card-best-season",
                label: "Best Season",
                value: data.best_season || " - ",
                sub: "Optimal growing period",
                icon: <CloudRain className="h-5 w-5" />,
                color: "from-blue-500 to-cyan-500",
                bg: "bg-blue-50 dark:bg-blue-900/20",
              },
            ].map((stat) => (
              <Card key={stat.label} padding="md" className="relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 truncate">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
                    {stat.icon}
                  </div>
                </div>
                <div className={`absolute -bottom-4 -right-4 w-20 h-20 ${stat.bg} rounded-full blur-2xl opacity-60`} />
              </Card>
            ))}
          </div>

          {/* ── Section 2: Productivity Score + Yield Trend ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Productivity Score Card */}
            <Card padding="md" className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Productivity Score</h2>
                  <p className="text-xs text-gray-500">Latest yield vs. your average</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center py-2">
                {data.productivity_score !== null && data.productivity_score !== undefined ? (
                  <>
                    <ProductivityRing score={data.productivity_score} />
                    <p className="text-xs text-gray-400 mt-3 text-center max-w-[200px]">
                      100 = at average. Above 100 means your latest prediction
                      outperforms your historical baseline.
                    </p>
                  </>
                ) : (
                  <div className="text-center text-gray-400 text-sm py-6">
                    <Target className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    Not enough data yet.
                  </div>
                )}
              </div>

              {/* Formula note */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 text-center">
                  Formula: (Latest Yield ÷ Avg Yield) × 100
                </p>
              </div>
            </Card>

            {/* Yield Trend Chart (spans 2 columns) */}
            <Card padding="md" className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Yield Trend Over Time</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{data.yield_trend.length} predictions plotted chronologically</p>
                </div>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <YieldTrendChart data={data.yield_trend} height={220} />
            </Card>
          </div>

          {/* ── Section 3: Crop & Season Comparison ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Crop Comparison */}
            <Card padding="md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Crop Yield Comparison</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Average yield per crop type · {data.crop_comparison.length} crops</p>
                </div>
                <Sprout className="h-4 w-4 text-green-600" />
              </div>
              <CropComparisonChart data={data.crop_comparison} height={250} />
            </Card>

            {/* Season Comparison */}
            <Card padding="md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Season Performance</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Average yield by agricultural season</p>
                </div>
                <Leaf className="h-4 w-4 text-amber-600" />
              </div>
              <SeasonComparisonChart data={data.season_comparison} height={250} />
            </Card>
          </div>

          {/* ── Section 4: Farm Comparison ── */}
          {data.farm_comparison && data.farm_comparison.length > 0 && (
            <Card padding="md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Farm Performance Comparison</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Average predicted yield per farm · {data.farm_comparison.length} farm{data.farm_comparison.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Map className="h-4 w-4 text-blue-600" />
                  <Link href={ROUTES.FARMS} className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                    Manage Farms <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
              <FarmComparisonChart data={data.farm_comparison} height={Math.max(220, data.farm_comparison.length * 52)} />

              {/* Farm summary table below chart */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs font-semibold text-gray-400 uppercase">
                        <th className="pb-2 text-left">Farm</th>
                        <th className="pb-2 text-right">Avg Yield</th>
                        <th className="pb-2 text-right">Predictions</th>
                        <th className="pb-2 text-right">Total Production</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {data.farm_comparison.map((farm, i) => (
                        <tr key={farm.farm_name} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                          <td className="py-2 text-gray-900 dark:text-white font-medium flex items-center gap-2">
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ background: ["#16a34a","#2563eb","#d97706","#dc2626","#7c3aed","#0891b2","#65a30d","#c026d3","#ea580c","#0d9488"][i % 10] }}
                            />
                            {farm.farm_name}
                          </td>
                          <td className="py-2 text-right font-semibold text-green-600 dark:text-green-400">
                            {farm.avg_yield.toFixed(3)} t/ha
                          </td>
                          <td className="py-2 text-right text-gray-500">{farm.count}</td>
                          <td className="py-2 text-right text-gray-500">{farm.total_production.toLocaleString()} t</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}

          {/* ── Section 5: Rainfall vs Yield Scatter ── */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Rainfall vs Yield</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Scatter analysis  -  each dot is a prediction, color-coded by crop
                </p>
              </div>
              <CloudRain className="h-4 w-4 text-cyan-600" />
            </div>
            <RainfallVsYieldChart data={data.rainfall_vs_yield} height={280} />
          </Card>

          {/* ── Section 6: Insights Summary Strip ── */}
          <Card padding="md" className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-green-600" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Key Insights</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/60 dark:bg-gray-900/40 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Best Crop</p>
                <p className="font-bold text-gray-900 dark:text-white">{data.best_crop || " - "}</p>
                <p className="text-xs text-gray-400 mt-0.5">Highest average yield recorded</p>
              </div>
              <div className="bg-white/60 dark:bg-gray-900/40 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Best Season</p>
                <p className="font-bold text-gray-900 dark:text-white">{data.best_season || " - "}</p>
                <p className="text-xs text-gray-400 mt-0.5">Optimal growing period</p>
              </div>
              <div className="bg-white/60 dark:bg-gray-900/40 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Top Farm</p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {data.farm_comparison && data.farm_comparison.length > 0
                    ? data.farm_comparison[0].farm_name
                    : " - "}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {data.farm_comparison && data.farm_comparison.length > 0
                    ? `${data.farm_comparison[0].avg_yield.toFixed(2)} t/ha avg`
                    : "Link farms to predictions"}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
