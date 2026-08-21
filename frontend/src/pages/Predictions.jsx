import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { farmsApi, cropsApi, predictionsApi } from "../api/resources";
import AppLayout from "../components/AppLayout";
import { EmptyState, PageHeader, RiskBadge, Spinner } from "../components/UIKit";

export default function Predictions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState(searchParams.get("crop") || "");
  const [history, setHistory] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([farmsApi.list(), cropsApi.list()])
      .then(([f, c]) => {
        setFarms(f.data);
        setCrops(c.data);
        if (!selectedCropId && c.data.length) setSelectedCropId(String(c.data[0].id));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCropId) return;
    predictionsApi.forCrop(selectedCropId).then(({ data }) => setHistory(data));
  }, [selectedCropId]);

  const selectedCrop = useMemo(() => crops.find((c) => String(c.id) === String(selectedCropId)), [crops, selectedCropId]);
  const farmLookup = useMemo(() => Object.fromEntries(farms.map((f) => [f.id, f])), [farms]);
  const latest = history[0];

  const runPrediction = async () => {
    if (!selectedCropId) return;
    setRunning(true);
    setError("");
    try {
      const { data } = await predictionsApi.run(selectedCropId);
      setHistory((h) => [data, ...h]);
      const { data: recData } = await predictionsApi.recommendations(data.id);
      setRecs(recData);
    } catch (err) {
      setError(err.response?.data?.detail || "Prediction failed. Add weather/soil data for better accuracy.");
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return <AppLayout><div className="flex h-64 items-center justify-center"><Spinner /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <PageHeader
        eyebrow="AI Model Inference"
        title="Yield prediction"
        description="Run the trained RandomForest model against your latest weather and soil data to forecast yield, productivity, and risk."
      />

      {crops.length === 0 ? (
        <EmptyState title="No crops available" description="Add a farm and a crop first to run a yield prediction." />
      ) : (
        <>
          <div className="card mb-6 flex flex-wrap items-end gap-4">
            <div className="min-w-[220px] flex-1">
              <label className="label-field">Select crop</label>
              <select
                className="input-field"
                value={selectedCropId}
                onChange={(e) => {
                  setSelectedCropId(e.target.value);
                  setSearchParams({ crop: e.target.value });
                  setRecs([]);
                }}
              >
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.crop_name} — {farmLookup[c.farm_id]?.name || "Farm"} ({c.season})
                  </option>
                ))}
              </select>
            </div>
            <button onClick={runPrediction} disabled={running} className="btn-gold">
              {running ? "Running model…" : "Run yield prediction"}
            </button>
          </div>

          {error && <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-risk-high">{error}</p>}

          {latest && (
            <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="card lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold">Latest forecast — {selectedCrop?.crop_name}</h3>
                  <RiskBadge level={latest.risk_level} />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Metric label="Predicted yield" value={latest.predicted_yield_kg_per_ha} unit="kg/ha" />
                  <Metric label="Total production" value={Math.round(latest.predicted_total_production_kg).toLocaleString()} unit="kg" />
                  <Metric label="Productivity score" value={latest.productivity_score} unit="/100" />
                  <Metric label="Model confidence" value={Math.round(latest.confidence_score * 100)} unit="%" />
                </div>
                {latest.input_snapshot?.risk_factors?.length > 0 && (
                  <div className="mt-4 rounded-lg bg-gold-50 p-3.5">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gold-700">Risk factors detected</p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-pine-700">
                      {latest.input_snapshot.risk_factors.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              <div className="card">
                <h3 className="mb-3 text-base font-semibold">Model input snapshot</h3>
                <dl className="space-y-2 text-sm">
                  {[
                    ["Temperature", `${latest.input_snapshot.temperature_c}°C`],
                    ["Rainfall", `${latest.input_snapshot.rainfall_mm} mm`],
                    ["Humidity", `${latest.input_snapshot.humidity_pct}%`],
                    ["Soil pH", latest.input_snapshot.ph_level],
                    ["Nitrogen", `${latest.input_snapshot.nitrogen_ppm} ppm`],
                    ["Phosphorus", `${latest.input_snapshot.phosphorus_ppm} ppm`],
                    ["Potassium", `${latest.input_snapshot.potassium_ppm} ppm`],
                    ["Irrigation", latest.input_snapshot.irrigation_type],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between border-b border-pine-50 pb-1.5 last:border-0">
                      <dt className="text-pine-400">{label}</dt>
                      <dd className="font-mono font-medium text-pine-800">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="card">
              <h3 className="mb-4 text-base font-semibold">Prediction history</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-pine-100 text-left text-xs font-semibold uppercase tracking-wide text-pine-400">
                    <th className="py-2.5">Date</th><th className="py-2.5">Yield (kg/ha)</th>
                    <th className="py-2.5">Productivity</th><th className="py-2.5">Confidence</th><th className="py-2.5">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b border-pine-50 last:border-0">
                      <td className="py-2.5 font-mono text-xs">{new Date(h.created_at).toLocaleString()}</td>
                      <td className="py-2.5 font-mono">{h.predicted_yield_kg_per_ha}</td>
                      <td className="py-2.5 font-mono">{h.productivity_score}</td>
                      <td className="py-2.5 font-mono">{Math.round(h.confidence_score * 100)}%</td>
                      <td className="py-2.5"><RiskBadge level={h.risk_level} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}

function Metric({ label, value, unit }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-pine-400">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold text-pine-900">
        {value} <span className="text-xs font-normal text-pine-400">{unit}</span>
      </p>
    </div>
  );
}
