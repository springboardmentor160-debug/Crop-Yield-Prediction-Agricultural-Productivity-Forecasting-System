"use client";

import { useState } from "react";

type Risk = "Low" | "Medium" | "High";

interface RiskItem {
  type: string;
  severity: string;
  advice: string;
}

interface RecommendationResult {
  crop: string;
  overall_risk_level: Risk;
  identified_risks: RiskItem[];
  actionable_recommendations: string[];
  best_practice_tips: string[];
}

export default function AnalyticsPage() {
  const [result, setResult] =
    useState<RecommendationResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getRecommendations() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/analytics/recommendations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            crop_type: "Rice",
            avg_temp: 28,
            rainfall: 700,
            soil_ph: 6.8,
            nitrogen: 70,
            phosphorus: 60,
            potassium: 60,
            predicted_yield: 1000,
            avg_yield: 1000,
            rainfall_deviation: 0,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate recommendations");
      }

      const data = await response.json();

      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load recommendations.");
    } finally {
      setLoading(false);
    }
  }

  const riskColor = {
    Low: "green",
    Medium: "orange",
    High: "red",
  };

  return (
    <div
      style={{
        padding: "40px",
        background: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: "#2E7D32" }}>
        🌾 AI Recommendation Dashboard
      </h1>

      <p>
        Generate crop recommendations and risk assessment.
      </p>

      <button
        onClick={getRecommendations}
        disabled={loading}
        style={{
          padding: "12px 25px",
          background: "#2E7D32",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        {loading
          ? "Generating..."
          : "Generate Recommendation"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "20px" }}>
          {error}
        </p>
      )}

      {result && (
        <div
          style={{
            marginTop: "30px",
            padding: "25px",
            background: "white",
            borderRadius: "15px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          {/* Risk */}
          <h2>⚠️ Overall Risk</h2>

          <h2
            style={{
              color: riskColor[result.overall_risk_level],
            }}
          >
            {result.overall_risk_level}
          </h2>

          {/* Recommendations */}
          <h2>💡 Recommendations</h2>

          <ul>
            {result.actionable_recommendations.map(
              (item, index) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>

          {/* Risk Alerts */}
          <h2>🚨 Risk Alerts</h2>

          {result.identified_risks.length === 0 ? (
            <p>No risk alerts detected.</p>
          ) : (
            <ul>
              {result.identified_risks.map(
                (risk, index) => (
                  <li key={index}>
                    <strong>
                      {risk.type} - {risk.severity}
                    </strong>
                    : {risk.advice}
                  </li>
                )
              )}
            </ul>
          )}

          {/* Best Practices */}
          <h2>🌱 Best Practices</h2>

          <ul>
            {result.best_practice_tips.map(
              (tip, index) => (
                <li key={index}>{tip}</li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}