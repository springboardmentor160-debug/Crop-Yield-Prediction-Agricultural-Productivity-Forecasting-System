// app/analyst/soil/page.tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import PageHeader from "@/components/analyst/PageHeader";
import StatCard from "@/components/ui/StatCard";

interface SoilAnalysisResponse {
  total_analyses: number;
  average_ph: number;
  average_fertility: number;
  healthy_soils: number;
  acidic_soils: number;
  alkaline_soils: number;
}

export default function AnalystSoilPage() {
  const [data, setData] = useState<SoilAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError("");
      setData(await api.getAnalystSoilAnalysis());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load soil analysis");
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
        Loading soil analysis…
      </div>
    );
  }

  const total = data?.total_analyses || 0;
  const buckets = [
    { label: "Healthy (pH 6–7.5)", value: data?.healthy_soils ?? 0, color: "var(--color-primary)" },
    { label: "Acidic (pH < 6)", value: data?.acidic_soils ?? 0, color: "var(--color-soil)" },
    { label: "Alkaline (pH > 7.5)", value: data?.alkaline_soils ?? 0, color: "var(--color-sky)" },
  ];

  return (
    <div>
      <PageHeader
        title="Soil Analysis"
        subtitle="Platform-wide soil pH and fertility distribution."
        onRefresh={loadData}
        refreshing={refreshing}
      />

      {error && (
        <div className="bg-[var(--color-danger)]/8 border border-[var(--color-danger)]/25 text-[var(--color-danger)] text-sm rounded-[8px] px-4 py-2.5 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
        <StatCard label="Total Analyses" value={total} />
        <StatCard label="Average pH" value={data?.average_ph ?? 0} />
        <StatCard label="Average Fertility" value={data?.average_fertility ?? 0} accent />
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius)] p-6 shadow-[var(--shadow-card)]">
        <div className="text-[13px] font-medium text-[var(--color-ink-soft)] mb-4">
          Soil pH Categories
        </div>
        {buckets.map((b) => {
          const pct = total ? Math.round((b.value / total) * 100) : 0;
          return (
            <div key={b.label} className="mb-3 last:mb-0">
              <div className="flex justify-between text-[13px] mb-1">
                <span className="text-[var(--color-ink)]">{b.label}</span>
                <span className="text-[var(--color-ink-soft)] font-mono-num">
                  {b.value} ({pct}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: b.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
