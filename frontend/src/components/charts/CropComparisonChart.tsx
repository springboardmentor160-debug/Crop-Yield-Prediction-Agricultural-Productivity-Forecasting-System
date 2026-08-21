/**
 * YieldSense AI  -  Crop Comparison Bar Chart
 */

"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { CropYieldPoint } from "@/types/analytics";

interface Props {
  data: CropYieldPoint[];
  height?: number;
}

const COLORS = [
  "#16a34a", "#2563eb", "#d97706", "#dc2626", "#7c3aed",
  "#0891b2", "#65a30d", "#c026d3", "#ea580c", "#0d9488",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload as CropYieldPoint;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">{d.crop}</p>
        <p className="text-green-600">
          Avg Yield: <span className="font-bold">{d.avg_yield.toFixed(3)} t/ha</span>
        </p>
        <p className="text-gray-500">Predictions: {d.count}</p>
        <p className="text-gray-400 text-xs">Total: {d.total_production.toLocaleString()} t</p>
      </div>
    );
  }
  return null;
};

export default function CropComparisonChart({ data, height = 280 }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm">
        No crop data available yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} vertical={false} />
        <XAxis
          dataKey="crop"
          tick={{ fontSize: 10, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          angle={-30}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          unit=" t/ha"
          width={65}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Bar dataKey="avg_yield" radius={[6, 6, 0, 0]} maxBarSize={50}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
