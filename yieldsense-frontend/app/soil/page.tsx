"use client";

import { useEffect, useState } from "react";

interface SoilData {
  ph: number;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  soil_health: string;
}

export default function SoilPage() {
  const [soil, setSoil] = useState<SoilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSoilData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("http://127.0.0.1:8000/soil");

        if (!response.ok) {
          throw new Error("Failed to fetch soil data");
        }

        const data = await response.json();

        setSoil({
          ph: Number(data.ph),
          nitrogen: String(data.nitrogen),
          phosphorus: String(data.phosphorus),
          potassium: String(data.potassium),
          soil_health: String(data.soil_health),
        });
      } catch (err) {
        console.error("Soil API error:", err);
        setError("Unable to load soil data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSoilData();
  }, []);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f8f3",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "30px 40px",
            borderRadius: "16px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <h2>🌱 Loading Soil Data...</h2>
          <p>Please wait while we fetch the soil information.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f8f3",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "30px 40px",
            borderRadius: "16px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <h2>⚠️ Soil Data Error</h2>
          <p>{error}</p>

          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              background: "#2e7d32",
              color: "white",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!soil) {
    return null;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f8f3",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "36px",
              marginBottom: "10px",
              color: "#1b5e20",
            }}
          >
            🌱 Soil Health Analysis
          </h1>

          <p
            style={{
              color: "#666",
              fontSize: "17px",
            }}
          >
            Analyze soil quality and nutrient levels for better crop
            recommendations.
          </p>
        </div>

        {/* Soil Health Card */}
        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "30px",
            marginBottom: "25px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
            borderLeft: "6px solid #2e7d32",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: "#777",
                  fontSize: "14px",
                  textTransform: "uppercase",
                }}
              >
                Overall Soil Health
              </p>

              <h2
                style={{
                  marginTop: "8px",
                  marginBottom: 0,
                  color: "#1b5e20",
                  fontSize: "30px",
                }}
              >
                {soil.soil_health}
              </h2>
            </div>

            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "#e8f5e9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "35px",
              }}
            >
              🌿
            </div>
          </div>
        </div>

        {/* Soil Metrics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {/* pH */}
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "16px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
            }}
          >
            <div style={{ fontSize: "30px" }}>🧪</div>

            <p
              style={{
                color: "#777",
                marginBottom: "5px",
              }}
            >
              Soil pH
            </p>

            <h2
              style={{
                margin: 0,
                color: "#333",
                fontSize: "30px",
              }}
            >
              {soil.ph.toFixed(1)}
            </h2>

            <p
              style={{
                color: soil.ph >= 6 && soil.ph <= 7.5 ? "#2e7d32" : "#d84315",
                fontWeight: "bold",
              }}
            >
              {soil.ph >= 6 && soil.ph <= 7.5
                ? "Suitable Range"
                : "Needs Attention"}
            </p>
          </div>

          {/* Nitrogen */}
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "16px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
            }}
          >
            <div style={{ fontSize: "30px" }}>🌿</div>

            <p
              style={{
                color: "#777",
                marginBottom: "5px",
              }}
            >
              Nitrogen
            </p>

            <h2
              style={{
                margin: 0,
                color: "#333",
                fontSize: "26px",
              }}
            >
              {soil.nitrogen}
            </h2>
          </div>

          {/* Phosphorus */}
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "16px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
            }}
          >
            <div style={{ fontSize: "30px" }}>🌾</div>

            <p
              style={{
                color: "#777",
                marginBottom: "5px",
              }}
            >
              Phosphorus
            </p>

            <h2
              style={{
                margin: 0,
                color: "#333",
                fontSize: "26px",
              }}
            >
              {soil.phosphorus}
            </h2>
          </div>

          {/* Potassium */}
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "16px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
            }}
          >
            <div style={{ fontSize: "30px" }}>🥬</div>

            <p
              style={{
                color: "#777",
                marginBottom: "5px",
              }}
            >
              Potassium
            </p>

            <h2
              style={{
                margin: 0,
                color: "#333",
                fontSize: "26px",
              }}
            >
              {soil.potassium}
            </h2>
          </div>
        </div>

        {/* Recommendations */}
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "18px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              color: "#1b5e20",
              marginTop: 0,
            }}
          >
            🌾 Soil Suitability
          </h2>

          <p
            style={{
              color: "#555",
              lineHeight: 1.7,
            }}
          >
            Based on the available soil parameters, the current soil
            condition can be used to support crop planning and
            recommendations.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "15px",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                background: "#f1f8e9",
                padding: "18px",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              🌾
              <br />
              <strong>Rice</strong>
            </div>

            <div
              style={{
                background: "#f1f8e9",
                padding: "18px",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              🌽
              <br />
              <strong>Maize</strong>
            </div>

            <div
              style={{
                background: "#f1f8e9",
                padding: "18px",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              🌱
              <br />
              <strong>Wheat</strong>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}