"use client";

import Card from "./Card";

interface PredictionProps {
  prediction: {
    area: string;
    item: string;
    predicted_yield: number;
  };
}

export default function PredictionCard({
  prediction,
}: PredictionProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
        gap: "20px",
      }}
    >
      <Card
        title="Crop"
        value={prediction.item}
        icon="🌾"
        color="#4CAF50"
      />

      <Card
        title="Area"
        value={prediction.area}
        icon="📍"
        color="#03A9F4"
      />

      <Card
        title="Predicted Yield"
        value={`${prediction.predicted_yield.toFixed(2)} hg/ha`}
        icon="🤖"
        color="#9C27B0"
      />
    </div>
  );
}