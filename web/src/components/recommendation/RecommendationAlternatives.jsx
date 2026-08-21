import {
  BarChart3,
  Layers3,
  Sprout,
  Wheat,
} from "lucide-react";

function formatNumber(value, digits = 2) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toFixed(digits);
}

function RecommendationAlternatives({
  alternatives = [],
  yieldUnit = "metric tons per hectare",
  productionUnit = "metric tons",
}) {
  if (!Array.isArray(alternatives) || alternatives.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gray-200 p-2 text-gray-600">
            <Layers3 size={20} />
          </div>

          <div>
            <h3 className="font-bold text-gray-900">
              Alternative Crops
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              No additional crop alternatives were returned.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
          <Layers3 size={24} />
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Alternative Crop Options
          </h3>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            Other suitable crops ranked by predicted yield,
            historical performance, and available records.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {alternatives.map((alternative, index) => (
          <article
            key={`${alternative.crop ?? "crop"}-${index}`}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-green-200 hover:bg-green-50/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <Sprout size={21} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Rank #{index + 2}
                  </p>

                  <h4 className="mt-1 text-lg font-bold text-gray-900">
                    {alternative.crop ??
                      alternative.crop_name ??
                      "Crop option"}
                  </h4>
                </div>
              </div>

              <div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm">
                <p className="text-xs text-gray-500">
                  Score
                </p>

                <p className="text-lg font-bold text-green-700">
                  {formatNumber(
                    alternative.recommendation_score ??
                      alternative.score
                  )}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Wheat size={16} />
                  Predicted Yield
                </div>

                <p className="mt-2 font-bold text-gray-900">
                  {formatNumber(
                    alternative.predicted_yield
                  )}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {yieldUnit}
                </p>
              </div>

              <div className="rounded-xl bg-white p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <BarChart3 size={16} />
                  Production
                </div>

                <p className="mt-2 font-bold text-gray-900">
                  {formatNumber(
                    alternative.estimated_production
                  )}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {productionUnit}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                <p className="text-xs text-gray-500">
                  Historical Average
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {formatNumber(
                    alternative.historical_average_yield
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                <p className="text-xs text-gray-500">
                  Historical Records
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {alternative.historical_record_count ?? 0}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default RecommendationAlternatives;