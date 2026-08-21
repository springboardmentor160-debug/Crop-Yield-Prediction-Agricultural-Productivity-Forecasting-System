"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import FieldInput from "@/components/FieldInput";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

interface FormState {
  farm_name: string;
  latitude: string;
  longitude: string;
  soil_ph: string;
  soil_n: string;
  soil_p: string;
  soil_k: string;
}

const initialState: FormState = {
  farm_name: "",
  latitude: "",
  longitude: "",
  soil_ph: "",
  soil_n: "",
  soil_p: "",
  soil_k: "",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.createFarm({
        farm_name: form.farm_name,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        soil_ph: form.soil_ph ? Number(form.soil_ph) : undefined,
        soil_n: form.soil_n ? Number(form.soil_n) : undefined,
        soil_p: form.soil_p ? Number(form.soil_p) : undefined,
        soil_k: form.soil_k ? Number(form.soil_k) : undefined,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this farm profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col pb-20">
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] mix-blend-screen pointer-events-none -translate-y-1/2"></div>
      <Navbar />
      
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 mt-12 animate-slide-up relative z-10">
        <div className="mb-10 text-center">
          <div className="inline-block mb-4 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary font-mono text-xs uppercase tracking-widest">
            Acreage Registration
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">Log a New Farm</h1>
          <p className="text-textSecondary max-w-xl mx-auto">
            Input geographical coordinates and baseline soil metrics to initialize your predictive model.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-8 sm:p-10 border border-white/5 shadow-2xl relative">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
            <div className=" border border-white/5 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Primary Details
              </h3>
              <FieldInput
                label="Farm Designation"
                required
                value={form.farm_name}
                onChange={(e) => update("farm_name", e.target.value)}
                placeholder="e.g. North Ridge Sector A"
              />

              <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 mt-2">
                <FieldInput
                  label="Latitude"
                  type="number"
                  step="0.000001"
                  required
                  value={form.latitude}
                  onChange={(e) => update("latitude", e.target.value)}
                  placeholder="34.052235"
                />
                <FieldInput
                  label="Longitude"
                  type="number"
                  step="0.000001"
                  required
                  value={form.longitude}
                  onChange={(e) => update("longitude", e.target.value)}
                  placeholder="-118.243683"
                />
              </div>
            </div>

            <div className="bg-black/20 border border-white/5 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
                Soil Composition (Optional)
              </h3>
              <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                <FieldInput
                  label="Soil pH"
                  unit="0–14"
                  type="number"
                  step="0.01"
                  value={form.soil_ph}
                  onChange={(e) => update("soil_ph", e.target.value)}
                  placeholder="6.50"
                />
                <FieldInput
                  label="Nitrogen (N)"
                  unit="kg/ha"
                  type="number"
                  value={form.soil_n}
                  onChange={(e) => update("soil_n", e.target.value)}
                  placeholder="80"
                />
                <FieldInput
                  label="Phosphorus (P)"
                  unit="kg/ha"
                  type="number"
                  value={form.soil_p}
                  onChange={(e) => update("soil_p", e.target.value)}
                  placeholder="40"
                />
                <FieldInput
                  label="Potassium (K)"
                  unit="kg/ha"
                  type="number"
                  value={form.soil_k}
                  onChange={(e) => update("soil_k", e.target.value)}
                  placeholder="40"
                />
              </div>
            </div>

            {error && (
              <div role="alert" className="bg-danger/10 border border-danger/30 rounded-lg p-4 animate-fade-in">
                <p className="text-sm text-danger font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-danger inline-block"></span>
                  {error}
                </p>
              </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto btn-primary px-10"
              >
                {loading ? "Registering..." : "Initialize Farm"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
