"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { api } from "@/lib/api";

export default function AnalyticsPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [riskSummary, setRiskSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [dashboardSummary, riskData] = await Promise.all([
        api.getDashboardSummary(),
        api.getRiskDistribution(),
      ]);

      setSummary(dashboardSummary);
      setRiskSummary(riskData);
    } catch (error) {
      console.error(error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const topMetrics = [
    { label: "Productivity", value: `${summary?.productivity_score ?? 0}%`, note: summary?.productivity_rating ?? "Unknown" },
    { label: "Avg Yield", value: `${summary?.summary_metrics?.average_yield_tons_per_ha ?? 0} t/ha`, note: "Across all farms" },
    { label: "Total Farms", value: summary?.summary_metrics?.total_farms ?? 0, note: "Farms managed" },
    { label: "Predictions", value: summary?.summary_metrics?.total_predictions ?? 0, note: "Forecast records" },
  ];

  const yieldTrendData = summary?.yield_trend ?? [];
  const seasonalData = summary?.seasonal_comparison ?? [];
  const farmComparisonData = summary?.farm_comparison ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-700 text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
          >
            ← Dashboard
          </button>
          <span className="text-2xl">📈</span>
          <span className="text-xl font-bold">Analytics</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-500 text-sm">Dashboard data is calculated on the backend; React only renders charts and numbers.</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border p-6 text-center text-gray-500">Loading dashboard data...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {topMetrics.map((metric) => (
                <div key={metric.label} className="bg-white rounded-3xl border p-6 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">{metric.label}</div>
                  <div className="text-4xl font-bold text-gray-900 mb-3">{metric.value}</div>
                  <div className="text-sm text-gray-500">{metric.note}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-3xl border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Yield Trend</h2>
                    <p className="text-sm text-gray-500">Trend of average yield per month.</p>
                  </div>
                </div>
                {yieldTrendData.length ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={yieldTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="avg_yield" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Not enough data for a yield trend chart yet.</div>
                )}
              </div>

              <div className="bg-white rounded-3xl border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Seasonal Comparison</h2>
                    <p className="text-sm text-gray-500">Season-over-season yield comparison.</p>
                  </div>
                </div>
                {seasonalData.length ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={seasonalData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="avg_yield" fill="#2563eb" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Not enough seasonal comparison data yet.</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border p-6 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Farm Comparison Report</h2>
                  <p className="text-sm text-gray-500">Compare average yield across your farms.</p>
                </div>
              </div>
              {farmComparisonData.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-gray-600">
                    <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Farm</th>
                        <th className="px-4 py-3">Avg Yield</th>
                        <th className="px-4 py-3">Area</th>
                        <th className="px-4 py-3">Predictions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {farmComparisonData.map((farm: any) => (
                        <tr key={farm.farm_id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-4">{farm.farm_name || `Farm ${farm.farm_id}`}</td>
                          <td className="px-4 py-4">{farm.avg_yield_tons_per_ha} t/ha</td>
                          <td className="px-4 py-4">{farm.area_hectares ?? 0} ha</td>
                          <td className="px-4 py-4">{farm.total_predictions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No farm comparison data available yet.</div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Summary</h2>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Total farms</span>
                    <strong>{summary?.summary_metrics.total_farms ?? 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total predictions</span>
                    <strong>{summary?.summary_metrics.total_predictions ?? 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Average yield</span>
                    <strong>{summary?.summary_metrics.average_yield_tons_per_ha ?? 0} t/ha</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>High risk forecasts</span>
                    <strong>{summary?.summary_metrics.high_risk_predictions ?? 0}</strong>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Notes</h2>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>Backend returns clean JSON for all dashboard calculations.</li>
                  <li>The frontend renders charts, loading state, and fallbacks only.</li>
                  <li>If there is not enough data, the dashboard shows a friendly message instead of crashing.</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
