"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface AlertItem {
  id: number;
  title: string;
  message: string;
  priority: string;
  time: string;
  icon?: string;
}

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data?.alerts ?? data ?? []);
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-700 text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
          >
            ← Dashboard
          </button>
          <span className="text-2xl">⚠️</span>
          <span className="text-xl font-bold">Alerts</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Farm Alerts</h1>
          <p className="text-gray-500 text-sm">Stay aware of risk signals and actionable advisories.</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border p-6 text-center text-gray-500">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-6 text-center text-gray-500">No alerts at the moment.</div>
        ) : (
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={`rounded-3xl border p-5 bg-white shadow-sm`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{alert.icon}</div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{alert.title}</h2>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${alert.priority === 'high' ? 'text-red-600' : alert.priority === 'medium' ? 'text-amber-600' : 'text-green-600'}`}>{alert.priority}</span>
                </div>
                <p className="text-sm text-gray-600">{alert.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
