"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Farm {
  id: number;
  farm_name: string;
}

export default function SoilPage() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmId, setFarmId] = useState<string>("");
  const [form, setForm] = useState({
    nitrogen: "80", phosphorus: "40", potassium: "60",
    ph: "6.5", humidity: "65", temperature: "25", rainfall: "850",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }

    const loadFarms = async () => {
      try {
        const data = await api.getFarms();
        setFarms(data);
        if (data.length > 0) setFarmId(String(data[0].id));
      } catch (err) {
        console.error(err);
      }
    };
    loadFarms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!farmId) {
      alert("Please select a farm before analyzing.");
      return;
    }

    setLoading(true);
    try {
      const data = await api.analyzeSoil({
        farm_id: parseInt(farmId, 10),
        nitrogen: parseFloat(form.nitrogen),
        phosphorus: parseFloat(form.phosphorus),
        potassium: parseFloat(form.potassium),
        ph: parseFloat(form.ph),
        humidity: parseFloat(form.humidity),
        temperature: parseFloat(form.temperature),
        rainfall: parseFloat(form.rainfall),
      });
      setResult(data);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === "Optimal") return "#22c55e";
    if (status === "High" || status === "Excess") return "#f59e0b";
    return "#ef4444";
  };

  const fertilityColor = (index: string) => {
    if (index === "Excellent") return "#22c55e";
    if (index === "Good") return "#84cc16";
    if (index === "Fair") return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f0a00", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#ffffff" }}>

      {/* Navbar */}
      <nav style={{ backgroundColor: "#1a1000", borderBottom: "1px solid #2a1e00", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "#7a6a4a", cursor: "pointer", fontSize: "13px" }}>← Dashboard</button>
          <div style={{ width: "1px", height: "20px", backgroundColor: "#2a1e00" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>🧪</span>
            <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: "15px" }}>Soil Analysis</span>
          </div>
        </div>
        <button onClick={() => { localStorage.clear(); router.push("/"); }} style={{ backgroundColor: "transparent", border: "1px solid #2a1e00", borderRadius: "8px", padding: "6px 14px", color: "#7a6a4a", cursor: "pointer", fontSize: "12px" }}>Sign Out</button>
      </nav>

      <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "11px", color: "#f59e0b", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>Module 5</div>
          <h1 style={{ fontSize: "32px", fontWeight: 800 }}>Soil Health Analysis</h1>
          <p style={{ color: "#7a6a4a", fontSize: "14px" }}>Enter soil parameters to get fertility assessment and crop recommendations</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px" }}>

          {/* Form */}
          <div style={{ backgroundColor: "#1a1000", border: "1px solid #2a1e00", borderRadius: "16px", padding: "28px" }}>
            <div style={{ fontSize: "11px", color: "#7a6a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "20px" }}>Soil Parameters</div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Farm selector */}
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "#f59e0b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px", opacity: 0.7 }}>Farm</label>
                {farms.length === 0 ? (
                  <div style={{ fontSize: "13px", color: "#7a6a4a", padding: "10px 12px", backgroundColor: "#0f0a00", border: "1px solid #2a1e00", borderRadius: "8px" }}>
                    No farms yet — add one first.
                  </div>
                ) : (
                  <select
                    value={farmId}
                    onChange={(e) => setFarmId(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", backgroundColor: "#0f0a00", border: "1px solid #2a1e00", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  >
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>{f.farm_name}</option>
                    ))}
                  </select>
                )}
              </div>

              {[
                { key: "nitrogen", label: "Nitrogen N (kg/ha)", placeholder: "80" },
                { key: "phosphorus", label: "Phosphorus P (kg/ha)", placeholder: "40" },
                { key: "potassium", label: "Potassium K (kg/ha)", placeholder: "60" },
                { key: "ph", label: "Soil pH", placeholder: "6.5" },
                { key: "humidity", label: "Humidity (%)", placeholder: "65" },
                { key: "temperature", label: "Temperature (°C)", placeholder: "25" },
                { key: "rainfall", label: "Rainfall (mm)", placeholder: "850" },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: "block", fontSize: "11px", color: "#f59e0b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px", opacity: 0.7 }}>{field.label}</label>
                  <input type="number" step="any" value={form[field.key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    style={{ width: "100%", padding: "10px 12px", backgroundColor: "#0f0a00", border: "1px solid #2a1e00", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    onFocus={e => e.target.style.borderColor = "#f59e0b"}
                    onBlur={e => e.target.style.borderColor = "#2a1e00"}
                  />
                </div>
              ))}
              <button type="submit" disabled={loading || farms.length === 0} style={{
                width: "100%", padding: "14px",
                background: (loading || farms.length === 0) ? "rgba(245,158,11,0.3)" : "linear-gradient(135deg, #f59e0b, #d97706)",
                border: "none", borderRadius: "10px", color: "#0f0a00",
                fontSize: "14px", fontWeight: 800, cursor: (loading || farms.length === 0) ? "not-allowed" : "pointer",
                marginTop: "8px",
              }}>
                {loading ? "⏳ Analyzing Soil..." : "🧪 Analyze Soil Health →"}
              </button>
            </form>
          </div>

          {/* Results */}
          <div>
            {!result ? (
              <div style={{ backgroundColor: "#1a1000", border: "1px solid #2a1e00", borderRadius: "16px", padding: "28px", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <div style={{ fontSize: "64px", marginBottom: "20px" }}>🌱</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#7a6a4a", marginBottom: "8px" }}>Ready to Analyze</div>
                <div style={{ fontSize: "13px", color: "#4a3a1a" }}>Enter soil parameters to get detailed fertility assessment</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* Fertility Score */}
                <div style={{ backgroundColor: "#1a1000", border: `1px solid ${fertilityColor(result.fertility_index)}40`, borderRadius: "16px", padding: "24px" }}>
                  <div style={{ fontSize: "11px", color: "#7a6a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Soil Fertility Assessment</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div>
                      <div style={{ fontSize: "52px", fontWeight: 900, color: fertilityColor(result.fertility_index), lineHeight: 1 }}>{result.fertility_score}</div>
                      <div style={{ fontSize: "14px", color: "#7a6a4a" }}>Fertility Score / 100</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "11px", color: "#7a6a4a", marginBottom: "6px" }}>FERTILITY INDEX</div>
                      <div style={{ fontSize: "20px", fontWeight: 800, color: fertilityColor(result.fertility_index), backgroundColor: `${fertilityColor(result.fertility_index)}15`, borderRadius: "8px", padding: "8px 16px" }}>
                        {result.fertility_index}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "#7a6a4a" }}>Soil pH</div>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#f59e0b" }}>{result.soil_ph} — {result.ph_category}</div>
                    </div>
                  </div>
                </div>

                {/* Nutrients */}
                <div style={{ backgroundColor: "#1a1000", border: "1px solid #2a1e00", borderRadius: "16px", padding: "24px" }}>
                  <div style={{ fontSize: "11px", color: "#7a6a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Nutrient Levels</div>
                  {Object.entries(result.nutrients).map(([nutrient, data]: [string, any]) => (
                    <div key={nutrient} style={{ marginBottom: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "13px", color: "#d4a400", fontWeight: 600, textTransform: "capitalize" }}>{nutrient}</span>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <span style={{ fontSize: "13px", color: "#ffffff", fontWeight: 700 }}>{data.value} {data.unit}</span>
                          <span style={{ fontSize: "11px", color: statusColor(data.status), backgroundColor: `${statusColor(data.status)}15`, borderRadius: "100px", padding: "2px 8px" }}>{data.status}</span>
                        </div>
                      </div>
                      <div style={{ height: "5px", backgroundColor: "#0f0a00", borderRadius: "3px" }}>
                        <div style={{ height: "100%", width: `${Math.min(100, (data.value / 200) * 100)}%`, backgroundColor: statusColor(data.status), borderRadius: "3px" }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suitable Crops */}
                <div style={{ backgroundColor: "#1a1000", border: "1px solid #2a1e00", borderRadius: "16px", padding: "24px" }}>
                  <div style={{ fontSize: "11px", color: "#7a6a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>Recommended Crops</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                    {result.suitable_crops?.map((crop: string) => (
                      <span key={crop} style={{ fontSize: "13px", color: "#f59e0b", backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px", padding: "6px 14px", fontWeight: 600 }}>
                        🌾 {crop}
                      </span>
                    ))}
                  </div>
                  {result.deficiencies?.length > 0 && (
                    <div>
                      <div style={{ fontSize: "11px", color: "#7a6a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>Deficiencies & Fixes</div>
                      {result.deficiencies.map((d: any, i: number) => (
                        <div key={i} style={{ padding: "10px 14px", backgroundColor: "#0f0a00", borderRadius: "8px", borderLeft: "3px solid #f59e0b", marginBottom: "8px" }}>
                          <div style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 700, marginBottom: "4px" }}>{d.nutrient} — {d.level}</div>
                          <div style={{ fontSize: "12px", color: "#7a6a4a" }}>{d.recommendation}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}