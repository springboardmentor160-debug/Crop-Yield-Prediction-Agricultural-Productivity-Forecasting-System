// components/analyst/AnalystNav.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionUser, logoutAndRedirect } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/analyst/dashboard", label: "Dashboard" },
  { href: "/analyst/farm-comparison", label: "Farm Comparison" },
  { href: "/analyst/crop-performance", label: "Crop Performance" },
  { href: "/analyst/yield-trends", label: "Yield Trends" },
  { href: "/analyst/productivity", label: "Productivity" },
  { href: "/analyst/risk", label: "Risk Distribution" },
  { href: "/analyst/weather", label: "Weather Impact" },
  { href: "/analyst/soil", label: "Soil Analysis" },
  { href: "/analyst/predictions", label: "Recent Predictions" },
  { href: "/analyst/reports", label: "Reports" },
];

export default function AnalystNav({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[var(--color-sidebar)] text-[var(--color-sidebar-ink)] min-h-screen p-5">
      <div className="flex items-center gap-2.5 mb-8 px-1">
        <div className="w-8 h-8 rounded-[6px] border border-white/15 flex items-center justify-center">
          <span className="font-display text-[13px] font-semibold">YS</span>
        </div>
        <div>
          <div className="font-display text-[15px] font-medium leading-tight">
            YieldSense AI
          </div>
          <div className="text-[11px] text-[var(--color-sidebar-ink-soft)]">
            Analyst Console
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-[8px] text-[13.5px] transition-colors ${
                active
                  ? "bg-[var(--color-sidebar-active)] text-white font-medium"
                  : "text-[var(--color-sidebar-ink-soft)] hover:bg-[var(--color-sidebar-hover)] hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 pt-4 mt-4">
        <div className="px-1 mb-3">
          <div className="text-[13px] font-medium text-white truncate">
            {user?.full_name || "—"}
          </div>
          <div className="text-[11.5px] text-[var(--color-sidebar-ink-soft)] truncate">
            {user?.email || ""}
          </div>
        </div>
        <button
          onClick={logoutAndRedirect}
          className="w-full text-left px-3 py-2 rounded-[8px] text-[13px] text-[var(--color-sidebar-ink-soft)] hover:bg-[var(--color-sidebar-hover)] hover:text-white transition-colors"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
