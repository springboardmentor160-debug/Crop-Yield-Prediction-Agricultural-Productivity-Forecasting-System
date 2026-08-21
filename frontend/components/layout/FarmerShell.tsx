"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { clearSession, getStoredUser, getToken } from "@/lib/auth";
import type { User } from "@/lib/types";
import { api } from "@/lib/api";

const navItems = [
  { icon: "🏠", label: "Dashboard", href: "/dashboard" },
  { icon: "🚜", label: "Farms", href: "/farms" },
  { icon: "🌾", label: "Yield Prediction", href: "/predict" },
  { icon: "🌦️", label: "Weather", href: "/weather" },
  { icon: "🧪", label: "Soil Analysis", href: "/soil" },
  { icon: "💡", label: "Recommendations", href: "/recommendations" },
  { icon: "⚠️", label: "Risk Assessment", href: "/risk" },
  { icon: "🤖", label: "AI Advisor", href: "/advisor" },
  { icon: "📈", label: "Analytics", href: "/analytics" },
  { icon: "📋", label: "Reports", href: "/reports" },
  { icon: "🗺️", label: "Farm Map", href: "/map" },
  { icon: "🔔", label: "Alerts", href: "/alerts" },
  { icon: "📬", label: "Notifications", href: "/notifications" },
  { icon: "👤", label: "Profile", href: "/profile" },
];

export default function FarmerShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/auth");
      return;
    }

    const u = getStoredUser();
    if (!u) {
      router.push("/auth");
      return;
    }

    if (u.role === "Admin") {
      router.push("/admin");
      return;
    }
    if (u.role === "Analyst") {
      router.push("/analyst");
      return;
    }

    setUser(u);
    setChecked(true);

    api.getUnreadCount().then((d) => setUnreadCount(d.unread_count)).catch(() => {});
  }, [router]);

  const handleLogout = () => {
    clearSession();
    router.push("/auth");
  };

  if (!checked) return null;

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <aside
        className={`sidebar sticky top-0 h-screen flex flex-col shrink-0 transition-all duration-200 ${
          collapsed ? "w-[68px]" : "w-[240px]"
        }`}
      >
        <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center text-lg shrink-0">
            🌾
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-sm text-[var(--color-primary)] tracking-wide">
              YIELDSENSE AI
            </span>
          )}
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`sidebar-item w-full flex items-center gap-2.5 px-3 py-2.5 mb-0.5 text-sm ${
                  isActive ? "active" : ""
                }`}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-2 border-t border-[var(--color-border)]">
          {!collapsed && user && (
            <div className="px-3 py-2 mb-2 rounded-xl bg-[var(--color-primary-light)]">
              <div className="text-sm font-semibold text-[var(--color-heading)]">
                {user.full_name}
              </div>
              <div className="text-xs text-[var(--color-ink-soft)]">{user.role}</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full mb-1.5 px-3 py-2 text-xs rounded-lg border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-sidebar-hover)]"
          >
            {collapsed ? "→" : "← Collapse"}
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--color-border)] text-[var(--color-danger)] hover:bg-red-50"
          >
            {collapsed ? "🚪" : "Sign Out"}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-50 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 h-[52px] flex items-center justify-between">
          <span className="text-sm text-[var(--color-ink-soft)]">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/notifications")}
              className="relative text-sm px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-hover)]"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-danger)] text-white text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-primary-light)] border border-[var(--color-border)]">
              <span className="text-xs text-[var(--color-primary)] font-medium">
                {user?.role}
              </span>
              <span className="text-xs text-[var(--color-ink-soft)]">
                {user?.full_name}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
