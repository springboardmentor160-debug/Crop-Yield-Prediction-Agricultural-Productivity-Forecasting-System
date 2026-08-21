/**
 * YieldSense AI  -  Sidebar Navigation Component
 *
 * Clean sidebar with logical grouping and left-border active state.
 * No gradient boxes, no version numbers, no decorative elements.
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  User,
  Settings,
  Bell,
  BarChart3,
  Cloud,
  Layers,
  FileText,
  History,
  LineChart,
  X,
  Shield,
} from "lucide-react";
import { ROUTES } from "@/utils/constants";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type NavItem =
  | { type: "divider"; label: string }
  | { label: string; icon: React.ComponentType<{ className?: string }>; href: string };

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profile } = useAuth();

  const menuItems: NavItem[] = [
    ...(profile?.role === "admin"
      ? [
          { type: "divider" as const, label: "Administration" },
          { label: "Admin Control", icon: Shield, href: ROUTES.ADMIN },
        ]
      : []),
    { type: "divider" as const, label: "Farming" },
    { label: "Dashboard", icon: LayoutDashboard, href: ROUTES.DASHBOARD },
    { label: "Farms", icon: MapPin, href: ROUTES.FARMS },
    { label: "Prediction", icon: BarChart3, href: ROUTES.PREDICTION },
    { type: "divider" as const, label: "Intelligence" },
    { label: "Analytics", icon: LineChart, href: ROUTES.ANALYTICS },
    { label: "History", icon: History, href: ROUTES.HISTORY },
    { label: "Weather", icon: Cloud, href: ROUTES.WEATHER },
    { label: "Soil Analysis", icon: Layers, href: ROUTES.SOIL },
    { type: "divider" as const, label: "Reports & Alerts" },
    { label: "Reports", icon: FileText, href: ROUTES.REPORTS },
    { label: "Notifications", icon: Bell, href: ROUTES.NOTIFICATIONS },
    { type: "divider" as const, label: "Account" },
    { label: "Profile", icon: User, href: ROUTES.PROFILE },
    { label: "Settings", icon: Settings, href: ROUTES.SETTINGS },
  ];

  const isActive = (href: string) => {
    if (href === ROUTES.DASHBOARD) return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Navigation</span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto" aria-label="Main navigation">
        {menuItems.map((item, index) => {
          if ("type" in item && item.type === "divider") {
            return (
              <div key={`divider-${index}`} className="px-4 pt-5 pb-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {item.label}
                </p>
              </div>
            );
          }

          const navItem = item as { label: string; icon: React.ComponentType<{ className?: string }>; href: string };
          const Icon = navItem.icon;
          const active = isActive(navItem.href);

          return (
            <Link
              key={navItem.href}
              href={navItem.href}
              onClick={onClose}
              className={`
                flex items-center gap-3 mx-2 px-3 py-2 rounded-md text-sm
                transition-colors duration-150
                ${
                  active
                    ? "bg-green-50 dark:bg-green-900/15 text-[#1a6b3c] dark:text-green-400 font-medium border-l-2 border-l-[#1a6b3c] dark:border-l-green-500 pl-[10px]"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200 font-normal"
                }
              `}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#1a6b3c] dark:text-green-400" : "text-gray-400"}`} />
              <span>{navItem.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer  -  just a subtle brand mark */}
      <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-400 dark:text-gray-600">YieldSense AI</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-950
          border-r border-gray-100 dark:border-gray-800
          transform transition-transform duration-200 ease-out
          lg:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:top-14 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800"
        aria-label="Sidebar"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
