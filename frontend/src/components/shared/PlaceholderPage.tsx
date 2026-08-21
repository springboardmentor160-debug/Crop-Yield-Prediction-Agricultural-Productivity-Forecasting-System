/**
 * YieldSense AI  -  Placeholder Page Component
 *
 * Used for features coming in future milestones.
 */

"use client";

import React from "react";
import { Lock } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  phase?: string;
}

export default function PlaceholderPage({
  title,
  description,
  icon,
  phase = "Upcoming Release",
}: PlaceholderPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Animated icon container */}
        <div className="relative inline-flex mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center">
            <div className="text-green-600 dark:text-green-400">{icon}</div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{description}</p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
            Coming in {phase}
          </span>
        </div>
      </div>
    </div>
  );
}
