"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const markRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) { console.error(e); }
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) { console.error(e); }
  };

  const deleteNotif = async (id: number) => {
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) { console.error(e); }
  };

  const filtered = filter === "unread" ? notifications.filter(n => !n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔔</div>
        <div style={{ color: "#22c55e", letterSpacing: "0.15em", fontSize: "13px" }}>LOADING NOTIFICATIONS...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f0a", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#ffffff" }}>
      <nav style={{ backgroundColor: "#0d1a0d", borderBottom: "1px solid #1a2e1a", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "#4a7a4a", cursor: "pointer", fontSize: "13px" }}>← Dashboard</button>
          <div style={{ width: "1px", height: "20px", backgroundColor: "#1a2e1a" }} />
          <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "15px" }}>🔔 Notifications</span>
          {unreadCount > 0 && (
            <span style={{ backgroundColor: "#ef4444", color: "#ffffff", fontSize: "10px", fontWeight: 700, borderRadius: "100px", padding: "2px 8px" }}>{unreadCount} NEW</span>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{ backgroundColor: "transparent", border: "1px solid #1a2e1a", borderRadius: "8px", padding: "6px 14px", color: "#22c55e", cursor: "pointer", fontSize: "12px" }}>Mark All Read</button>
          )}
          <button onClick={() => { localStorage.clear(); router.push("/"); }} style={{ backgroundColor: "transparent", border: "1px solid #1a2e1a", borderRadius: "8px", padding: "6px 14px", color: "#6b9e6b", cursor: "pointer", fontSize: "12px" }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ padding: "32px", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "11px", color: "#22c55e", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>Notification Center</div>
          <h1 style={{ fontSize: "32px", fontWeight: 800 }}>Notifications</h1>
          <p style={{ color: "#4a7a4a", fontSize: "14px" }}>{unreadCount} unread · {notifications.length} total</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: "Total", value: notifications.length, color: "#6b9e6b" },
            { label: "Unread", value: unreadCount, color: "#22c55e" },
            { label: "Read", value: notifications.length - unreadCount, color: "#4a7a4a" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "#4a7a4a" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {["all", "unread"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 16px", borderRadius: "100px", border: "1px solid", fontSize: "12px", cursor: "pointer", fontWeight: filter === f ? 700 : 400, backgroundColor: filter === f ? "#22c55e" : "transparent", color: filter === f ? "#0a0f0a" : "#4a7a4a", borderColor: filter === f ? "#22c55e" : "#1a2e1a" }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "60px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔔</div>
            <div style={{ fontSize: "18px", fontWeight: 600, color: "#4a7a4a", marginBottom: "8px" }}>
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </div>
            <div style={{ fontSize: "13px", color: "#2a4a2a" }}>
              {filter === "unread" ? "You are all caught up!" : "Notifications will appear here when you make predictions or get alerts"}
            </div>
            {filter === "unread" && (
              <button onClick={() => setFilter("all")} style={{ marginTop: "16px", backgroundColor: "transparent", border: "1px solid #1a2e1a", borderRadius: "8px", padding: "8px 20px", color: "#22c55e", cursor: "pointer", fontSize: "12px" }}>
                View All Notifications
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map((notif) => (
              <div key={notif.id} style={{ backgroundColor: "#0d1a0d", border: `1px solid ${notif.is_read ? "#1a2e1a" : "#2a4a2a"}`, borderRadius: "12px", padding: "16px 20px", opacity: notif.is_read ? 0.75 : 1, transition: "all 0.2s" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: notif.is_read ? "#0a0f0a" : "rgba(34,197,94,0.1)", border: `1px solid ${notif.is_read ? "#1a2e1a" : "rgba(34,197,94,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                    🔔
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <div style={{ fontSize: "14px", fontWeight: notif.is_read ? 400 : 600 }}>{notif.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {!notif.is_read && <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block", flexShrink: 0 }} />}
                        <span style={{ fontSize: "11px", color: "#4a7a4a", whiteSpace: "nowrap" }}>
                          {new Date(notif.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b9e6b", lineHeight: 1.5, marginBottom: "10px" }}>{notif.message}</div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {!notif.is_read && (
                        <button onClick={() => markRead(notif.id)} style={{ fontSize: "11px", color: "#22c55e", backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "6px", padding: "4px 12px", cursor: "pointer" }}>
                          ✓ Mark Read
                        </button>
                      )}
                      <button onClick={() => deleteNotif(notif.id)} style={{ fontSize: "11px", color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px", padding: "4px 12px", cursor: "pointer" }}>
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div style={{ marginTop: "24px", backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "12px", padding: "16px 20px" }}>
          <div style={{ fontSize: "12px", color: "#4a7a4a", marginBottom: "6px" }}>ℹ️ About Notifications</div>
          <div style={{ fontSize: "12px", color: "#2a4a2a", lineHeight: 1.6 }}>
            Notifications are automatically created when you make yield predictions with High risk levels, or when system events occur. Make a prediction in the Yield Prediction module to see notifications appear here.
          </div>
          <button onClick={() => router.push("/predict")} style={{ marginTop: "10px", backgroundColor: "transparent", border: "1px solid #1a2e1a", borderRadius: "6px", padding: "6px 14px", color: "#22c55e", cursor: "pointer", fontSize: "11px" }}>
            Go to Yield Prediction →
          </button>
        </div>
      </div>
    </div>
  );
}
