/**
 * YieldSense AI  -  Card Component
 *
 * Clean surface container. No decorative effects,
 * no blobs, no excessive shadows or animations.
 */

"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const paddingStyles: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-7",
};

export default function Card({
  children,
  className = "",
  hover = false,
  padding = "md",
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-900
        rounded-lg
        border border-gray-200 dark:border-gray-800
        ${hover ? "hover:border-gray-300 dark:hover:border-gray-700 cursor-pointer transition-colors duration-150" : ""}
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-sm font-semibold text-gray-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-xs text-gray-500 dark:text-gray-400 mt-0.5 ${className}`}>
      {children}
    </p>
  );
}
