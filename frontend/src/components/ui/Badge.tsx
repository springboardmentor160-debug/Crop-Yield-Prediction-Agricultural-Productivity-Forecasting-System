/**
 * YieldSense AI  -  Badge Component
 *
 * Semantic status badges. Rounded-md for most contexts,
 * used only where state communication is needed.
 */

"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  success: "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  danger: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  info: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const sizeStyles: Record<string, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

export default function Badge({
  children,
  variant = "default",
  size = "sm",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-md font-medium
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
