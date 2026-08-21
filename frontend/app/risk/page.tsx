"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { RiskAssessmentResponse, DiseaseRiskResponse, ProfitRiskResponse } from "@/lib/types";

export default function RiskPage() {
  const router = useRouter();
  const [risk, setRisk] = useState<RiskAssessmentResponse | null>(null);
  const [disease, setDisease] = useState<DiseaseRiskResponse | null>(null);
  const [profit, setProfit] = useState<ProfitRiskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ crop_type: "wheat", rainfall_mm: "850", temperature_c: "25", soil_ph: "6.5", humidity: "65", area_hectares: "1.0", expected_yield: "3.5" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    runAssessment();
  }, []);

  const runAssessment = async () => {
    setLoading(true);
    try {
      const [r, d, p] = await Promise.all([
        api.getRiskAssessment(parseFloat(form.rainfall_mm), parseFloat(form.temperature_c), form.crop_type, parseFloat(form.soil_ph)),
        api.getDiseaseRisk(form.crop_type, parseFloat(form.rainfall_mm), parseFloat(form.temperature_c), parseFloat(form.humidity)),
        api.getProfitRisk(form.crop_type, parseFloat(form.area_hectares), parseFloat(form.expected_yield)),
      ]);
      setRisk(r); setDisease(d); setProfit(p);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const riskColor = (level: string) => {
    if (level === "Low") return "#22c55e";
    if (level === "Medium") return "#f59e0b";
    if (level === "High") return "#ef4444";
    return "#dc2626";
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f0a", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#ffffff" }}>
      <nav style={{ backgroundColor: "#0d1a0d", borderBottom: "1px solid #1a2e1a", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "#4a7a4a", cursor: "pointer", fontSize: "13px" }}>← Dashboard</button>
          <div style={{ width: "1px", height: "20px", backgroundColor: "#1a2e1a" }} />
          <span style={{ color: "#ef4444", fontWeight: 700, fontSize: "15px" }}>⚠️ Risk Assessment</span>
        </div>
        <button onClick={() => { localStorage.clear(); router.push("/"); }} style={{ backgroundColor: "transparent", border: "1px solid #1a2e1a", borderRadius: "8px", padding: "6px 14px", color: "#6b9e6b", cursor: "pointer", fontSize: "12px" }}>Sign Out</button>
      </nav>

      <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "11px", color: "#ef4444", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>Milestone 3 — Module 5</div>
          <h1 style={{ fontSize: "32px", fontWeight: 800 }}>Risk Assessment System</h1>
          <p style={{ color: "#4a7a4a", fontSize: "14px" }}>AI-powered risk analysis for weather, disease, yield and profit</p>
        </div>

        {/* Input Form */}
        <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Farm Parameters</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "#6b9e6b", marginBottom: "6px", textTransform: "uppercase" }}>Crop Type</label>
              <select value={form.crop_type} onChange={e => setForm({ ...form, crop_type: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", backgroundColor: "#0a0f0a", border: "1px solid #1a2e1a", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }}>
                {["wheat", "rice", "maize", "soybean", "cotton"].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            {[
              { key: "rainfall_mm", label: "Rainfall (mm)" }, { key: "temperature_c", label: "Temp (°C)" },
              { key: "soil_ph", label: "Soil pH" }, { key: "humidity", label: "Humidity (%)" },
              { key: "area_hectares", label: "Area (ha)" }, { key: "expected_yield", label: "Expected Yield (t/ha)" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: "11px", color: "#6b9e6b", marginBottom: "6px", textTransform: "uppercase" }}>{f.label}</label>
                <input type="number" step="any" value={form[f.key as keyof typeof form]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", backgroundColor: "#0a0f0a", border: "1px solid #1a2e1a", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "#ef4444"} onBlur={e => e.target.style.borderColor = "#1a2e1a"} />
              </div>
            ))}
          </div>
          <button onClick={runAssessment} disabled={loading} style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none", borderRadius: "10px", padding: "12px 28px", color: "#ffffff", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>
            {loading ? "⏳ Analyzing..." : "⚠️ Run Risk Assessment →"}
          </button>
        </div>

        {risk && (
          <>
            {/* Overall Risk */}
            <div style={{ backgroundColor: "#0d1a0d", border: `1px solid ${riskColor(risk.overall_risk_level)}40`, borderRadius: "16px", padding: "28px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>Overall Risk Score</div>
                  <div style={{ fontSize: "52px", fontWeight: 900, color: riskColor(risk.overall_risk_level), lineHeight: 1 }}>{risk.overall_risk_score}</div>
                  <div style={{ fontSize: "14px", color: "#4a7a4a", marginTop: "4px" }}>out of 100</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: riskColor(risk.overall_risk_level), backgroundColor: `${riskColor(risk.overall_risk_level)}15`, border: `1px solid ${riskColor(risk.overall_risk_level)}30`, borderRadius: "12px", padding: "12px 24px" }}>
                    {risk.overall_risk_level} Risk
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <div style={{ height: "8px", backgroundColor: "#0a0f0a", borderRadius: "4px" }}>
                  <div style={{ height: "100%", width: `${risk.overall_risk_score}%`, backgroundColor: riskColor(risk.overall_risk_level), borderRadius: "4px", transition: "width 0.5s" }} />
                </div>
              </div>
              <div style={{ fontSize: "13px", color: "#6b9e6b" }}>{risk.summary}</div>
            </div>

            {/* Risk Factors */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
                <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Risk Factors</div>
                {risk.risks?.map((r: { type: string; level: string; description: string; mitigation: string; score: number }, i: number) => (
                  <div key={i} style={{ padding: "14px", backgroundColor: "#0a0f0a", borderRadius: "10px", marginBottom: "10px", borderLeft: `3px solid ${riskColor(r.level)}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600 }}>{r.type}</span>
                      <span style={{ fontSize: "11px", color: riskColor(r.level), backgroundColor: `${riskColor(r.level)}15`, borderRadius: "100px", padding: "2px 8px" }}>{r.level}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b9e6b", marginBottom: "6px" }}>{r.description}</div>
                    <div style={{ fontSize: "11px", color: "#4a7a4a" }}>💡 {r.mitigation}</div>
                    <div style={{ marginTop: "8px" }}>
                      <div style={{ height: "4px", backgroundColor: "#1a2e1a", borderRadius: "2px" }}>
                        <div style={{ height: "100%", width: `${r.score}%`, backgroundColor: riskColor(r.level), borderRadius: "2px" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Disease Risk */}
                {disease && (
                  <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
                    <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>🦠 Disease Risk</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                      <div>
                        <div style={{ fontSize: "32px", fontWeight: 800, color: riskColor(disease.risk_level) }}>{disease.overall_disease_risk_percent}%</div>
                        <div style={{ fontSize: "12px", color: "#4a7a4a" }}>Disease Risk</div>
                      </div>
                      <div style={{ backgroundColor: `${riskColor(disease.risk_level)}15`, border: `1px solid ${riskColor(disease.risk_level)}30`, borderRadius: "8px", padding: "8px 16px", display: "flex", alignItems: "center" }}>
                        <span style={{ color: riskColor(disease.risk_level), fontWeight: 700 }}>{disease.risk_level}</span>
                      </div>
                    </div>
                    {disease.diseases?.map((d: { disease: string; probability: number; severity: string }, i: number) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#0a0f0a", borderRadius: "6px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "12px" }}>🦠 {d.disease}</span>
                        <span style={{ fontSize: "12px", color: riskColor(d.severity), fontWeight: 600 }}>{d.probability}%</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Profit Risk */}
                {profit && (
                  <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
                    <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>💰 Profit Analysis</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {[
                        { label: "Total Cost", value: `₹${profit.total_cost_inr?.toLocaleString()}`, color: "#ef4444" },
                        { label: "Revenue", value: `₹${profit.expected_revenue_inr?.toLocaleString()}`, color: "#22c55e" },
                        { label: "Profit", value: `₹${profit.expected_profit_inr?.toLocaleString()}`, color: profit.expected_profit_inr > 0 ? "#22c55e" : "#ef4444" },
                        { label: "ROI", value: `${profit.roi_percent}%`, color: profit.roi_percent > 20 ? "#22c55e" : "#f59e0b" },
                      ].map(s => (
                        <div key={s.label} style={{ backgroundColor: "#0a0f0a", borderRadius: "8px", padding: "12px" }}>
                          <div style={{ fontSize: "16px", fontWeight: 800, color: s.color }}>{s.value}</div>
                          <div style={{ fontSize: "11px", color: "#4a7a4a" }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: "12px", padding: "10px 12px", backgroundColor: "#0a0f0a", borderRadius: "8px" }}>
                      <div style={{ fontSize: "11px", color: "#4a7a4a" }}>Break-even yield: <span style={{ color: "#f59e0b", fontWeight: 700 }}>{profit.break_even_yield_tons} t/ha</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
