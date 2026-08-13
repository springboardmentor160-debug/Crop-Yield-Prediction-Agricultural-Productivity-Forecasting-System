"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function AdminPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [dashboardData, usersData, farmsData, predsData, healthData] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminUsers(),
        api.getAdminFarms(),
        api.getAdminPredictions(),
        api.getAdminSystemHealth(),
      ]);
      setDashboard(dashboardData);
      setUsers(usersData);
      setFarms(farmsData);
      setPredictions(predsData);
      setSystemHealth(healthData);
    } catch (err) {
      console.error(err);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
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
          <span className="text-2xl">🛠️</span>
          <span className="text-xl font-bold">Admin Panel</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Live admin metrics and system health powered by the backend.</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border p-6 text-center text-gray-500">Loading admin data...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[
                { label: "Total users", value: dashboard?.total_users ?? 0 },
                { label: "Total farms", value: dashboard?.total_farms ?? 0 },
                { label: "Total predictions", value: dashboard?.total_predictions ?? 0 },
              ].map((metric) => (
                <div key={metric.label} className="bg-white rounded-3xl border p-6 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">{metric.label}</div>
                  <div className="text-4xl font-bold text-gray-900">{metric.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-3xl border p-6 shadow-sm xl:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
                {systemHealth ? (
                  <div className="space-y-3 text-sm text-gray-700">
                    <div>API: <span className="font-semibold">{systemHealth.api}</span></div>
                    <div>Database: <span className="font-semibold">{systemHealth.database}</span></div>
                    <div>Server: <span className="font-semibold">{systemHealth.server}</span></div>
                  </div>
                ) : (
                  <div className="text-gray-500">System health unavailable.</div>
                )}
              </div>

              <div className="bg-white rounded-3xl border p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">User Breakdown</h2>
                <div className="space-y-2 text-sm text-gray-700">
                  <div>Farmers: {dashboard?.farmer_count ?? 0}</div>
                  <div>Analysts: {dashboard?.analyst_count ?? 0}</div>
                  <div>Admins: {dashboard?.admin_count ?? 0}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Predictions</h2>
                <div className="space-y-3">
                  {predictions.length ? predictions.slice(0, 8).map((prediction, index) => (
                    <div key={index} className="rounded-2xl border p-3 bg-gray-50">
                      <div className="text-sm font-semibold text-gray-900">{prediction.crop_type}</div>
                      <div className="text-xs text-gray-500">Yield: {prediction.predicted_yield_tons_per_ha} t/ha</div>
                      <div className="text-xs text-gray-500">Risk: {prediction.risk_level}</div>
                    </div>
                  )) : (
                    <div className="text-sm text-gray-500">No predictions found.</div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl border p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Users</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-gray-600">
                    <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length ? users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3">{user.full_name}</td>
                          <td className="px-4 py-3">{user.email}</td>
                          <td className="px-4 py-3">{user.role}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-4 text-center text-gray-500">No users available.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
