/**
 * YieldSense AI  -  Yield Trend Line Chart
 */

"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { YieldTrendPoint } from "@/types/analytics";

interface Props {
  data: YieldTrendPoint[];
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload as YieldTrendPoint;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
        <p className="text-green-600">
          Yield: <span className="font-bold">{d.predicted_yield.toFixed(3)} t/ha</span>
        </p>
        <p className="text-gray-500">{d.crop} · {d.season}</p>
        <p className="text-gray-400 text-xs">Area: {d.area.toLocaleString()} ha</p>
      </div>
    );
  }
  return null;
};

export default function YieldTrendChart({ data, height = 280 }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm">
        No prediction data yet. Make your first prediction to see yield trends.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v.toFixed(1)}`}
          unit=" t/ha"
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="predicted_yield"
          stroke="#16a34a"
          strokeWidth={2.5}
          dot={{ fill: "#16a34a", r: 4, strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 6, fill: "#16a34a", stroke: "#fff", strokeWidth: 2 }}
          name="Predicted Yield"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
