"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Recommendations() {
  const [result, setResult] = useState<any>(null);

  async function getRecommendations() {
    const response = await fetch(
      "http://127.0.0.1:8000/api/v1/analytics/recommendations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          crop_type: "Rice",
          avg_temp: 36,
          rainfall: 250,
          soil_ph: 5.5,
          nitrogen: 30,
          phosphorus: 20,
          potassium: 25,
        }),
      }
    );

    const data = await response.json();
    setResult(data);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6f9" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "35px", marginLeft: "250px" }}>
        <h1 style={{ color: "#2E7D32", marginBottom: "25px" }}>
          🌾 AI Recommendations
        </h1>

        <button
          onClick={getRecommendations}
          style={{
            padding: "12px 20px",
            background: "#2E7D32",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "30px",
          }}
        >
          Generate Recommendations
        </button>

        {result && (
          <>
            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              <h2>🚨 Risk Level</h2>
              <h3 style={{ color: "red" }}>
                {result.overall_risk_level}
              </h3>
            </div>

            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              <h2>⚠ Identified Risks</h2>

              {result.identified_risks.map((risk: any, index: number) => (
                <div key={index}>
                  <b>{risk.type}</b>
                  <p>{risk.advice}</p>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "10px",
              }}
            >
              <h2>💡 Recommendations</h2>

              <ul>
                {result.actionable_recommendations.map(
                  (item: string, index: number) => (
                    <li key={index}>{item}</li>
                  )
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}