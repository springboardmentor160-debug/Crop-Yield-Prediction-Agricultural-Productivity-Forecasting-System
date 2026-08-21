/**
 * YieldSense AI  -  Prediction History Page (Milestone 3)
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  History, Trash2, ChevronDown, ChevronUp, Download,
  AlertTriangle, CheckCircle, TrendingUp, Calendar, MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import { historyService, reportService } from "@/services/m3services";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { getRelativeTime, formatArea } from "@/utils/formatters";
import { useAuth } from "@/contexts/AuthContext";
import type { PredictionHistoryItem } from "@/types/m3types";


const RISK_BADGE: Record<string, "success" | "warning" | "danger" | "default"> = {
  Low: "success",
  Medium: "warning",
  High: "danger",
  Critical: "danger",
};

const CONFIDENCE_BADGE: Record<string, "success" | "warning" | "info" | "default"> = {
  High: "success",
  Medium: "warning",
  Low: "info",
};

function HistoryRow({ record, onDelete }: { record: PredictionHistoryItem; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this prediction record?")) return;
    setDeleting(true);
    try {
      await historyService.deletePrediction(record.id);
      onDelete(record.id);
      toast.success("Prediction record deleted.");
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const report = await reportService.generateReport({
        prediction_id: record.id,
        farm_id: record.farm_id || undefined,
        report_type: "prediction",
      });
      toast.success("Report generated! Download it from the Reports page.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate report.");
    } finally {
      setGeneratingReport(false);
    }
  };

  return (

    <Card padding="sm" className="overflow-hidden">
      {/* Summary Row */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {record.crop.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{record.crop}</p>
            <Badge variant="default" size="sm">{record.season}</Badge>
            <Badge variant={CONFIDENCE_BADGE[record.confidence] || "default"} size="sm">
              {record.confidence}
            </Badge>
            {record.risk_level && (
              <Badge variant={RISK_BADGE[record.risk_level] || "default"} size="sm">
                {record.risk_level} Risk
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {record.predicted_yield.toFixed(3)} t/ha
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {formatArea(record.area)}
            </span>
            {record.farm_name && <span>{record.farm_name}</span>}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {getRelativeTime(record.created_at)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {record.total_production.toFixed(1)} t
            </p>
            <p className="text-xs text-gray-400">total production</p>
          </div>
          <span className="text-gray-400">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
            {[
              { label: "Temperature", value: `${record.temperature}°C` },
              { label: "Rainfall", value: `${record.annual_rainfall} mm` },
              { label: "Soil pH", value: record.soil_ph },
              { label: "Nitrogen", value: `${record.nitrogen} kg/ha` },
              { label: "Phosphorus", value: `${record.phosphorus} kg/ha` },
              { label: "Potassium", value: `${record.potassium} kg/ha` },
              { label: "Fertilizer", value: `${record.fertilizer_usage} kg/ha` },
              { label: "State", value: record.state },
              { label: "Model", value: record.model_used },
              { label: "Accuracy", value: record.model_accuracy ? `${(record.model_accuracy * 100).toFixed(1)}%` : " - " },
              { label: "Risk Score", value: record.risk_score ? `${record.risk_score.toFixed(1)}/100` : " - " },
              { label: "Date", value: record.created_at.slice(0, 10) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-medium text-gray-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateReport}
              disabled={generatingReport}
            >
              <Download className="h-3.5 w-3.5" />
              {generatingReport ? "Generating..." : "Generate Report"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<PredictionHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const limit = 20;

  const loadHistory = async (p: number = 1) => {
    setLoading(true);
    try {
      const data = await historyService.getHistory(p, limit);
      setRecords(data.predictions);
      setTotal(data.total);
      setTotalPages(data.total_pages);
      setPage(p);
    } catch {
      toast.error("Failed to load prediction history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user?.uid]);

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setTotal((prev) => prev - 1);
  };

  const handleDownloadCsv = async () => {
    setDownloading(true);
    try {
      const { reportService: rs } = await import("@/services/m3services");
      await rs.downloadHistoryCsv();
      toast.success("CSV downloaded!");
    } catch (err: any) {
      toast.error(err?.message || "Download failed.");
    } finally {
      setDownloading(false);
    }
  };


  if (loading) return <LoadingSpinner text="Loading history..." />;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="h-6 w-6 text-green-600" />
            Prediction History
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {total} prediction{total !== 1 ? "s" : ""} saved · all auto-saved after predictions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadCsv}
          disabled={downloading || records.length === 0}
        >
          <Download className="h-4 w-4" />
          {downloading ? "Downloading..." : "Export CSV"}
        </Button>
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={<History className="h-8 w-8 text-gray-400" />}
          title="No predictions yet"
          description="Your prediction history will appear here automatically after you run predictions."
        />
      ) : (
        <>
          <div className="space-y-3">
            {records.map((record) => (
              <HistoryRow key={record.id} record={record} onDelete={handleDelete} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={loadHistory}
            />
          )}
        </>
      )}
    </div>
  );
}
