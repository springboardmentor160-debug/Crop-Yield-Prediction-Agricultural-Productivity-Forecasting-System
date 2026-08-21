"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User, AdminDashboardResponse, ModelPerformanceResponse, SystemStatsResponse } from "@/lib/types";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<AdminDashboardResponse["system_health"] | null>(null);
  const [modelMetrics, setModelMetrics] = useState<ModelPerformanceResponse | null>(null);
  const [stats, setStats] = useState<SystemStatsResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    const userData = localStorage.getItem("user");
    if (userData) {
      const u = JSON.parse(userData);
      if (u.role !== "Admin") { router.push("/"); return; }
      setUser(u);
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [health, metrics, systemStats] = await Promise.all([
        api.health(),
        api.getModelMetrics(),
        api.getSystemStats(),
      ]);
      setSystemHealth(health);
      setModelMetrics(metrics);
      setStats(systemStats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚙️</div>
        <div style={{ color: "#6366f1", letterSpacing: "0.15em", fontSize: "13px" }}>LOADING ADMIN PANEL...</div>
      </div>
    </div>
  );

  const navItems = ["overview", "users", "farms", "predictions", "system", "reports"];

  const systemStats = [
    { icon: "👥", label: "Total Users", value: stats?.total_users ?? "—", sub: "registered", color: "#6366f1" },
    { icon: "🏡", label: "Total Farms", value: stats?.total_farms ?? "—", sub: "across all users", color: "#22c55e" },
    { icon: "📊", label: "Predictions", value: stats?.total_predictions ?? "—", sub: "all time", color: "#f59e0b" },
    { icon: "⚠️", label: "Active Alerts", value: "0", sub: "system wide", color: "#ef4444" },
  ];

  const recentActivity = [
    { type: "user", message: "New farmer registered", time: "Just now", icon: "👤" },
    { type: "prediction", message: "Yield prediction generated", time: "2 min ago", icon: "📊" },
    { type: "farm", message: "New farm added", time: "5 min ago", icon: "🏡" },
    { type: "alert", message: "Weather alert triggered", time: "10 min ago", icon: "⚠️" },
    { type: "model", message: "ML model inference completed", time: "15 min ago", icon: "🤖" },
  ];

  const adminActions = [
    { icon: "👥", label: "Manage Users", desc: "View, edit, delete user accounts", color: "#6366f1", href: "/admin/users" },
    { icon: "🏡", label: "View All Farms", desc: "Browse farms across all users", color: "#22c55e", href: "/admin/farms" },
    { icon: "📊", label: "System Reports", desc: "Generate platform-wide reports", color: "#f59e0b", href: "/admin/reports" },
    { icon: "🔔", label: "Send Notifications", desc: "Broadcast alerts to users", color: "#ef4444", href: "/admin/notifications"},
    { icon: "🤖", label: "ML Model Control", desc: "Retrain or update prediction model", color: "#a855f7", href: "/admin/models" },
    { icon: "⚙️", label: "System Settings", desc: "Configure platform parameters", color: "#3b82f6", href: "/admin/settings" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a14", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#ffffff" }}>

      {/* Navbar */}
      <nav style={{ backgroundColor: "#0d0d1a", borderBottom: "1px solid #1a1a2e", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>⚙️</div>
            <span style={{ color: "#6366f1", fontWeight: 700, fontSize: "15px", letterSpacing: "0.05em" }}>YIELDSENSE ADMIN</span>
          </div>
          <div style={{ width: "1px", height: "20px", backgroundColor: "#1a1a2e" }} />
          {navItems.map(item => (
            <button key={item} onClick={() => setActiveTab(item)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase",
              color: activeTab === item ? "#6366f1" : "#4a4a7a",
              fontWeight: activeTab === item ? 700 : 400,
              borderBottom: activeTab === item ? "2px solid #6366f1" : "2px solid transparent",
              padding: "4px 0",
            }}>{item}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ backgroundColor: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "100px", padding: "4px 12px", fontSize: "12px", color: "#6366f1" }}>
            ⚙️ ADMIN
          </div>
          <span style={{ color: "#6b6b9e", fontSize: "13px" }}>{user?.full_name}</span>
          <button onClick={() => { localStorage.clear(); router.push("/"); }} style={{ backgroundColor: "transparent", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "6px 14px", color: "#6b6b9e", cursor: "pointer", fontSize: "12px" }}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>

        {/* Banner */}
        <div style={{ background: "linear-gradient(135deg, #1a1a3d, #0d0d2e)", borderRadius: "16px", padding: "32px 40px", marginBottom: "28px", border: "1px solid #2a2a4a", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: "40px", top: "50%", transform: "translateY(-50%)", fontSize: "100px", opacity: 0.06 }}>⚙️</div>
          <div style={{ fontSize: "11px", color: "#6366f1", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>Admin Control Panel</div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "6px" }}>System Overview — YieldSense AI</h1>
          <p style={{ color: "#6b6b9e", fontSize: "14px" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          {systemHealth && (
            <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
              <span style={{ fontSize: "12px", color: "#22c55e", backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "100px", padding: "4px 12px" }}>
                ● {systemHealth.status?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* System Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
          {systemStats.map(s => (
            <div key={s.label} style={{ backgroundColor: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>{s.icon}</div>
              <div style={{ fontSize: "30px", fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "#4a4a7a", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
              <div style={{ fontSize: "11px", color: "#2a2a3a", marginTop: "2px" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Users by Role */}
        {stats && (
          <div style={{ backgroundColor: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: "16px", padding: "24px", marginBottom: "28px" }}>
            <div style={{ fontSize: "11px", color: "#4a4a7a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Users by Role</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {[
                { label: "Farmer", value: stats.total_users, color: "#22c55e" },
                { label: "Analyst", value: 0, color: "#3b82f6" },
                { label: "Admin", value: 0, color: "#ef4444" },
              ].map(r => (
                <div key={r.label} style={{ backgroundColor: "#0a0a14", borderRadius: "10px", padding: "16px", border: "1px solid #1a1a2e", textAlign: "center" }}>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: r.color, marginBottom: "4px" }}>{r.value}</div>
                  <div style={{ fontSize: "11px", color: "#4a4a7a", textTransform: "uppercase", letterSpacing: "0.06em" }}>{r.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ML Model Status */}
        {modelMetrics && (
          <div style={{ backgroundColor: "#0d0d1a", border: "1px solid #2a2a4a", borderRadius: "16px", padding: "24px", marginBottom: "28px" }}>
            <div style={{ fontSize: "11px", color: "#4a4a7a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>ML Model Status</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
              {[
                { label: "Accuracy (R2)", value: `${modelMetrics.accuracy_percent}%`, color: "#22c55e" },
                { label: "MAE", value: `${modelMetrics.mae} t/ha`, color: "#f59e0b" },
                { label: "RMSE", value: `${modelMetrics.rmse} t/ha`, color: "#f59e0b" },
                { label: "Training Samples", value: modelMetrics.training_samples?.toLocaleString(), color: "#6366f1" },
              ].map(m => (
                <div key={m.label} style={{ backgroundColor: "#0a0a14", borderRadius: "10px", padding: "16px", border: "1px solid #1a1a2e" }}>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: m.color, marginBottom: "4px" }}>{m.value}</div>
                  <div style={{ fontSize: "11px", color: "#4a4a7a", textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <div style={{ fontSize: "12px", color: "#4a4a7a" }}>Crops trained on:</div>
              {modelMetrics.crops?.map((crop: string) => (
                <span key={crop} style={{ fontSize: "11px", color: "#6366f1", backgroundColor: "rgba(99,102,241,0.1)", borderRadius: "100px", padding: "2px 10px" }}>{crop}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>

          {/* Admin Actions */}
          <div style={{ backgroundColor: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: "16px", padding: "24px" }}>
            <div style={{ fontSize: "11px", color: "#4a4a7a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Admin Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {adminActions.map(a => (
                <div key={a.label}
                  onClick={() => a.href ? router.push(a.href) : alert(`${a.label} isn't built yet`)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = a.color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a2e"}
                  style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", backgroundColor: "#0a0a14", borderRadius: "10px", border: "1px solid #1a1a2e", cursor: "pointer", transition: "border-color 0.2s" }}>
                  <div style={{ width: "36px", height: "36px", backgroundColor: `${a.color}15`, border: `1px solid ${a.color}30`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{a.icon}</div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>{a.label}</div>
                    <div style={{ fontSize: "11px", color: "#4a4a7a" }}>{a.desc}</div>
                  </div>
                  <div style={{ marginLeft: "auto", color: a.color, fontSize: "14px" }}>→</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Recent Activity */}
            <div style={{ backgroundColor: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: "16px", padding: "24px" }}>
              <div style={{ fontSize: "11px", color: "#4a4a7a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Recent Activity</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {recentActivity.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", backgroundColor: "#0a0a14", borderRadius: "8px", border: "1px solid #1a1a2e" }}>
                    <div style={{ fontSize: "18px" }}>{a.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>{a.message}</div>
                      <div style={{ fontSize: "11px", color: "#4a4a7a" }}>{a.time}</div>
                    </div>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#6366f1", flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>

            {/* System Health */}
            <div style={{ backgroundColor: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: "16px", padding: "24px" }}>
              <div style={{ fontSize: "11px", color: "#4a4a7a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>System Health</div>
              {[
                { label: "API Server", status: systemHealth?.status === "healthy" ? "Online" : "Offline", color: "#22c55e" },
                { label: "Database", status: "Connected", color: "#22c55e" },
                { label: "ML Model", status: modelMetrics?.accuracy_percent ? "Ready" : "Not Trained", color: modelMetrics?.accuracy_percent ? "#22c55e" : "#ef4444" },
                { label: "Weather API", status: "Active", color: "#22c55e" },
                { label: "Soil Analysis", status: "Active", color: "#22c55e" },
              ].map(h => (
                <div key={h.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", padding: "8px 0", borderBottom: "1px solid #1a1a2e" }}>
                  <span style={{ fontSize: "13px", color: "#6b6b9e" }}>{h.label}</span>
                  <span style={{ fontSize: "11px", color: h.color, backgroundColor: `${h.color}15`, borderRadius: "100px", padding: "3px 10px", fontWeight: 600 }}>● {h.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Modules */}
        <div style={{ backgroundColor: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: "16px", padding: "24px" }}>
          <div style={{ fontSize: "11px", color: "#4a4a7a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Platform Modules Status</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            {["User Management", "Farm Management", "Yield Prediction", "Weather Service", "Soil Analysis", "AI Advisor", "Reports", "Notifications"].map((mod: string) => (
              <div key={mod} style={{ backgroundColor: "#0a0a14", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#22c55e", backgroundColor: "rgba(34,197,94,0.1)", borderRadius: "100px", padding: "2px 8px", marginBottom: "8px", display: "inline-block" }}>● ACTIVE</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>{mod}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}