"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RiskPage() {
  const router = useRouter();
  const [risk, setRisk] = useState<any>(null);
  const [cropType, setCropType] = useState("wheat");
  const [rainfall, setRainfall] = useState(500);
  const [temperature, setTemperature] = useState(25);
  const [humidity, setHumidity] = useState(60);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
  }, []);

  const fetchRisk = async () => {
    setLoading(true);
    try {
      const data = await api.getDiseaseRisk(cropType, rainfall, temperature, humidity);
      setRisk(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Risk Assessment</h1>
            <p className="text-sm text-gray-500">Assess crop risk and make data-driven mitigation decisions.</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl border p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Crop Type</label>
                <input
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rainfall (mm)</label>
                <input
                  type="number"
                  value={rainfall}
                  onChange={(e) => setRainfall(Number(e.target.value))}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Humidity (%)</label>
                <input
                  type="number"
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3"
                />
              </div>
              <button
                onClick={fetchRisk}
                disabled={loading}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Assessing risk..." : "Run Risk Assessment"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl border p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Results</h2>
            {risk ? (
              <div className="space-y-4">
                <div className="rounded-3xl border p-4 bg-slate-50">
                  <div className="text-sm text-gray-500">Overall Risk</div>
                  <div className="mt-2 text-3xl font-semibold text-gray-900">{risk.risk_level}</div>
                  <div className="text-sm text-gray-500">Disease probability: {risk.overall_disease_risk_percent}%</div>
                </div>
                <div className="rounded-3xl border p-4 bg-slate-50">
                  <div className="text-sm text-gray-500">Crop</div>
                  <div className="mt-2 text-2xl font-semibold text-gray-900">{risk.crop_type}</div>
                </div>
                <div className="rounded-3xl border p-4 bg-slate-50">
                  <div className="text-sm text-gray-500">Possible Diseases</div>
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {risk.diseases?.map((d: any, index: number) => (
                      <li key={index} className="rounded-2xl border p-3 bg-white">
                        <div className="font-semibold text-gray-900">{d.disease}</div>
                        <div>{d.severity} severity • {d.probability}% probability</div>
                        <div className="text-xs text-gray-500">{d.prevention}</div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl border p-4 bg-slate-50">
                  <div className="text-sm text-gray-500">Advice</div>
                  <div className="mt-2 text-sm text-gray-700">{risk.general_advice}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Enter parameters and run the assessment to see disease risk and advice.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
