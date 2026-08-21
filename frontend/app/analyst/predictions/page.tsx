// app/analyst/predictions/page.tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import PageHeader from "@/components/analyst/PageHeader";
import DataTable, { Column } from "@/components/ui/DataTable";
import RiskBadge from "@/components/ui/RiskBadge";

interface PredictionRow {
  id: number;
  farm_id: number;
  crop_type: string;
  yield: number;
  confidence: number;
  risk: string;
  temperature: number;
  rainfall: number;
  humidity: number;
  created_at: string;
}

const LIMIT_OPTIONS = [10, 25, 50, 100];

export default function AnalystPredictionsPage() {
  const [rows, setRows] = useState<PredictionRow[]>([]);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async (n: number) => {
    try {
      setRefreshing(true);
      setError("");
      setRows(await api.getAnalystRecentPredictions(n));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recent predictions");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  const columns: Column<PredictionRow>[] = [
    {
      key: "created_at",
      header: "Date",
      render: (r) => new Date(r.created_at).toLocaleString(),
    },
    { key: "farm_id", header: "Farm ID", align: "center" },
    { key: "crop_type", header: "Crop" },
    { key: "yield", header: "Yield (t/ha)", align: "right", render: (r) => r.yield?.toFixed(2) },
    {
      key: "confidence",
      header: "Confidence",
      align: "right",
      render: (r) => `${r.confidence?.toFixed(0)}%`,
    },
    {
      key: "temperature",
      header: "Weather",
      render: (r) => `${r.temperature}°C · ${r.rainfall}mm · ${r.humidity}%`,
    },
    {
      key: "risk",
      header: "Risk",
      align: "center",
      render: (r) => <RiskBadge level={r.risk} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Recent Predictions"
        subtitle="The latest yield predictions submitted across the platform."
        onRefresh={() => loadData(limit)}
        refreshing={refreshing}
      />

      {error && (
        <div className="bg-[var(--color-danger)]/8 border border-[var(--color-danger)]/25 text-[var(--color-danger)] text-sm rounded-[8px] px-4 py-2.5 mb-6">
          {error}
        </div>
      )}

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius)] shadow-[var(--shadow-card)]">
        <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-2">
          <span className="text-[13px] text-[var(--color-ink-soft)]">Show</span>
          {LIMIT_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setLimit(n)}
              className={`px-3 py-1.5 rounded-[7px] text-[13px] font-medium transition-colors ${
                limit === n
                  ? "bg-[var(--color-primary-dark)] text-white"
                  : "bg-[var(--color-bg-secondary)] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-14 text-[var(--color-ink-soft)] text-sm">
              Loading predictions…
            </div>
          ) : (
            <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} />
          )}
        </div>
      </div>
    </div>
  );
}
