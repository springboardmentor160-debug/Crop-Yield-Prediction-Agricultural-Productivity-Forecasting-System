import {
  Award,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  MapPin,
  RefreshCcw,
  Sparkles,
  Sprout,
  Tractor,
  Wheat,
} from "lucide-react";

import RecommendationAlternatives from "./RecommendationAlternatives";

function formatNumber(value, digits = 2) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toFixed(digits);
}

function getStrengthClasses(strength) {
  const normalized = String(strength ?? "").toLowerCase();

  if (normalized === "high" || normalized === "strong") {
    return "bg-green-100 text-green-800";
  }

  if (normalized === "medium" || normalized === "moderate") {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-gray-100 text-gray-700";
}

function RecommendationResult({
  recommendation,
  onRecommendAgain,
}) {
  if (!recommendation) {
    return null;
  }

  const units = recommendation.units ?? {};

  const yieldUnit =
    units.yield ??
    units.predicted_yield ??
    recommendation.prediction_unit ??
    "metric tons per hectare";

  const productionUnit =
    units.production ??
    recommendation.production_unit ??
    "metric tons";

  const reasons = Array.isArray(recommendation.reasons)
    ? recommendation.reasons
    : [];

  const alternatives = Array.isArray(
    recommendation.alternatives
  )
    ? recommendation.alternatives
    : [];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-green-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-green-700 via-emerald-700 to-green-800 px-6 py-8 text-white lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white/15 p-4">
                <Award size={34} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-bold uppercase tracking-wide text-green-100">
                    Recommended Crop
                  </p>

                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-bold capitalize",
                      getStrengthClasses(
                        recommendation.recommendation_strength
                      ),
                    ].join(" ")}
                  >
                    {recommendation.recommendation_strength ??
                      "Recommendation"}
                  </span>
                </div>

                <h2 className="mt-2 text-4xl font-extrabold">
                  {recommendation.recommended_crop}
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-green-50">
                  YieldSense AI selected this crop after
                  comparing candidate crops using predicted yield,
                  historical agricultural performance, soil
                  conditions, and weather references.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-5 text-center backdrop-blur-sm">
              <p className="text-sm text-green-100">
                Recommendation Score
              </p>

              <p className="mt-2 text-4xl font-extrabold">
                {formatNumber(
                  recommendation.recommendation_score
                )}
              </p>

              <p className="mt-1 text-xs text-green-100">
                Overall suitability score
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 px-6 py-7 sm:grid-cols-2 xl:grid-cols-4 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
              <Wheat size={18} className="text-green-700" />
              Predicted Yield
            </div>

            <p className="mt-3 text-2xl font-bold text-gray-900">
              {formatNumber(
                recommendation.predicted_yield
              )}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {yieldUnit}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
              <BarChart3
                size={18}
                className="text-green-700"
              />
              Estimated Production
            </div>

            <p className="mt-3 text-2xl font-bold text-gray-900">
              {formatNumber(
                recommendation.estimated_production
              )}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {productionUnit}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
              <Sparkles
                size={18}
                className="text-green-700"
              />
              Historical Average
            </div>

            <p className="mt-3 text-2xl font-bold text-gray-900">
              {formatNumber(
                recommendation.historical_average_yield
              )}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {yieldUnit}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
              <CheckCircle2
                size={18}
                className="text-green-700"
              />
              Historical Records
            </div>

            <p className="mt-3 text-2xl font-bold text-gray-900">
              {recommendation.historical_record_count ?? 0}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Supporting dataset records
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-green-100 p-3 text-green-700">
              <Tractor size={22} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Farm & Season
              </h3>

              <p className="text-sm text-gray-500">
                Inputs used for this recommendation
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
              <Tractor
                size={18}
                className="mt-0.5 text-green-700"
              />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Farm
                </p>

                <p className="mt-1 font-bold text-gray-900">
                  {recommendation.farm_name ??
                    `Farm #${recommendation.farm_id}`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
              <MapPin
                size={18}
                className="mt-0.5 text-green-700"
              />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Location
                </p>

                <p className="mt-1 font-bold text-gray-900">
                  {[
                    recommendation.district,
                    recommendation.state,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
              <CalendarDays
                size={18}
                className="mt-0.5 text-green-700"
              />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Crop Year & Season
                </p>

                <p className="mt-1 font-bold text-gray-900">
                  {recommendation.crop_year ?? "—"} ·{" "}
                  {recommendation.season ?? "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
              <Sprout size={22} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Why This Crop?
              </h3>

              <p className="text-sm text-gray-500">
                Main factors supporting the recommendation
              </p>
            </div>
          </div>

          {reasons.length > 0 ? (
            <div className="mt-5 space-y-3">
              {reasons.map((reason, index) => (
                <div
                  key={`${reason}-${index}`}
                  className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4"
                >
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-blue-700"
                  />

                  <p className="text-sm leading-6 text-blue-900">
                    {typeof reason === "string"
                      ? reason
                      : reason.message ??
                        reason.description ??
                        JSON.stringify(reason)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
              The recommendation was selected using predicted
              yield, historical performance, and dataset support.
            </p>
          )}
        </div>
      </section>

      {recommendation.explanation && (
        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
          <div className="flex items-start gap-3">
            <Sparkles
              size={22}
              className="mt-0.5 shrink-0 text-blue-700"
            />

            <div>
              <h3 className="font-bold text-blue-950">
                AI Explanation
              </h3>

              <p className="mt-2 text-sm leading-7 text-blue-900">
                {recommendation.explanation}
              </p>
            </div>
          </div>
        </section>
      )}

      <RecommendationAlternatives
        alternatives={alternatives}
        yieldUnit={yieldUnit}
        productionUnit={productionUnit}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRecommendAgain}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800"
        >
          <RefreshCcw size={18} />
          Recommend Again
        </button>
      </div>
    </div>
  );
}

export default RecommendationResult;