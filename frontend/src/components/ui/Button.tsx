/**
 * YieldSense AI  -  Button Component
 *
 * Solid colors, no gradients, no colored shadows.
 * Intentional and practical  -  not decorative.
 */

"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-[#1a6b3c] hover:bg-[#155730] active:bg-[#124a2a] text-white border border-transparent",
  secondary:
    "bg-gray-800 hover:bg-gray-900 active:bg-gray-950 text-white border border-transparent dark:bg-gray-700 dark:hover:bg-gray-600",
  danger:
    "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border border-transparent",
  ghost:
    "bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700 border border-transparent",
  outline:
    "bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600",
};

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs font-medium gap-1.5",
  md: "px-4 py-2 text-sm font-medium gap-2",
  lg: "px-5 py-2.5 text-sm font-semibold gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-lg
        transition-colors duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a6b3c] focus-visible:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        select-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
