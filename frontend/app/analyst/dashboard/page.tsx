// app/analyst/dashboard/page.tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import PageHeader from "@/components/analyst/PageHeader";
import StatCard from "@/components/ui/StatCard";

interface DashboardData {
  total_users: number;
  total_farms: number;
  total_predictions: number;
  total_area_hectares: number;
  average_yield: number;
  highest_yield: number;
  lowest_yield: number;
  average_confidence: number;
  average_soil_ph: number;
  average_fertility: number;
  best_crop: string | null;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  model_accuracy: number;
  mae: number;
  rmse: number;
  training_samples: number;
  n_crops: number;
}

export default function AnalystDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError("");
      setData(await api.getAnalystDashboard());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0a0f0a" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <div style={{ color: "#22c55e", letterSpacing: "0.15em", fontSize: "13px" }}>LOADING ANALYST DASHBOARD...</div>
        </div>
      </div>
    );
  }

  const totalRisk = (data?.high_risk ?? 0) + (data?.medium_risk ?? 0) + (data?.low_risk ?? 0);

  return (
    <div style={{ backgroundColor: "#0a0f0a", minHeight: "100vh", color: "#ffffff", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <PageHeader
        title="Analyst Dashboard"
        subtitle="Platform-wide overview across every user's farms."
        onRefresh={loadData}
        refreshing={refreshing}
      />

      {error && (
        <div style={{ backgroundColor: "rgba(220,76,67,0.08)", border: "1px solid rgba(220,76,67,0.2)", color: "#d44c43", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", fontSize: "14px" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <StatCard label="Total Users" value={data?.total_users ?? 0} />
        <StatCard label="Total Farms" value={data?.total_farms ?? 0} />
        <StatCard label="Total Predictions" value={data?.total_predictions ?? 0} />
        <StatCard
          label="Total Area"
          value={`${data?.total_area_hectares ?? 0} ha`}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <StatCard label="Average Yield" value={`${data?.average_yield ?? 0} t/ha`} accent />
        <StatCard label="Highest Yield" value={`${data?.highest_yield ?? 0} t/ha`} tone="success" />
        <StatCard label="Lowest Yield" value={`${data?.lowest_yield ?? 0} t/ha`} />
        <StatCard label="Best Crop" value={data?.best_crop ?? "—"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Risk breakdown */}
        <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#4a7a4a", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Risk Distribution
          </div>
          {[
            { label: "Low", value: data?.low_risk ?? 0, color: "#22c55e" },
            { label: "Medium", value: data?.medium_risk ?? 0, color: "#f59e0b" },
            { label: "High", value: data?.high_risk ?? 0, color: "#ef4444" },
          ].map((r) => {
            const pct = totalRisk ? Math.round((r.value / totalRisk) * 100) : 0;
            return (
              <div key={r.label} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
                  <span style={{ color: "#ffffff" }}>{r.label}</span>
                  <span style={{ color: "#6b9e6b", fontFamily: "monospace" }}>
                    {r.value} ({pct}%)
                  </span>
                </div>
                <div style={{ height: "8px", backgroundColor: "#0a0f0a", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{ height: "100%", borderRadius: "4px", width: `${pct}%`, backgroundColor: r.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Model performance */}
        <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#4a7a4a", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Model Performance
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#4a7a4a", marginBottom: "4px" }}>Accuracy</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#22c55e" }}>
                {data?.model_accuracy ?? 0}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#4a7a4a", marginBottom: "4px" }}>MAE</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff" }}>{data?.mae ?? 0}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#4a7a4a", marginBottom: "4px" }}>RMSE</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff" }}>{data?.rmse ?? 0}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#4a7a4a", marginBottom: "4px" }}>Training Samples</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff" }}>{data?.training_samples ?? 0}</div>
            </div>
          </div>
          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #1a2e1a", display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span style={{ color: "#4a7a4a" }}>Avg soil pH</span>
            <span style={{ color: "#ffffff", fontFamily: "monospace" }}>{data?.average_soil_ph ?? 0}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "8px" }}>
            <span style={{ color: "#4a7a4a" }}>Avg fertility</span>
            <span style={{ color: "#ffffff", fontFamily: "monospace" }}>{data?.average_fertility ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
