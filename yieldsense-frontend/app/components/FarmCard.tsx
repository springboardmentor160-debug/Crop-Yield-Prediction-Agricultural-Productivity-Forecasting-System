"use client";

import Card from "./Card";

interface FarmProps {
  farm: {
    farmer_name: string;
    village: string;
    district: string;
    state: string;
    farm_size: string;
    crop: string;
  };
}

export default function FarmCard({ farm }: FarmProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
        gap: "20px",
      }}
    >
      <Card
        title="Farmer Name"
        value={farm.farmer_name}
        icon="👨‍🌾"
        color="#2E7D32"
      />

      <Card
        title="Village"
        value={farm.village}
        icon="🏡"
        color="#43A047"
      />

      <Card
        title="District"
        value={farm.district}
        icon="📍"
        color="#039BE5"
      />

      <Card
        title="State"
        value={farm.state}
        icon="🗺️"
        color="#7E57C2"
      />

      <Card
        title="Farm Size"
        value={farm.farm_size}
        icon="📏"
        color="#FB8C00"
      />

      <Card
        title="Crop"
        value={farm.crop}
        icon="🌾"
        color="#66BB6A"
      />
    </div>
  );
}