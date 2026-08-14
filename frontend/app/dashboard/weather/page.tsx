"use client";

import { useEffect, useState } from "react";

export default function WeatherPage() {

  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
  }, []);

  async function loadWeather() {

    try {

      const res = await fetch(
  "http://127.0.0.1:8000/weather?latitude=12.9716&longitude=77.5946"
);

      if (!res.ok) {
        throw new Error("Failed to fetch weather");
      }

      const data = await res.json();

      setWeather(data);

    } catch (error) {

      console.error("Weather Error:", error);

    } finally {

      setLoading(false);

    }
  }

  if (loading) {
    return (
      <div className="page">
        <h2>Loading weather...</h2>
      </div>
    );
  }

  if (!weather || weather.error) {
    return (
      <div className="page">
        <h2>No Weather Data Available</h2>
      </div>
    );
  }

  return (
    <div className="page">

      <h1>☁ Weather Analysis</h1>

      <div className="dash-grid">

        <div className="dash-card">
          <h2>🌡 Temperature</h2>
          <h3>{weather.temperature} °C</h3>
        </div>

        <div className="dash-card">
          <h2>💧 Humidity</h2>
          <h3>{weather.humidity}%</h3>
        </div>

        <div className="dash-card">
          <h2>🌧 Rainfall</h2>
          <h3>{weather.rainfall} mm</h3>
        </div>

        <div className="dash-card">
          <h2>🌬 Wind Speed</h2>
          <h3>{weather.wind_speed} km/h</h3>
        </div>

        <div className="dash-card">
          <h2>📈 Pressure</h2>
          <h3>{weather.pressure} hPa</h3>
        </div>

        <div className="dash-card">
          <h2>🌤 Condition</h2>
          <h3>{weather.condition}</h3>
        </div>

      </div>

      <div
        className="card"
        style={{
          marginTop: "30px",
          padding: "20px"
        }}
      >

        <h2>Weather Information</h2>

        <p>
          🌡 Current temperature is {weather.temperature}°C
          with {weather.humidity}% humidity.
        </p>

        <p>
          🌧 Current rainfall is {weather.rainfall} mm
          and today's rainfall is {weather.today_rainfall} mm.
        </p>

        <p>
          🌬 Wind speed is {weather.wind_speed} km/h
          with atmospheric pressure of {weather.pressure} hPa.
        </p>

        <p>
          🌱 Current weather condition: {weather.condition}.
        </p>

      </div>

    </div>
  );
}