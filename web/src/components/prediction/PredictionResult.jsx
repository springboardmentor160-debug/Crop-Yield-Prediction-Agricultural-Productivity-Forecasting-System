import {
  BrainCircuit,
  CalendarDays,
  CircleAlert,
  Clock3,
  MapPinned,
  Package,
  RotateCcw,
  Sprout,
  Tractor,
} from "lucide-react";

function PredictionResult({
  prediction,
  onPredictAgain,
}) {
  if (!prediction) {
    return null;
  }

  const createdDate = prediction.created_at
    ? new Date(
        prediction.created_at
      ).toLocaleString()
    : "Recently";

  const estimatedKilograms =
    Number(prediction.estimated_production) * 1000;

  const categoryStyle = getCategoryStyle(
    prediction.yield_category
  );

  return (
    <section className="animate-[resultReveal_0.55s_ease-out_forwards] overflow-hidden rounded-3xl border border-green-200 bg-white shadow-lg">
      <div className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 px-6 py-7 text-white lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-green-100">
              <BrainCircuit size={18} />
              AI Prediction Completed
            </div>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              {prediction.crop} Yield Forecast
            </h2>

            <p className="mt-2 text-sm text-green-100">
              {prediction.farm_name} ·{" "}
              {prediction.state}
            </p>
          </div>

          <button
            type="button"
            onClick={onPredictAgain}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
          >
            <RotateCcw size={18} />
            Predict Again
          </button>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <div
          className={`mb-5 rounded-2xl border p-5 ${categoryStyle.container}`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide opacity-70">
                Yield Classification
              </p>

              <p className="mt-1 text-2xl font-black">
                {categoryStyle.symbol}{" "}
                {prediction.yield_category_label}
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${categoryStyle.badge}`}
            >
              Compared with historical{" "}
              {prediction.crop} yields
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 opacity-80">
            {prediction.yield_category_description}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <MetricCard
            icon={Sprout}
            label="Predicted Yield"
            value={`${formatNumber(
              prediction.predicted_yield
            )} t/ha`}
            note="Metric tons per hectare"
            className="border-green-200 bg-green-50 text-green-900"
          />

          <MetricCard
            icon={Package}
            label="Estimated Production"
            value={`${formatNumber(
              prediction.estimated_production
            )} metric tons`}
            note={`Approximately ${formatWholeNumber(
              estimatedKilograms
            )} kg for a farm area of ${formatNumber(
              prediction.area_hectares
            )} hectares`}
            className="border-amber-200 bg-amber-50 text-amber-900"
          />
        </div>

        <div className="mt-7">
          <h3 className="text-lg font-bold text-gray-900">
            Prediction Details
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DetailCard
              icon={Tractor}
              label="Farm"
              value={prediction.farm_name}
            />

            <DetailCard
              icon={Sprout}
              label="Crop & Season"
              value={`${prediction.crop} · ${prediction.season}`}
            />

            <DetailCard
              icon={CalendarDays}
              label="Prediction Year"
              value={prediction.crop_year}
            />

            <DetailCard
              icon={MapPinned}
              label="State"
              value={prediction.state}
            />

            <DetailCard
              icon={Clock3}
              label="Generated"
              value={createdDate}
            />

            <DetailCard
              icon={BrainCircuit}
              label="Model"
              value={`${prediction.model_name} v${prediction.model_version}`}
            />
          </div>
        </div>

        {prediction.explanation && (
          <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-2.5 text-blue-700 shadow-sm">
                <CircleAlert size={20} />
              </div>

              <div>
                <h3 className="font-bold text-blue-950">
                  Prediction Information
                </h3>

                <p className="mt-2 text-sm leading-6 text-blue-900">
                  {prediction.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes resultReveal {
          0% {
            opacity: 0;
            transform: translateY(28px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  className,
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white/80 p-3 shadow-sm">
          <Icon size={24} />
        </div>

        <p className="font-semibold">
          {label}
        </p>
      </div>

      <p className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 opacity-75">
        {note}
      </p>
    </div>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <Icon
        size={18}
        className="text-green-700"
      />

      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function getCategoryStyle(category) {
  switch (category) {
    case "excellent":
      return {
        symbol: "🟢",
        container:
          "border-emerald-200 bg-emerald-50 text-emerald-900",
        badge:
          "bg-emerald-100 text-emerald-800",
      };

    case "good":
      return {
        symbol: "🟢",
        container:
          "border-green-200 bg-green-50 text-green-900",
        badge:
          "bg-green-100 text-green-800",
      };

    case "average":
      return {
        symbol: "🟡",
        container:
          "border-amber-200 bg-amber-50 text-amber-900",
        badge:
          "bg-amber-100 text-amber-800",
      };

    case "low":
      return {
        symbol: "🔴",
        container:
          "border-red-200 bg-red-50 text-red-900",
        badge:
          "bg-red-100 text-red-800",
      };

    default:
      return {
        symbol: "⚪",
        container:
          "border-gray-200 bg-gray-50 text-gray-900",
        badge:
          "bg-gray-100 text-gray-700",
      };
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

function formatWholeNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return Math.round(number).toLocaleString();
}

export default PredictionResult;