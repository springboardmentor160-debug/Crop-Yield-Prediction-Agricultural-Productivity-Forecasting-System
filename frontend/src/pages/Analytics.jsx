import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { analyticsApi } from "../api/resources";
import AppLayout from "../components/AppLayout";
import { EmptyState, PageHeader, Spinner, StatCard } from "../components/UIKit";

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.summary(), analyticsApi.farmComparison()])
      .then(([s, c]) => {
        setSummary(s.data);
        setComparison(c.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <AppLayout><div className="flex h-64 items-center justify-center"><Spinner /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Agricultural Analytics & Insights"
        title="Analytics dashboard"
        description="Productivity analytics, seasonal performance, and farm-to-farm comparison reports."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Predictions (last 30 days)" value={summary?.predictions_last_30_days ?? 0} />
        <StatCard label="Farms tracked" value={summary?.total_farms ?? 0} />
        <StatCard label="Crops tracked" value={summary?.total_crops ?? 0} />
        <StatCard label="Avg. yield" value={summary?.average_predicted_yield_kg_per_ha ?? 0} unit="kg/ha" />
      </div>

      <div className="card mb-6">
        <h3 className="mb-4 text-base font-semibold">Farm comparison — average predicted yield</h3>
        {comparison.length === 0 ? (
          <EmptyState title="No farm data yet" description="Add farms and run predictions to populate comparison reports." />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef4f1" />
              <XAxis dataKey="farm_name" tick={{ fontSize: 12, fill: "#5b6b62" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#5b6b62" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #d3e3db", fontSize: 12 }} />
              <Bar dataKey="average_predicted_yield_kg_per_ha" fill="#1f4b3f" radius={[6, 6, 0, 0]} name="kg/ha" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {comparison.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pine-100 text-left text-xs font-semibold uppercase tracking-wide text-pine-400">
                <th className="px-4 py-3">Farm</th><th className="px-4 py-3">Area (ha)</th>
                <th className="px-4 py-3">Crops</th><th className="px-4 py-3">Avg. yield (kg/ha)</th>
                <th className="px-4 py-3">Avg. productivity score</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((f) => (
                <tr key={f.farm_id} className="border-b border-pine-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-pine-800">{f.farm_name}</td>
                  <td className="px-4 py-3 font-mono">{f.total_area_hectares}</td>
                  <td className="px-4 py-3 font-mono">{f.crop_count}</td>
                  <td className="px-4 py-3 font-mono">{f.average_predicted_yield_kg_per_ha}</td>
                  <td className="px-4 py-3 font-mono">{f.average_productivity_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
