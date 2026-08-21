import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import CropAnalyticsChart from "../../components/analytics/CropAnalyticsChart";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import RecentPredictions from "../../components/analytics/RecentPredictions";
import SeasonAnalyticsChart from "../../components/analytics/SeasonAnalyticsChart";
import StateAnalyticsChart from "../../components/analytics/StateAnalyticsChart";
import SummaryCards from "../../components/analytics/SummaryCards";
import { getAnalyticsDashboard } from "../../services/analyticsService";


const EMPTY_ANALYTICS = {
  summary: {
    total_predictions: 0,
    active_farms: 0,
    average_predicted_yield: 0,
    average_estimated_production: 0,
  },
  crops: [],
  seasons: [],
  states: [],
  recent_predictions: [],
};


function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(
    EMPTY_ANALYTICS
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(
    async (showRefreshMessage = false) => {
      try {
        setError("");

        const data =
          await getAnalyticsDashboard();

        setAnalytics({
          summary:
            data?.summary ||
            EMPTY_ANALYTICS.summary,
          crops: Array.isArray(data?.crops)
            ? data.crops
            : [],
          seasons: Array.isArray(data?.seasons)
            ? data.seasons
            : [],
          states: Array.isArray(data?.states)
            ? data.states
            : [],
          recent_predictions: Array.isArray(
            data?.recent_predictions
          )
            ? data.recent_predictions
            : [],
        });

        if (showRefreshMessage) {
          toast.success(
            "Analytics dashboard refreshed"
          );
        }
      } catch (requestError) {
        const message =
          requestError?.response?.data?.detail ||
          requestError?.message ||
          "Unable to load analytics dashboard.";

        setError(message);

        if (showRefreshMessage) {
          toast.error(message);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics(true);
  };

  const handleRetry = async () => {
    setLoading(true);
    await loadAnalytics();
  };

  if (loading) {
  return (
    <DashboardLayout>
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />

          <div className="text-center">
            <p className="font-semibold text-slate-800">
              Loading analytics
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Preparing dashboard insights...
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

  if (error) {
  return (
    <DashboardLayout>
      <div className="flex min-h-[65vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <BarChart3 className="h-7 w-7 text-red-500" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Analytics unavailable
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={handleRetry}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

  return (
  <DashboardLayout>
    <div className="space-y-6 pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 px-6 py-8 text-white shadow-lg sm:px-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />

        <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <BarChart3 className="h-6 w-6" />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
              YieldSense AI
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Analytics Dashboard
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50 sm:text-base">
              Review farm activity, prediction performance,
              crop trends, seasonal distribution and
              state-level insights.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh Analytics"}
          </button>
        </div>
      </section>

      <SummaryCards summary={analytics.summary} />

      <section className="grid gap-6 xl:grid-cols-2">
        <CropAnalyticsChart crops={analytics.crops} />

        <SeasonAnalyticsChart
          seasons={analytics.seasons}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <StateAnalyticsChart states={analytics.states} />

        <RecentPredictions
          predictions={analytics.recent_predictions}
        />
      </section>
    </div>
  </DashboardLayout>
);
}

export default AnalyticsDashboard;