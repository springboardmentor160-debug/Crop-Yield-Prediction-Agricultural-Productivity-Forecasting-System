"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { clearSession, getStoredUser, getToken } from "@/lib/auth";
import type { User } from "@/lib/types";

const navItems = [
  { label: "Overview", href: "/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Farms", href: "/admin/farms" },
  { label: "Models", href: "/admin/models" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Settings", href: "/admin/settings" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/auth");
      return;
    }

    const u = getStoredUser();
    if (!u || u.role !== "Admin") {
      router.push("/auth");
      return;
    }

    setUser(u);
    setChecked(true);
  }, [router]);

  if (!checked) return null;

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white font-[family-name:var(--font-body)]">
      <nav className="sticky top-0 z-50 bg-[#0d0d1a] border-b border-[#1a1a2e] px-8 h-[60px] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center text-base">
              ⚙️
            </div>
            <span className="text-[#6366f1] font-bold text-sm tracking-wide">
              YIELDSENSE ADMIN
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`px-3 py-1.5 text-xs uppercase tracking-wider rounded-md transition-colors ${
                    isActive
                      ? "text-[#6366f1] font-bold bg-[#6366f1]/10"
                      : "text-[#4a4a7a] hover:text-[#6b6b9e]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-[#6b6b9e]">
            {user?.full_name}
          </span>
          <button
            onClick={() => {
              clearSession();
              router.push("/auth");
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#1a1a2e] text-[#6b6b9e] hover:border-[#6366f1] hover:text-[#6366f1]"
          >
            Sign Out
          </button>
        </div>
      </nav>
      {children}
    </div>
  );
}
