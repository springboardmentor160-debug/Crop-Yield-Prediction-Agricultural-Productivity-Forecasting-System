"use client";

import Card from "./Card";

interface WeatherProps {
  weather: {
    city: string;
    temperature: number;
    humidity: number;
    wind_speed: number;
    weather: string;
    description: string;
  };
}

export default function WeatherCard({ weather }: WeatherProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
        gap: "20px",
      }}
    >
      <Card
        title="Temperature"
        value={`${weather.temperature} °C`}
        icon="🌡️"
        color="#2196F3"
      />

      <Card
        title="Humidity"
        value={`${weather.humidity}%`}
        icon="💧"
        color="#00BCD4"
      />

      <Card
        title="Wind Speed"
        value={`${weather.wind_speed} m/s`}
        icon="💨"
        color="#795548"
      />

      <Card
        title="Weather"
        value={weather.weather}
        icon="☁️"
        color="#3F51B5"
      />

      <Card
        title="City"
        value={weather.city}
        icon="📍"
        color="#4CAF50"
      />

      <Card
        title="Description"
        value={weather.description}
        icon="🌦️"
        color="#9C27B0"
      />
    </div>
  );
}