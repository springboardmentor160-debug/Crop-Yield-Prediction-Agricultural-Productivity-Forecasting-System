"use client";

import { useEffect, useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  LineController,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  LineController,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [farm, setFarm] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [seasonData, setSeasonData] = useState<any[]>([]);

  // ================= LOAD DATA =================

  useEffect(() => {
    async function loadData() {
      try {
        const [
          dashboardRes,
          farmRes,
          historyRes,
          seasonRes,
        ] = await Promise.all([
          fetch("http://127.0.0.1:8000/dashboard"),
          fetch("http://127.0.0.1:8000/farm"),
          fetch("http://127.0.0.1:8000/analytics/history"),
          fetch("http://127.0.0.1:8000/analytics/season"),
        ]);

        const dashboardData = await dashboardRes.json();
        const farmData = await farmRes.json();
        const historyData = await historyRes.json();
        const seasonDataResponse = await seasonRes.json();

        setData(dashboardData);
        setFarm(farmData);
        setHistory(historyData);
        setSeasonData(seasonDataResponse);
      } catch (err) {
        console.error("Analytics loading error:", err);
      }
    }

    loadData();
  }, []);

  // ================= LOADING =================

  if (!data || !farm) {
    return <h2 style={{ padding: "40px" }}>Loading...</h2>;
  }

  const p = data.latest_prediction;

  // =========================================================
  // WEATHER CHART
  // =========================================================

  const weatherChart = {
    labels: ["Temperature", "Humidity", "Rainfall"],

    datasets: [
      {
        label: "Current Weather",

        data: [
          Number(p.temperature),
          Number(p.humidity),
          Number(p.rainfall),
        ],

        backgroundColor: [
          "#22c55e",
          "#3b82f6",
          "#f59e0b",
        ],

        borderRadius: 8,
      },
    ],
  };

  // Weather has completely different values from yield.
  // Therefore it needs its own Y-axis.

  const weatherChartOptions = {
    responsive: true,

    scales: {
      y: {
        beginAtZero: true,

        max: 100,

        ticks: {
          stepSize: 10,
        },
      },
    },

    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  // =========================================================
  // YIELD TREND
  // =========================================================

  // Remove the old/outlier prediction above 20,000 kg/ha.
  // This removes the old ~83,000 value from the graph.

  const validHistory = history.filter(
    (x: any) =>
      Number(x.estimated_yield) > 0 &&
      Number(x.estimated_yield) <= 20000
  );

  const yieldChart = {
    labels: validHistory.map((x: any) => {
      const date = new Date(x.prediction_time);

      if (isNaN(date.getTime())) {
        return "Prediction";
      }

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
    }),

    datasets: [
      {
        label: "Estimated Yield (kg/ha)",

        data: validHistory.map((x: any) =>
          Number(x.estimated_yield)
        ),

        borderColor: "#16a34a",

        backgroundColor: "#16a34a",

        tension: 0.4,

        pointRadius: 4,

        pointHoverRadius: 6,
      },
    ],
  };

  // Yield gets its own 0–20,000 scale.

  const yieldChartOptions = {
    responsive: true,

    scales: {
      y: {
        beginAtZero: true,

        max: 20000,

        ticks: {
          stepSize: 2000,
        },
      },
    },

    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  // =========================================================
  // SEASONAL PERFORMANCE
  // =========================================================

  const validSeasons = seasonData.filter(
    (item: any) =>
      item.season &&
      item.season.toLowerCase() !== "unknown"
  );

  const seasonChart = {
    labels: validSeasons.map(
      (item: any) => item.season
    ),

    datasets: [
      {
        label: "Average Yield",

        data: validSeasons.map(
          (item: any) => Number(item.yield)
        ),

        backgroundColor: "#8b5cf6",

        borderRadius: 8,
      },
    ],
  };

  // Find a suitable maximum for seasonal data.

  const maximumSeasonYield =
    validSeasons.length > 0
      ? Math.max(
          ...validSeasons.map(
            (item: any) => Number(item.yield)
          )
        )
      : 20000;

  const seasonChartMax =
    Math.ceil(maximumSeasonYield / 20000) * 20000;

  const seasonChartOptions = {
    responsive: true,

    scales: {
      y: {
        beginAtZero: true,

        max:
          seasonChartMax > 0
            ? seasonChartMax
            : 20000,

        ticks: {
          stepSize: 20000,
        },
      },
    },

    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="page">

      <h1>📊 Analytics Dashboard</h1>

      {/* =====================================================
          DASHBOARD CARDS
      ===================================================== */}

      <div className="dash-grid">

        {/* Predicted Yield */}

        <div className="dash-card">

          <h2>🌾 Predicted Yield</h2>

          <h3>
            {p.estimated_yield} kg/ha
          </h3>

          <span
            style={{
              background:
                p.yield_potential === "High"
                  ? "#16a34a"
                  : p.yield_potential === "Moderate"
                  ? "#f59e0b"
                  : "#dc2626",

              color: "#fff",

              padding: "5px 15px",

              borderRadius: "18px",

              fontWeight: "bold",
            }}
          >
            {p.yield_potential}
          </span>

        </div>


        {/* Farm Statistics */}

        <div className="dash-card">

          <h2>📊 Farm Statistics</h2>

          <h3>
            {data.total_farms}
          </h3>

          <p>
            Total Registered Farms
          </p>

        </div>


        {/* Current Season */}

        <div className="dash-card">

          <h2>🍂 Current Season</h2>

          <h3>
            {farm.season}
          </h3>

          <p>
            Active Farming Season
          </p>

        </div>


        {/* Crop Records */}

        <div className="dash-card">

          <h2>🚜 Crop Records</h2>

          <h3>
            {data.crops_added} Records
          </h3>

          <p>
            Registered Crop Records
          </p>

        </div>

      </div>


      {/* =====================================================
          WEATHER ANALYSIS
      ===================================================== */}

      <div
        className="card"
        style={{
          marginTop: "30px",
          padding: "25px",
        }}
      >

        <h2>
          🌦 Current Weather Analysis
        </h2>

        <Bar
          data={weatherChart}
          options={weatherChartOptions}
        />

      </div>


      {/* =====================================================
          YIELD TREND
      ===================================================== */}

      <div
        className="card"
        style={{
          marginTop: "30px",
          padding: "25px",
        }}
      >

        <h2>
          📈 Yield Trend Analysis
        </h2>

        {validHistory.length > 0 ? (
          <Line
            data={yieldChart}
            options={yieldChartOptions}
          />
        ) : (
          <p>
            No valid yield prediction history available.
          </p>
        )}

      </div>


      {/* =====================================================
          SEASONAL PERFORMANCE
      ===================================================== */}

      {validSeasons.length > 0 && (

        <div
          className="card"
          style={{
            marginTop: 30,
            padding: 25,
          }}
        >

          <h2>
            🍂 Seasonal Performance
          </h2>

          <Bar
            data={seasonChart}
            options={seasonChartOptions}
          />

        </div>

      )}


      {/* =====================================================
          FARM PERFORMANCE SUMMARY
      ===================================================== */}

      <div
        className="card"
        style={{
          marginTop: "30px",
          padding: "25px",
        }}
      >

        <h2>
          📋 Farm Performance Summary
        </h2>

        <br />

        <p>
          <strong>
            Estimated Yield :
          </strong>{" "}
          {p.estimated_yield} kg/ha
        </p>

        <p>
          <strong>
            Yield Potential :
          </strong>{" "}
          {p.yield_potential}
        </p>

        <p>
          <strong>
            Crop :
          </strong>{" "}
          {farm.crop_type}
        </p>

        <p>
          <strong>
            Season :
          </strong>{" "}
          {farm.season}
        </p>

        <p>
          <strong>
            Temperature :
          </strong>{" "}
          {p.temperature} °C
        </p>

        <p>
          <strong>
            Humidity :
          </strong>{" "}
          {p.humidity}%
        </p>

        <p>
          <strong>
            Rainfall :
          </strong>{" "}
          {p.rainfall} mm
        </p>

        <p>
          <strong>
            Weather Status :
          </strong>{" "}
          {p.weather_status}
        </p>

        <br />

        <p
          style={{
            color: "#777",
            fontStyle: "italic",
          }}
        >
          Last Updated :{" "}
          {new Date().toLocaleString()}
        </p>

      </div>

    </div>
  );
}