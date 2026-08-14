"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [farm, setFarm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashboardRes, farmRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/dashboard"),
          fetch("http://127.0.0.1:8000/farm"),
        ]);

        const dashboardData = await dashboardRes.json();
        const farmData = await farmRes.json();

        setDashboard(dashboardData);
        setFarm(farmData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <h2 style={{ padding: "40px" }}>Loading...</h2>;
  }

  const p = dashboard?.latest_prediction;

  return (
    <div className="page dashboard">

      <h1>🌾 YieldSense AI Dashboard</h1>

      <div className="dash-grid">

        <div className="dash-card">
          <h2>🌾 Farm</h2>
          <h3>{farm?.crop_type ?? "--"}</h3>
          <p>Current Crop</p>
        </div>

        <div className="dash-card">
          <h2>🌡 Weather</h2>
          <h3>{p ? `${p.temperature}°C` : "--"}</h3>
            <p><strong>Status:</strong> {p?.weather_status ?? "--"}</p>
        </div>

        <div className="dash-card">
          <h2>🌱 Soil</h2>
          <h3>{p?.crop_suitability ?? "--"}</h3>
          <p>{farm?.soil_type ?? "--"}</p>
        </div>

        <div className="dash-card">
          <h2>📈 Latest Yield</h2>
          <h3>{p ? `${p.estimated_yield} kg/ha` : "--"}</h3>
          <p>{p?.yield_potential ?? "--"}</p>
        </div>

        <div className="dash-card">
          <h2>💡 Recommendation</h2>
          <h3>{p?.recommendation ?? "--"}</h3>
          <p>{p?.fertilizer ?? "--"}</p>
        </div>

        <div className="dash-card">
          <h2>📅 Prediction Date</h2>
          <h3>
            {p ? new Date(p.prediction_time).toLocaleDateString() : "--"}
          </h3>
          <p>Latest Prediction</p>
        </div>

      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "25px",
          marginTop: "35px",
        }}
      >
        <div className="card">
          <h2>🌱 Crop Health Overview</h2>
          <br />
          <p>🌾 Crop : {farm?.crop_type ?? "--"}</p>
          <p>🟢 Soil Health : {p?.crop_suitability ?? "--"}</p>
          <p>🌦 Weather Status : {p?.weather_status ?? "--"}</p>
          <p>💧 Irrigation : {p?.irrigation ?? "--"}</p>
          <p>🌱 Fertilizer : {p?.fertilizer ?? "--"}</p>
        </div>

        <div className="card">
          <h2>📊 Farm Summary</h2>
          <br />
          <p>🚜 Farm : {farm?.farm_name ?? "--"}</p>
          <p>📍 Location : {farm?.location ?? "--"}</p>
          <p>📏 Area : {farm?.area ?? "--"} ha</p>
          <p>🌱 Season : {farm?.season ?? "--"}</p>
          <p>🧪 Soil Type : {farm?.soil_type ?? "--"}</p>
        </div>
      </div>

    </div>
  );
}