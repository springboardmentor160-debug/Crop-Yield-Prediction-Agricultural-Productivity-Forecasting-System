/**
 * YieldSense AI  -  Farm Advisory Panel (Week 6)
 *
 * Displays rule-based recommendations & risk assessment for a specific farm.
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldAlert, Lightbulb, AlertTriangle, CheckCircle2,
  TrendingDown, TrendingUp, RefreshCw, Layers, Droplets, Info
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { farmAdvisoryService } from "@/services/farmAdvisoryService";
import type { FarmAdvisoryResponse } from "@/types/farmAdvisory";

interface Props {
  farmId: string;
}

export default function FarmAdvisoryPanel({ farmId }: Props) {
  const [advisory, setAdvisory] = useState<FarmAdvisoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvisory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await farmAdvisoryService.getFarmAdvisory(farmId);
      setAdvisory(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to load farm advisory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisory();
  }, [farmId]);

  if (loading) {
    return <LoadingSpinner text="Analyzing farm data, rainfall, and soil parameters..." />;
  }

  if (error) {
    return (
      <Card padding="md" className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Unable to generate farm advisory</p>
              <p className="text-xs text-red-600 dark:text-red-500">{error}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAdvisory}>
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!advisory) return null;

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
      case "Medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
    }
  };

  const getRiskBarColor = (level: string) => {
    switch (level) {
      case "High": return "bg-red-500";
      case "Medium": return "bg-amber-500";
      default: return "bg-[#1a6b3c]";
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Assessment Card */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
        <div className={`h-1.5 w-full ${getRiskBarColor(advisory.risk_level)}`} />
        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className={`h-5 w-5 ${advisory.risk_level === "High" ? "text-red-600" : advisory.risk_level === "Medium" ? "text-amber-600" : "text-[#1a6b3c]"}`} />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-base">Agricultural Risk Assessment</h3>
                <p className="text-xs text-gray-500">
                  {advisory.crop} · Score {advisory.risk_score} · {advisory.detected_risk_count} risk factor{advisory.detected_risk_count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-md text-xs font-semibold border ${getRiskBadgeColor(advisory.risk_level)}`}>
                {advisory.risk_level} Risk
              </span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">
                {advisory.priority_level}
              </span>
            </div>
          </div>

          {/* Priority Reason */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-3 text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
            <Info className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gray-900 dark:text-white">Priority Guidance: </span>
              {advisory.priority_reason}
            </div>
          </div>

          {/* Detailed Identified Risks */}
          {advisory.identified_risks.length > 0 ? (
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Identified Warning Signals</h4>
              <div className="space-y-2.5">
                {advisory.identified_risks.map((risk, i) => (
                  <div key={i} className="p-3.5 rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <AlertTriangle className={`h-3.5 w-3.5 ${risk.severity === "High" ? "text-red-500" : "text-amber-500"}`} />
                        {risk.type}
                      </span>
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${risk.severity === "High" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {risk.severity} Severity
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{risk.reason}</p>
                    <p className="text-xs font-medium text-[#1a6b3c] dark:text-green-400 pt-0.5">
                      <strong>Action:</strong> {risk.advice}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>No critical agricultural risk factors detected for this farm.</span>
            </div>
          )}
        </div>
      </div>

      {/* Actionable Recommendations Card */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
        <div className="h-1.5 w-full bg-[#1a6b3c]" />
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-800">
            <Lightbulb className="h-5 w-5 text-[#1a6b3c]" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">Actionable Recommendations</h3>
              <p className="text-xs text-gray-500">Deterministic agronomic rules based on farm soil, yield trends, and rainfall</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {advisory.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                <span className="font-bold text-[#1a6b3c] dark:text-green-400 shrink-0 mt-0.5">{i + 1}.</span>
                <span className="flex-1">{rec}</span>
              </div>
            ))}
          </div>

          {/* Metrics & Context strip */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2 rounded bg-gray-50 dark:bg-gray-800/40">
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Soil pH</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{advisory.metrics_used.soil_ph ?? "N/A"}</p>
            </div>
            <div className="p-2 rounded bg-gray-50 dark:bg-gray-800/40">
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Predicted Yield</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {advisory.metrics_used.predicted_yield ? `${advisory.metrics_used.predicted_yield} t/ha` : "N/A"}
              </p>
            </div>
            <div className="p-2 rounded bg-gray-50 dark:bg-gray-800/40">
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Avg Yield</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {advisory.metrics_used.avg_yield ? `${advisory.metrics_used.avg_yield} t/ha` : "N/A"}
              </p>
            </div>
            <div className="p-2 rounded bg-gray-50 dark:bg-gray-800/40">
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Rainfall Dev</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {advisory.metrics_used.rainfall_deviation !== null && advisory.metrics_used.rainfall_deviation !== undefined
                  ? `${advisory.metrics_used.rainfall_deviation > 0 ? "+" : ""}${advisory.metrics_used.rainfall_deviation} mm`
                  : "N/A"}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-500 pt-1 leading-normal">
            {advisory.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
