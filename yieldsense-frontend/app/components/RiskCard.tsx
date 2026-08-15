"use client";

type RiskCardProps = {
  level: string;
};

export default function RiskCard({ level }: RiskCardProps) {
  const color =
    level === "High"
      ? "#f44336"
      : level === "Medium"
      ? "#ff9800"
      : "#4CAF50";

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "15px",
        borderLeft: `8px solid ${color}`,
        boxShadow: "0 4px 10px rgba(0,0,0,.1)",
        marginBottom: "20px",
      }}
    >
      <h3>🚨 Risk Assessment</h3>

      <h2 style={{ color }}>{level} Risk</h2>
    </div>
  );
}