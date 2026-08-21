"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { DashboardAnalyticsResponse, YieldTrendResponse, FarmComparisonResponse, FarmComparisonItem, CropPerformanceResponse, CropPerformanceItem, ProductivityResponse } from "@/lib/types";

export default function AnalyticsPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardAnalyticsResponse | null>(null);
  const [trends, setTrends] = useState<YieldTrendResponse | null>(null);
  const [farmComp, setFarmComp] = useState<FarmComparisonResponse | null>(null);
  const [cropPerf, setCropPerf] = useState<CropPerformanceResponse | null>(null);
  const [productivity, setProductivity] = useState<ProductivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [d, t, f, c, p] = await Promise.all([
        api.getDashboardAnalytics(),
        api.getYieldTrends(),
        api.getFarmComparison(),
        api.getCropPerformance(),
        api.getProductivity(),
      ]);
      setDashboard(d); setTrends(t); setFarmComp(f); setCropPerf(c); setProductivity(p);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
        <div style={{ color: "#22c55e", letterSpacing: "0.15em", fontSize: "13px" }}>LOADING ANALYTICS...</div>
      </div>
    </div>
  );

  const tabs = ["overview", "yield-trends", "farm-comparison", "crop-performance", "productivity"];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f0a", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#ffffff" }}>
      <nav style={{ backgroundColor: "#0d1a0d", borderBottom: "1px solid #1a2e1a", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "#4a7a4a", cursor: "pointer", fontSize: "13px" }}>← Dashboard</button>
          <div style={{ width: "1px", height: "20px", backgroundColor: "#1a2e1a" }} />
          <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "15px" }}>📊 Analytics</span>
          <div style={{ display: "flex", gap: "16px" }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: activeTab === tab ? "#22c55e" : "#4a7a4a", borderBottom: activeTab === tab ? "2px solid #22c55e" : "2px solid transparent", padding: "4px 0" }}>
                {tab.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => { localStorage.clear(); router.push("/"); }} style={{ backgroundColor: "transparent", border: "1px solid #1a2e1a", borderRadius: "8px", padding: "6px 14px", color: "#6b9e6b", cursor: "pointer", fontSize: "12px" }}>Sign Out</button>
      </nav>

      <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "11px", color: "#22c55e", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>Milestone 3 — Module 6</div>
          <h1 style={{ fontSize: "32px", fontWeight: 800 }}>Agricultural Analytics</h1>
          <p style={{ color: "#4a7a4a", fontSize: "14px" }}>Real-time insights and performance metrics</p>
        </div>

        {/* KPI Cards */}
        {dashboard && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
            {[
              { label: "Total Farms", value: dashboard.total_farms, icon: "🏡", color: "#22c55e" },
              { label: "Total Predictions", value: dashboard.total_predictions, icon: "📊", color: "#3b82f6" },
              { label: "Avg Yield", value: `${dashboard.average_yield} t/ha`, icon: "🌾", color: "#f59e0b" },
              { label: "Model Accuracy", value: `${dashboard.model_accuracy}%`, icon: "🤖", color: "#a855f7" },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "12px", padding: "20px" }}>
                <div style={{ fontSize: "24px", marginBottom: "10px" }}>{s.icon}</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "11px", color: "#4a7a4a", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Productivity Card */}
        {productivity && (
          <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Productivity Overview</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
              {[
                { label: "Total Area", value: `${productivity.total_area_hectares} ha`, color: "#22c55e" },
                { label: "Est. Production", value: `${productivity.estimated_production_tons} t`, color: "#f59e0b" },
                { label: "Est. Revenue", value: `₹${productivity.estimated_revenue_inr?.toLocaleString()}`, color: "#3b82f6" },
                { label: "Performance", value: productivity.performance_rating, color: "#a855f7" },
              ].map(s => (
                <div key={s.label} style={{ backgroundColor: "#0a0f0a", border: "1px solid #1a2e1a", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: s.color, marginBottom: "4px" }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "#4a7a4a" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", color: "#4a7a4a" }}>Productivity Score</span>
                <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 700 }}>{productivity.productivity_score}%</span>
              </div>
              <div style={{ height: "8px", backgroundColor: "#0a0f0a", borderRadius: "4px" }}>
                <div style={{ height: "100%", width: `${productivity.productivity_score}%`, background: "linear-gradient(90deg, #22c55e, #4ade80)", borderRadius: "4px" }} />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Farm Comparison */}
          {farmComp && (
            <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
              <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Farm Comparison</div>
              {farmComp.farm_comparison?.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#4a7a4a" }}>No farms data yet</div>
              ) : (
                farmComp.farm_comparison?.map((farm: FarmComparisonItem, i: number) => (
                  <div key={i} style={{ padding: "14px", backgroundColor: "#0a0f0a", borderRadius: "10px", marginBottom: "10px", border: "1px solid #1a2e1a" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>🏡 {farm.farm_name}</div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#22c55e" }}>{farm.average_yield} t/ha</div>
                    </div>
                    <div style={{ fontSize: "11px", color: "#4a7a4a", marginBottom: "8px" }}>{farm.location} · {farm.area_hectares} ha</div>
                    <div style={{ height: "4px", backgroundColor: "#1a2e1a", borderRadius: "2px" }}>
                      <div style={{ height: "100%", width: `${Math.min(100, (farm.average_yield / 8) * 100)}%`, backgroundColor: "#22c55e", borderRadius: "2px" }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Crop Performance */}
          {cropPerf && (
            <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
              <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Crop Performance</div>
              {cropPerf.crop_performance?.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#4a7a4a" }}>No prediction data yet. Make predictions first!</div>
              ) : (
                cropPerf.crop_performance?.map((crop: CropPerformanceItem, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", backgroundColor: "#0a0f0a", borderRadius: "8px", marginBottom: "8px", border: "1px solid #1a2e1a" }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>🌾 {crop.crop}</div>
                      <div style={{ fontSize: "11px", color: "#4a7a4a" }}>{crop.prediction_count} predictions</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#f59e0b" }}>{crop.average_yield} t/ha</div>
                      <div style={{ fontSize: "10px", color: "#4a7a4a" }}>avg yield</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
