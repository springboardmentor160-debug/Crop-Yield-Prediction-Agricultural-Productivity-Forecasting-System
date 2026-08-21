import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CalendarRange } from "lucide-react";


const CHART_COLORS = [
  "#10b981",
  "#0ea5e9",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
];


function formatYield(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.00";
  }

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}


function SeasonAnalyticsChart({ seasons = [] }) {
  const chartData = seasons.map((item) => ({
    name: item.season || "Unknown",
    value: Number(item.prediction_count || 0),
    averageYield: Number(item.average_yield || 0),
  }));

  const totalPredictions = chartData.reduce(
    (total, item) => total + item.value,
    0
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <CalendarRange className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Season Analytics
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Prediction distribution across farming seasons.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {totalPredictions.toLocaleString("en-IN")} total
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <CalendarRange className="h-10 w-10 text-slate-300" />

          <p className="mt-4 font-semibold text-slate-700">
            No season analytics available
          </p>

          <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
            Seasonal distribution will appear after prediction
            records are available.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {chartData.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={
                        CHART_COLORS[
                          index % CHART_COLORS.length
                        ]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, name, item) => [
                    `${Number(value).toLocaleString(
                      "en-IN"
                    )} predictions`,
                    `${name} · ${formatYield(
                      item?.payload?.averageYield
                    )} t/ha`,
                  ]}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow:
                      "0 10px 30px rgba(15, 23, 42, 0.08)",
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {chartData.map((item, index) => {
              const percentage =
                totalPredictions > 0
                  ? (
                      (item.value / totalPredictions) *
                      100
                    ).toFixed(1)
                  : "0.0";

              return (
                <div
                  key={item.name}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            CHART_COLORS[
                              index % CHART_COLORS.length
                            ],
                        }}
                      />

                      <p className="truncate text-sm font-semibold text-slate-800">
                        {item.name}
                      </p>
                    </div>

                    <span className="text-sm font-bold text-slate-900">
                      {percentage}%
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {item.value.toLocaleString("en-IN")} predictions
                    </span>

                    <span>
                      {formatYield(item.averageYield)} t/ha
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default SeasonAnalyticsChart;