"use client";

import Card from "./Card";

interface SoilProps {
  soil: {
    soil_health: string;
    ph: number;
    nitrogen: string;
    phosphorus: string;
    potassium: string;
    moisture: string;
  };
}

export default function SoilCard({ soil }: SoilProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
      }}
    >
      <Card
        title="Soil Health"
        value={soil.soil_health}
        icon="🌱"
        color="#4CAF50"
      />

      <Card
        title="pH Value"
        value={soil.ph}
        icon="🧪"
        color="#8BC34A"
      />

      <Card
        title="Nitrogen"
        value={soil.nitrogen}
        icon="🌿"
        color="#009688"
      />

      <Card
        title="Phosphorus"
        value={soil.phosphorus}
        icon="🧬"
        color="#FF9800"
      />

      <Card
        title="Potassium"
        value={soil.potassium}
        icon="🍃"
        color="#3F51B5"
      />

      <Card
        title="Moisture"
        value={soil.moisture}
        icon="💧"
        color="#2196F3"
      />
    </div>
  );
}