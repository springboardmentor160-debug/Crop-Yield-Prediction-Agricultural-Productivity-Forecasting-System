// app/analyst/crop-performance/page.tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import PageHeader from "@/components/analyst/PageHeader";
import StatCard from "@/components/ui/StatCard";
import DataTable, { Column } from "@/components/ui/DataTable";
import RiskBadge from "@/components/ui/RiskBadge";

interface CropRow {
  crop_name: string;
  prediction_count: number;
  average_yield: number;
  risk_level: string;
}

interface CropPerformanceResponse {
  total_crops: number;
  average_yield: number;
  best_crop: string;
  highest_risk_crop: string;
  crop_performance: CropRow[];
}

export default function CropPerformancePage() {
  const [data, setData] = useState<CropPerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError("");
      setData(await api.getAnalystCropPerformance());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load crop performance");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns: Column<CropRow>[] = [
    { key: "crop_name", header: "Crop" },
    { key: "prediction_count", header: "Predictions", align: "right" },
    {
      key: "average_yield",
      header: "Avg Yield (t/ha)",
      align: "right",
      render: (r) => r.average_yield?.toFixed(2),
    },
    {
      key: "risk_level",
      header: "Risk",
      align: "center",
      render: (r) => <RiskBadge level={r.risk_level} />,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-[var(--color-ink-soft)] text-sm">
        Loading crop performance…
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Crop Performance"
        subtitle="Yield and risk profile broken down by crop type."
        onRefresh={loadData}
        refreshing={refreshing}
      />

      {error && (
        <div className="bg-[var(--color-danger)]/8 border border-[var(--color-danger)]/25 text-[var(--color-danger)] text-sm rounded-[8px] px-4 py-2.5 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
        <StatCard label="Crop Types Tracked" value={data?.total_crops ?? 0} />
        <StatCard label="Average Yield" value={`${data?.average_yield ?? 0} t/ha`} accent />
        <StatCard label="Best Performing Crop" value={data?.best_crop ?? "—"} tone="success" />
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius)] shadow-[var(--shadow-card)] p-4">
        <DataTable columns={columns} rows={data?.crop_performance || []} getRowKey={(r) => r.crop_name} />
      </div>
    </div>
  );
}
