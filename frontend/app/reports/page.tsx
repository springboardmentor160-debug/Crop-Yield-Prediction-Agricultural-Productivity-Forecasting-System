"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ReportsPage() {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-500">View yield, farm, and soil reports generated from your data.</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            Back to Dashboard
          </button>
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
      </div>
    </div>
  );
}
