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
      <div className="flex items-center justify-center h-[60vh] text-[var(--color-ink-soft)] text-sm">
        Loading dashboard…
      </div>
    );
  }

  const totalRisk = (data?.high_risk ?? 0) + (data?.medium_risk ?? 0) + (data?.low_risk ?? 0);

  return (
    <div>
      <PageHeader
        title="Analyst Dashboard"
        subtitle="Platform-wide overview across every user's farms."
        onRefresh={loadData}
        refreshing={refreshing}
      />

      {error && (
        <div className="bg-[var(--color-danger)]/8 border border-[var(--color-danger)]/25 text-[var(--color-danger)] text-sm rounded-[8px] px-4 py-2.5 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={data?.total_users ?? 0} />
        <StatCard label="Total Farms" value={data?.total_farms ?? 0} />
        <StatCard label="Total Predictions" value={data?.total_predictions ?? 0} />
        <StatCard
          label="Total Area"
          value={`${data?.total_area_hectares ?? 0} ha`}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Average Yield" value={`${data?.average_yield ?? 0} t/ha`} accent />
        <StatCard label="Highest Yield" value={`${data?.highest_yield ?? 0} t/ha`} tone="success" />
        <StatCard label="Lowest Yield" value={`${data?.lowest_yield ?? 0} t/ha`} />
        <StatCard label="Best Crop" value={data?.best_crop ?? "—"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk breakdown */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius)] p-5 shadow-[var(--shadow-card)]">
          <div className="text-[13px] font-medium text-[var(--color-ink-soft)] mb-4">
            Risk Distribution
          </div>
          {[
            { label: "Low", value: data?.low_risk ?? 0, color: "var(--color-primary)" },
            { label: "Medium", value: data?.medium_risk ?? 0, color: "var(--color-accent)" },
            { label: "High", value: data?.high_risk ?? 0, color: "var(--color-danger)" },
          ].map((r) => {
            const pct = totalRisk ? Math.round((r.value / totalRisk) * 100) : 0;
            return (
              <div key={r.label} className="mb-3 last:mb-0">
                <div className="flex justify-between text-[13px] mb-1">
                  <span className="text-[var(--color-ink)]">{r.label}</span>
                  <span className="text-[var(--color-ink-soft)] font-mono-num">
                    {r.value} ({pct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: r.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Model performance */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius)] p-5 shadow-[var(--shadow-card)]">
          <div className="text-[13px] font-medium text-[var(--color-ink-soft)] mb-4">
            Model Performance
          </div>
          <div className="grid grid-cols-2 gap-4 font-mono-num">
            <div>
              <div className="text-[12px] text-[var(--color-ink-soft)]">Accuracy</div>
              <div className="text-xl font-semibold text-[var(--color-primary)]">
                {data?.model_accuracy ?? 0}%
              </div>
            </div>
            <div>
              <div className="text-[12px] text-[var(--color-ink-soft)]">MAE</div>
              <div className="text-xl font-semibold">{data?.mae ?? 0}</div>
            </div>
            <div>
              <div className="text-[12px] text-[var(--color-ink-soft)]">RMSE</div>
              <div className="text-xl font-semibold">{data?.rmse ?? 0}</div>
            </div>
            <div>
              <div className="text-[12px] text-[var(--color-ink-soft)]">Training Samples</div>
              <div className="text-xl font-semibold">{data?.training_samples ?? 0}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex justify-between text-[13px]">
            <span className="text-[var(--color-ink-soft)]">Avg soil pH</span>
            <span className="font-mono-num">{data?.average_soil_ph ?? 0}</span>
          </div>
          <div className="flex justify-between text-[13px] mt-1.5">
            <span className="text-[var(--color-ink-soft)]">Avg fertility</span>
            <span className="font-mono-num">{data?.average_fertility ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
