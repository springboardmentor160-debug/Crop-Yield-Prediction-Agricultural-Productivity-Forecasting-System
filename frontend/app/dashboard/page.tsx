"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getToken, getStoredUser, clearSession } from "@/lib/auth";

export default function LiveDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [farms, setFarms] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [latestPrediction, setLatestPrediction] = useState<any>(null);
  const [modelMetrics, setModelMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    try {
    const [farmsData, weatherData, metricsData, historyData] =
  await Promise.all([
    api.getFarms(),
    api.getCurrentWeather("Bhubaneswar"),
    api.getModelMetrics(),
    api.getPredictionHistory(),
  ]);
      setFarms(farmsData);
      setWeather(weatherData);
      setModelMetrics(metricsData);
      if (historyData && historyData.length > 0) {
        setLatestPrediction(historyData[0]);
      }
      setLastUpdated(new Date());
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      if (/not authenticated|invalid token|permission denied/i.test(message)) {
        clearSession();
        router.push("/");
        return;
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      clearSession();
      router.push("/");
      return;
    }

    const storedUser = getStoredUser();
    if (!storedUser) {
      clearSession();
      router.push("/");
      return;
    }

    setUser(storedUser);
    loadData();
    // Auto refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData, router]);

  const alerts = [
    { type: "warning", icon: "🌧️", message: "Heavy rain expected tomorrow", time: "2h ago" },
    { type: "info", icon: "💧", message: "Low soil moisture detected", time: "4h ago" },
    { type: "danger", icon: "🌡️", message: "High temperature warning", time: "6h ago" },
    { type: "success", icon: "🌾", message: "Harvest season approaching", time: "1d ago" },
  ];

  const recommendations = [
    { icon: "🌿", text: "Add Nitrogen Fertilizer", priority: "high" },
    { icon: "💧", text: "Delay Irrigation 2 days", priority: "medium" },
    { icon: "🌾", text: "Best Crop: Wheat this season", priority: "high" },
    { icon: "🦠", text: "Disease Risk: Low", priority: "low" },
  ];

  const alertColor = (type: string) => {
    if (type === "warning") return "#f59e0b";
    if (type === "danger") return "#ef4444";
    if (type === "success") return "#22c55e";
    return "#3b82f6";
  };

  const priorityColor = (p: string) => {
    if (p === "high") return "#ef4444";
    if (p === "medium") return "#f59e0b";
    return "#22c55e";
  };

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌾</div>
        <div style={{ color: "#22c55e", letterSpacing: "0.15em", fontSize: "13px" }}>LOADING YIELDSENSE AI...</div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Greeting row - was a sticky duplicate top bar, now just a content header
          since DashboardLayout already provides the sidebar + top bar chrome */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <span style={{ fontSize: "16px", fontWeight: 700 }}>Good day, {user?.full_name} 👋</span>
          <span style={{ fontSize: "11px", color: "#4a7a4a", marginLeft: "12px" }}>Updated {lastUpdated.toLocaleTimeString()}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={loadData} style={{ backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "6px", padding: "5px 12px", color: "#22c55e", cursor: "pointer", fontSize: "11px" }}>↻ Refresh</button>
          <button onClick={() => router.push("/predict")} style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", borderRadius: "6px", padding: "5px 14px", color: "#0a0f0a", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}>+ New Prediction</button>
        </div>
      </div>

      {/* Weather + Latest Prediction Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>

        {/* Weather Card */}
        <div style={{ background: "linear-gradient(135deg, #0d1a3d, #0a0f20)", border: "1px solid #1a1a4a", borderRadius: "14px", padding: "20px" }}>
          <div style={{ fontSize: "10px", color: "#3b82f6", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>🌤️ Current Weather</div>
          <div style={{ fontSize: "40px", fontWeight: 900, color: "#3b82f6", lineHeight: 1 }}>{weather?.temperature_c || "—"}°C</div>
          <div style={{ fontSize: "12px", color: "#4a4a7a", marginTop: "6px", marginBottom: "12px" }}>{weather?.condition || "Loading..."}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div style={{ backgroundColor: "rgba(59,130,246,0.08)", borderRadius: "6px", padding: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#3b82f6" }}>{weather?.humidity_percent || "—"}%</div>
              <div style={{ fontSize: "10px", color: "#4a4a7a" }}>Humidity</div>
            </div>
            <div style={{ backgroundColor: "rgba(59,130,246,0.08)", borderRadius: "6px", padding: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#3b82f6" }}>{weather?.rainfall_mm_annual || "—"}mm</div>
              <div style={{ fontSize: "10px", color: "#4a4a7a" }}>Annual Rain</div>
            </div>
          </div>
          <div style={{ fontSize: "10px", color: "#2a2a4a", marginTop: "8px" }}>{weather?.agricultural_advisory}</div>
        </div>

        {/* Latest Prediction */}
        <div style={{ background: "linear-gradient(135deg, #0d2e0d, #0a1a0a)", border: "1px solid #1a4a1a", borderRadius: "14px", padding: "20px" }}>
          <div style={{ fontSize: "10px", color: "#22c55e", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>🌾 Latest Yield Prediction</div>
          {latestPrediction ? (
            <>
              <div style={{ fontSize: "40px", fontWeight: 900, color: "#22c55e", lineHeight: 1 }}>{latestPrediction.predicted_yield_tons_per_ha}</div>
              <div style={{ fontSize: "12px", color: "#4a7a4a", marginTop: "4px", marginBottom: "12px" }}>tons per hectare · {latestPrediction.crop_type}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div style={{ backgroundColor: "rgba(34,197,94,0.08)", borderRadius: "6px", padding: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#22c55e" }}>{latestPrediction.confidence_score}%</div>
                  <div style={{ fontSize: "10px", color: "#4a7a4a" }}>AI Confidence</div>
                </div>
                <div style={{ backgroundColor: "rgba(34,197,94,0.08)", borderRadius: "6px", padding: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: latestPrediction.risk_level === "Low" ? "#22c55e" : latestPrediction.risk_level === "Medium" ? "#f59e0b" : "#ef4444" }}>{latestPrediction.risk_level}</div>
                  <div style={{ fontSize: "10px", color: "#4a7a4a" }}>Risk Level</div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🌱</div>
              <div style={{ fontSize: "12px", color: "#4a7a4a" }}>No predictions yet</div>
              <button onClick={() => router.push("/predict")} style={{ marginTop: "12px", backgroundColor: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "6px", padding: "6px 14px", color: "#22c55e", cursor: "pointer", fontSize: "11px" }}>Make First Prediction →</button>
            </div>
          )}
        </div>

        {/* Model Performance */}
        <div style={{ background: "linear-gradient(135deg, #1a0a2e, #0f0a1a)", border: "1px solid #2a1a4a", borderRadius: "14px", padding: "20px" }}>
          <div style={{ fontSize: "10px", color: "#a855f7", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>🤖 AI Model Status</div>
          <div style={{ fontSize: "40px", fontWeight: 900, color: "#a855f7", lineHeight: 1 }}>{modelMetrics?.accuracy_percent || "—"}%</div>
          <div style={{ fontSize: "12px", color: "#6b4a9e", marginTop: "4px", marginBottom: "12px" }}>Model Accuracy</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div style={{ backgroundColor: "rgba(168,85,247,0.08)", borderRadius: "6px", padding: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#a855f7" }}>{modelMetrics?.mae || "—"}</div>
              <div style={{ fontSize: "10px", color: "#4a4a5a" }}>MAE t/ha</div>
            </div>
            <div style={{ backgroundColor: "rgba(168,85,247,0.08)", borderRadius: "6px", padding: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#a855f7" }}>{modelMetrics?.n_crops || "—"}</div>
              <div style={{ fontSize: "10px", color: "#4a4a5a" }}>Crop Types</div>
            </div>
          </div>
          <div style={{ marginTop: "8px" }}>
            <div style={{ height: "4px", backgroundColor: "#1a1a2a", borderRadius: "2px" }}>
              <div style={{ height: "100%", width: `${modelMetrics?.accuracy_percent || 0}%`, background: "linear-gradient(90deg, #a855f7, #c084fc)", borderRadius: "2px" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { icon: "🏡", label: "Total Farms", value: farms.length, color: "#22c55e" },
          { icon: "📊", label: "Predictions Made", value: "—", color: "#3b82f6" },
          { icon: "🌾", label: "Avg Yield", value: latestPrediction ? `${latestPrediction.predicted_yield_tons_per_ha} t/ha` : "—", color: "#f59e0b" },
          { icon: "⚠️", label: "Active Alerts", value: alerts.length, color: "#ef4444" },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "10px", padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "24px" }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "#4a7a4a" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>

        {/* Alerts */}
        <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "14px", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700 }}>🚨 Smart Alerts</div>
            <button onClick={() => router.push("/alerts")} style={{ fontSize: "11px", color: "#22c55e", backgroundColor: "transparent", border: "none", cursor: "pointer" }}>View all →</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {alerts.map((alert, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", backgroundColor: "#0a0f0a", borderRadius: "8px", borderLeft: `3px solid ${alertColor(alert.type)}` }}>
                <span style={{ fontSize: "18px" }}>{alert.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", fontWeight: 600 }}>{alert.message}</div>
                  <div style={{ fontSize: "10px", color: "#4a7a4a" }}>{alert.time}</div>
                </div>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: alertColor(alert.type) }} />
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "14px", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700 }}>🤖 AI Recommendations</div>
            <button onClick={() => router.push("/advisor")} style={{ fontSize: "11px", color: "#22c55e", backgroundColor: "transparent", border: "none", cursor: "pointer" }}>View all →</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recommendations.map((rec, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", backgroundColor: "#0a0f0a", borderRadius: "8px", border: "1px solid #1a2e1a" }}>
                <span style={{ fontSize: "18px" }}>{rec.icon}</span>
                <div style={{ flex: 1, fontSize: "12px", fontWeight: 500 }}>{rec.text}</div>
                <span style={{ fontSize: "10px", color: priorityColor(rec.priority), backgroundColor: `${priorityColor(rec.priority)}15`, borderRadius: "100px", padding: "2px 8px" }}>{rec.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Farms + Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>

        {/* Farms */}
        <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "14px", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700 }}>🚜 My Farms</div>
            <button onClick={() => router.push("/farms")} style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", borderRadius: "6px", padding: "6px 14px", color: "#0a0f0a", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}>+ Add Farm</button>
          </div>
          {farms.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: "#4a7a4a" }}>
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>🌾</div>
              <div style={{ fontSize: "13px" }}>No farms yet. Add your first farm!</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
              {farms.map(farm => (
                <div key={farm.id}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#22c55e"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1a2e1a"}
                  style={{ backgroundColor: "#0a0f0a", border: "1px solid #1a2e1a", borderRadius: "10px", padding: "14px", cursor: "pointer", transition: "border-color 0.2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "18px" }}>🏡</span>
                    <span style={{ fontSize: "10px", color: "#22c55e", backgroundColor: "rgba(34,197,94,0.1)", borderRadius: "100px", padding: "2px 6px" }}>ACTIVE</span>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "2px" }}>{farm.farm_name}</div>
                  <div style={{ fontSize: "11px", color: "#4a7a4a", marginBottom: "8px" }}>{farm.location || "No location"}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                    <div style={{ fontSize: "10px", color: "#6b9e6b" }}>📐 {farm.area_hectares || "—"} ha</div>
                    <div style={{ fontSize: "10px", color: "#6b9e6b" }}>🧪 pH {farm.soil_ph || "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "14px", padding: "20px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "16px" }}>⚡ Quick Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { icon: "🌾", label: "Predict Yield", href: "/predict", color: "#22c55e" },
              { icon: "🌤️", label: "Check Weather", href: "/weather", color: "#3b82f6" },
              { icon: "🧪", label: "Soil Analysis", href: "/soil", color: "#f59e0b" },
              { icon: "🤖", label: "AI Advisor", href: "/advisor", color: "#ec4899" },
              { icon: "📈", label: "Generate Report", href: "/reports", color: "#6366f1" },
            ].map(action => (
              <button key={action.href} onClick={() => router.push(action.href)}
                onMouseEnter={e => e.currentTarget.style.borderColor = action.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1a2e1a"}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", backgroundColor: "#0a0f0a", border: "1px solid #1a2e1a", borderRadius: "8px", cursor: "pointer", transition: "border-color 0.2s", width: "100%", textAlign: "left" }}>
                <span style={{ fontSize: "16px" }}>{action.icon}</span>
                <span style={{ fontSize: "12px", fontWeight: 500, color: "#6b9e6b" }}>{action.label}</span>
                <span style={{ marginLeft: "auto", color: action.color, fontSize: "12px" }}>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}