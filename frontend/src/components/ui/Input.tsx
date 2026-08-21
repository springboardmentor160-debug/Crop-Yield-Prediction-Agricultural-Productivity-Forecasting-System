/**
 * YieldSense AI  -  Input Component
 *
 * Clean, accessible text input.
 * Consistent with form-select utility class.
 */

"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  icon,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full rounded-lg border bg-white dark:bg-gray-900
            px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            transition-colors duration-150
            focus:outline-none focus:ring-1 focus:border-green-800 focus:ring-green-800
            dark:focus:border-green-600 dark:focus:ring-green-600
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
            ${icon ? "pl-9" : ""}
            ${
              error
                ? "border-red-400 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
