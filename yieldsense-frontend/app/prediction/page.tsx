"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function PredictionPage() {
  const [form, setForm] = useState({
    area: "",
    item: "",
    year: new Date().getFullYear(),
    rainfall: "",
    pesticides: "",
    temperature: "",
  });

  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function predictYield() {
    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/predict-yield",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            area: form.area,
            item: form.item,
            year: Number(form.year),
            rainfall: Number(form.rainfall),
            pesticides: Number(form.pesticides),
            temperature: Number(form.temperature),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail);
        return;
      }

      setPrediction(data.predicted_yield);
    } catch (err) {
      console.log(err);
      alert("Prediction Failed");
    } finally {
      setLoading(false);
    }
  }

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
        <h1 style={{ color: "#2E7D32" }}>
          🌾 Crop Yield Prediction
        </h1>

        <div
          style={{
            marginTop: "30px",
            background: "#fff",
            padding: "30px",
            borderRadius: "15px",
            boxShadow: "0 5px 15px rgba(0,0,0,.1)",
          }}
        >
          <input
            placeholder="Area"
            style={input}
            onChange={(e) =>
              setForm({ ...form, area: e.target.value })
            }
          />

          <input
            placeholder="Crop"
            style={input}
            onChange={(e) =>
              setForm({ ...form, item: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Year"
            style={input}
            value={form.year}
            onChange={(e) =>
              setForm({ ...form, year: Number(e.target.value) })
            }
          />

          <input
            type="number"
            placeholder="Rainfall"
            style={input}
            onChange={(e) =>
              setForm({
                ...form,
                rainfall: e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="Pesticides"
            style={input}
            onChange={(e) =>
              setForm({
                ...form,
                pesticides: e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="Temperature"
            style={input}
            onChange={(e) =>
              setForm({
                ...form,
                temperature: e.target.value,
              })
            }
          />

          <button
            onClick={predictYield}
            style={button}
          >
            {loading ? "Predicting..." : "Predict Yield"}
          </button>

          {prediction && (
            <div
              style={{
                marginTop: "25px",
                background: "#E8F5E9",
                padding: "20px",
                borderRadius: "10px",
              }}
            >
              <h2>
                🌾 Predicted Yield:
              </h2>

              <h1
                style={{
                  color: "#2E7D32",
                }}
              >
                {prediction} hg/ha
              </h1>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const input = {
  width: "100%",
  padding: "15px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const button = {
  width: "100%",
  padding: "15px",
  background: "#2E7D32",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "18px",
  cursor: "pointer",
};