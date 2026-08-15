"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import WeatherCard from "../components/WeatherCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

interface Weather {
  city: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  weather: string;
  description: string;
}

export default function WeatherPage() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadWeather();
  }, []);

  async function loadWeather() {
    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/weather");

      if (!res.ok) {
        throw new Error("Weather API Error");
      }

      const data = await res.json();

      setWeather(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load weather information.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <>
      <Sidebar />

      <div
        style={{
          marginLeft: "260px",
          padding: "30px",
          background: "#f5f7fa",
          minHeight: "100vh",
        }}
      >
        <h1
          style={{
            color: "#2196F3",
            marginBottom: "10px",
          }}
        >
          🌦 Weather Information
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: "25px",
          }}
        >
          Current weather conditions for crop monitoring.
        </p>

        {error && <ErrorMessage message={error} />}

        {weather && <WeatherCard weather={weather} />}

        <button
          onClick={loadWeather}
          style={{
            marginTop: "25px",
            padding: "12px 30px",
            background: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          🔄 Refresh Weather
        </button>
      </div>
    </>
  );
}