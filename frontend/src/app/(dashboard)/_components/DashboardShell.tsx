/**
 * YieldSense AI  -  Dashboard Shell (Client Component)
 *
 * Client-side shell with Navbar + Sidebar + auth guard.
 * Adjusted for 56px navbar (h-14) and 240px sidebar (w-60).
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ROUTES } from "@/utils/constants";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading YieldSense AI..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" style={{ zoom: "125%" }}>
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content  -  offset for 240px sidebar on desktop */}
      <main className="lg:pl-60">
        <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-screen-xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
