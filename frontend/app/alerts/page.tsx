"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Alert } from "@/lib/types";

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data.alerts || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const markRead = async (id: number) => {
    await api.markAlertRead(id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
  };

  const deleteAlert = async (id: number) => {
    await api.deleteAlert(id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const markAllRead = async () => {
    await api.markAllAlertsRead();
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
  };

  const priorityColor = (p: string) => p === "high" ? "#ef4444" : p === "medium" ? "#f59e0b" : "#22c55e";
  const filtered = filter === "all" ? alerts : filter === "unread" ? alerts.filter(a => !a.is_read) : alerts.filter(a => a.type === filter);

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: "48px", marginBottom: "16px" }}>🔔</div><div style={{ color: "#22c55e", fontSize: "13px" }}>LOADING ALERTS...</div></div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f0a", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#ffffff" }}>
      <nav style={{ backgroundColor: "#0d1a0d", borderBottom: "1px solid #1a2e1a", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "#4a7a4a", cursor: "pointer", fontSize: "13px" }}>← Dashboard</button>
          <div style={{ width: "1px", height: "20px", backgroundColor: "#1a2e1a" }} />
          <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "15px" }}>🔔 Alerts & Notifications</span>
        </div>
        <button onClick={() => { localStorage.clear(); router.push("/"); }} style={{ backgroundColor: "transparent", border: "1px solid #1a2e1a", borderRadius: "8px", padding: "6px 14px", color: "#6b9e6b", cursor: "pointer", fontSize: "12px" }}>Sign Out</button>
      </nav>

      <div style={{ padding: "32px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#22c55e", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>Milestone 3 — Module 9</div>
            <h1 style={{ fontSize: "32px", fontWeight: 800 }}>Alert Center</h1>
            <p style={{ color: "#4a7a4a", fontSize: "14px" }}>{alerts.filter(a => !a.is_read).length} unread alerts</p>
          </div>
          <button onClick={markAllRead} style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", borderRadius: "8px", padding: "10px 20px", color: "#0a0f0a", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
            Mark All Read
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {["all", "unread", "weather", "disease", "harvest", "prediction", "soil"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: "100px", border: "1px solid", fontSize: "12px", cursor: "pointer", fontWeight: filter === f ? 700 : 400, backgroundColor: filter === f ? "#22c55e" : "transparent", color: filter === f ? "#0a0f0a" : "#4a7a4a", borderColor: filter === f ? "#22c55e" : "#1a2e1a" }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Alert Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: "Total", value: alerts.length, color: "#6b9e6b" },
            { label: "Unread", value: alerts.filter(a => !a.is_read).length, color: "#22c55e" },
            { label: "High Priority", value: alerts.filter(a => a.priority === "high").length, color: "#ef4444" },
            { label: "Medium", value: alerts.filter(a => a.priority === "medium").length, color: "#f59e0b" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "#4a7a4a" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Alerts List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map(alert => (
            <div key={alert.id} style={{ backgroundColor: "#0d1a0d", border: `1px solid ${alert.is_read ? "#1a2e1a" : "#2a4a2a"}`, borderLeft: `3px solid ${priorityColor(alert.priority)}`, borderRadius: "12px", padding: "16px 20px", opacity: alert.is_read ? 0.7 : 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <div style={{ fontSize: "24px", flexShrink: 0 }}>{alert.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>{alert.title}</div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "10px", color: priorityColor(alert.priority), backgroundColor: `${priorityColor(alert.priority)}15`, borderRadius: "100px", padding: "2px 8px" }}>{alert.priority.toUpperCase()}</span>
                      {!alert.is_read && <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block" }} />}
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", color: "#6b9e6b", marginBottom: "8px", lineHeight: 1.5 }}>{alert.message}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: "#4a7a4a" }}>🕐 {alert.time}</span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {!alert.is_read && (
                        <button onClick={() => markRead(alert.id)} style={{ fontSize: "11px", color: "#22c55e", backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "6px", padding: "4px 10px", cursor: "pointer" }}>Mark Read</button>
                      )}
                      <button onClick={() => deleteAlert(alert.id)} style={{ fontSize: "11px", color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px", padding: "4px 10px", cursor: "pointer" }}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px", color: "#4a7a4a" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔔</div>
              <div style={{ fontSize: "16px", fontWeight: 600 }}>No alerts found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
