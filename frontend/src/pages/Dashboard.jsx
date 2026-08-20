import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { analyticsApi, recommendationsApi } from "../api/resources";
import AppLayout from "../components/AppLayout";
import { PageHeader, RiskBadge, Spinner, StatCard } from "../components/UIKit";
import { useAuth } from "../context/AuthContext";

const RISK_COLORS = { Low: "#2f6b4f", Moderate: "#c99a2e", High: "#b3452e" };

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.summary(), recommendationsApi.all()])
      .then(([s, r]) => {
        setSummary(s.data);
        setRecs(r.data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center"><Spinner /></div>
      </AppLayout>
    );
  }

  const riskData = Object.entries(summary?.risk_distribution || {}).map(([name, value]) => ({ name, value }));
  const cropYieldData = Object.entries(summary?.yield_by_crop || {}).map(([crop, yield_kg]) => ({ crop, yield_kg }));

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${user?.full_name?.split(" ")[0] || ""}`}
        description="A live snapshot of your farms, forecasts, and agronomic risk."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total farms" value={summary?.total_farms ?? 0} />
        <StatCard label="Active crops" value={summary?.total_crops ?? 0} />
        <StatCard label="Land under forecast" value={summary?.total_area_hectares ?? 0} unit="ha" />
        <StatCard label="Avg. predicted yield" value={summary?.average_predicted_yield_kg_per_ha ?? 0} unit="kg/ha" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h3 className="mb-4 text-base font-semibold">Predicted yield by crop</h3>
          {cropYieldData.length === 0 ? (
            <p className="py-10 text-center text-sm text-pine-400">Run a prediction to see crop comparisons here.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={cropYieldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef4f1" />
                <XAxis dataKey="crop" tick={{ fontSize: 12, fill: "#5b6b62" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#5b6b62" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#f6f7f4" }} contentStyle={{ borderRadius: 8, border: "1px solid #d3e3db", fontSize: 12 }} />
                <Bar dataKey="yield_kg" fill="#2f6b4f" radius={[6, 6, 0, 0]} name="kg/ha" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 className="mb-4 text-base font-semibold">Risk distribution</h3>
          {riskData.length === 0 ? (
            <p className="py-10 text-center text-sm text-pine-400">No predictions yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={riskData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {riskData.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name] || "#c99a2e"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #d3e3db", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-2 flex justify-center gap-4 text-xs">
            {Object.entries(RISK_COLORS).map(([k, color]) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                {k}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h3 className="mb-4 text-base font-semibold">Recent yield trend</h3>
          {(summary?.yield_trend || []).length === 0 ? (
            <p className="py-10 text-center text-sm text-pine-400">No prediction history yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={summary.yield_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef4f1" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#5b6b62" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5b6b62" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #d3e3db", fontSize: 12 }} />
                <Line type="monotone" dataKey="predicted_yield_kg_per_ha" stroke="#c99a2e" strokeWidth={2.5} dot={{ r: 3 }} name="kg/ha" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold">Latest recommendations</h3>
            <Link to="/recommendations" className="text-xs font-semibold text-pine-600 hover:underline">View all</Link>
          </div>
          {recs.length === 0 ? (
            <p className="py-8 text-center text-sm text-pine-400">Run a prediction to generate recommendations.</p>
          ) : (
            <ul className="space-y-3">
              {recs.map((r) => (
                <li key={r.id} className="rounded-lg border border-pine-100 p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="badge bg-pine-50 text-pine-700 capitalize">{r.category}</span>
                    <span className="text-[10px] font-semibold uppercase text-pine-400">{r.priority}</span>
                  </div>
                  <p className="text-sm font-semibold text-pine-800">{r.title}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
