// app/analyst/reports/page.tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import PageHeader from "@/components/analyst/PageHeader";
import StatCard from "@/components/ui/StatCard";
import DataTable, { Column } from "@/components/ui/DataTable";
import RiskBadge from "@/components/ui/RiskBadge";

interface ReportPrediction {
  id: number;
  farm_id: number;
  crop_type: string;
  predicted_yield: number;
  risk_level: string;
  date: string;
}

interface ReportResponse {
  report_type: string;
  generated_at: string;
  period_days: number;
  total_predictions: number;
  active_farms: number;
  average_yield: number;
  predictions: ReportPrediction[];
}

const PERIOD_OPTIONS = [7, 30, 90, 365];

export default function AnalystReportsPage() {
  const [data, setData] = useState<ReportResponse | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async (period: number) => {
    try {
      setRefreshing(true);
      setError("");
      setData(await api.getAnalystReports(period));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const columns: Column<ReportPrediction>[] = [
    { key: "date", header: "Date" },
    { key: "farm_id", header: "Farm ID", align: "center" },
    { key: "crop_type", header: "Crop" },
    {
      key: "predicted_yield",
      header: "Predicted Yield (t/ha)",
      align: "right",
      render: (r) => r.predicted_yield?.toFixed(2),
    },
    {
      key: "risk_level",
      header: "Risk",
      align: "center",
      render: (r) => <RiskBadge level={r.risk_level} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Platform Reports"
        subtitle={data?.report_type || "Aggregated platform activity report."}
        onRefresh={() => loadData(days)}
        refreshing={refreshing}
      />

      {error && (
        <div className="bg-[var(--color-danger)]/8 border border-[var(--color-danger)]/25 text-[var(--color-danger)] text-sm rounded-[8px] px-4 py-2.5 mb-6">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 mb-6">
        <span className="text-[13px] text-[var(--color-ink-soft)]">Period</span>
        {PERIOD_OPTIONS.map((n) => (
          <button
            key={n}
            onClick={() => setDays(n)}
            className={`px-3 py-1.5 rounded-[7px] text-[13px] font-medium transition-colors ${
              days === n
                ? "bg-[var(--color-primary-dark)] text-white"
                : "bg-[var(--color-bg-secondary)] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            }`}
          >
            {n === 365 ? "1yr" : `${n}d`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
        <StatCard label="Total Predictions" value={data?.total_predictions ?? 0} />
        <StatCard label="Active Farms" value={data?.active_farms ?? 0} />
        <StatCard label="Average Yield" value={`${data?.average_yield ?? 0} t/ha`} accent />
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius)] shadow-[var(--shadow-card)] p-4">
        {loading ? (
          <div className="text-center py-14 text-[var(--color-ink-soft)] text-sm">
            Loading report…
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={data?.predictions || []}
            getRowKey={(r) => r.id}
            emptyLabel="No predictions in this period."
          />
        )}
      </div>

      {data && (
        <div className="text-[12px] text-[var(--color-ink-soft)] mt-4 text-right">
          Generated {new Date(data.generated_at).toLocaleString()}
        </div>
      )}
    </div>
  );
}
