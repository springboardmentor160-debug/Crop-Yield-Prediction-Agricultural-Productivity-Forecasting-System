/**
 * YieldSense AI  -  Reports Page (Milestone 3)
 *
 * Full reports UI: generate, list, download PDF/CSV, delete.
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  FileText, Download, Trash2, Plus, RefreshCw,
  FileDown, AlertCircle, CheckCircle, Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { reportService, historyService } from "@/services/m3services";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { getRelativeTime } from "@/utils/formatters";
import { useAuth } from "@/contexts/AuthContext";
import type { ReportSummary } from "@/types/m3types";
import type { PredictionHistoryItem } from "@/types/m3types";


// ============================================================
// Generate Report Modal
// ============================================================

interface GenerateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function GenerateReportModal({ onClose, onSuccess }: GenerateModalProps) {
  const [predictions, setPredictions] = useState<PredictionHistoryItem[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState("");
  const [reportType, setReportType] = useState("prediction");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await historyService.getHistory(1, 50);
        setPredictions(data.predictions);
        if (data.predictions.length > 0) {
          setSelectedPrediction(data.predictions[0].id);
        }
      } catch {
        toast.error("Failed to load predictions.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleGenerate = async () => {
    if (!selectedPrediction) {
      toast.error("Please select a prediction.");
      return;
    }
    setGenerating(true);
    try {
      await reportService.generateReport({
        prediction_id: selectedPrediction,
        report_type: reportType,
        title: title || undefined,
      });
      toast.success("Report generated successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to generate report.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generate Report</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-6">
              <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">No predictions available.</p>
              <p className="text-xs text-gray-400 mt-1">Make a prediction first, then generate a report.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Select Prediction
                </label>
                <select
                  value={selectedPrediction}
                  onChange={(e) => setSelectedPrediction(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {predictions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.crop} · {p.season} · {p.predicted_yield.toFixed(2)} t/ha · {p.created_at.slice(0, 10)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="prediction">Prediction Report</option>
                  <option value="farm">Farm Report</option>
                  <option value="seasonal">Seasonal Report</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Custom Title <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Rice Kharif Season 2025 Report"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleGenerate}
            disabled={generating || loading || predictions.length === 0}
          >
            {generating ? "Generating..." : "Generate Report"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Report Card
// ============================================================

const STATUS_STYLES = {
  generated: { badge: "success" as const, icon: <CheckCircle className="h-3.5 w-3.5" /> },
  generating: { badge: "warning" as const, icon: <Clock className="h-3.5 w-3.5" /> },
  failed: { badge: "danger" as const, icon: <AlertCircle className="h-3.5 w-3.5" /> },
};

interface ReportCardProps {
  report: ReportSummary;
  onDelete: (id: string) => void;
}

function ReportCard({ report, onDelete }: ReportCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const statusStyle = STATUS_STYLES[report.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.generated;

  const handlePdfDownload = async () => {
    setDownloading(true);
    try {
      await reportService.downloadPdf(report.id, `${report.title}.pdf`);
      toast.success("PDF downloaded!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to download PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const handleCsvDownload = async () => {
    setDownloadingCsv(true);
    try {
      await reportService.downloadReportCsv(report.id);
      toast.success("CSV downloaded!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to download CSV.");
    } finally {
      setDownloadingCsv(false);
    }
  };


  const handleDelete = async () => {
    if (!confirm(`Delete "${report.title}"?`)) return;
    setDeleting(true);
    try {
      await reportService.deleteReport(report.id);
      onDelete(report.id);
      toast.success("Report deleted.");
    } catch {
      toast.error("Failed to delete report.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card padding="md" className="hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shrink-0">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {report.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <Badge variant={statusStyle.badge} size="sm">
                  <span className="flex items-center gap-1">
                    {statusStyle.icon} {report.status}
                  </span>
                </Badge>
                <span className="text-xs text-gray-400 capitalize">{report.report_type} report</span>
                {report.crop && (
                  <span className="text-xs text-gray-400">{report.crop}</span>
                )}
                {report.farm_name && (
                  <span className="text-xs text-gray-400">· {report.farm_name}</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">{getRelativeTime(report.created_at)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              size="sm"
              onClick={handlePdfDownload}
              disabled={downloading || report.status !== "generated"}
            >
              <Download className="h-3.5 w-3.5" />
              {downloading ? "Downloading..." : "PDF"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCsvDownload}
              disabled={downloadingCsv || report.status !== "generated"}
            >
              <FileDown className="h-3.5 w-3.5" />
              {downloadingCsv ? "..." : "CSV"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? "..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// Main Reports Page
// ============================================================

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [downloadingHistory, setDownloadingHistory] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await reportService.getReports();
      setReports(data.reports);
    } catch {
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [user?.uid]);


  const handleDelete = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDownloadHistoryCsv = async () => {
    setDownloadingHistory(true);
    try {
      await reportService.downloadHistoryCsv();
      toast.success("History CSV downloaded!");
    } catch {
      toast.error("Download failed.");
    } finally {
      setDownloadingHistory(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading reports..." />;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {reports.length} report{reports.length !== 1 ? "s" : ""} generated · PDF and CSV export supported
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadHistoryCsv}
            disabled={downloadingHistory}
          >
            <FileDown className="h-4 w-4" />
            {downloadingHistory ? "Downloading..." : "Export History CSV"}
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" /> Generate Report
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              How to generate a report
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
              1. Make a prediction on the Prediction page  -  it saves automatically to history.
              2. Click "Generate Report" and select the prediction.
              3. Download the report as PDF or CSV.
            </p>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8 text-gray-400" />}
          title="No reports yet"
          description="Generate your first report by clicking 'Generate Report' above. Reports include prediction summary, risk assessment, and actionable recommendations."
          actionLabel="Generate First Report"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Generate Modal */}
      {showModal && (
        <GenerateReportModal
          onClose={() => setShowModal(false)}
          onSuccess={loadReports}
        />
      )}
    </div>
  );
}
