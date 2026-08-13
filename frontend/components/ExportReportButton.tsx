"use client";

import { useState } from "react";
import { Loader2, FileText, FileSpreadsheet } from "lucide-react";

interface FarmAnalyticsResponse {
  crop: string;
  overall_risk_level: string;
  identified_risks: Array<{
    type: string;
    severity: string;
    advice: string;
  }>;
  actionable_recommendations: string[];
  best_practice_tips: string[];
}

interface ExportReportButtonProps {
  targetElementId: string;
  data: FarmAnalyticsResponse | null;
}

export default function ExportReportButton({
  targetElementId,
  data,
}: ExportReportButtonProps) {
  const [exporting, setExporting] = useState<"pdf" | "csv" | null>(null);
  const [error, setError] = useState<string>("");

  const buildCsvContent = (report: FarmAnalyticsResponse) => {
    const rows = Object.entries(report).map(([key, value]) => [
      key,
      typeof value === "object" ? JSON.stringify(value) : String(value),
    ]);

    const csvLines = [["Field", "Value"], ...rows].map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    );

    return csvLines.join("\n");
  };

  const downloadCsvFile = (report: FarmAnalyticsResponse) => {
    const filename = `farm-report-${report.crop}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    const csvContent = buildCsvContent(report);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    if (!data) {
      setError("Generate recommendations first to export a PDF.");
      return;
    }

    setError("");
    setExporting("pdf");

    try {
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = (html2pdfModule as any).default ?? html2pdfModule;
      const element = document.getElementById(targetElementId);

      if (!element) {
        throw new Error(
          "Nothing to export yet — generate recommendations first."
        );
      }

      await html2pdf()
        .set({
          margin: 10,
          filename: `farm-report-${data.crop}-${new Date()
            .toISOString()
            .slice(0, 10)}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate PDF.");
    } finally {
      setExporting(null);
    }
  };

  const handleDownloadCsv = async () => {
    if (!data) {
      setError("Generate recommendations first to export a CSV.");
      return;
    }

    setError("");
    setExporting("csv");

    try {
      downloadCsvFile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not export CSV.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownloadPdf}
          disabled={!data || exporting !== null}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {exporting === "pdf" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          Download PDF Report
        </button>

        <button
          onClick={handleDownloadCsv}
          disabled={!data || exporting !== null}
          className="flex items-center gap-2 border border-green-700 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {exporting === "csv" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-4 h-4" />
          )}
          Download CSV Log
        </button>
      </div>

      {!data && (
        <p className="text-xs text-gray-400">
          Generate recommendations first to enable downloads.
        </p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}