"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { clearSession, getStoredUser, getToken } from "@/lib/auth";
import type { User } from "@/lib/types";

const menuItems = [
  { icon: "📊", label: "Dashboard", href: "/analyst" },
  { icon: "📈", label: "Yield Trends", href: "/analyst/yield-trends" },
  { icon: "🌾", label: "Farm Comparison", href: "/analyst/farm-comparison" },
  { icon: "🌱", label: "Crop Performance", href: "/analyst/crop-performance" },
  { icon: "🌦️", label: "Weather Impact", href: "/analyst/weather" },
  { icon: "🧪", label: "Soil Analysis", href: "/analyst/soil" },
  { icon: "⚡", label: "Productivity", href: "/analyst/productivity" },
  { icon: "⚠️", label: "Risk Analysis", href: "/analyst/risk" },
  { icon: "🔮", label: "Predictions", href: "/analyst/predictions" },
  { icon: "📑", label: "Reports", href: "/analyst/reports" },
];

export default function AnalystShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [checked, setChecked] = useState(false);

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

    if (u.role !== "Analyst" && u.role !== "Admin") {
      router.push("/dashboard");
      return;
    }

    setUser(u);
    setChecked(true);
  }, [router]);

  if (!checked) return null;

  return (
    <div className="flex min-h-screen bg-[#070b13] text-white">
      <aside
        className={`bg-[#0d1320] border-r border-[#1d2940] flex flex-col shrink-0 transition-all duration-300 ${
          collapsed ? "w-[75px]" : "w-[260px]"
        }`}
      >
        <div className="p-5 border-b border-[#1d2940] flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-[#3b82f6] flex items-center justify-center text-xl shrink-0">
            📊
          </div>
          {!collapsed && (
            <div>
              <div className="font-display font-bold text-lg">YieldSense AI</div>
              <div className="text-[#60a5fa] text-xs">Analyst Portal</div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-[#1e3a8a] text-white"
                    : "text-[#94a3b8] hover:bg-[#1d2940] hover:text-white"
                }`}
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#1d2940]">
          {!collapsed && user && (
            <div className="mb-3 px-2">
              <div className="font-semibold text-sm">{user.full_name}</div>
              <div className="text-[#60a5fa] text-xs">{user.role}</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full mb-2 py-2 rounded-lg bg-[#1d2940] text-sm hover:bg-[#253550]"
          >
            {collapsed ? "➡" : "⬅ Collapse"}
          </button>
          <button
            onClick={() => {
              clearSession();
              router.push("/auth");
            }}
            className="w-full py-2 rounded-lg bg-[#dc2626] text-sm hover:bg-[#b91c1c]"
          >
            {collapsed ? "🚪" : "Logout"}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
