"use client";

import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import YieldTrendChart from "../components/YieldTrendChart";
import SeasonalBarChart from "../components/SeasonalBarChart";
import RiskCard from "../components/RiskCard";
import RecommendationCard from "../components/RecommendationCard";
import DownloadReportButton from "../components/DownloadReportButton";

export default function DashboardPage() {
  const [productivityScore, setProductivityScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const recommendations = [
    "Apply agricultural lime to improve soil pH.",
    "Increase nitrogen fertilizer.",
    "Use drip irrigation.",
    "Monitor weather updates.",
  ];

  useEffect(() => {
    fetch("http://127.0.0.1:8000/dashboard/summary")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load dashboard data");
        }
        return response.json();
      })
      .then((data) => {
        setProductivityScore(data.productivity_score);
        setMessage(data.message);
      })
      .catch((error) => {
        console.error(error);
        setMessage("Unable to load dashboard data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Sidebar />

      <main
        style={{
          marginLeft: "240px",
          padding: "30px",
          minHeight: "100vh",
          background: "#f5f7fa",
          boxSizing: "border-box",
        }}
      >
        <h1 style={{ color: "#2E7D32" }}>
          🌾 YieldSense AI Dashboard
        </h1>

        <p style={{ color: "#666", marginBottom: "20px" }}>
          Welcome to your analytics dashboard.
        </p>

        <DownloadReportButton />

        {/* Productivity Score */}
        <div
          style={{
            background: "#ffffff",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#2E7D32" }}>
            📊 Productivity Score
          </h2>

          {loading ? (
            <p>Loading productivity score...</p>
          ) : productivityScore !== null ? (
            <>
              <div
                style={{
                  fontSize: "42px",
                  fontWeight: "bold",
                  color: "#2E7D32",
                  marginTop: "10px",
                }}
              >
                {productivityScore}%
              </div>

              <p style={{ color: "#555" }}>
                {productivityScore >= 100
                  ? "Good Performance"
                  : "Needs Improvement"}
              </p>
            </>
          ) : (
            <p>Not enough data yet.</p>
          )}
        </div>

        {/* Loading / API message */}
        {!loading && message && (
          <p style={{ color: "#666", marginTop: "15px" }}>
            {message}
          </p>
        )}

        <div style={{ marginTop: "20px" }}>
          <YieldTrendChart />
        </div>

        <div style={{ marginTop: "20px" }}>
          <SeasonalBarChart />
        </div>

        <div style={{ marginTop: "20px" }}>
          <RiskCard level="High" />
        </div>

        <div style={{ marginTop: "20px" }}>
          <RecommendationCard recommendations={recommendations} />
        </div>
      </main>
    </>
  );
}