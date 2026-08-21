function FarmSummaryCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value ?? "—"}
          </p>

          {subtitle && (
            <p className="mt-1 text-xs text-gray-500">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className="rounded-xl bg-green-100 p-3 text-green-700">
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}

export default FarmSummaryCard;