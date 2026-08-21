import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sprout } from "lucide-react";


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


function CropAnalyticsChart({ crops = [] }) {
  const chartData = crops.map((item) => ({
    crop: item.crop || "Unknown",
    predictions: Number(item.prediction_count || 0),
    averageYield: Number(item.average_yield || 0),
  }));

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <Sprout className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Crop Analytics
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Prediction volume and average yield by crop.
              </p>
            </div>
          </div>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Top {chartData.length}
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <Sprout className="h-10 w-10 text-slate-300" />

          <p className="mt-4 font-semibold text-slate-700">
            No crop analytics available
          </p>

          <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
            Crop statistics will appear after yield predictions
            have been generated.
          </p>
        </div>
      ) : (
        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -15,
                bottom: 15,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="crop"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={65}
                tick={{
                  fontSize: 12,
                }}
              />

              <YAxis
                yAxisId="left"
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 12,
                }}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 12,
                }}
              />

              <Tooltip
                cursor={{
                  fill: "rgba(15, 23, 42, 0.04)",
                }}
                formatter={(value, name) => {
                  if (name === "Average Yield") {
                    return [
                      `${formatYield(value)} t/ha`,
                      name,
                    ];
                  }

                  return [
                    Number(value).toLocaleString("en-IN"),
                    name,
                  ];
                }}
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  boxShadow:
                    "0 10px 30px rgba(15, 23, 42, 0.08)",
                }}
              />

              <Legend
                wrapperStyle={{
                  fontSize: "12px",
                  paddingTop: "10px",
                }}
              />

              <Bar
                yAxisId="left"
                dataKey="predictions"
                name="Predictions"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                maxBarSize={44}
              />

              <Bar
                yAxisId="right"
                dataKey="averageYield"
                name="Average Yield"
                fill="#0ea5e9"
                radius={[8, 8, 0, 0]}
                maxBarSize={44}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default CropAnalyticsChart;