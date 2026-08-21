"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { RecommendationsResponse, CropRecommendationResponse, IrrigationPlanResponse, FertilizerPlanResponse, Recommendation } from "@/lib/types";

export default function RecommendationsPage() {
  const router = useRouter();
  const [recs, setRecs] = useState<RecommendationsResponse | null>(null);
  const [cropRecs, setCropRecs] = useState<CropRecommendationResponse | null>(null);
  const [irrigation, setIrrigation] = useState<IrrigationPlanResponse | null>(null);
  const [fertilizer, setFertilizer] = useState<FertilizerPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [form, setForm] = useState({ crop_type: "wheat", soil_ph: "6.5", nitrogen: "80", phosphorus: "40", potassium: "60", rainfall_mm: "850", temperature_c: "25", farm_area_hectares: "1.0" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [r, cr, irr, fert] = await Promise.all([
        api.getRecommendations(),
        api.getCropRecommendations(6.5, 80, 850, 25),
        api.getIrrigationPlan("wheat", 25, 850, 1.0),
        api.getFertilizerPlan("wheat", 80, 40, 60, 1.0),
      ]);
      setRecs(r); setCropRecs(cr); setIrrigation(irr); setFertilizer(fert);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const generateRecs = async () => {
    setLoading(true);
    try {
      const [r, cr, irr, fert] = await Promise.all([
        api.generateRecommendations({
          crop_type: form.crop_type, rainfall_mm: parseFloat(form.rainfall_mm),
          temperature_c: parseFloat(form.temperature_c), soil_ph: parseFloat(form.soil_ph),
          nitrogen: parseFloat(form.nitrogen), phosphorus: parseFloat(form.phosphorus),
          potassium: parseFloat(form.potassium), farm_area_hectares: parseFloat(form.farm_area_hectares),
        }),
        api.getCropRecommendations(parseFloat(form.soil_ph), parseFloat(form.nitrogen), parseFloat(form.rainfall_mm), parseFloat(form.temperature_c)),
        api.getIrrigationPlan(form.crop_type, parseFloat(form.temperature_c), parseFloat(form.rainfall_mm), parseFloat(form.farm_area_hectares)),
        api.getFertilizerPlan(form.crop_type, parseFloat(form.nitrogen), parseFloat(form.phosphorus), parseFloat(form.potassium), parseFloat(form.farm_area_hectares)),
      ]);
      setRecs(r); setCropRecs(cr); setIrrigation(irr); setFertilizer(fert);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const priorityColor = (p: string) => p === "high" ? "#ef4444" : p === "medium" ? "#f59e0b" : "#22c55e";

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: "48px", marginBottom: "16px" }}>💡</div><div style={{ color: "#22c55e", fontSize: "13px" }}>LOADING RECOMMENDATIONS...</div></div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f0a", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#ffffff" }}>
      <nav style={{ backgroundColor: "#0d1a0d", borderBottom: "1px solid #1a2e1a", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "#4a7a4a", cursor: "pointer", fontSize: "13px" }}>← Dashboard</button>
          <div style={{ width: "1px", height: "20px", backgroundColor: "#1a2e1a" }} />
          <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "15px" }}>💡 Recommendations</span>
          {["all", "crop", "irrigation", "fertilizer"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: activeTab === t ? "#22c55e" : "#4a7a4a", borderBottom: activeTab === t ? "2px solid #22c55e" : "2px solid transparent", padding: "4px 0" }}>{t}</button>
          ))}
        </div>
        <button onClick={() => { localStorage.clear(); router.push("/"); }} style={{ backgroundColor: "transparent", border: "1px solid #1a2e1a", borderRadius: "8px", padding: "6px 14px", color: "#6b9e6b", cursor: "pointer", fontSize: "12px" }}>Sign Out</button>
      </nav>

      <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "11px", color: "#22c55e", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>Milestone 3 — Module 3</div>
          <h1 style={{ fontSize: "32px", fontWeight: 800 }}>AI Recommendation Engine</h1>
          <p style={{ color: "#4a7a4a", fontSize: "14px" }}>Data-driven farming advice personalized for your conditions</p>
        </div>

        {/* Input Form */}
        <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Generate Custom Recommendations</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "#6b9e6b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Crop Type</label>
              <select value={form.crop_type} onChange={e => setForm({ ...form, crop_type: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", backgroundColor: "#0a0f0a", border: "1px solid #1a2e1a", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }}>
                {["wheat", "rice", "maize", "soybean", "cotton"].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            {[
              { key: "soil_ph", label: "Soil pH" }, { key: "nitrogen", label: "Nitrogen" },
              { key: "phosphorus", label: "Phosphorus" }, { key: "potassium", label: "Potassium" },
              { key: "rainfall_mm", label: "Rainfall (mm)" }, { key: "temperature_c", label: "Temp (°C)" },
              { key: "farm_area_hectares", label: "Area (ha)" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: "11px", color: "#6b9e6b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{f.label}</label>
                <input type="number" step="any" value={form[f.key as keyof typeof form]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", backgroundColor: "#0a0f0a", border: "1px solid #1a2e1a", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "#22c55e"} onBlur={e => e.target.style.borderColor = "#1a2e1a"} />
              </div>
            ))}
          </div>
          <button onClick={generateRecs} style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", borderRadius: "10px", padding: "12px 28px", color: "#0a0f0a", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>
            💡 Generate Recommendations →
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>

          {/* AI Recommendations */}
          <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
            <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>🤖 AI Recommendations</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(recs?.recommendations || []).map((rec: Recommendation, i: number) => {
                const priority = rec.priority || "medium";
                return (
                  <div key={i} style={{ padding: "14px", backgroundColor: "#0a0f0a", borderRadius: "10px", borderLeft: `3px solid ${priorityColor(priority)}`, border: `1px solid ${priorityColor(priority)}20` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", color: priorityColor(priority), fontWeight: 700 }}>{rec.category}</span>
                      <span style={{ fontSize: "10px", color: priorityColor(priority), backgroundColor: `${priorityColor(priority)}15`, borderRadius: "100px", padding: "2px 8px" }}>{priority.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>{rec.title}</div>
                    <div style={{ fontSize: "12px", color: "#6b9e6b", lineHeight: 1.5, marginBottom: "8px" }}>{rec.message}</div>
                    {rec.expected_benefit && <div style={{ fontSize: "11px", color: "#22c55e" }}>✓ {rec.expected_benefit}</div>}
                    {rec.action && <button style={{ marginTop: "8px", fontSize: "11px", color: "#22c55e", backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "6px", padding: "4px 12px", cursor: "pointer" }}>{rec.action} →</button>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Crop Recommendations */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
              <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>🌾 Best Crops for Your Soil</div>
              {cropRecs?.recommended_crops?.map((crop: { crop: string; expected_yield: string; suitability: string; profit_potential: string }, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", backgroundColor: "#0a0f0a", borderRadius: "8px", marginBottom: "8px", border: "1px solid #1a2e1a" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>🌾 {crop.crop}</div>
                    <div style={{ fontSize: "11px", color: "#4a7a4a" }}>{crop.expected_yield}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "12px", color: crop.suitability === "Excellent" ? "#22c55e" : "#f59e0b", fontWeight: 700 }}>{crop.suitability}</div>
                    <div style={{ fontSize: "11px", color: "#4a7a4a" }}>{crop.profit_potential} profit</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Profit Estimate */}
            {recs?.profit_estimate && (
              <div style={{ backgroundColor: "#0d1a0d", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "16px", padding: "20px" }}>
                <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>💰 Profit Estimate</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {[
                    { label: "Est. Yield", value: `${recs.profit_estimate.estimated_yield_tons} t` },
                    { label: "Price/Ton", value: `₹${recs.profit_estimate.price_per_ton_inr?.toLocaleString()}` },
                    { label: "Est. Revenue", value: `₹${recs.profit_estimate.estimated_revenue_inr?.toLocaleString()}`, highlight: true },
                    { label: "Area", value: `${recs.profit_estimate.area_hectares} ha` },
                  ].map(s => (
                    <div key={s.label} style={{ backgroundColor: "#0a0f0a", borderRadius: "8px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: s.highlight ? "#22c55e" : "#ffffff" }}>{s.value}</div>
                      <div style={{ fontSize: "10px", color: "#4a7a4a" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

          {/* Irrigation Plan */}
          {irrigation && (
            <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
              <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>💧 Smart Irrigation Plan</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <div style={{ backgroundColor: "#0a0f0a", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#3b82f6" }}>{irrigation.daily_water_requirement_mm} mm</div>
                  <div style={{ fontSize: "10px", color: "#4a7a4a" }}>Daily Water Req.</div>
                </div>
                <div style={{ backgroundColor: "#0a0f0a", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#3b82f6" }}>{irrigation.weekly_water_liters?.toLocaleString()} L</div>
                  <div style={{ fontSize: "10px", color: "#4a7a4a" }}>Weekly Total</div>
                </div>
              </div>
              <div style={{ fontSize: "11px", color: "#4a7a4a", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Schedule</div>
              {irrigation.irrigation_schedule?.map((day: { day: string; water_liters?: number; time: string }, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#0a0f0a", borderRadius: "6px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600 }}>{day.day}</span>
                  <span style={{ fontSize: "12px", color: "#3b82f6" }}>{day.water_liters?.toLocaleString()} L</span>
                  <span style={{ fontSize: "11px", color: "#4a7a4a" }}>{day.time}</span>
                </div>
              ))}
              <div style={{ marginTop: "12px" }}>
                <div style={{ fontSize: "11px", color: "#4a7a4a", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Water Saving Tips</div>
                {irrigation.water_saving_tips?.map((tip: string, i: number) => (
                  <div key={i} style={{ fontSize: "12px", color: "#6b9e6b", marginBottom: "4px" }}>✓ {tip}</div>
                ))}
              </div>
            </div>
          )}

          {/* Fertilizer Plan */}
          {fertilizer && (
            <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
              <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>🌿 Fertilizer Plan</div>
              <div style={{ backgroundColor: "#0a0f0a", borderRadius: "8px", padding: "12px", marginBottom: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#f59e0b" }}>₹{fertilizer.total_cost_estimate_inr?.toLocaleString()}</div>
                <div style={{ fontSize: "11px", color: "#4a7a4a" }}>Estimated Total Cost</div>
              </div>
              {fertilizer.fertilizer_plan?.map((item: { nutrient: string; fertilizer: string; quantity_kg: number; timing: string; method: string }, i: number) => (
                <div key={i} style={{ padding: "14px", backgroundColor: "#0a0f0a", borderRadius: "10px", marginBottom: "10px", border: "1px solid #1a2e1a" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>🌿 {item.nutrient}</span>
                    <span style={{ fontSize: "13px", color: "#f59e0b", fontWeight: 700 }}>{item.quantity_kg} kg</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b9e6b", marginBottom: "4px" }}>{item.fertilizer}</div>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <span style={{ fontSize: "11px", color: "#4a7a4a" }}>⏱ {item.timing}</span>
                    <span style={{ fontSize: "11px", color: "#4a7a4a" }}>📋 {item.method}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
