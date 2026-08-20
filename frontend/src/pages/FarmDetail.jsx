import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cropsApi, farmsApi, soilApi, weatherApi } from "../api/resources";
import AppLayout from "../components/AppLayout";
import { EmptyState, PageHeader, Spinner } from "../components/UIKit";

const TABS = ["Crops", "Weather", "Soil"];

export default function FarmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farm, setFarm] = useState(null);
  const [crops, setCrops] = useState([]);
  const [weather, setWeather] = useState([]);
  const [soil, setSoil] = useState([]);
  const [tab, setTab] = useState("Crops");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'crop' | 'weather' | 'soil'

  const load = () => {
    setLoading(true);
    Promise.all([
      farmsApi.get(id),
      cropsApi.list(id),
      weatherApi.list(id),
      soilApi.list(id),
    ])
      .then(([f, c, w, s]) => {
        setFarm(f.data);
        setCrops(c.data);
        setWeather(w.data);
        setSoil(s.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) {
    return <AppLayout><div className="flex h-64 items-center justify-center"><Spinner /></div></AppLayout>;
  }
  if (!farm) {
    return <AppLayout><EmptyState title="Farm not found" /></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="mb-2">
        <Link to="/farms" className="text-xs font-semibold text-pine-500 hover:underline">&larr; All farms</Link>
      </div>
      <PageHeader
        eyebrow={farm.region || "Farm profile"}
        title={farm.name}
        description={`${farm.location} · ${farm.total_area_hectares} ha · ${farm.soil_type || "Soil type unset"}`}
      />

      <div className="mb-6 flex gap-1 border-b border-pine-100">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold transition ${
              tab === t ? "border-b-2 border-pine-600 text-pine-800" : "text-pine-400 hover:text-pine-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Crops" && (
        <CropsTab farmId={farm.id} crops={crops} onAdd={() => setModal("crop")} onChanged={load} navigate={navigate} />
      )}
      {tab === "Weather" && <WeatherTab records={weather} onAdd={() => setModal("weather")} />}
      {tab === "Soil" && <SoilTab records={soil} onAdd={() => setModal("soil")} />}

      {modal === "crop" && <CropModal farmId={farm.id} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
      {modal === "weather" && <WeatherModal farmId={farm.id} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
      {modal === "soil" && <SoilModal farmId={farm.id} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
    </AppLayout>
  );
}

function CropsTab({ crops, onAdd, navigate }) {
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={onAdd} className="btn-primary">+ Add crop</button>
      </div>
      {crops.length === 0 ? (
        <EmptyState title="No crops yet" description="Add a crop to start generating yield predictions for this farm." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {crops.map((c) => (
            <div key={c.id} className="card cursor-pointer transition hover:border-pine-300" onClick={() => navigate(`/predictions?crop=${c.id}`)}>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-display text-base font-semibold">{c.crop_name}</h4>
                <span className="badge bg-gold-50 text-gold-700">{c.season}</span>
              </div>
              <p className="text-sm text-pine-500">{c.variety || "Variety not set"}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-pine-400">
                <span>{c.area_hectares} ha</span>
                <span>{c.irrigation_type}</span>
                <span className="capitalize">{c.growth_stage}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WeatherTab({ records, onAdd }) {
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={onAdd} className="btn-primary">+ Add weather record</button>
      </div>
      {records.length === 0 ? (
        <EmptyState title="No weather records" description="Add rainfall, temperature, and humidity readings to power more accurate predictions." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pine-100 text-left text-xs font-semibold uppercase tracking-wide text-pine-400">
                <th className="px-4 py-3">Date</th><th className="px-4 py-3">Temp (°C)</th>
                <th className="px-4 py-3">Rainfall (mm)</th><th className="px-4 py-3">Humidity (%)</th>
                <th className="px-4 py-3">Wind (km/h)</th><th className="px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-pine-50 last:border-0">
                  <td className="px-4 py-3 font-mono">{r.record_date}</td>
                  <td className="px-4 py-3 font-mono">{r.temperature_c}</td>
                  <td className="px-4 py-3 font-mono">{r.rainfall_mm}</td>
                  <td className="px-4 py-3 font-mono">{r.humidity_pct}</td>
                  <td className="px-4 py-3 font-mono">{r.wind_speed_kmh}</td>
                  <td className="px-4 py-3 text-pine-400">{r.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SoilTab({ records, onAdd }) {
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={onAdd} className="btn-primary">+ Add soil record</button>
      </div>
      {records.length === 0 ? (
        <EmptyState title="No soil records" description="Log a soil test to unlock soil health scoring and nutrient recommendations." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pine-100 text-left text-xs font-semibold uppercase tracking-wide text-pine-400">
                <th className="px-4 py-3">Date</th><th className="px-4 py-3">pH</th>
                <th className="px-4 py-3">N (ppm)</th><th className="px-4 py-3">P (ppm)</th>
                <th className="px-4 py-3">K (ppm)</th><th className="px-4 py-3">Organic %</th><th className="px-4 py-3">Texture</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-pine-50 last:border-0">
                  <td className="px-4 py-3 font-mono">{r.record_date}</td>
                  <td className="px-4 py-3 font-mono">{r.ph_level}</td>
                  <td className="px-4 py-3 font-mono">{r.nitrogen_ppm}</td>
                  <td className="px-4 py-3 font-mono">{r.phosphorus_ppm}</td>
                  <td className="px-4 py-3 font-mono">{r.potassium_ppm}</td>
                  <td className="px-4 py-3 font-mono">{r.organic_matter_pct}</td>
                  <td className="px-4 py-3">{r.soil_texture}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-pine-900/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
        {children}
        <button onClick={onClose} className="sr-only">Close</button>
      </div>
    </div>
  );
}

function CropModal({ farmId, onClose, onSaved }) {
  const [form, setForm] = useState({ crop_name: "", variety: "", season: "Kharif", area_hectares: "", planting_date: "", irrigation_type: "Rainfed" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = (f) => (e) => setForm((s) => ({ ...s, [f]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await cropsApi.create({ ...form, farm_id: Number(farmId), area_hectares: parseFloat(form.area_hectares) });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add crop.");
    } finally { setSaving(false); }
  };

  return (
    <ModalShell title="Add a crop" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3.5">
        <div>
          <label className="label-field">Crop name</label>
          <input required className="input-field" value={form.crop_name} onChange={update("crop_name")} placeholder="e.g. Wheat" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Variety</label>
            <input className="input-field" value={form.variety} onChange={update("variety")} />
          </div>
          <div>
            <label className="label-field">Season</label>
            <select className="input-field" value={form.season} onChange={update("season")}>
              <option>Kharif</option><option>Rabi</option><option>Zaid</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Area (hectares)</label>
            <input required type="number" step="0.1" min="0.1" className="input-field" value={form.area_hectares} onChange={update("area_hectares")} />
          </div>
          <div>
            <label className="label-field">Planting date</label>
            <input required type="date" className="input-field" value={form.planting_date} onChange={update("planting_date")} />
          </div>
        </div>
        <div>
          <label className="label-field">Irrigation type</label>
          <select className="input-field" value={form.irrigation_type} onChange={update("irrigation_type")}>
            <option>Rainfed</option><option>Drip</option><option>Sprinkler</option><option>Flood</option>
          </select>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-risk-high">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Saving…" : "Add crop"}</button>
        </div>
      </form>
    </ModalShell>
  );
}

function WeatherModal({ farmId, onClose, onSaved }) {
  const [form, setForm] = useState({ record_date: "", temperature_c: "", rainfall_mm: "", humidity_pct: "", wind_speed_kmh: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = (f) => (e) => setForm((s) => ({ ...s, [f]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await weatherApi.create({
        ...form, farm_id: Number(farmId),
        temperature_c: parseFloat(form.temperature_c), rainfall_mm: parseFloat(form.rainfall_mm),
        humidity_pct: parseFloat(form.humidity_pct), wind_speed_kmh: parseFloat(form.wind_speed_kmh || 0),
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add weather record.");
    } finally { setSaving(false); }
  };

  return (
    <ModalShell title="Add weather record" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3.5">
        <div>
          <label className="label-field">Date</label>
          <input required type="date" className="input-field" value={form.record_date} onChange={update("record_date")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Temperature (°C)</label>
            <input required type="number" step="0.1" className="input-field" value={form.temperature_c} onChange={update("temperature_c")} />
          </div>
          <div>
            <label className="label-field">Rainfall (mm)</label>
            <input required type="number" step="0.1" min="0" className="input-field" value={form.rainfall_mm} onChange={update("rainfall_mm")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Humidity (%)</label>
            <input required type="number" step="0.1" min="0" max="100" className="input-field" value={form.humidity_pct} onChange={update("humidity_pct")} />
          </div>
          <div>
            <label className="label-field">Wind (km/h)</label>
            <input type="number" step="0.1" min="0" className="input-field" value={form.wind_speed_kmh} onChange={update("wind_speed_kmh")} />
          </div>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-risk-high">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Saving…" : "Add record"}</button>
        </div>
      </form>
    </ModalShell>
  );
}

function SoilModal({ farmId, onClose, onSaved }) {
  const [form, setForm] = useState({ record_date: "", ph_level: "", nitrogen_ppm: "", phosphorus_ppm: "", potassium_ppm: "", organic_matter_pct: "", moisture_pct: "", soil_texture: "Loam" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = (f) => (e) => setForm((s) => ({ ...s, [f]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await soilApi.create({
        ...form, farm_id: Number(farmId),
        ph_level: parseFloat(form.ph_level), nitrogen_ppm: parseFloat(form.nitrogen_ppm),
        phosphorus_ppm: parseFloat(form.phosphorus_ppm), potassium_ppm: parseFloat(form.potassium_ppm),
        organic_matter_pct: parseFloat(form.organic_matter_pct || 0), moisture_pct: parseFloat(form.moisture_pct || 0),
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add soil record.");
    } finally { setSaving(false); }
  };

  return (
    <ModalShell title="Add soil test record" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Date</label>
            <input required type="date" className="input-field" value={form.record_date} onChange={update("record_date")} />
          </div>
          <div>
            <label className="label-field">pH level</label>
            <input required type="number" step="0.1" min="0" max="14" className="input-field" value={form.ph_level} onChange={update("ph_level")} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label-field">N (ppm)</label>
            <input required type="number" step="0.1" min="0" className="input-field" value={form.nitrogen_ppm} onChange={update("nitrogen_ppm")} />
          </div>
          <div>
            <label className="label-field">P (ppm)</label>
            <input required type="number" step="0.1" min="0" className="input-field" value={form.phosphorus_ppm} onChange={update("phosphorus_ppm")} />
          </div>
          <div>
            <label className="label-field">K (ppm)</label>
            <input required type="number" step="0.1" min="0" className="input-field" value={form.potassium_ppm} onChange={update("potassium_ppm")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Organic matter (%)</label>
            <input type="number" step="0.1" min="0" className="input-field" value={form.organic_matter_pct} onChange={update("organic_matter_pct")} />
          </div>
          <div>
            <label className="label-field">Moisture (%)</label>
            <input type="number" step="0.1" min="0" max="100" className="input-field" value={form.moisture_pct} onChange={update("moisture_pct")} />
          </div>
        </div>
        <div>
          <label className="label-field">Soil texture</label>
          <select className="input-field" value={form.soil_texture} onChange={update("soil_texture")}>
            <option>Sandy</option><option>Loam</option><option>Clay</option><option>Silty</option>
          </select>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-risk-high">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Saving…" : "Add record"}</button>
        </div>
      </form>
    </ModalShell>
  );
}
