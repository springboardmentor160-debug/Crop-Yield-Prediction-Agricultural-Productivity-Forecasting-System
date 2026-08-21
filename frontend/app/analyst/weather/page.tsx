// app/analyst/weather/page.tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import PageHeader from "@/components/analyst/PageHeader";
import StatCard from "@/components/ui/StatCard";

interface WeatherImpactResponse {
  average_temperature: number;
  average_rainfall: number;
  average_humidity: number;
  average_yield: number;
}

export default function AnalystWeatherPage() {
  const [data, setData] = useState<WeatherImpactResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError("");
      setData(await api.getAnalystWeatherImpact());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load weather impact");
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
        Loading weather impact…
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Weather Impact"
        subtitle="Average conditions recorded across every prediction on the platform."
        onRefresh={loadData}
        refreshing={refreshing}
      />

      {error && (
        <div className="bg-[var(--color-danger)]/8 border border-[var(--color-danger)]/25 text-[var(--color-danger)] text-sm rounded-[8px] px-4 py-2.5 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Avg Temperature"
          value={`${data?.average_temperature ?? 0}°C`}
        />
        <StatCard
          label="Avg Rainfall"
          value={`${data?.average_rainfall ?? 0} mm`}
        />
        <StatCard
          label="Avg Humidity"
          value={`${data?.average_humidity ?? 0}%`}
        />
        <StatCard
          label="Avg Yield Under These Conditions"
          value={`${data?.average_yield ?? 0} t/ha`}
          accent
        />
      </div>
    </div>
  );
}
