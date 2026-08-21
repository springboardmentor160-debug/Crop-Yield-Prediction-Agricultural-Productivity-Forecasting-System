/**
 * YieldSense AI  -  Auth Layout
 *
 * Clean, responsive auth page wrapper.
 * Completely fits any screen (desktop, laptop, mobile) with zero scrollbars.
 */

import React from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-4 sm:py-6">
      <div className="w-full max-w-sm flex flex-col items-center my-auto" style={{ zoom: "125%" }}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-3 sm:mb-4 shrink-0">
          <div className="w-7 h-7 rounded-md bg-[#1a6b3c] flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1.5C7 1.5 2.5 4 2.5 8C2.5 10.5 4.5 12.5 7 12.5C9.5 12.5 11.5 10.5 11.5 8C11.5 4 7 1.5 7 1.5Z" fill="white" fillOpacity="0.9"/>
              <path d="M7 5V12.5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-base font-semibold text-gray-900 dark:text-white">YieldSense AI</span>
        </Link>

        {/* Auth card */}
        <div className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm shrink-0">
          {children}
        </div>
      </div>
    </div>
  );
}
