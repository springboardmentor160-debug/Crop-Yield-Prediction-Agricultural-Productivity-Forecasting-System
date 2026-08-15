"use client";

type Props = {
  recommendations: string[];
};

export default function RecommendationCard({
  recommendations,
}: Props) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "15px",
        boxShadow: "0 4px 10px rgba(0,0,0,.1)",
        marginBottom: "20px",
      }}
    >
      <h2>💡 Recommendations</h2>

      <ul>
        {recommendations.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}