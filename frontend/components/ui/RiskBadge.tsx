// components/ui/RiskBadge.tsx
export default function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    Low: "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]",
    Medium: "bg-[var(--color-warning)] text-[var(--color-soil)]",
    High: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  };

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
        styles[level] || "bg-[var(--color-bg-secondary)] text-[var(--color-ink-soft)]"
      }`}
    >
      {level || "—"}
    </span>
  );
}
