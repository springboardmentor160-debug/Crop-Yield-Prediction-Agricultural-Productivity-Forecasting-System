/**
 * YieldSense AI  -  Navbar Component
 *
 * Clean, minimal header. No gradient text, no decorative effects.
 */

"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, LogOut, User, Menu } from "lucide-react";
import { ROUTES } from "@/utils/constants";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, profile, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const handleLogout = async () => {
    setShowUserMenu(false);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const initials = profile?.display_name?.charAt(0)?.toUpperCase() || "U";

  return (
    <nav className="sticky top-0 z-40 h-14 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <Link
            href={user ? ROUTES.DASHBOARD : ROUTES.HOME}
            className="flex items-center gap-2.5"
            aria-label="YieldSense AI home"
          >
            {/* Logo mark  -  simple geometric shape */}
            <div className="w-7 h-7 rounded-md bg-[#1a6b3c] flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1.5C7 1.5 2.5 4 2.5 8C2.5 10.5 4.5 12.5 7 12.5C9.5 12.5 11.5 10.5 11.5 8C11.5 4 7 1.5 7 1.5Z" fill="white" fillOpacity="0.9"/>
                <path d="M7 5V12.5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white hidden sm:block">
              YieldSense AI
            </span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {user && (
            <>
              {/* Notifications */}
              <Link
                href={ROUTES.NOTIFICATIONS}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </Link>

              {/* User menu */}
              <div className="relative ml-1">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pr-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  <div className="w-7 h-7 rounded-md bg-[#1a6b3c] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                    {initials}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block max-w-[120px] truncate">
                    {profile?.display_name || "User"}
                  </span>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md py-1 z-50">
                      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {profile?.display_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {profile?.email}
                        </p>
                      </div>
                      <Link
                        href={ROUTES.PROFILE}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
