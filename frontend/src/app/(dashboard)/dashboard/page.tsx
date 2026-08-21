/**
 * YieldSense AI  -  Dashboard Page
 *
 * Clear visual hierarchy. Data-first layout.
 * No decorative gradients, no emoji, no excessive cards.
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  MapPin, Wheat, Ruler, BarChart3, Plus, TrendingUp,
  ArrowRight, Cloud, Layers, AlertTriangle,
  ShieldCheck, ShieldAlert, ShieldX, AlertCircle,
  History, FileText, RefreshCw, Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { analyticsService } from "@/services/m3services";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import YieldTrendChart from "@/components/charts/YieldTrendChart";
import { ROUTES } from "@/utils/constants";
import { formatArea, getRelativeTime } from "@/utils/formatters";
import type { DashboardSummary } from "@/types/analytics";

const RISK_STYLES: Record<string, { badge: string; icon: React.ReactNode; text: string }> = {
  Low: {
    badge: "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    icon: <ShieldCheck className="h-4 w-4 text-green-600" />,
    text: "text-green-700 dark:text-green-400",
  },
  Medium: {
    badge: "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    icon: <AlertCircle className="h-4 w-4 text-amber-600" />,
    text: "text-amber-700 dark:text-amber-400",
  },
  High: {
    badge: "bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    icon: <ShieldAlert className="h-4 w-4 text-orange-600" />,
    text: "text-orange-700 dark:text-orange-400",
  },
  Critical: {
    badge: "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    icon: <ShieldX className="h-4 w-4 text-red-600" />,
    text: "text-red-700 dark:text-red-400",
  },
};

const quickActions = [
  { label: "New Farm", href: ROUTES.FARM_NEW, icon: <Plus className="h-4 w-4" />, desc: "Register a farm with soil and location data" },
  { label: "AI Prediction", href: ROUTES.PREDICTION, icon: <TrendingUp className="h-4 w-4" />, desc: "Predict yield with risk and recommendations" },
  { label: "Analytics", href: ROUTES.ANALYTICS, icon: <BarChart3 className="h-4 w-4" />, desc: "Charts, trends, and performance insights" },
  { label: "History", href: ROUTES.HISTORY, icon: <History className="h-4 w-4" />, desc: "All past predictions with export" },
  { label: "Reports", href: ROUTES.REPORTS, icon: <FileText className="h-4 w-4" />, desc: "Generate PDF and CSV reports" },
  { label: "Weather", href: ROUTES.WEATHER, icon: <Cloud className="h-4 w-4" />, desc: "Live weather for farm locations" },
  { label: "Soil Analysis", href: ROUTES.SOIL, icon: <Layers className="h-4 w-4" />, desc: "NPK and pH soil health check" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getDashboardSummary();
      setSummary(data);
    } catch {
      setSummary({
        total_farms: 0,
        total_area: 0,
        unique_crops: 0,
        crop_list: [],
        total_predictions: 0,
        avg_predicted_yield: null,
        latest_prediction: null,
        latest_risk_level: null,
        latest_risk_score: null,
        high_risk_count: 0,
        recent_predictions: [],
        recent_farms: [],
        model_name: null,
        model_accuracy: null,
        model_status: "not_trained",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && profile.role === "admin") {
      router.replace(ROUTES.ADMIN);
      return;
    }
    loadDashboard();
  }, [user?.uid, profile?.role]);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const modelReady = summary?.model_status === "ready" && summary?.model_name;
  const riskStyle = summary?.latest_risk_level
    ? RISK_STYLES[summary.latest_risk_level] || RISK_STYLES.Low
    : null;

  const stats = [
    { label: "Farms", value: summary?.total_farms || 0, icon: <MapPin className="h-4 w-4 text-gray-400" /> },
    { label: "Total Area", value: formatArea(summary?.total_area || 0), icon: <Ruler className="h-4 w-4 text-gray-400" /> },
    { label: "Crop Types", value: summary?.unique_crops || 0, icon: <Wheat className="h-4 w-4 text-gray-400" /> },
    { label: "Predictions", value: summary?.total_predictions || 0, icon: <BarChart3 className="h-4 w-4 text-gray-400" /> },
  ];

  return (
    <div className="space-y-6 animate-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {profile?.display_name ? `${profile.display_name}'s Dashboard` : "Farm Dashboard"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Overview of your farms, predictions, and alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboard}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Refresh dashboard"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <Link href={ROUTES.FARM_NEW}>
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" /> Add Farm
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-4"
          >
            <div className="flex items-center gap-2 mb-2">
              {stat.icon}
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Status Row  -  Yield / Risk / Model ── */}
      {summary && summary.total_predictions > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Average Yield */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Avg. Yield</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {summary.avg_predicted_yield ? `${summary.avg_predicted_yield.toFixed(2)} t/ha` : " - "}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              across {summary.total_predictions} prediction{summary.total_predictions !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Latest Risk */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Latest Risk</p>
            <div className="flex items-center gap-2">
              {riskStyle ? riskStyle.icon : <ShieldCheck className="h-4 w-4 text-gray-400" />}
              <p className={`text-xl font-bold ${riskStyle ? riskStyle.text : "text-gray-400"}`}>
                {summary.latest_risk_level || "No data"}
              </p>
            </div>
            {summary.high_risk_count > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-orange-600">
                  {summary.high_risk_count} high-risk
                </span>
              </div>
            )}
          </div>

          {/* AI Model */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="h-3.5 w-3.5 text-gray-400" />
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">AI Model</p>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {summary.model_name || "Not trained"}
            </p>
            {summary.model_accuracy && (
              <p className="text-xs text-[#1a6b3c] dark:text-green-400 mt-1">
                R² = {(summary.model_accuracy * 100).toFixed(1)}%
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Main Content: 2-column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left column (wider): Predictions + Yield Trend */}
        <div className="lg:col-span-3 space-y-5">
          {/* Recent Predictions */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Predictions</h2>
              <Link href={ROUTES.HISTORY}>
                <span className="text-xs text-[#1a6b3c] dark:text-green-400 hover:underline font-medium flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </div>

            {summary && summary.recent_predictions.length > 0 ? (
              <div className="space-y-1">
                {summary.recent_predictions.map((pred) => {
                  const rs = pred.risk_level ? RISK_STYLES[pred.risk_level] : null;
                  return (
                    <div
                      key={pred.id}
                      className="flex items-center gap-3 py-2.5 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      {/* Crop initial */}
                      <div className="w-8 h-8 rounded-md bg-[#e8f5ec] dark:bg-green-900/20 flex items-center justify-center text-[#1a6b3c] dark:text-green-400 text-xs font-bold shrink-0">
                        {pred.crop.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{pred.crop}</p>
                          <span className="text-xs text-gray-400">{pred.season}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs font-semibold text-[#1a6b3c] dark:text-green-400">
                            {pred.predicted_yield.toFixed(2)} t/ha
                          </p>
                          {pred.risk_level && rs && (
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${rs.badge}`}>
                              {pred.risk_level}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{getRelativeTime(pred.created_at)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <BarChart3 className="h-8 w-8 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-3">No predictions yet</p>
                <Link href={ROUTES.PREDICTION}>
                  <Button size="sm" variant="outline">
                    <TrendingUp className="h-3.5 w-3.5" /> Make first prediction
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Yield Trend Chart */}
          {summary && summary.total_predictions > 0 && (
            <Card padding="md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Yield Trend</h2>
                <Link href={ROUTES.ANALYTICS}>
                  <span className="text-xs text-[#1a6b3c] dark:text-green-400 hover:underline font-medium flex items-center gap-1">
                    Full analytics <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </div>
              <YieldTrendChart
                data={(summary.recent_predictions || []).map((p) => ({
                  date: p.created_at.slice(0, 10),
                  predicted_yield: p.predicted_yield,
                  crop: p.crop,
                  season: p.season,
                  area: p.area,
                }))}
                height={180}
              />
            </Card>
          )}

          {/* Recent Farms */}
          {summary && summary.recent_farms.length > 0 && (
            <Card padding="md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Farms</h2>
                <Link href={ROUTES.FARMS}>
                  <span className="text-xs text-[#1a6b3c] dark:text-green-400 hover:underline font-medium flex items-center gap-1">
                    All farms <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </div>
              <div className="space-y-1">
                {summary.recent_farms.map((farm) => (
                  <Link key={farm.id} href={ROUTES.FARM_DETAIL(farm.id)}>
                    <div className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer">
                      <div className="w-7 h-7 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 text-xs font-semibold shrink-0">
                        {farm.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{farm.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{farm.location}</span>
                          <span>·</span>
                          <span>{farm.crop}</span>
                          <span>·</span>
                          <span>{formatArea(farm.area)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right column (narrower): Quick Actions + Active Crops */}
        <div className="lg:col-span-2 space-y-5">
          {/* Quick Actions */}
          <Card padding="md">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h2>
            <div className="space-y-0.5">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-[#e8f5ec] dark:group-hover:bg-green-900/20 group-hover:text-[#1a6b3c] dark:group-hover:text-green-400 transition-colors shrink-0">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
                    <p className="text-xs text-gray-500 truncate">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-[#1a6b3c] dark:group-hover:text-green-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </Card>

          {/* Active Crops */}
          {summary?.crop_list && summary.crop_list.length > 0 && (
            <Card padding="md">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Active Crops</h2>
              <div className="flex flex-wrap gap-2">
                {summary.crop_list.map((crop) => (
                  <span
                    key={crop}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    {crop}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
