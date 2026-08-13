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
    if (risk === "Low") return "text-green-600 bg-green-50 border-green-200";
    if (risk === "Medium") return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const priorityColor = (p: string) => {
    if (p === "high") return "border-l-red-500 text-red-600";
    if (p === "medium") return "border-l-amber-500 text-amber-600";
    return "border-l-green-500 text-green-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-green-700 text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
          >
            ← Dashboard
          </button>
          <span className="text-2xl">🌱</span>
          <span className="text-xl font-bold">Yield Prediction</span>
        </div>
        <button
          onClick={() => { localStorage.clear(); router.push("/"); }}
          className="bg-green-600 hover:bg-green-500 px-4 py-1.5 rounded-lg text-sm transition"
        >
          Sign Out
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">AI Crop Yield Prediction</h1>
          <p className="text-gray-500 text-sm">Enter farm parameters to get AI-powered yield forecasts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 h-fit">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">Farm Parameters</h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Farm Select */}
              <div>
                <label className="block text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
                  Select Farm *
                </label>
                <select
                  value={form.farm_id}
                  onChange={e => setForm({ ...form, farm_id: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select a farm...</option>
                  {farms.map(f => <option key={f.id} value={f.id}>{f.farm_name} — {f.location}</option>)}
                </select>
              </div>

              {/* Crop Type */}
              <div>
                <label className="block text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
                  Crop Type *
                </label>
                <select
                  value={form.crop_type}
                  onChange={e => setForm({ ...form, crop_type: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {["wheat", "rice", "maize", "soybean", "cotton", "sugarcane", "barley", "groundnut"].map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Input Grid */}
              <div className="grid grid-cols-2 gap-3">
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
                    <label className="block text-xs font-semibold text-green-700 uppercase tracking-wide mb-1.5">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition shadow-sm ${
                  loading
                    ? "bg-green-200 text-green-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {loading ? "⏳ Running AI Model..." : "🌱 Predict Crop Yield →"}
              </button>
            </form>
          </div>

          {/* Results Panel */}
          <div>
            {!result ? (
              <div className="bg-white rounded-2xl shadow-sm border p-6 h-full flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="text-6xl mb-5">🌾</div>
                <div className="text-lg font-bold text-gray-700 mb-2">Ready to Predict</div>
                <div className="text-sm text-gray-400">Fill in farm parameters and click Predict to get AI-powered yield forecast</div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">

                {/* Main Result Card */}
                <div className={`rounded-2xl border p-6 ${riskColor(result.risk_level).split(" ").filter(c => c.startsWith("bg-") || c.startsWith("border-")).join(" ")}`}>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Prediction Result</h3>

                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-5xl font-extrabold text-green-600 leading-none">
                        {result.predicted_yield_tons_per_ha}
                      </div>
                      <div className="text-sm text-gray-500 mt-1.5">tons per hectare</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1.5">RISK LEVEL</div>
                      <div className={`text-sm font-bold rounded-lg px-3.5 py-1.5 border bg-white ${riskColor(result.risk_level).split(" ")[0]}`}>
                        {result.risk_level}
                      </div>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-gray-500">Model Confidence</span>
                      <span className="text-xs text-green-600 font-bold">{result.confidence_score}%</span>
                    </div>
                    <div className="h-1.5 bg-white rounded-full">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                        style={{ width: `${result.confidence_score}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">AI Recommendations</h3>
                  <div className="flex flex-col gap-2.5">
                    {result.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className={`p-3.5 bg-gray-50 rounded-lg border-l-4 ${priorityColor(rec.priority).split(" ")[0]}`}
                      >
                        <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${priorityColor(rec.priority).split(" ")[1]}`}>
                          {rec.category} — {rec.priority.toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600 leading-relaxed">{rec.message}</div>
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