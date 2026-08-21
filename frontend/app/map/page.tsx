"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Farm } from "@/lib/types";

interface FarmLocation {
  id: number;
  name: string;
  farm_name: string;
  latitude: number;
  longitude: number;
  location: string;
  area_hectares?: number | null;
  soil_ph?: number | null;
  risk_level?: string;
  avg_yield?: number;
  total_predictions?: number;
  marker_color?: string;
}

interface SoilZone {
  id: number;
  zone: string;
  name: string;
  coordinates: number[][];
  soil_type: string;
  ph: number;
  fertility: string;
}

interface WeatherStation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  status: string;
}

interface SoilLab {
  id: number;
  name: string;
  distance_km: number;
  contact: string;
}

interface StationsResponse {
  weather_stations?: WeatherStation[];
  soil_labs?: SoilLab[];
}

export default function GISPage() {
  const router = useRouter();
  const [farms, setFarms] = useState<FarmLocation[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<FarmLocation | null>(null);
  const [soilZones, setSoilZones] = useState<SoilZone[]>([]);
  const [stations, setStations] = useState<StationsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [locs, zones, stat] = await Promise.all([
        api.getFarmLocations(),
        api.getSoilZones(),
        api.getNearbyStations(),
      ]);
      setFarms(locs.farms || []);
      setSoilZones(zones.zones || []);
      setStations(stat);
      if (locs.farms?.length > 0) setSelectedFarm(locs.farms[0]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const riskColor = (r: string) => r === "Low" ? "#22c55e" : r === "Medium" ? "#f59e0b" : r === "Unknown" ? "#6b9e6b" : "#ef4444";

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🗺️</div>
        <div style={{ color: "#22c55e", letterSpacing: "0.15em", fontSize: "13px" }}>LOADING FARM MAP...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f0a", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#ffffff" }}>
      <nav style={{ backgroundColor: "#0d1a0d", borderBottom: "1px solid #1a2e1a", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "#4a7a4a", cursor: "pointer", fontSize: "13px" }}>← Dashboard</button>
          <div style={{ width: "1px", height: "20px", backgroundColor: "#1a2e1a" }} />
          <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "15px" }}>🗺️ Farm Map & GIS</span>
        </div>
        <button onClick={() => { localStorage.clear(); router.push("/"); }} style={{ backgroundColor: "transparent", border: "1px solid #1a2e1a", borderRadius: "8px", padding: "6px 14px", color: "#6b9e6b", cursor: "pointer", fontSize: "12px" }}>Sign Out</button>
      </nav>

      <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "11px", color: "#22c55e", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>GIS Module</div>
          <h1 style={{ fontSize: "32px", fontWeight: 800 }}>Farm Map & Location Intelligence</h1>
          <p style={{ color: "#4a7a4a", fontSize: "14px" }}>Interactive farm locations with weather and soil overlays</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "20px", marginBottom: "20px" }}>

          {/* Farm List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
              <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>🏡 Farm Locations ({farms.length})</div>
              {farms.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#4a7a4a" }}>
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>🗺️</div>
                  <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>No farms mapped yet</div>
                  <div style={{ fontSize: "12px" }}>Add farms with GPS coordinates to see them on the map</div>
                  <button onClick={() => router.push("/farms")} style={{ marginTop: "16px", background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", borderRadius: "8px", padding: "8px 20px", color: "#0a0f0a", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>+ Add Farm</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {farms.map((farm) => (
                    <div key={farm.id} onClick={() => setSelectedFarm(farm)}
                      style={{ padding: "14px", backgroundColor: selectedFarm?.id === farm.id ? "rgba(34,197,94,0.1)" : "#0a0f0a", borderRadius: "10px", border: `1px solid ${selectedFarm?.id === farm.id ? "#22c55e" : "#1a2e1a"}`, cursor: "pointer", transition: "all 0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600 }}>🏡 {farm.farm_name}</div>
                        <span style={{ fontSize: "10px", color: riskColor(farm.risk_level || "Low"), backgroundColor: `${riskColor(farm.risk_level || "Low")}15`, borderRadius: "100px", padding: "2px 8px" }}>{farm.risk_level || "Low"} Risk</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#4a7a4a", marginBottom: "6px" }}>📍 {farm.farm_name}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                        <div style={{ fontSize: "10px", color: "#6b9e6b" }}>📐 {farm.area_hectares || "—"} ha</div>
                        <div style={{ fontSize: "10px", color: "#6b9e6b" }}>🌾 {farm.avg_yield} t/ha</div>
                        <div style={{ fontSize: "10px", color: "#6b9e6b" }}>📊 {farm.total_predictions} pred.</div>
                      </div>
                      <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
                        <div style={{ fontSize: "10px", color: "#4a7a4a" }}>Lat: {farm.latitude?.toFixed(4)}</div>
                        <div style={{ fontSize: "10px", color: "#4a7a4a" }}>Lng: {farm.longitude?.toFixed(4)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nearby Stations */}
            {stations && (
              <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "20px" }}>
                <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>📡 Nearby Stations</div>
                <div style={{ fontSize: "12px", color: "#4a7a4a", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Weather Stations</div>
                {stations.weather_stations?.map((s: WeatherStation, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#0a0f0a", borderRadius: "6px", marginBottom: "6px" }}>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 600 }}>🌤️ {s.name}</div>
                      <div style={{ fontSize: "10px", color: "#4a7a4a" }}>{s.distance_km} km away</div>
                    </div>
                    <span style={{ fontSize: "10px", color: "#22c55e", backgroundColor: "rgba(34,197,94,0.1)", borderRadius: "100px", padding: "2px 8px", alignSelf: "center" }}>{s.status}</span>
                  </div>
                ))}
                <div style={{ fontSize: "12px", color: "#4a7a4a", marginBottom: "10px", marginTop: "14px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Soil Labs</div>
                {stations.soil_labs?.map((s: SoilLab, i: number) => (
                  <div key={i} style={{ padding: "8px 12px", backgroundColor: "#0a0f0a", borderRadius: "6px", marginBottom: "6px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600 }}>🧪 {s.name}</div>
                    <div style={{ fontSize: "10px", color: "#4a7a4a" }}>{s.distance_km} km · {s.contact}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map Visualization */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Map Placeholder */}
            <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a2e1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "13px", fontWeight: 700 }}>🗺️ Interactive Map</div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["Satellite", "Terrain", "Weather"].map(layer => (
                    <button key={layer} style={{ fontSize: "10px", color: "#4a7a4a", backgroundColor: "transparent", border: "1px solid #1a2e1a", borderRadius: "6px", padding: "3px 8px", cursor: "pointer" }}>{layer}</button>
                  ))}
                </div>
              </div>

              {/* Map Visual */}
              <div style={{ position: "relative", height: "350px", backgroundColor: "#0a1a0a", overflow: "hidden" }}>
                {/* Grid lines */}
                <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(34,197,94,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

                {/* Farm markers */}
                {farms.map((farm, i) => (
                  <div key={farm.id} onClick={() => setSelectedFarm(farm)}
                    style={{ position: "absolute", left: `${20 + (i * 25) % 60}%`, top: `${20 + (i * 30) % 60}%`, cursor: "pointer", transform: "translate(-50%, -50%)", zIndex: 10 }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: farm.marker_color, border: "3px solid #0a0f0a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", boxShadow: `0 0 12px ${farm.marker_color}60`, transition: "transform 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.3)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                      🏡
                    </div>
                    {selectedFarm?.id === farm.id && (
                      <div style={{ position: "absolute", bottom: "44px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#0d1a0d", border: "1px solid #22c55e", borderRadius: "8px", padding: "8px 12px", whiteSpace: "nowrap", zIndex: 20 }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#22c55e" }}>{farm.name}</div>
                        <div style={{ fontSize: "10px", color: "#6b9e6b" }}>{farm.avg_yield} t/ha · {farm.risk_level} Risk</div>
                      </div>
                    )}
                  </div>
                ))}

                {farms.length === 0 && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#4a7a4a" }}>
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>🗺️</div>
                    <div style={{ fontSize: "14px" }}>Add farms with GPS coordinates to see them here</div>
                  </div>
                )}

                {/* Map Legend */}
                <div style={{ position: "absolute", bottom: "12px", right: "12px", backgroundColor: "rgba(13,26,13,0.9)", border: "1px solid #1a2e1a", borderRadius: "8px", padding: "10px 12px" }}>
                  <div style={{ fontSize: "10px", color: "#4a7a4a", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Legend</div>
                  {[["#22c55e", "Low Risk"], ["#f59e0b", "Medium Risk"], ["#ef4444", "High Risk"]].map(([color, label]) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: color }} />
                      <span style={{ fontSize: "10px", color: "#6b9e6b" }}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Coordinates Display */}
                <div style={{ position: "absolute", bottom: "12px", left: "12px", backgroundColor: "rgba(13,26,13,0.9)", border: "1px solid #1a2e1a", borderRadius: "8px", padding: "6px 10px" }}>
                  <div style={{ fontSize: "10px", color: "#4a7a4a" }}>
                    {selectedFarm ? `📍 ${selectedFarm.latitude?.toFixed(4)}°N, ${selectedFarm.longitude?.toFixed(4)}°E` : "Select a farm"}
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Farm Details */}
            {selectedFarm && (
              <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
                <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Selected Farm Details</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div>
                    <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>🏡 {selectedFarm.name}</div>
                    <div style={{ fontSize: "12px", color: "#4a7a4a" }}>📍 {selectedFarm.location}</div>
                  </div>
                  <span style={{ fontSize: "13px", color: riskColor(selectedFarm.risk_level || "Low"), backgroundColor: `${riskColor(selectedFarm.risk_level || "Low")}15`, border: `1px solid ${riskColor(selectedFarm.risk_level || "Low")}30`, borderRadius: "8px", padding: "6px 14px", fontWeight: 700, alignSelf: "flex-start" }}>
                    {selectedFarm.risk_level || "Low"} Risk
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  {[
                    { label: "Area", value: `${selectedFarm.area_hectares || "—"} ha`, icon: "📐" },
                    { label: "Avg Yield", value: `${selectedFarm.avg_yield} t/ha`, icon: "🌾" },
                    { label: "Soil pH", value: selectedFarm.soil_ph || "—", icon: "🧪" },
                    { label: "Predictions", value: selectedFarm.total_predictions, icon: "📊" },
                    { label: "Latitude", value: selectedFarm.latitude?.toFixed(4), icon: "📍" },
                    { label: "Longitude", value: selectedFarm.longitude?.toFixed(4), icon: "📍" },
                  ].map(s => (
                    <div key={s.label} style={{ backgroundColor: "#0a0f0a", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: "16px", marginBottom: "4px" }}>{s.icon}</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#22c55e" }}>{s.value}</div>
                      <div style={{ fontSize: "10px", color: "#4a7a4a" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                  <button onClick={() => router.push("/predict")} style={{ flex: 1, background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", borderRadius: "8px", padding: "10px", color: "#0a0f0a", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>🌾 Predict Yield</button>
                  <button onClick={() => router.push("/weather")} style={{ flex: 1, backgroundColor: "transparent", border: "1px solid #1a2e1a", borderRadius: "8px", padding: "10px", color: "#3b82f6", fontSize: "12px", cursor: "pointer" }}>🌤️ Check Weather</button>
                </div>
              </div>
            )}

            {/* Soil Zones */}
            <div style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: "16px", padding: "24px" }}>
              <div style={{ fontSize: "11px", color: "#4a7a4a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>🧪 Regional Soil Zones</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {soilZones.map((zone, i) => (
                  <div key={i} style={{ backgroundColor: "#0a0f0a", borderRadius: "10px", padding: "14px", border: "1px solid #1a2e1a" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#f59e0b", marginBottom: "6px" }}>{zone.zone}</div>
                    <div style={{ fontSize: "11px", color: "#6b9e6b", marginBottom: "4px" }}>{zone.soil_type}</div>
                    <div style={{ fontSize: "11px", color: "#4a7a4a" }}>pH: {zone.ph}</div>
                    <div style={{ fontSize: "11px", color: zone.fertility === "High" ? "#22c55e" : "#f59e0b", marginTop: "4px" }}>{zone.fertility} Fertility</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
