"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface YieldTrendPoint {
  period: string;
  yieldKgPerHa: number;
}

interface YieldTrendChartProps {
  data: YieldTrendPoint[];
  title?: string;
}

export default function YieldTrendChart({
  data,
  title = "Historical Yield Trend",
}: YieldTrendChartProps) {
  const hasData = data && data.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-green-700 mb-4">{title}</h3>

      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          No historical yield data yet. Submit a prediction to start building your trend.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="period" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{
                value: "kg/ha",
                angle: -90,
                position: "insideLeft",
                dy: 40,
                style: { fontSize: 12 },
              }}
            />
            <Tooltip
              formatter={(value) => {
                const val = typeof value === "number" ? value : Number(value);
                return [`${val.toLocaleString()} kg/ha`, "Yield"];
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="yieldKgPerHa"
              name="Yield"
              stroke="#15803d"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}