import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Sprout,
  Tractor,
} from "lucide-react";

function formatNumber(value, digits = 2) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toFixed(digits);
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStrengthClasses(strength) {
  const normalized = String(strength ?? "").toLowerCase();

  if (
    normalized === "high" ||
    normalized === "strong"
  ) {
    return "bg-green-100 text-green-800";
  }

  if (
    normalized === "medium" ||
    normalized === "moderate"
  ) {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-gray-100 text-gray-700";
}

function RecommendationHistoryTable({
  recommendations = [],
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                Farm
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                Recommended Crop
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                Year & Season
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                Score
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                Predicted Yield
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                Created
              </th>

              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {recommendations.map((item) => (
              <tr
                key={item.id}
                className="transition hover:bg-green-50/60"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gray-100 p-2 text-gray-600">
                      <Tractor size={18} />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.farm_name ??
                          `Farm #${item.farm_id}`}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {item.state ?? "State unavailable"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Sprout
                      size={18}
                      className="text-green-700"
                    />

                    <div>
                      <p className="font-bold text-green-800">
                        {item.recommended_crop ?? "—"}
                      </p>

                      <span
                        className={[
                          "mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize",
                          getStrengthClasses(
                            item.recommendation_strength
                          ),
                        ].join(" ")}
                      >
                        {item.recommendation_strength ??
                          "Unknown"}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CalendarDays
                      size={17}
                      className="text-gray-500"
                    />

                    <span>
                      {item.crop_year ?? "—"} ·{" "}
                      {item.season ?? "—"}
                    </span>
                  </div>
                </td>

                <td className="whitespace-nowrap px-6 py-4">
                  <p className="font-bold text-gray-900">
                    {formatNumber(
                      item.recommendation_score
                    )}
                  </p>
                </td>

                <td className="whitespace-nowrap px-6 py-4">
                  <p className="font-semibold text-gray-900">
                    {formatNumber(item.predicted_yield)}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {item.prediction_unit ??
                      "metric tons per hectare"}
                  </p>
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {formatDate(item.created_at)}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <Link
                    to={`/recommendations/${item.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-green-200 px-4 py-2 text-sm font-semibold text-green-700 transition hover:border-green-700 hover:bg-green-50"
                  >
                    View
                    <ArrowRight size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecommendationHistoryTable;