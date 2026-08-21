import type { InputHTMLAttributes } from "react";

interface FieldInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unit?: string;
  error?: string;
}

export default function FieldInput({ label, unit, error, id, ...rest }: FieldInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="mb-5 relative group">
      <div className="flex items-baseline justify-between mb-2">
        <label htmlFor={inputId} className="text-sm font-medium text-textSecondary transition-colors group-focus-within:text-primary">
          {label}
        </label>
        {unit && <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-textMuted border border-white/10">{unit}</span>}
      </div>
      <div className="relative">
        <input
          id={inputId}
          {...rest}
          className="glass-input transition-all shadow-[0_4px_20px_rgba(0,0,0,0.1)] group-focus-within:shadow-[0_4px_20px_rgba(16,185,129,0.15)]"
        />
        <div className="absolute inset-0 rounded-lg pointer-events-none ring-1 ring-inset ring-white/10 group-focus-within:ring-primary/50 transition-all"></div>
      </div>
      {error && (
        <p className="mt-2 text-xs font-medium text-danger bg-danger/10 px-2 py-1 rounded inline-flex border border-danger/20">
          {error}
        </p>
      )}
    </div>
  );
}
