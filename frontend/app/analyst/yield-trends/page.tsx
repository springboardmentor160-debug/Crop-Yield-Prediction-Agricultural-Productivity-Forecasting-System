// app/analyst/yield-trends/page.tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import PageHeader from "@/components/analyst/PageHeader";
import StatCard from "@/components/ui/StatCard";

interface TrendPoint {
  month: string;
  average_yield: number;
  maximum_yield: number;
  minimum_yield: number;
  prediction_count: number;
}

interface YieldTrendsResponse {
  yield_trend: TrendPoint[];
  total_predictions: number;
  average_yield: number;
  best_yield: number;
  worst_yield: number;
}

export default function YieldTrendsPage() {
  const [data, setData] = useState<YieldTrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError("");
      setData(await api.getAnalystYieldTrends());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load yield trends");
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
        Loading yield trends…
      </div>
    );
  }

  const points = data?.yield_trend || [];
  const maxVal = Math.max(1, ...points.map((p) => p.maximum_yield));

  return (
    <div>
      <PageHeader
        title="Yield Trends"
        subtitle="Monthly average, minimum, and maximum yield across the platform."
        onRefresh={loadData}
        refreshing={refreshing}
      />

      {error && (
        <div className="bg-[var(--color-danger)]/8 border border-[var(--color-danger)]/25 text-[var(--color-danger)] text-sm rounded-[8px] px-4 py-2.5 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard label="Total Predictions" value={data?.total_predictions ?? 0} />
        <StatCard label="Average Yield" value={`${data?.average_yield ?? 0} t/ha`} accent />
        <StatCard label="Best Yield" value={`${data?.best_yield ?? 0} t/ha`} tone="success" />
        <StatCard label="Worst Yield" value={`${data?.worst_yield ?? 0} t/ha`} />
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius)] shadow-[var(--shadow-card)] p-6">
        {points.length === 0 ? (
          <div className="text-center py-14 text-[var(--color-ink-soft)] text-sm">
            No prediction history yet.
          </div>
        ) : (
          <div className="flex items-end gap-4 h-64">
            {points.map((p) => (
              <div key={p.month} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="text-[11px] font-mono-num text-[var(--color-ink-soft)] mb-1">
                  {p.average_yield}
                </div>
                <div
                  className="w-full max-w-[42px] rounded-t-[6px] bg-[var(--color-primary)]"
                  style={{
                    height: `${(p.average_yield / maxVal) * 100}%`,
                    minHeight: 4,
                  }}
                  title={`Avg: ${p.average_yield} · Max: ${p.maximum_yield} · Min: ${p.minimum_yield} · n=${p.prediction_count}`}
                />
                <div className="text-[11.5px] text-[var(--color-ink-soft)] mt-2">
                  {p.month}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
