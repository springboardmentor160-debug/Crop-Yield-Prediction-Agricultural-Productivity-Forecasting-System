"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { WeatherDashboard, WeatherForecast, HourlyWeather, WeatherAlert } from "@/lib/types";

export default function WeatherPage() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState<WeatherDashboard | null>(null);
  const [location, setLocation] = useState("Bhubaneswar");
  const [loading, setLoading] = useState(true);

  const locations = [
    "Bhubaneswar",
    "Mumbai",
    "Delhi",
    "Chennai",
    "Kolkata",
    "Pune",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    loadWeather();
  }, [location]);

  const loadWeather = async () => {
    setLoading(true);

    try {
      const data = await api.getWeatherDashboard(location);
      setDashboard(data);
    } catch (err) {
      console.error(err);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a14",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
        }}
      >
        <h2>Loading Weather...</h2>
      </div>
    );

  const current = dashboard?.current;

  const conditionIcon = (condition: string) => {
    if (!condition) return "🌤️";

    if (condition.includes("Rain")) return "🌧️";
    if (condition.includes("Cloud")) return "☁️";
    if (condition.includes("Thunder")) return "⛈️";
    if (condition.includes("Snow")) return "❄️";
    if (condition.includes("Fog")) return "🌫️";
    if (condition.includes("Clear")) return "☀️";

    return "🌤️";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a14",
        color: "white",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* NAVBAR */}

      <nav
        style={{
          backgroundColor: "#0d0d1a",
          borderBottom: "1px solid #1a1a2e",
          height: "60px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 30px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              background: "none",
              border: "none",
              color: "#7c8cff",
              cursor: "pointer",
            }}
          >
            ← Dashboard
          </button>

          <h2 style={{ color: "#3b82f6" }}>
            🌤 Weather Intelligence
          </h2>
        </div>

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{
            padding: "8px",
            background: "#0a0a14",
            color: "white",
            border: "1px solid #1a1a2e",
            borderRadius: "8px",
          }}
        >
          {locations.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
      </nav>

      <div
        style={{
          maxWidth: "1300px",
          margin: "30px auto",
          padding: "20px",
        }}
      >
        {/* CURRENT WEATHER */}

        <div
          style={{
            background:
              "linear-gradient(135deg,#122a5f,#0a0a14)",
            border: "1px solid #1a1a2e",
            borderRadius: "18px",
            padding: "35px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "72px",
                  margin: 0,
                  color: "#3b82f6",
                }}
              >
                {current?.temperature_c}°C
              </h1>

              <h2>{current?.condition}</h2>

              <p
                style={{
                  color: "#8b8ba7",
                }}
              >
                {current?.location}, {current?.country}
              </p>

              <p
                style={{
                  color: "#7dd3fc",
                  marginTop: "20px",
                }}
              >
                {dashboard?.advisory?.advisory}
              </p>
            </div>

            <div
              style={{
                fontSize: "90px",
              }}
            >
              {conditionIcon(current?.condition || "Clear")}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4,1fr)",
              gap: "20px",
              marginTop: "35px",
            }}
          >
            {[
              {
                label: "Humidity",
                value: `${current?.humidity_percent}%`,
                icon: "💧",
              },
              {
                label: "Rainfall",
                value: `${current?.rainfall_mm} mm`,
                icon: "🌧️",
              },
              {
                label: "Wind",
                value: `${current?.wind_speed_kmh} km/h`,
                icon: "💨",
              },
              {
                label: "Feels Like",
                value: `${current?.feels_like}°C`,
                icon: "🌡️",
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background:
                    "rgba(59,130,246,0.08)",
                  border:
                    "1px solid rgba(59,130,246,0.15)",
                  borderRadius: "12px",
                  padding: "18px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "28px" }}>
                  {item.icon}
                </div>

                <div
                  style={{
                    color: "#3b82f6",
                    fontWeight: "bold",
                    fontSize: "20px",
                    marginTop: "10px",
                  }}
                >
                  {item.value}
                </div>

                <div
                  style={{
                    color: "#888",
                    fontSize: "12px",
                    marginTop: "5px",
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7 DAY FORECAST */}

        <div
          style={{
            background: "#0d0d1a",
            border: "1px solid #1a1a2e",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "25px",
          }}
        >
          <h3
            style={{
              color: "#3b82f6",
              marginBottom: "20px",
            }}
          >
            7-Day Forecast
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(7,1fr)",
              gap: "12px",
            }}
          >
            {dashboard?.forecast?.map(
              (day: WeatherForecast, index: number) => (
                <div
                  key={index}
                  style={{
                    background: "#111122",
                    border: "1px solid #222244",
                    borderRadius: "10px",
                    padding: "15px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#888",
                    }}
                  >
                    {new Date(day.date).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                      }
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: "30px",
                      margin: "10px 0",
                    }}
                  >
                    {conditionIcon(day.condition || "Clear")}
                  </div>

                  <div>{day.max_temp}°C</div>

                  <div
                    style={{
                      color: "#888",
                      fontSize: "12px",
                    }}
                  >
                    {day.min_temp}°C
                  </div>

                  <div
                    style={{
                      color: "#3b82f6",
                      fontSize: "12px",
                      marginTop: "8px",
                    }}
                  >
                    {day.rainfall_mm} mm
                  </div>
                </div>
              )
            )}
          </div>
        </div>
                {/* HOURLY FORECAST */}

        <div
          style={{
            background: "#0d0d1a",
            border: "1px solid #1a1a2e",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "25px",
          }}
        >
          <h3
            style={{
              color: "#3b82f6",
              marginBottom: "20px",
            }}
          >
            24-Hour Forecast
          </h3>

          <div
            style={{
              display: "flex",
              overflowX: "auto",
              gap: "12px",
            }}
          >
            {dashboard?.hourly?.slice(0, 24).map(
              (hour: HourlyWeather, index: number) => (
                <div
                  key={index}
                  style={{
                    minWidth: "90px",
                    background: "#111122",
                    border: "1px solid #222244",
                    borderRadius: "10px",
                    padding: "12px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#888",
                    }}
                  >
                    {new Date(hour.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  <div
                    style={{
                      fontSize: "26px",
                      margin: "10px 0",
                    }}
                  >
                    {conditionIcon(hour.condition || "Clear")}
                  </div>

                  <div>{hour.temperature}°</div>

                  <div
                    style={{
                      color: "#3b82f6",
                      fontSize: "11px",
                      marginTop: "8px",
                    }}
                  >
                    💧 {hour.rain_probability}%
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* WEATHER ALERTS */}

        <div
          style={{
            background: "#0d0d1a",
            border: "1px solid #1a1a2e",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "25px",
          }}
        >
          <h3
            style={{
              color: "#ef4444",
              marginBottom: "18px",
            }}
          >
            Weather Alerts
          </h3>

          {dashboard?.alerts?.map((alert: WeatherAlert, index: number) => (
            <div
              key={index}
              style={{
                background:
                  alert.severity === "High"
                    ? "rgba(239,68,68,0.12)"
                    : "rgba(59,130,246,0.08)",
                border:
                  alert.severity === "High"
                    ? "1px solid #ef4444"
                    : "1px solid #3b82f6",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: "6px",
                }}
              >
                {alert.type}
              </div>

              <div
                style={{
                  color: "#bfbfd3",
                  fontSize: "14px",
                }}
              >
                {alert.message}
              </div>
            </div>
          ))}
        </div>

        {/* RISK + ADVISORY */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "24px",
          }}
        >
          <div
            style={{
              background: "#0d0d1a",
              border: "1px solid #1a1a2e",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h3
              style={{
                color: "#3b82f6",
                marginBottom: "20px",
              }}
            >
              Weather Risk
            </h3>

            <div
              style={{
                fontSize: "60px",
                fontWeight: 800,
                color: "#3b82f6",
              }}
            >
              {dashboard?.risk?.risk_score}
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "18px",
              }}
            >
              {dashboard?.risk?.risk_level}
            </div>

            <div
              style={{
                marginTop: "20px",
              }}
            >
              {dashboard?.risk?.reasons?.map(
                (reason: string, index: number) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "8px",
                      color: "#9ca3af",
                    }}
                  >
                    • {reason}
                  </div>
                )
              )}
            </div>
          </div>

          <div
            style={{
              background: "#0d0d1a",
              border: "1px solid #1a1a2e",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h3
              style={{
                color: "#22c55e",
                marginBottom: "20px",
              }}
            >
              Agricultural Advisory
            </h3>

            {dashboard?.advisory?.map(
              (item: any, index: number) => (
                <div
                  key={index}
                  style={{
                    background: "#111122",
                    border: "1px solid #222244",
                    borderRadius: "10px",
                    padding: "15px",
                    marginBottom: "15px",
                  }}
                >
                  <div
                    style={{
                      color: "#22c55e",
                      fontWeight: 700,
                      marginBottom: "8px",
                    }}
                  >
                    {item.category}
                  </div>

                  <div
                    style={{
                      color: "#d1d5db",
                    }}
                  >
                    {item.advice}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}