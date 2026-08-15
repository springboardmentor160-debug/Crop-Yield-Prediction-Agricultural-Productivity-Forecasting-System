"use client";

interface ErrorProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorProps) {
  return (
    <div
      style={{
        background: "#FFEBEE",
        color: "#D32F2F",
        padding: "20px",
        borderRadius: "12px",
        textAlign: "center",
        fontWeight: "bold",
        margin: "20px 0",
      }}
    >
      ❌ {message}
    </div>
  );
}