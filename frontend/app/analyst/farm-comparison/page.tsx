// app/analyst/farm-comparison/page.tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import PageHeader from "@/components/analyst/PageHeader";
import StatCard from "@/components/ui/StatCard";
import DataTable, { Column } from "@/components/ui/DataTable";

interface FarmRow {
  farm_id: number;
  farm_name: string;
  owner_name: string;
  location: string;
  area_hectares: number;
  soil_ph: number;
  soil_type: string;
  prediction_count: number;
  average_yield: number;
  highest_yield: number;
  lowest_yield: number;
  average_confidence: number;
  productivity_score: number;
  crop_type: string;
  rank: number;
}

interface FarmComparisonResponse {
  total_farms: number;
  average_yield: number;
  best_farm: string;
  highest_risk_farm: string;
  farm_comparison: FarmRow[];
}

export default function FarmComparisonPage() {
  const [data, setData] = useState<FarmComparisonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError("");
      const result = await api.getAnalystFarmComparison();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load farm comparison");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRows =
    data?.farm_comparison.filter(
      (f) =>
        f.farm_name.toLowerCase().includes(search.toLowerCase()) ||
        f.owner_name.toLowerCase().includes(search.toLowerCase()) ||
        f.location.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const columns: Column<FarmRow>[] = [
    { key: "rank", header: "#", align: "center" },
    {
      key: "farm_name",
      header: "Farm",
      render: (r) => (
        <div>
          <div className="font-medium">{r.farm_name}</div>
          <div className="text-[12px] text-[var(--color-ink-soft)]">{r.location}</div>
        </div>
      ),
    },
    { key: "owner_name", header: "Owner" },
    { key: "crop_type", header: "Crops" },
    {
      key: "area_hectares",
      header: "Area (ha)",
      align: "right",
      render: (r) => r.area_hectares?.toFixed(1),
    },
    {
      key: "average_yield",
      header: "Avg Yield (t/ha)",
      align: "right",
      render: (r) => r.average_yield?.toFixed(2),
    },
    {
      key: "average_confidence",
      header: "Confidence",
      align: "right",
      render: (r) => `${r.average_confidence?.toFixed(0)}%`,
    },
    {
      key: "productivity_score",
      header: "Productivity",
      align: "right",
      render: (r) => (
        <span className="font-mono-num font-semibold text-[var(--color-primary)]">
          {r.productivity_score}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-[var(--color-ink-soft)] text-sm">
        Loading farm comparison…
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Farm Comparison"
        subtitle="Productivity and yield ranked across every farm on the platform."
        onRefresh={loadData}
        refreshing={refreshing}
      />

      {error && (
        <div className="bg-[var(--color-danger)]/8 border border-[var(--color-danger)]/25 text-[var(--color-danger)] text-sm rounded-[8px] px-4 py-2.5 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard label="Total Farms" value={data?.total_farms ?? 0} />
        <StatCard
          label="Average Yield"
          value={`${data?.average_yield ?? 0} t/ha`}
        />
        <StatCard label="Top Performer" value={data?.best_farm ?? "—"} accent />
        <StatCard
          label="Most Predictions"
          value={data?.highest_risk_farm ?? "—"}
          sublabel="highest activity"
        />
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius)] shadow-[var(--shadow-card)]">
        <div className="p-4 border-b border-[var(--color-border)]">
          <input
            type="text"
            placeholder="Search by farm, owner, or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs border border-[var(--color-border)] rounded-[8px] px-3.5 py-2 text-sm bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 focus:border-[var(--color-primary)]"
          />
        </div>
        <div className="p-4">
          <DataTable
            columns={columns}
            rows={filteredRows}
            getRowKey={(r) => r.farm_id}
            emptyLabel="No farms match your search."
          />
        </div>
      </div>
    </div>
  );
}
