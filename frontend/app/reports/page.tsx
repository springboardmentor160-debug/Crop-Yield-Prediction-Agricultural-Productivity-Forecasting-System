"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { FileText, FileSpreadsheet, Loader2, Download } from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"pdf" | "csv" | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await api.getPredictionReport();
      setReport(data);
    } catch (err) {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setError("");
    setExporting("csv");
    try {
      const response = await api.exportCsv("predictions");
      // Create blob and download
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = response.filename || `yieldsense_report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not export CSV.");
    } finally {
      setExporting(null);
    }
  };

  const handleExportPdf = async () => {
    setError("");
    setExporting("pdf");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api/v1"}/reports/export/pdf?report_type=predictions`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `yieldsense_report_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate PDF.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-500">View yield, farm, and soil reports generated from your data.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              disabled={!report || exporting !== null}
              className="flex items-center gap-2 border border-green-700 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {exporting === "csv" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              Download CSV
            </button>
            <button
              onClick={handleExportPdf}
              disabled={!report || exporting !== null}
              className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {exporting === "pdf" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              Download PDF
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl shadow-sm border p-8 text-center text-gray-500">Loading report...</div>
        ) : report ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{report.report_type}</h2>
                  <p className="text-sm text-gray-500">Generated at {new Date(report.generated_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-3xl border p-4 bg-slate-50">
                  <div className="text-sm text-gray-500">Total Predictions</div>
                  <div className="mt-2 text-2xl font-semibold text-gray-900">{report.summary.total_predictions}</div>
                </div>
                <div className="rounded-3xl border p-4 bg-slate-50">
                  <div className="text-sm text-gray-500">Average Yield</div>
                  <div className="mt-2 text-2xl font-semibold text-gray-900">{report.summary.average_yield} t/ha</div>
                </div>
                <div className="rounded-3xl border p-4 bg-slate-50">
                  <div className="text-sm text-gray-500">High Risk Count</div>
                  <div className="mt-2 text-2xl font-semibold text-gray-900">{report.summary.high_risk_count}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Predictions</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-gray-600">
                  <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Crop</th>
                      <th className="px-4 py-3">Yield</th>
                      <th className="px-4 py-3">Confidence</th>
                      <th className="px-4 py-3">Risk</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.predictions.map((item: any) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-4">{item.crop_type}</td>
                        <td className="px-4 py-4">{item.predicted_yield} t/ha</td>
                        <td className="px-4 py-4">{item.confidence}%</td>
                        <td className="px-4 py-4">{item.risk_level}</td>
                        <td className="px-4 py-4">{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border p-8 text-center text-gray-500">No report data available.</div>
        )}
        {error && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
      </div>
    </div>
  );
}
