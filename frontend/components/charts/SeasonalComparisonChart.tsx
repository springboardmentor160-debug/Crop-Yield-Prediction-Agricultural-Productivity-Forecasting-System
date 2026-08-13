"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

interface SeasonalComparisonPoint {
  label: string;
  yieldKgPerHa: number;
}

interface SeasonalComparisonChartProps {
  data: SeasonalComparisonPoint[];
  title?: string;
}

const BAR_COLORS = ["#15803d", "#65a30d", "#0d9488", "#84cc16", "#166534", "#4d7c0f"];

export default function SeasonalComparisonChart({
  data,
  title = "Seasonal / Crop Comparison",
}: SeasonalComparisonChartProps) {
  const hasData = data.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-green-700 mb-4">{title}</h3>

      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          No comparison data yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
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
            <Bar dataKey="yieldKgPerHa" radius={[6, 6, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}