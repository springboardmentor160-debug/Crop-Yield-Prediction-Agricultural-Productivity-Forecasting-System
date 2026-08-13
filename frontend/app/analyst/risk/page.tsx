// app/analyst/risk/page.tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import PageHeader from "@/components/analyst/PageHeader";
import StatCard from "@/components/ui/StatCard";

interface RiskResponse {
  total_predictions: number;
  low: number;
  medium: number;
  high: number;
  low_percent: number;
  medium_percent: number;
  high_percent: number;
}

export default function RiskDistributionPage() {
  const [data, setData] = useState<RiskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError("");
      setData(await api.getAnalystRiskDistribution());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load risk distribution");
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
        Loading risk distribution…
      </div>
    );
  }

  const segments = [
    { label: "Low", value: data?.low ?? 0, pct: data?.low_percent ?? 0, color: "var(--color-primary)" },
    { label: "Medium", value: data?.medium ?? 0, pct: data?.medium_percent ?? 0, color: "var(--color-accent)" },
    { label: "High", value: data?.high ?? 0, pct: data?.high_percent ?? 0, color: "var(--color-danger)" },
  ];

  return (
    <div>
      <PageHeader
        title="Risk Distribution"
        subtitle="Share of predictions falling into each risk tier across the platform."
        onRefresh={loadData}
        refreshing={refreshing}
      />

      {error && (
        <div className="bg-[var(--color-danger)]/8 border border-[var(--color-danger)]/25 text-[var(--color-danger)] text-sm rounded-[8px] px-4 py-2.5 mb-6">
          {error}
        </div>
      )}

      <div className="mb-7">
        <StatCard label="Total Predictions Assessed" value={data?.total_predictions ?? 0} />
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius)] p-6 shadow-[var(--shadow-card)]">
        {/* Stacked bar */}
        <div className="h-4 rounded-full overflow-hidden flex mb-6 bg-[var(--color-bg-secondary)]">
          {segments.map((s) => (
            <div
              key={s.label}
              style={{ width: `${s.pct}%`, background: s.color }}
              title={`${s.label}: ${s.value} (${s.pct}%)`}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {segments.map((s) => (
            <div
              key={s.label}
              className="border border-[var(--color-border)] rounded-[10px] p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: s.color }}
                />
                <span className="text-[13px] font-medium text-[var(--color-ink)]">
                  {s.label} Risk
                </span>
              </div>
              <div className="font-mono-num text-2xl font-semibold text-[var(--color-heading)]">
                {s.value}
              </div>
              <div className="text-[12.5px] text-[var(--color-ink-soft)] mt-1">
                {s.pct}% of predictions
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
