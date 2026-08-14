"use client";

import { useEffect, useState } from "react";

export default function SoilPage() {

  const [farm, setFarm] = useState<any>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/farm")
      .then((res) => res.json())
      .then((data) => setFarm(data));
  }, []);

  if (!farm) {
    return <h2 style={{ padding: "40px" }}>Loading...</h2>;
  }

  return (
    <div className="page">

      <h1>🌱 Soil Analysis</h1>

      <div className="dash-grid">

        <div className="dash-card">
          <h2>🌍 Soil Type</h2>
          <h3>{farm.soil_type}</h3>
        </div>

        <div className="dash-card">
          <h2>🧪 Soil pH</h2>
          <h3>{farm.soil_ph}</h3>
        </div>

        <div className="dash-card">
          <h2>🌿 Nitrogen</h2>
          <h3>{farm.nitrogen} kg/ha</h3>
        </div>

        <div className="dash-card">
          <h2>🌾 Phosphorus</h2>
          <h3>{farm.phosphorus} kg/ha</h3>
        </div>

        <div className="dash-card">
          <h2>🍃 Potassium</h2>
          <h3>{farm.potassium} kg/ha</h3>
        </div>

        <div className="dash-card">
          <h2>✅ Soil Health</h2>
          <h3>Good</h3>
        </div>

      </div>

      <div className="card" style={{ marginTop: "30px" }}>

  <h2>🌱 Agricultural Soil Insights</h2>

  <br />

  <p>✅ Soil quality supports healthy root development.</p>

  <p>🌿 Current nutrient levels are adequate for {farm.crop_type}.</p>

  <p>🧪 Soil pH is within the optimal range for cultivation.</p>

  <p>💧 Maintain moderate irrigation to preserve soil moisture.</p>

  <p>🌾 Monitor nutrient levels before the next fertilizer cycle.</p>

  <p>📈 Overall soil condition indicates good productivity potential.</p>

</div>
</div>

    
  );
}