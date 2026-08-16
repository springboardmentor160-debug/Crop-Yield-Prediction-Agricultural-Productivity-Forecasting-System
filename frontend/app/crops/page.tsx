"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function CropsPage() {
  const router = useRouter();
  const [crops, setCrops] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [cropName, setCropName] = useState("");
  const [hectaresPlanted, setHectaresPlanted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadFarms();
  }, []);

  const loadFarms = async () => {
    setLoading(true);
    try {
      const farmData = await api.getFarms();
      setFarms(farmData || []);
      if (farmData?.length > 0) {
        const firstFarmId = farmData[0].id;
        setSelectedFarmId(firstFarmId);
        await loadCrops(firstFarmId);
      } else {
        setCrops([]);
      }
    } catch (err) {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const loadCrops = async (farmId: number) => {
    setLoading(true);
    try {
      const data = await api.getCrops(farmId);
      setCrops(data);
    } catch (err) {
      console.error(err);
      setCrops([]);
    } finally {
      setLoading(false);
    }
  };

  const addCrop = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFarmId) return;
    setSaving(true);
    try {
      await api.addCrop(selectedFarmId, { crop_name: cropName, hectares_planted: hectaresPlanted });
      setCropName("");
      setHectaresPlanted(0);
      await loadCrops(selectedFarmId);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crop Data</h1>
            <p className="text-sm text-gray-500">Track your farm crops and planted areas.</p>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Crop Record</h2>
            <form onSubmit={addCrop} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Farm</label>
                <select
                  value={selectedFarmId ?? ""}
                  onChange={(e) => {
                    const farmId = Number(e.target.value) || null;
                    setSelectedFarmId(farmId);
                    if (farmId) loadCrops(farmId);
                  }}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3"
                >
                  <option value="">Select a farm</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.farm_name || `Farm ${farm.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Crop Name</label>
                <input
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Hectares Planted</label>
                <input
                  type="number"
                  value={hectaresPlanted}
                  onChange={(e) => setHectaresPlanted(Number(e.target.value))}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add Crop"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Crop Records</h2>
            {loading ? (
              <div className="text-gray-500">Loading crop data...</div>
            ) : crops.length === 0 ? (
              <div className="text-gray-500">No crop records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-gray-600">
                  <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Farm ID</th>
                      <th className="px-4 py-3">Crop Type</th>
                      <th className="px-4 py-3">Area (ha)</th>
                      <th className="px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crops.map((crop) => (
                      <tr key={crop.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-4">{crop.id}</td>
                        <td className="px-4 py-4">{crop.crop_name}</td>
                        <td className="px-4 py-4">{crop.hectares_planted ?? "—"}</td>
                        <td className="px-4 py-4">{crop.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
