
// components/ui/StatCard.tsx
"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: boolean; // true = wheat-gold value (signature accent, use sparingly)
  tone?: "default" | "danger" | "success";
}

export default function StatCard({
  label,
  value,
  sublabel,
  accent = false,
  tone = "default",
}: StatCardProps) {
  const valueColor =
    tone === "danger"
      ? "text-[var(--color-danger)]"
      : tone === "success"
      ? "text-[var(--color-primary)]"
      : accent
      ? "text-[var(--color-accent)]"
      : "text-[var(--color-heading)]";

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius)] p-5 shadow-[var(--shadow-card)]">
      <div className="text-[13px] font-medium text-[var(--color-ink-soft)] mb-2">
        {label}
      </div>
      <div className={`font-mono-num text-[1.8rem] font-semibold leading-none ${valueColor}`}>
        {value}
      </div>
      {sublabel && (
        <div className="text-[12.5px] text-[var(--color-ink-soft)] mt-2">
          {sublabel}
        </div>
      )}
    </div>
  );
}
