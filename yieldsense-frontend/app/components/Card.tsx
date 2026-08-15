"use client";

interface CardProps {
  title: string;
  value: string | number;
  color?: string;
  icon?: string;
}

export default function Card({
  title,
  value,
  color = "#2E7D32",
  icon = "",
}: CardProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        padding: "24px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        transition: "0.3s",
        borderLeft: `6px solid ${color}`,
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow =
          "0 12px 25px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow =
          "0 8px 20px rgba(0,0,0,0.08)";
      }}
    >
      <h3
        style={{
          color,
          marginBottom: "15px",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        {icon} {title}
      </h3>

      <h2
        style={{
          color: "#333",
          fontSize: "30px",
          fontWeight: "bold",
        }}
      >
        {value}
      </h2>
    </div>
  );
}