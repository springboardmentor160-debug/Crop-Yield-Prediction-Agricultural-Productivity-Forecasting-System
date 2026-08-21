interface LoadingStateProps {
  label?: string;
  icon?: string;
}

export default function LoadingState({
  label = "Loading…",
  icon = "🌾",
}: LoadingStateProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">{icon}</div>
        <p className="text-sm font-medium text-[var(--color-primary)] tracking-wide">
          {label}
        </p>
      </div>
    </div>
  );
}
