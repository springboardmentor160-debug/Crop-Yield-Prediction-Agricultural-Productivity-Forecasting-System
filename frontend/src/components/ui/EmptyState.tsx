/**
 * YieldSense AI  -  Empty State Component
 */

"use client";

import React from "react";
import { Inbox } from "lucide-react";
import Button from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        {icon || <Inbox className="h-8 w-8 text-gray-400" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
