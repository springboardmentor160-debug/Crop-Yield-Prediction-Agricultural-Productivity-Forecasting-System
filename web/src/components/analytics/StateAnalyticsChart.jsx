import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MapPinned } from "lucide-react";


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


function StateAnalyticsChart({ states = [] }) {
  const chartData = states.map((item) => ({
    state: item.state || "Unknown",
    predictions: Number(item.prediction_count || 0),
    averageYield: Number(item.average_yield || 0),
  }));

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
            <MapPinned className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              State Analytics
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Compare prediction activity and yield across
              states.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Top {chartData.length}
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <MapPinned className="h-10 w-10 text-slate-300" />

          <p className="mt-4 font-semibold text-slate-700">
            No state analytics available
          </p>

          <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
            State-wise insights will appear after prediction
            records are generated.
          </p>
        </div>
      ) : (
        <div className="mt-6">
            <div className="h-72 w-full">
                <ResponsiveContainer
                width="100%"
                height="100%"
                >
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{
                    top: 5,
                    right: 35,
                    left: 20,
                    bottom: 5,
                    }}
                >
                    <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    />

                    <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    domain={[0, "dataMax"]}
                    tick={{
                        fontSize: 12,
                    }}
                    />

                    <YAxis
                    type="category"
                    dataKey="state"
                    width={95}
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
                    formatter={(value, name, item) => {
                        if (name === "Predictions") {
                        return [
                            Number(value).toLocaleString(
                            "en-IN"
                            ),
                            name,
                        ];
                        }

                        return [
                        `${formatYield(
                            item?.payload?.averageYield
                        )} t/ha`,
                        "Average Yield",
                        ];
                    }}
                    contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid #e2e8f0",
                        boxShadow:
                        "0 10px 30px rgba(15, 23, 42, 0.08)",
                    }}
                    />

                    <Bar
                    dataKey="predictions"
                    name="Predictions"
                    fill="#0ea5e9"
                    radius={[0, 8, 8, 0]}
                    maxBarSize={32}
                    />
                </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {chartData.slice(0, 5).map((item) => (
                <div
                    key={item.state}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-3"
                >
                    <div>
                    <p className="text-xs font-semibold text-slate-700">
                        {item.state}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        Average yield
                    </p>
                    </div>

                    <p className="text-sm font-bold text-sky-700">
                    {formatYield(item.averageYield)} t/ha
                    </p>
                </div>
                ))}
            </div>
            </div>
      )}
    </section>
  );
}

export default StateAnalyticsChart;