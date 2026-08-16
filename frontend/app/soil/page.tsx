"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function SoilPage() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState<any[]>([]);
  const [form, setForm] = useState({
    farm_id: "",
    nitrogen: "80", phosphorus: "40", potassium: "60",
    ph: "6.5", humidity: "65", temperature: "25", rainfall: "850",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    api.getFarms().then(setFarms).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.farm_id) {
      alert("Please select a farm before analyzing soil.");
      return;
    }
    setLoading(true);
    try {
      const data = await api.analyzeSoil({
        farm_id: parseInt(form.farm_id),
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
    if (status === "Optimal") return "text-green-600 bg-green-50";
    if (status === "High" || status === "Excess") return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const statusBar = (status: string) => {
    if (status === "Optimal") return "bg-green-500";
    if (status === "High" || status === "Excess") return "bg-amber-500";
    return "bg-red-500";
  };

  const fertilityColor = (index: string) => {
    if (index === "Excellent") return "text-green-600";
    if (index === "Good") return "text-lime-600";
    if (index === "Fair") return "text-amber-600";
    return "text-red-600";
  };

  const fertilityBg = (index: string) => {
    if (index === "Excellent") return "bg-green-50 border-green-200";
    if (index === "Good") return "bg-lime-50 border-lime-200";
    if (index === "Fair") return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
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
          <span className="text-2xl">🧪</span>
          <span className="text-xl font-bold">Soil Analysis</span>
        </div>
        <button
          onClick={() => { localStorage.clear(); router.push("/"); }}
          className="bg-green-600 hover:bg-green-500 px-4 py-1.5 rounded-lg text-sm transition"
        >
          Sign Out
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Soil Health Analysis</h1>
          <p className="text-gray-500 text-sm">Enter soil parameters to get fertility assessment and crop recommendations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6 h-fit">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">Soil Parameters</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
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
              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-2 py-3 rounded-xl font-bold text-sm transition ${
                  loading
                    ? "bg-green-200 text-green-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {loading ? "⏳ Analyzing Soil..." : "🧪 Analyze Soil Health →"}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {!result ? (
              <div className="bg-white rounded-2xl shadow-sm border p-6 h-full flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="text-6xl mb-5">🌱</div>
                <div className="text-lg font-bold text-gray-700 mb-2">Ready to Analyze</div>
                <div className="text-sm text-gray-400">Enter soil parameters to get detailed fertility assessment</div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">

                {/* Fertility Score */}
                <div className={`rounded-2xl border p-6 ${fertilityBg(result.fertility_index)}`}>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Soil Fertility Assessment</h3>
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <div className={`text-5xl font-extrabold leading-none ${fertilityColor(result.fertility_index)}`}>
                        {result.fertility_score}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Fertility Score / 100</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1.5">FERTILITY INDEX</div>
                      <div className={`text-lg font-extrabold rounded-lg px-4 py-2 bg-white ${fertilityColor(result.fertility_index)}`}>
                        {result.fertility_index}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Soil pH</div>
                    <div className="text-base font-bold text-green-700">{result.soil_ph} — {result.ph_category}</div>
                  </div>
                </div>

                {/* Nutrients */}
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Nutrient Levels</h3>
                  {Object.entries(result.nutrients).map(([nutrient, data]: [string, any]) => (
                    <div key={nutrient} className="mb-3.5">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-semibold text-gray-700 capitalize">{nutrient}</span>
                        <div className="flex gap-3 items-center">
                          <span className="text-sm font-bold text-gray-800">{data.value} {data.unit}</span>
                          <span className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${statusColor(data.status)}`}>
                            {data.status}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div
                          className={`h-full rounded-full ${statusBar(data.status)}`}
                          style={{ width: `${Math.min(100, (data.value / 200) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suitable Crops */}
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recommended Crops</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {result.suitable_crops?.map((crop: string) => (
                      <span
                        key={crop}
                        className="text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-3.5 py-1.5"
                      >
                        🌾 {crop}
                      </span>
                    ))}
                  </div>
                  {result.deficiencies?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Deficiencies & Fixes</h4>
                      {result.deficiencies.map((d: any, i: number) => (
                        <div key={i} className="px-3.5 py-2.5 bg-gray-50 rounded-lg border-l-4 border-green-500 mb-2">
                          <div className="text-xs font-bold text-green-700 mb-1">{d.nutrient} — {d.level}</div>
                          <div className="text-xs text-gray-500">{d.recommendation}</div>
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