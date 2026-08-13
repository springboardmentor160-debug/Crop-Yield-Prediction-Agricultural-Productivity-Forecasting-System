// components/analyst/PageHeader.tsx
"use client";

export default function PageHeader({
  title,
  subtitle,
  onRefresh,
  refreshing,
}: {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <h1 className="font-display text-2xl font-medium text-[var(--color-heading)]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[var(--color-ink-soft)] text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="text-[13px] font-medium px-3.5 py-2 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50"
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      )}
    </div>
  );
}
