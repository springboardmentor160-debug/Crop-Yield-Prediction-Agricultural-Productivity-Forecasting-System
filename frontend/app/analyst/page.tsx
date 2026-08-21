"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function AnalystPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [yieldTrend, setYieldTrend] = useState<any[]>([]);
  const [riskSummary, setRiskSummary] = useState<any>(null);
  const [recentPredictions, setRecentPredictions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadAnalystData();
  }, []);

  const loadAnalystData = async () => {
    setLoading(true);
    try {
      const [dashboardData, trendData, riskData, recentData, reportsData] = await Promise.all([
        api.getAnalystDashboard(),
        api.getAnalystYieldTrends(),
        api.getAnalystRiskDistribution(),
        api.getAnalystRecentPredictions(5),
        api.getAnalystReports(30),
      ]);

      setDashboard(dashboardData);
      setYieldTrend(trendData?.yield_trend || []);
      setRiskSummary(riskData);
      setRecentPredictions(recentData || []);
      setReports(reportsData || []);
    } catch (err) {
      console.error(err);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

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
          <span className="text-2xl">🧠</span>
          <span className="text-xl font-bold">Analyst Panel</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Analyst Dashboard</h1>
          <p className="text-gray-500 text-sm">Focused farm analytics and research insights for analysts.</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border p-6 text-center text-gray-500">Loading analyst data...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[
                { label: "Coverage farms", value: dashboard?.coverage_farms ?? 0 },
                { label: "Active reports", value: dashboard?.active_reports ?? 0 },
                { label: "Insights generated", value: dashboard?.insights_count ?? 0 },
              ].map((metric) => (
                <div key={metric.label} className="bg-white rounded-3xl border p-6 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">{metric.label}</div>
                  <div className="text-4xl font-bold text-gray-900">{metric.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-3xl border p-6 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Yield Trend</h2>
                    <p className="text-sm text-gray-500">Recent farm yield trends for analyst review.</p>
                  </div>
                </div>
                {yieldTrend.length ? (
                  <div className="space-y-3">
                    {yieldTrend.map((item, index) => (
                      <div key={index} className="flex items-center justify-between rounded-2xl border px-4 py-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{item.month}</div>
                          <div className="text-xs text-gray-500">Observations: {item.count}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-700">{item.avg_yield} t/ha</div>
                          <div className="text-xs text-gray-500">High: {item.max_yield ?? 0} t/ha</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No yield trend data available yet.</div>
                )}
              </div>

              <div className="bg-white rounded-3xl border p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h2>
                {riskSummary ? (
                  <div className="space-y-4">
                    {[
                      { label: "Low risk", value: riskSummary.low, percent: riskSummary.low_percent, color: "bg-emerald-500" },
                      { label: "Medium risk", value: riskSummary.medium, percent: riskSummary.medium_percent, color: "bg-yellow-500" },
                      { label: "High risk", value: riskSummary.high, percent: riskSummary.high_percent, color: "bg-red-500" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm text-gray-700 mb-1">
                          <span>{item.label}</span>
                          <span>{item.value} ({item.percent}%)</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                          <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Risk analytics unavailable.</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-3xl border p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Predictions</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-gray-600">
                    <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Crop</th>
                        <th className="px-4 py-3">Yield</th>
                        <th className="px-4 py-3">Risk</th>
                        <th className="px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPredictions.length ? recentPredictions.map((prediction) => (
                        <tr key={prediction.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-4">{prediction.crop_type}</td>
                          <td className="px-4 py-4">{prediction.predicted_yield_tons_per_ha} t/ha</td>
                          <td className="px-4 py-4">{prediction.risk_level}</td>
                          <td className="px-4 py-4">{new Date(prediction.created_at).toLocaleDateString()}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-4 text-center text-gray-500">No recent predictions available.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-3xl border p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Analyst Reports</h2>
                <div className="space-y-3">
                  {reports.length ? reports.slice(0, 6).map((report: any) => (
                    <div key={report.id} className="rounded-2xl border p-4 bg-gray-50">
                      <div className="font-semibold text-gray-900">{report.title}</div>
                      <div className="text-xs text-gray-500">{new Date(report.created_at).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-600 mt-2">{report.summary || "No summary available."}</div>
                    </div>
                  )) : (
                    <div className="text-sm text-gray-500">No analyst reports available.</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
