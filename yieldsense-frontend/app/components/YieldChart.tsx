"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { crop: "Rice", yield: 66921 },
  { crop: "Wheat", yield: 52000 },
  { crop: "Maize", yield: 47000 },
  { crop: "Cotton", yield: 39000 },
];

export default function YieldChart() {
  return (
    <div
      style={{
        width: "100%",
        height: 400,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="crop" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="yield"
            fill="#4CAF50"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}