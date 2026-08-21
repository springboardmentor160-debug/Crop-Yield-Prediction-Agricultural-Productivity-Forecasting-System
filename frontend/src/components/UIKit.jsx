export function RiskBadge({ level }) {
  const cls = { Low: "badge-low", Moderate: "badge-moderate", High: "badge-high" }[level] || "badge-low";
  return <span className={`badge ${cls}`}>{level} risk</span>;
}

export function StatCard({ label, value, unit, accent = "pine", icon }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-pine-400">{label}</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-pine-900">
            {value}
            {unit && <span className="ml-1 text-sm font-normal text-pine-400">{unit}</span>}
          </p>
        </div>
        {icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${accent}-50 text-${accent}-600`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gold-600">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-pine-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 py-14 text-center">
      <p className="font-display text-lg font-semibold text-pine-800">{title}</p>
      {description && <p className="max-w-sm text-sm text-pine-500">{description}</p>}
      {action}
    </div>
  );
}

export function Spinner() {
  return <div className="h-6 w-6 animate-spin rounded-full border-2 border-pine-200 border-t-pine-600" />;
}
