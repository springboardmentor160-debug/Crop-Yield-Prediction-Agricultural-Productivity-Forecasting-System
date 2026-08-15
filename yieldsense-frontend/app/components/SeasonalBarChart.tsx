"use client";

import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type CropData = {
  crop: string;
  yield: number;
};

export default function SeasonalBarChart() {
  const [data, setData] = useState<CropData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/dashboard/summary")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load crop comparison data");
        }

        return response.json();
      })
      .then((result) => {
        setData(result.crop_comparison || []);
      })
      .catch((error) => {
        console.error("Crop comparison error:", error);
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
        📊 Seasonal Crop Comparison
      </h2>

      {loading ? (
        <p>Loading comparison data...</p>
      ) : data.length === 0 ? (
        <p>Not enough data yet for crop comparison.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="crop" />
            <YAxis />
            <Tooltip />

            <Bar
              dataKey="yield"
              fill="#4CAF50"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}