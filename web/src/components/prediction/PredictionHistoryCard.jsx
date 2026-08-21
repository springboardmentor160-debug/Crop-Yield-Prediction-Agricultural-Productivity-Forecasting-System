import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronRight,
  MapPinned,
  Package,
  Sprout,
  Tractor,
} from "lucide-react";

function PredictionHistoryCard({ prediction }) {
  const createdAt = prediction.created_at
    ? new Date(prediction.created_at).toLocaleString()
    : "Recently";

  const categoryStyle = getCategoryStyle(
    prediction.yield_category
  );

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-green-100 p-3 text-green-700">
            <Sprout size={24} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {prediction.crop}
            </h2>

            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <Tractor size={15} />
              {prediction.farm_name}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${categoryStyle}`}
        >
          {prediction.yield_category_label}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <MapPinned size={15} />
          {prediction.state}
        </span>

        <span className="flex items-center gap-1.5">
          <CalendarDays size={15} />
          {prediction.crop_year}
        </span>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          {prediction.season}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric
          icon={Sprout}
          label="Predicted Yield"
          value={`${formatNumber(
            prediction.predicted_yield
          )} t/ha`}
          tone="green"
        />

        <Metric
          icon={Package}
          label="Estimated Production"
          value={`${formatNumber(
            prediction.estimated_production
          )} t`}
          tone="amber"
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">
          Generated {createdAt}
        </p>

        <Link
          to={`/predictions/${prediction.id}`}
          className="inline-flex items-center gap-1 self-start text-sm font-bold text-green-700 hover:text-green-800"
        >
          View Details
          <ChevronRight size={17} />
        </Link>
      </div>
    </article>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-50 text-amber-800"
      : "bg-green-50 text-green-800";

  return (
    <div className={`rounded-xl p-4 ${toneClass}`}>
      <div className="flex items-center gap-2">
        <Icon size={18} />

        <p className="text-xs font-semibold">
          {label}
        </p>
      </div>

      <p className="mt-2 text-xl font-black">
        {value}
      </p>
    </div>
  );
}

function getCategoryStyle(category) {
  switch (category) {
    case "excellent":
      return "bg-emerald-100 text-emerald-800";

    case "good":
      return "bg-green-100 text-green-800";

    case "average":
      return "bg-amber-100 text-amber-800";

    case "low":
      return "bg-red-100 text-red-800";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default PredictionHistoryCard;