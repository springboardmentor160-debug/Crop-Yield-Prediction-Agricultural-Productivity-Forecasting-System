import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { farmsApi } from "../api/resources";
import AppLayout from "../components/AppLayout";
import { EmptyState, PageHeader, Spinner } from "../components/UIKit";

const emptyForm = {
  name: "", location: "", region: "", total_area_hectares: "", soil_type: "", irrigation_available: false,
};

export default function Farms() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    farmsApi.list().then(({ data }) => setFarms(data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const update = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await farmsApi.create({ ...form, total_area_hectares: parseFloat(form.total_area_hectares) });
      setShowModal(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create farm.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Farm Management"
        title="Your farms"
        description="Manage farm profiles, land area, and irrigation status."
        action={<button onClick={() => setShowModal(true)} className="btn-primary">+ Add farm</button>}
      />

      {loading ? (
        <div className="flex h-48 items-center justify-center"><Spinner /></div>
      ) : farms.length === 0 ? (
        <EmptyState
          title="No farms yet"
          description="Add your first farm to start tracking crops, weather, soil health, and yield predictions."
          action={<button onClick={() => setShowModal(true)} className="btn-primary mt-2">+ Add farm</button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {farms.map((farm) => (
            <Link key={farm.id} to={`/farms/${farm.id}`} className="card block transition hover:border-pine-300 hover:shadow-md">
              <div className="mb-3 flex items-start justify-between">
                <h3 className="font-display text-lg font-semibold text-pine-900">{farm.name}</h3>
                {farm.irrigation_available && (
                  <span className="badge bg-pine-50 text-pine-600">Irrigated</span>
                )}
              </div>
              <p className="text-sm text-pine-500">{farm.location}</p>
              <div className="mt-4 flex items-center justify-between border-t border-pine-100 pt-3 text-sm">
                <span className="font-mono font-semibold text-pine-800">{farm.total_area_hectares} ha</span>
                <span className="text-pine-400">{farm.soil_type || "Soil type unset"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pine-900/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Add a new farm</h3>
            <form onSubmit={submit} className="space-y-3.5">
              <div>
                <label className="label-field">Farm name</label>
                <input required className="input-field" value={form.name} onChange={update("name")} placeholder="e.g. Riverside Farm" />
              </div>
              <div>
                <label className="label-field">Location</label>
                <input required className="input-field" value={form.location} onChange={update("location")} placeholder="City, State" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Region</label>
                  <input className="input-field" value={form.region} onChange={update("region")} placeholder="State/province" />
                </div>
                <div>
                  <label className="label-field">Area (hectares)</label>
                  <input required type="number" step="0.1" min="0.1" className="input-field" value={form.total_area_hectares} onChange={update("total_area_hectares")} />
                </div>
              </div>
              <div>
                <label className="label-field">Soil type</label>
                <select className="input-field" value={form.soil_type} onChange={update("soil_type")}>
                  <option value="">Select soil type</option>
                  <option>Sandy</option><option>Loam</option><option>Clay</option><option>Silty</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-pine-600">
                <input type="checkbox" checked={form.irrigation_available} onChange={update("irrigation_available")} />
                Irrigation available
              </label>

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-risk-high">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Saving…" : "Create farm"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
