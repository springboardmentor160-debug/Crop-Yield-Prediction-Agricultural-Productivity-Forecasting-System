/**
 * YieldSense AI  -  Farm Comparison Horizontal Bar Chart
 *
 * Displays average yield per farm as a horizontal bar chart,
 * sorted highest to lowest.
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
  LabelList,
} from "recharts";
import type { FarmYieldPoint } from "@/types/analytics";

interface Props {
  data: FarmYieldPoint[];
  height?: number;
}

const FARM_COLORS = [
  "#16a34a", "#2563eb", "#d97706", "#dc2626", "#7c3aed",
  "#0891b2", "#65a30d", "#c026d3", "#ea580c", "#0d9488",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload as FarmYieldPoint;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-semibold text-gray-900 dark:text-white mb-1 truncate max-w-[200px]">{d.farm_name}</p>
        <p className="text-green-600">
          Avg Yield: <span className="font-bold">{d.avg_yield.toFixed(3)} t/ha</span>
        </p>
        <p className="text-gray-500">Predictions: {d.count}</p>
        <p className="text-gray-400 text-xs">Total Production: {d.total_production.toLocaleString()} t</p>
      </div>
    );
  }
  return null;
};

const CustomYAxisTick = ({ x, y, payload }: any) => {
  const label: string = payload.value;
  const maxLen = 14;
  const display = label.length > maxLen ? label.slice(0, maxLen) + "…" : label;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#9ca3af" fontSize={11}>
        {display}
      </text>
    </g>
  );
};

export default function FarmComparisonChart({ data, height = 280 }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm">
        No farm data available yet. Link farms when making predictions.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(height, data.length * 48 + 20)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          unit=" t/ha"
        />
        <YAxis
          type="category"
          dataKey="farm_name"
          width={110}
          tick={<CustomYAxisTick />}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Bar dataKey="avg_yield" radius={[0, 6, 6, 0]} maxBarSize={32}>
          <LabelList
            dataKey="avg_yield"
            position="right"
            formatter={(v: unknown) => `${(v as number).toFixed(2)}`}
            style={{ fontSize: 10, fill: "#6b7280" }}
          />
          {data.map((_, i) => (
            <Cell key={i} fill={FARM_COLORS[i % FARM_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
