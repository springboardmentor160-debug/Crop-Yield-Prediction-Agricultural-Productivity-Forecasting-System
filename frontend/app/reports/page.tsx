"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { PredictionReport, FarmReport, WeatherReport, SoilReport, PredictionHistoryOut, Farm } from "@/lib/types";

export default function ReportsPage() {
  const router = useRouter();
  const [predReport, setPredReport] = useState<PredictionReport | null>(null);
  const [farmReport, setFarmReport] = useState<FarmReport | null>(null);
  const [weatherReport, setWeatherReport] = useState<WeatherReport | null>(null);
  const [soilReport, setSoilReport] = useState<SoilReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState("prediction");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [p, f, w, s] = await Promise.all([
        api.getPredictionReport(),
        api.getFarmReport(),
        api.getWeatherReport(),
        api.getSoilReport(),
      ]);
      setPredReport(p); setFarmReport(f); setWeatherReport(w); setSoilReport(s);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const exportCSV = async () => {
    setExporting(true);
    try {
      const data = await api.exportCSV();
      const blob = new Blob([data.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = data.filename; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { alert("Export failed"); }
    finally { setExporting(false); }
  };

  const riskColor = (r: string) => r === "Low" ? "#22c55e" : r === "Medium" ? "#f59e0b" : "#ef4444";

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: "48px", marginBottom: "16px" }}>📈</div><div style={{ color: "#22c55e", fontSize: "13px" }}>LOADING REPORTS...</div></div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f0a", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#ffffff" }}>
      <nav style={{ backgroundColor: "#0d1a0d", borderBottom: "1px solid #1a2e1a", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "#4a7a4a", cursor: "pointer", fontSize: "13px" }}>← Dashboard</button>
          <div style={{ width: "1px", height: "20px", backgroundColor: "#1a2e1a" }} />
          <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "15px" }}>📈 Reports & Export</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={exportCSV} disabled={exporting} style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", borderRadius: "8px", padding: "6px 16px", color: "#0a0f0a", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>
            {exporting ? "Exporting..." : "⬇️ Export CSV"}
          </button>
          <button onClick={() => window.print()} style={{ backgroundColor: "transparent", border: "1px solid #1a2e1a", borderRadius: "8px", padding: "6px 14px", color: "#6b9e6b", cursor: "pointer", fontSize: "12px" }}>🖨️ Print</button>
          <button onClick={() => { localStorage.clear(); router.push("/"); }} style={{ backgroundColor: "transparent", border: "1px solid #1a2e1a", borderRadius: "8px", padding: "6px 14px", color: "#6b9e6b", cursor: "pointer", fontSize: "12px" }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "11px", color: "#22c55e", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>Milestone 3 — Module 4</div>
          <h1 style={{ fontSize: "32px", fontWeight: 800 }}>Reports & Export Center</h1>
          <p style={{ color: "#4a7a4a", fontSize: "14px" }}>Generate and export professional agricultural reports</p>
        </div>

        {/* Report Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {[
            { key: "prediction", label: "📊 Prediction Report" },
            { key: "farm", label: "🏡 Farm Report" },
            { key: "weather", label: "🌤️ Weather Report" },
            { key: "soil", label: "🧪 Soil Report" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveReport(tab.key)} style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid", cursor: "pointer", fontSize: "13px", fontWeight: activeReport === tab.key ? 700 : 400, backgroundColor: activeReport === tab.key ? "#22c55e" : "transparent", color: activeReport === tab.key ? "#0a0f0a" : "#4a7a4a", borderColor: activeReport === tab.key ? "#22c55e" : "#1a2e1a" }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Prediction Report */}
        {activeReport === "prediction" && predReport && (
          <div>
            <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#4a7a4a", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "4px" }}>Report Type</div>
                  <div style={{ fontSize: "20px", fontWeight: 700 }}>{predReport.report_type}</div>
                  <div style={{ fontSize: "12px", color: "#4a7a4a" }}>Generated: {new Date(predReport.generated_at).toLocaleString()} · By: {predReport.generated_by}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                {[
                  { label: "Total Predictions", value: predReport.summary?.total_predictions },
                  { label: "Avg Yield", value: `${predReport.summary?.average_yield} t/ha` },
                  { label: "High Risk", value: predReport.summary?.high_risk_count },
                  { label: "Low Risk", value: predReport.summary?.low_risk_count },
                ].map(s => (
                  <div key={s.label} style={{ backgroundColor: "#0a0f0a", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: "#22c55e" }}>{s.value}</div>
                    <div style={{ fontSize: "11px", color: "#4a7a4a" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
              <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Prediction History</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px", padding: "10px 14px", backgroundColor: "#0a0f0a", borderRadius: "8px", marginBottom: "8px" }}>
                {["Crop", "Yield (t/ha)", "Confidence", "Risk", "Rainfall", "Date"].map(h => (
                  <div key={h} style={{ fontSize: "11px", color: "#4a7a4a", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
                ))}
              </div>
              {predReport.predictions?.map((p: { crop_type: string; predicted_yield: number; confidence: number; risk_level: string; rainfall_mm: number; date: string }, i: number) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px", padding: "12px 14px", borderBottom: "1px solid #1a2e1a", alignItems: "center" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>🌾 {p.crop_type}</div>
                  <div style={{ fontSize: "13px", color: "#22c55e", fontWeight: 700 }}>{p.predicted_yield}</div>
                  <div style={{ fontSize: "13px", color: "#3b82f6" }}>{p.confidence}%</div>
                  <div><span style={{ fontSize: "11px", color: riskColor(p.risk_level), backgroundColor: `${riskColor(p.risk_level)}15`, borderRadius: "100px", padding: "2px 8px" }}>{p.risk_level}</span></div>
                  <div style={{ fontSize: "12px", color: "#6b9e6b" }}>{p.rainfall_mm}mm</div>
                  <div style={{ fontSize: "11px", color: "#4a7a4a" }}>{p.date}</div>
                </div>
              ))}
              {predReport.predictions?.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "#4a7a4a" }}>No predictions yet. Make your first prediction!</div>
              )}
            </div>
          </div>
        )}

        {/* Farm Report */}
        {activeReport === "farm" && farmReport && (
          <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>{farmReport.report_type}</div>
              <div style={{ fontSize: "12px", color: "#4a7a4a" }}>Total Farms: {farmReport.total_farms} · Generated: {new Date(farmReport.generated_at).toLocaleString()}</div>
            </div>
            {farmReport.farms?.map((farm: { farm_name: string; location: string; area_hectares: number; soil_ph: number; total_predictions: number; avg_yield: number; created_date: string }, i: number) => (
              <div key={i} style={{ padding: "16px", backgroundColor: "#0a0f0a", borderRadius: "10px", marginBottom: "12px", border: "1px solid #1a2e1a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 700 }}>🏡 {farm.farm_name}</div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#22c55e" }}>{farm.avg_yield} t/ha</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                  <div><div style={{ fontSize: "12px", color: "#4a7a4a" }}>Location</div><div style={{ fontSize: "13px" }}>{farm.location || "—"}</div></div>
                  <div><div style={{ fontSize: "12px", color: "#4a7a4a" }}>Area</div><div style={{ fontSize: "13px" }}>{farm.area_hectares} ha</div></div>
                  <div><div style={{ fontSize: "12px", color: "#4a7a4a" }}>Soil pH</div><div style={{ fontSize: "13px" }}>{farm.soil_ph}</div></div>
                  <div><div style={{ fontSize: "12px", color: "#4a7a4a" }}>Predictions</div><div style={{ fontSize: "13px" }}>{farm.total_predictions}</div></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Weather Report */}
        {activeReport === "weather" && weatherReport && (
          <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
            <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>{weatherReport.report_type}</div>
            <div style={{ fontSize: "12px", color: "#4a7a4a", marginBottom: "20px" }}>Period: {weatherReport.period}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
              {[
                { label: "Avg Temperature", value: `${weatherReport.summary?.avg_temperature_c}°C`, color: "#ef4444" },
                { label: "Total Rainfall", value: `${weatherReport.summary?.total_rainfall_mm}mm`, color: "#3b82f6" },
                { label: "Peak Rain Month", value: weatherReport.summary?.peak_rain_month, color: "#22c55e" },
                { label: "Weather Alerts", value: weatherReport.summary?.weather_alerts, color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} style={{ backgroundColor: "#0a0f0a", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "#4a7a4a" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "120px", marginBottom: "16px" }}>
              {weatherReport.monthly_data?.map((m: { month: string; rain: number }, i: number) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "100%", height: `${(m.rain / 320) * 100}px`, background: "linear-gradient(180deg, #3b82f6, #1d4ed8)", borderRadius: "3px 3px 0 0", minHeight: "3px" }} />
                  <div style={{ fontSize: "9px", color: "#4a7a4a" }}>{m.month}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Soil Report */}
        {activeReport === "soil" && soilReport && (
          <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>{soilReport.report_type}</div>
                <div style={{ fontSize: "12px", color: "#4a7a4a" }}>Overall Health: <span style={{ color: "#22c55e", fontWeight: 700 }}>{soilReport.overall_soil_health}</span></div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px", fontWeight: 900, color: "#f59e0b" }}>{soilReport.health_score}</div>
                <div style={{ fontSize: "11px", color: "#4a7a4a" }}>Health Score</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
              {Object.entries(soilReport.parameters || {}).map(([key, val]: [string, { value: number | string; unit?: string; status: string }]) => (
                <div key={key} style={{ backgroundColor: "#0a0f0a", borderRadius: "10px", padding: "14px", border: "1px solid #1a2e1a" }}>
                  <div style={{ fontSize: "12px", color: "#4a7a4a", textTransform: "capitalize", marginBottom: "4px" }}>{key.replace("_", " ")}</div>
                  <div style={{ fontSize: "16px", fontWeight: 700 }}>{val.value} {val.unit || ""}</div>
                  <div style={{ fontSize: "11px", color: val.status === "Optimal" ? "#22c55e" : val.status === "Good" ? "#22c55e" : "#f59e0b", marginTop: "4px" }}>{val.status}</div>
                </div>
              ))}
            </div>
            <div style={{ backgroundColor: "#0a0f0a", borderRadius: "10px", padding: "16px" }}>
              <div style={{ fontSize: "11px", color: "#4a7a4a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Recommendations</div>
              {soilReport.recommendations?.map((r: string, i: number) => (
                <div key={i} style={{ fontSize: "13px", color: "#6b9e6b", marginBottom: "6px" }}>✓ {r}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
