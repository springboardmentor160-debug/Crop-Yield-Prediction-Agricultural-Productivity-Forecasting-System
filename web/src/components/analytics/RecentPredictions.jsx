import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Sprout,
} from "lucide-react";
import { Link } from "react-router-dom";


function formatNumber(value, decimals = 2) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return Number(0).toFixed(decimals);
  }

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}


function RecentPredictions({
  predictions = [],
}) {
    const recentPredictions = predictions.slice(0, 3);
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <Clock3 className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent Predictions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest yield prediction activity.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {recentPredictions.length} records
        </span>
      </div>

      {recentPredictions.length === 0 ? (
        <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <Sprout className="h-10 w-10 text-slate-300" />

          <p className="mt-4 font-semibold text-slate-700">
            No recent predictions
          </p>

          <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
            Newly generated prediction records will appear
            here.
          </p>

          <Link
            to="/predictions"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Generate Prediction
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {recentPredictions.map((prediction) => (
            <article
              key={prediction.id}
              className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                      <Sprout className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {prediction.farm_name ||
                          "Unknown Farm"}
                      </p>

                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {prediction.crop || "Unknown Crop"}
                        {" · "}
                        {prediction.season ||
                          "Unknown Season"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {prediction.crop_year || "—"}
                    </span>

                    <span>
                      Yield:{" "}
                      <strong className="text-slate-700">
                        {formatNumber(
                          prediction.predicted_yield
                        )}{" "}
                        t/ha
                      </strong>
                    </span>

                    <span>
                      Production:{" "}
                      <strong className="text-slate-700">
                        {formatNumber(
                          prediction.estimated_production
                        )}{" "}
                        t
                      </strong>
                    </span>
                  </div>
                </div>

                <Link
                  to={`/predictions/${prediction.id}`}
                  className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                >
                  View Details
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentPredictions;