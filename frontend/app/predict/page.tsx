"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Farm { id: number; farm_name: string; location: string; }
interface Recommendation { category: string; message: string; priority: string; }
interface PredictionResult {
  predicted_yield_tons_per_ha: number;
  confidence_score: number;
  risk_level: string;
  recommendations: Recommendation[];
}

export default function PredictPage() {
  const router = useRouter();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [form, setForm] = useState({
    farm_id: "",
    crop_type: "wheat",
    rainfall_mm: "850",
    temperature_c: "25",
    humidity_percent: "65",
    soil_ph: "6.5",
    nitrogen: "80",
    phosphorus: "40",
    potassium: "60",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    api.getFarms().then(setFarms).catch(() => router.push("/"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const data = await api.predict({
        farm_id: parseInt(form.farm_id),
        crop_type: form.crop_type,
        rainfall_mm: parseFloat(form.rainfall_mm),
        temperature_c: parseFloat(form.temperature_c),
        humidity_percent: parseFloat(form.humidity_percent),
        soil_ph: parseFloat(form.soil_ph),
        nitrogen: parseFloat(form.nitrogen),
        phosphorus: parseFloat(form.phosphorus),
        potassium: parseFloat(form.potassium),
      });
      setResult(data);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (risk: string) => {
    if (risk === "Low") return "#22c55e";
    if (risk === "Medium") return "#f59e0b";
    return "#ef4444";
  };

  const priorityColor = (p: string) => {
    if (p === "high") return "#ef4444";
    if (p === "medium") return "#f59e0b";
    return "#22c55e";
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f0a", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#ffffff" }}>

      {/* Navbar */}
      <nav style={{ backgroundColor: "#0d1a0d", borderBottom: "1px solid #1a2e1a", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "#4a7a4a", cursor: "pointer", fontSize: "13px" }}>← Dashboard</button>
          <div style={{ width: "1px", height: "20px", backgroundColor: "#1a2e1a" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>🌱</span>
            <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "15px" }}>Yield Prediction</span>
          </div>
        </div>
        <button onClick={() => { localStorage.clear(); router.push("/"); }} style={{ backgroundColor: "transparent", border: "1px solid #1a2e1a", borderRadius: "8px", padding: "6px 14px", color: "#6b9e6b", cursor: "pointer", fontSize: "12px" }}>Sign Out</button>
      </nav>

      <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "11px", color: "#22c55e", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>Module 3</div>
          <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>AI Crop Yield Prediction</h1>
          <p style={{ color: "#4a7a4a", fontSize: "14px" }}>Enter farm parameters to get AI-powered yield forecasts</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

          {/* Form */}
          <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "28px" }}>
            <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "20px" }}>Farm Parameters</div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Farm Select */}
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "#6b9e6b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Select Farm *</label>
                <select value={form.farm_id} onChange={e => setForm({ ...form, farm_id: e.target.value })} required
                  style={{ width: "100%", padding: "11px 14px", backgroundColor: "#0a0f0a", border: "1px solid #1a2e1a", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}>
                  <option value="">Select a farm...</option>
                  {farms.map(f => <option key={f.id} value={f.id}>{f.farm_name} — {f.location}</option>)}
                </select>
              </div>

              {/* Crop Type */}
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "#6b9e6b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Crop Type *</label>
                <select value={form.crop_type} onChange={e => setForm({ ...form, crop_type: e.target.value })}
                  style={{ width: "100%", padding: "11px 14px", backgroundColor: "#0a0f0a", border: "1px solid #1a2e1a", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}>
                  {["wheat", "rice", "maize", "soybean", "cotton", "sugarcane", "barley", "groundnut"].map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Input Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
                  { key: "rainfall_mm", label: "Rainfall (mm)", placeholder: "850" },
                  { key: "temperature_c", label: "Temperature (°C)", placeholder: "25" },
                  { key: "humidity_percent", label: "Humidity (%)", placeholder: "65" },
                  { key: "soil_ph", label: "Soil pH", placeholder: "6.5" },
                  { key: "nitrogen", label: "Nitrogen (kg/ha)", placeholder: "80" },
                  { key: "phosphorus", label: "Phosphorus (kg/ha)", placeholder: "40" },
                  { key: "potassium", label: "Potassium (kg/ha)", placeholder: "60" },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ display: "block", fontSize: "11px", color: "#6b9e6b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>{field.label}</label>
                    <input type="number" step="any" value={form[field.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      style={{ width: "100%", padding: "10px 12px", backgroundColor: "#0a0f0a", border: "1px solid #1a2e1a", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.borderColor = "#22c55e"}
                      onBlur={e => e.target.style.borderColor = "#1a2e1a"}
                    />
                  </div>
                ))}
              </div>

              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "14px",
                background: loading ? "rgba(34,197,94,0.3)" : "linear-gradient(135deg, #22c55e, #16a34a)",
                border: "none", borderRadius: "10px", color: "#0a0f0a",
                fontSize: "15px", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 20px rgba(34,197,94,0.2)",
              }}>
                {loading ? "⏳ Running AI Model..." : "🌱 Predict Crop Yield →"}
              </button>
            </form>
          </div>

          {/* Results Panel */}
          <div>
            {!result ? (
              <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "28px", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <div style={{ fontSize: "64px", marginBottom: "20px" }}>🌾</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#4a7a4a", marginBottom: "8px" }}>Ready to Predict</div>
                <div style={{ fontSize: "13px", color: "#2a4a2a" }}>Fill in farm parameters and click Predict to get AI-powered yield forecast</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* Main Result Card */}
                <div style={{ backgroundColor: "#0d1a0d", border: `1px solid ${riskColor(result.risk_level)}40`, borderRadius: "16px", padding: "28px" }}>
                  <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Prediction Result</div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                    <div>
                      <div style={{ fontSize: "52px", fontWeight: 900, color: "#22c55e", lineHeight: 1 }}>
                        {result.predicted_yield_tons_per_ha}
                      </div>
                      <div style={{ fontSize: "14px", color: "#4a7a4a", marginTop: "4px" }}>tons per hectare</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "11px", color: "#4a7a4a", marginBottom: "6px" }}>RISK LEVEL</div>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: riskColor(result.risk_level), backgroundColor: `${riskColor(result.risk_level)}15`, border: `1px solid ${riskColor(result.risk_level)}30`, borderRadius: "8px", padding: "6px 14px" }}>
                        {result.risk_level}
                      </div>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#4a7a4a" }}>Model Confidence</span>
                      <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 700 }}>{result.confidence_score}%</span>
                    </div>
                    <div style={{ height: "6px", backgroundColor: "#0a0f0a", borderRadius: "3px" }}>
                      <div style={{ height: "100%", width: `${result.confidence_score}%`, background: "linear-gradient(90deg, #22c55e, #4ade80)", borderRadius: "3px" }} />
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
                  <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>AI Recommendations</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {result.recommendations.map((rec, i) => (
                      <div key={i} style={{ padding: "14px", backgroundColor: "#0a0f0a", borderRadius: "10px", border: `1px solid ${priorityColor(rec.priority)}25`, borderLeft: `3px solid ${priorityColor(rec.priority)}` }}>
                        <div style={{ fontSize: "11px", color: priorityColor(rec.priority), fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                          {rec.category} — {rec.priority.toUpperCase()}
                        </div>
                        <div style={{ fontSize: "13px", color: "#6b9e6b", lineHeight: 1.5 }}>{rec.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
