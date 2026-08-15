"use client";

import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type YieldData = {
  year: string;
  yield: number;
};

export default function YieldTrendChart() {
  const [data, setData] = useState<YieldData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/dashboard/summary")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load yield data");
        }

        return response.json();
      })
      .then((result) => {
        setData(result.yield_trend || []);
      })
      .catch((error) => {
        console.error("Yield trend error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "20px",
        borderRadius: "15px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        marginBottom: "20px",
      }}
    >
      <h2 style={{ color: "#2E7D32", marginBottom: "20px" }}>
        📈 Yield Trend Analysis
      </h2>

      {loading ? (
        <p>Loading yield data...</p>
      ) : data.length === 0 ? (
        <p>Not enough data yet to display the yield trend.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="yield"
              stroke="#2E7D32"
              strokeWidth={4}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}