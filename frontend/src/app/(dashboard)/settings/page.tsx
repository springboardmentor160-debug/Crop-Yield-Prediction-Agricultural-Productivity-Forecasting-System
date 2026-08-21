/**
 * YieldSense AI  -  Settings Page
 */

"use client";

import React, { useState } from "react";
import { Settings, Bell, Shield, Trash2, Moon, Sun } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";

export default function SettingsPage() {
  const { logout } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Theme switching state and handler
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark" | "system">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as "light" | "dark" | "system") || "system";
    }
    return "system";
  });

  const applyTheme = (theme: "light" | "dark" | "system") => {
    setCurrentTheme(theme);
    if (typeof window === "undefined") return;

    localStorage.setItem("theme", theme);
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // System preference check
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      if (mediaQuery.matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
    toast.success(`Theme set to ${theme}`);
  };

  // Interactive notification states
  const [notifications, setNotifications] = useState({
    email: true,
    predictions: true,
    weather: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    const newVal = !notifications[key];
    const label = key === "email" ? "Email notifications" : key === "predictions" ? "Prediction alerts" : "Weather warnings";
    toast.success(`${label} toggled ${newVal ? "on" : "off"}`);
    setNotifications((prev) => ({ ...prev, [key]: newVal }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Settings
      </h1>

      {/* Appearance */}
      <Card padding="md">
        <div className="flex items-center gap-2 mb-5">
          <Sun className="h-5 w-5 text-amber-500" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Appearance
          </h2>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Theme</p>
            <p className="text-xs text-gray-500">Select your preferred theme</p>
          </div>
          <div className="flex gap-2">
            {["light", "dark", "system"].map((theme) => (
              <button
                key={theme}
                onClick={() => applyTheme(theme as "light" | "dark" | "system")}
                className={`px-4 py-2 rounded-xl text-sm font-medium border-2 capitalize transition-all ${
                  currentTheme === theme
                    ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-950/20"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-500 hover:text-green-600"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card padding="md">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="h-5 w-5 text-blue-500" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Notifications
          </h2>
        </div>
        <div className="space-y-4">
          {[
            { key: "email" as const, label: "Email Notifications", desc: "Receive farm updates via email" },
            { key: "predictions" as const, label: "Prediction Alerts", desc: "Get notified about new predictions" },
            { key: "weather" as const, label: "Weather Warnings", desc: "Severe weather alerts for your farms" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <button
                className={`
                  relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                  ${notifications[item.key] ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}
                `}
                onClick={() => toggleNotification(item.key)}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${notifications[item.key] ? "translate-x-5" : "translate-x-0"}
                  `}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger Zone */}
      <Card padding="md" className="border-red-200 dark:border-red-900/50">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="h-5 w-5 text-red-500" />
          <h2 className="text-base font-semibold text-red-600 dark:text-red-400">
            Danger Zone
          </h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Delete Account
            </p>
            <p className="text-xs text-gray-500">
              Permanently delete your account and all data
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </Card>

      {/* Delete Account Dialog */}
      <Dialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Account"
        maxWidth="sm"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          This feature is not yet available. Account deletion will be implemented
          in a future milestone.
        </p>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setDeleteDialogOpen(false)}>
            Understood
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
