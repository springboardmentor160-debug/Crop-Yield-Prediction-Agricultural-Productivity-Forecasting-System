"use client";

import { useEffect, useState } from "react";
import DownloadReport from "@/components/DownloadReport";

export default function RecommendationPage() {

  const [dashboard, setDashboard] = useState<any>(null);
  const [farm, setFarm] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {

    async function loadRecommendation() {

      try {

        // -----------------------------
        // GET DASHBOARD DATA
        // -----------------------------

        const dashboardRes = await fetch(
          "http://127.0.0.1:8000/dashboard"
        );

        if (!dashboardRes.ok) {
          throw new Error("Failed to load dashboard");
        }

        const dashboardData = await dashboardRes.json();

        setDashboard(dashboardData);

        // -----------------------------
        // GET FARM DATA
        // -----------------------------

        const farmRes = await fetch(
          "http://127.0.0.1:8000/farm"
        );

        if (!farmRes.ok) {
          throw new Error("Failed to load farm data");
        }

        const farmData = await farmRes.json();

        setFarm(farmData);

        // -----------------------------
        // GET LATEST PREDICTION
        // -----------------------------

        const prediction =
          dashboardData.latest_prediction;

        if (!prediction) {
          throw new Error(
            "No prediction available. Please make a yield prediction first."
          );
        }

        // -----------------------------
        // RECOMMENDATION API
        // -----------------------------

        const recommendationRes = await fetch(
          "http://127.0.0.1:8000/recommendation",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({

              crop_type:
                farmData.crop_type,

              soil_type:
                farmData.soil_type || "Unknown",

              soil_ph:
                Number(farmData.soil_ph),

              nitrogen:
                Number(farmData.nitrogen),

              phosphorus:
                Number(farmData.phosphorus),

              potassium:
                Number(farmData.potassium),

              rainfall:
                Number(prediction.rainfall),

              temperature:
                Number(prediction.temperature),
            }),
          }
        );

        if (!recommendationRes.ok) {

          const errorText =
            await recommendationRes.text();

          console.error(
            "Recommendation API error:",
            errorText
          );

          throw new Error(
            "Recommendation API failed"
          );
        }

        const recommendationData =
          await recommendationRes.json();

        setRecommendation(
          recommendationData
        );

      } catch (err: any) {

        console.error(err);

        setError(
          err.message ||
          "Unable to load recommendations."
        );
      }
    }

    loadRecommendation();

  }, []);

  // -----------------------------
  // LOADING
  // -----------------------------

  if (!dashboard || !farm || !recommendation) {

    return (
      <div className="page">
        <h2>Loading recommendation...</h2>
      </div>
    );
  }

  // -----------------------------
  // ERROR
  // -----------------------------

  if (error) {

    return (
      <div className="page">

        <h2>
          Unable to load recommendation
        </h2>

        <p>{error}</p>

        <p>
          Please make a yield prediction first
          and try again.
        </p>

      </div>
    );
  }

  // -----------------------------
  // MAIN UI
  // -----------------------------

  return (

    <div className="page">

      <h1>
        💡 AI Recommendation Engine
      </h1>

      <div className="dash-grid">

        {/* =========================
            CROP RECOMMENDATION
        ========================= */}

        <div className="dash-card">

          <h2>
            🌾 Crop Recommendation
          </h2>

          <hr />

          <br />

          <p>
            <b>Current Crop</b>
          </p>

          <p>
            {recommendation?.current_crop}
          </p>

          <br />

          <p>
            <b>Recommended Crop</b>
          </p>

          <p>
            {recommendation?.recommended_crop}
          </p>

          <br />

          <p>
            <b>Crop Rotation</b>
          </p>

          <p>
            {recommendation?.next_crop}
          </p>

        </div>


        {/* =========================
            SOIL & FERTILIZER
        ========================= */}

        <div className="dash-card">

          <h2>
            🧪 Soil & Fertilizer
          </h2>

          <hr />

          <br />

          <p>
            <b>Soil Advice</b>
          </p>

          <p>
            {recommendation?.soil_advice}
          </p>

          <br />

          <p>
            <b>Recommended Fertilizer</b>
          </p>

          <p>
            {recommendation?.recommended_fertilizer}
          </p>

          <br />

          <p>
            <b>Recommendations</b>
          </p>

          {recommendation?.recommendations?.map(
            (item: string, index: number) => (

              <p
                key={index}
                style={{
                  marginBottom: "8px"
                }}
              >
                ✅ {item}
              </p>

            )
          )}

        </div>


        {/* =========================
            RISK ASSESSMENT
        ========================= */}

        <div className="dash-card">

          <h2>
            ⚠ Risk Assessment
          </h2>

          <hr />

          <br />

          <p>
            <b>Overall Risk Level</b>
          </p>

          <span
            style={{
              background:
                recommendation?.risk_level === "High"
                  ? "#dc2626"
                  : recommendation?.risk_level === "Medium"
                  ? "#f59e0b"
                  : "#16a34a",

              color: "#fff",

              padding: "6px 18px",

              borderRadius: "20px",

              fontWeight: "bold",

              display: "inline-block",

              marginBottom: "15px",
            }}
          >

            {recommendation?.risk_level}

          </span>

          <p>
            <b>Detected Risks</b>
          </p>

          {recommendation?.identified_risks?.length === 0 ? (

            <p>
              ✅ No environmental risks detected.
            </p>

          ) : (

            recommendation?.identified_risks?.map(
              (risk: string, index: number) => (

                <p
                  key={index}
                  style={{
                    marginBottom: "10px"
                  }}
                >
                  🚨 {risk}
                </p>

              )
            )

          )}

          <br />

          <p>
            <b>Today's Action</b>
          </p>

          <p>
            {recommendation?.today_action}
          </p>

        </div>


        {/* =========================
            IRRIGATION
        ========================= */}

        <div className="dash-card">

          <h2>
            💧 Irrigation & Farm Management
          </h2>

          <hr />

          <br />

          <p>
            <b>Irrigation Advice</b>
          </p>

          <p>
            {recommendation?.irrigation}
          </p>

          <br />

          <p>
            <b>Weekly Action</b>
          </p>

          <p>
            {recommendation?.weekly_action}
          </p>

          <br />

          <p>
            <b>Best Farming Practices</b>
          </p>

          {recommendation?.best_practices?.map(
            (item: string, index: number) => (

              <p
                key={index}
                style={{
                  marginBottom: "8px"
                }}
              >
                🌱 {item}
              </p>

            )
          )}

        </div>

      </div>


      {/* =========================
          SUMMARY
      ========================= */}

      <div
        className="card"
        style={{
          marginTop: "30px"
        }}
      >

        <h2>
          📋 Recommendation Summary
        </h2>

        <br />

        <p>
          Based on the current farm conditions,{" "}
          <b>{recommendation?.recommended_crop}</b>{" "}
          is identified as the recommended crop. The system
          recommends{" "}
          <b>{recommendation?.recommended_fertilizer}</b>{" "}
          and advises you to{" "}
          <b>
            {recommendation?.irrigation
              ?.replace(/\.+$/, "")
              .replace(/^./, (char: string) => char.toLowerCase())}
          </b>
          . The current overall agricultural risk level is{" "}
          <b>{recommendation?.risk_level}</b>.
        </p>

        <br />

        <DownloadReport
          farm={farm}
          prediction={
            dashboard.latest_prediction
          }
          recommendation={recommendation}
        />

      </div>

    </div>
  );
} 