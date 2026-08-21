// app/analyst/productivity/page.tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import PageHeader from "@/components/analyst/PageHeader";
import StatCard from "@/components/ui/StatCard";

interface ProductivityResponse {
  total_area_hectares: number;
  average_yield_tons_per_ha: number;
  estimated_production_tons: number;
  estimated_revenue_inr: number;
  productivity_score: number;
  performance_rating: string;
  excellent_farms: number;
  good_farms: number;
  average_farms: number;
  poor_farms: number;
}

const RATING_TONE: Record<string, "success" | "danger" | "default"> = {
  Excellent: "success",
  "Very Good": "success",
  Good: "default",
  Average: "default",
  Poor: "danger",
  "No Data": "default",
};

export default function ProductivityPage() {
  const [data, setData] = useState<ProductivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError("");
      setData(await api.getAnalystProductivity());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load productivity data");
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
        Loading productivity data…
      </div>
    );
  }

  const buckets = [
    { label: "Excellent", value: data?.excellent_farms ?? 0, color: "var(--color-primary)" },
    { label: "Good", value: data?.good_farms ?? 0, color: "var(--color-accent)" },
    { label: "Average", value: data?.average_farms ?? 0, color: "var(--color-sky)" },
    { label: "Poor", value: data?.poor_farms ?? 0, color: "var(--color-danger)" },
  ];
  const totalFarms = buckets.reduce((s, b) => s + b.value, 0);

  return (
    <div>
      <PageHeader
        title="Productivity"
        subtitle="Estimated production, revenue, and performance across all farms."
        onRefresh={loadData}
        refreshing={refreshing}
      />

      {error && (
        <div className="bg-[var(--color-danger)]/8 border border-[var(--color-danger)]/25 text-[var(--color-danger)] text-sm rounded-[8px] px-4 py-2.5 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Area" value={`${data?.total_area_hectares ?? 0} ha`} />
        <StatCard
          label="Avg Yield"
          value={`${data?.average_yield_tons_per_ha ?? 0} t/ha`}
        />
        <StatCard
          label="Est. Production"
          value={`${data?.estimated_production_tons ?? 0} t`}
        />
        <StatCard
          label="Est. Revenue"
          value={`₹${(data?.estimated_revenue_inr ?? 0).toLocaleString("en-IN")}`}
          accent
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius)] p-5 shadow-[var(--shadow-card)] flex flex-col items-center justify-center text-center">
          <div className="text-[13px] font-medium text-[var(--color-ink-soft)] mb-2">
            Productivity Score
          </div>
          <div className="text-4xl font-mono-num font-semibold text-[var(--color-primary)] mb-2">
            {data?.productivity_score ?? 0}
          </div>
          <StatBadge
            label={data?.performance_rating ?? "No Data"}
            tone={RATING_TONE[data?.performance_rating ?? "No Data"]}
          />
        </div>

        <div className="lg:col-span-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius)] p-5 shadow-[var(--shadow-card)]">
          <div className="text-[13px] font-medium text-[var(--color-ink-soft)] mb-4">
            Farms by Performance Tier
          </div>
          {buckets.map((b) => {
            const pct = totalFarms ? Math.round((b.value / totalFarms) * 100) : 0;
            return (
              <div key={b.label} className="mb-3 last:mb-0">
                <div className="flex justify-between text-[13px] mb-1">
                  <span className="text-[var(--color-ink)]">{b.label}</span>
                  <span className="text-[var(--color-ink-soft)] font-mono-num">
                    {b.value} farms
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
    </div>
  );
}

function StatBadge({
  label,
  tone,
}: {
  label: string;
  tone: "success" | "danger" | "default";
}) {
  const cls =
    tone === "success"
      ? "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]"
      : tone === "danger"
      ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
      : "bg-[var(--color-bg-secondary)] text-[var(--color-ink-soft)]";
  return (
    <span className={`px-3 py-1 rounded-full text-[13px] font-medium ${cls}`}>
      {label}
    </span>
  );
}
