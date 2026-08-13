"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, getStoredUser, clearSession } from "@/lib/auth";

interface SidebarProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: "🏠", label: "Dashboard", href: "/dashboard" },
  { icon: "🚜", label: "Farms", href: "/farms" },
  { icon: "🌾", label: "Yield Prediction", href: "/predict" },
  { icon: "🌦️", label: "Weather", href: "/weather" },
  { icon: "🧪", label: "Soil Analysis", href: "/soil" },
  { icon: "🤖", label: "AI Advisor", href: "/advisor" },
  { icon: "📈", label: "Reports", href: "/reports" },
    { icon: "📈", label: "Analytics", href: "/analytics" },

  { icon: "🗺️", label: "Farm Map", href: "/map" },
  { icon: "🔔", label: "Alerts", href: "/alerts" },
  
 
];

export default function DashboardLayout({ children }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [checked, setChecked] = useState(false); // avoids a flash of farmer UI before the redirect fires

  useEffect(() => {
    const token = getToken();
    if (!token) {
      clearSession();
      router.push("/");
      return;
    }

    const u = getStoredUser();
    if (!u) {
      clearSession();
      router.push("/");
      return;
    }

    // NEW: role guard - this layout (and everything under /dashboard) is
    // Farmer-only. Admin/Analyst land here if they still have an old
    // session or type the URL directly, so bounce them to their own
    // dashboard instead of silently showing farmer features.
    if (u.role === "Admin") { router.push("/admin"); return; }
    if (u.role === "Analyst") { router.push("/analyst"); return; }

    setUser(u);
    setChecked(true);
  }, [router]);

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };

  // Don't render farmer content until we've confirmed the role - prevents
  // a brief flash of the farmer dashboard for Admin/Analyst before the
  // redirect above kicks in.
  if (!checked) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#0a0f0a", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#ffffff" }}>

      {/* Sidebar */}
      <div style={{
        width: collapsed ? "64px" : "240px",
        backgroundColor: "#0d1a0d",
        borderRight: "1px solid #1a2e1a",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #1a2e1a", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #22c55e, #16a34a)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>🌾</div>
          {!collapsed && <span style={{ color: "#22c55e", fontWeight: 800, fontSize: "14px", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>YIELDSENSE AI</span>}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <button key={item.href} onClick={() => router.push(item.href)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "8px", border: "none",
                  cursor: "pointer", marginBottom: "2px", transition: "all 0.15s",
                  backgroundColor: isActive ? "rgba(34,197,94,0.15)" : "transparent",
                  borderLeft: isActive ? "2px solid #22c55e" : "2px solid transparent",
                  textAlign: "left",
                }}>
                <span style={{ fontSize: "16px", flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && (
                  <span style={{ fontSize: "13px", fontWeight: isActive ? 600 : 400, color: isActive ? "#22c55e" : "#6b9e6b", whiteSpace: "nowrap" }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User + Collapse */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid #1a2e1a" }}>
          {!collapsed && user && (
            <div style={{ padding: "10px 12px", backgroundColor: "rgba(34,197,94,0.08)", borderRadius: "8px", marginBottom: "8px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff", marginBottom: "2px" }}>{user.full_name}</div>
              <div style={{ fontSize: "11px", color: "#4a7a4a" }}>{user.role}</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ width: "100%", padding: "8px 12px", backgroundColor: "transparent", border: "1px solid #1a2e1a", borderRadius: "8px", color: "#4a7a4a", cursor: "pointer", fontSize: "12px", marginBottom: "6px" }}>
            {collapsed ? "→" : "← Collapse"}
          </button>
          <button onClick={handleLogout} style={{ width: "100%", padding: "8px 12px", backgroundColor: "transparent", border: "1px solid #1a2e1a", borderRadius: "8px", color: "#ef4444", cursor: "pointer", fontSize: "12px" }}>
            {collapsed ? "🚪" : "Sign Out"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Top Bar */}
        <div style={{ backgroundColor: "#0d1a0d", borderBottom: "1px solid #1a2e1a", padding: "0 24px", height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ fontSize: "13px", color: "#4a7a4a" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button style={{ backgroundColor: "transparent", border: "1px solid #1a2e1a", borderRadius: "8px", padding: "5px 12px", color: "#4a7a4a", cursor: "pointer", fontSize: "12px" }}>🔔 Alerts</button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "8px", padding: "5px 12px" }}>
              <span style={{ fontSize: "12px", color: "#22c55e" }}>● {user?.role || "User"}</span>
              <span style={{ fontSize: "12px", color: "#6b9e6b" }}>{user?.full_name}</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: "24px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}