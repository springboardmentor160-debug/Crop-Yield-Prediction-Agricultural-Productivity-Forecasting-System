"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  MapPin,
  Sprout,
  Ruler,
  FlaskConical,
  Trash2,
  Pencil,
  X,
  Tractor,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Farm } from "@/lib/types";

const emptyFarm = {
  farm_name: "",
  location: "",
  soil_type: "",
  soil_ph: "",
  area_hectares: "",
  latitude: "",
  longitude: "",
};

export default function FarmsPage() {
  const router = useRouter();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState<typeof emptyFarm>(emptyFarm);

  const loadFarms = async () => {
    try {
      setLoading(true);
      const data = await api.getFarms();
      setFarms(data);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const filteredFarms = useMemo(() => {
    return farms.filter((farm) =>
      farm.farm_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [farms, search]);

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyFarm);
    setShowModal(true);
  };

  const openEditModal = (farm: Farm) => {
    setEditingId(farm.id);

    setForm({
      farm_name: farm.farm_name,
      location: farm.location || "",
      soil_type: farm.soil_type || "",
      soil_ph: farm.soil_ph != null ? String(farm.soil_ph) : "",
      area_hectares: farm.area_hectares != null ? String(farm.area_hectares) : "",
      latitude: farm.latitude != null ? String(farm.latitude) : "",
      longitude: farm.longitude != null ? String(farm.longitude) : "",
    });

    setShowModal(true);
  };

  const saveFarm = async () => {
    try {
      const body = {
        farm_name: form.farm_name,
        location: form.location || null,
        soil_type: form.soil_type || null,
        soil_ph: form.soil_ph ? parseFloat(form.soil_ph) : null,
        area_hectares: form.area_hectares
          ? parseFloat(form.area_hectares)
          : null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };

      if (editingId) {
        await api.updateFarm(editingId, body);
      } else {
        await api.createFarm(body);
      }

      setShowModal(false);
      loadFarms();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const deleteFarm = async (id: number) => {
    if (!confirm("Delete this farm?")) return;

    await api.deleteFarm(id);

    loadFarms();
  };

  return (
    <div className="min-h-screen bg-[#07160B] p-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">🚜 Farms</h1>

          <p className="text-gray-400 mt-2">
            Manage all your farms from one place.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl"
        >
          <Plus size={18} />
          Add Farm
        </button>
      </div>

      <div className="grid grid-cols-4 gap-5 mt-8">
        <div className="bg-[#0D2311] rounded-xl border border-[#1B4D2A] p-5">
          <p className="text-gray-400">Total Farms</p>

          <h2 className="text-3xl font-bold mt-2">{farms.length}</h2>
        </div>

        <div className="bg-[#0D2311] rounded-xl border border-[#1B4D2A] p-5">
          <p className="text-gray-400">Total Area</p>

          <h2 className="text-3xl font-bold mt-2">
            {farms.reduce((a, b) => a + (b.area_hectares || 0), 0).toFixed(1)}{" "}
            ha
          </h2>
        </div>

        <div className="bg-[#0D2311] rounded-xl border border-[#1B4D2A] p-5">
          <p className="text-gray-400">Average pH</p>

          <h2 className="text-3xl font-bold mt-2">
            {farms.length
              ? (
                  farms.reduce((a, b) => a + (b.soil_ph || 0), 0) /
                  farms.length
                ).toFixed(1)
              : "-"}
          </h2>
        </div>

        <div className="bg-[#0D2311] rounded-xl border border-[#1B4D2A] p-5">
          <p className="text-gray-400">Soil Types</p>

          <h2 className="text-3xl font-bold mt-2">
            {new Set(farms.map((f) => f.soil_type)).size}
          </h2>
        </div>
      </div>

      <div className="mt-8 relative">
        <Search size={20} className="absolute left-4 top-3.5 text-gray-500" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search farms..."
          className="w-full bg-[#0D2311] border border-[#1B4D2A] rounded-xl pl-12 pr-4 py-3 outline-none"
        />
      </div>

      {/* ============================
            Add / Edit Farm Modal
      ============================= */}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0D2311] border border-[#1B4D2A] rounded-2xl w-full max-w-2xl p-8">
            {/* Header */}

            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  {editingId ? "Edit Farm" : "Add New Farm"}
                </h2>

                <p className="text-gray-400 mt-1">
                  Enter your farm information
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-[#17351E]"
              >
                <X size={22} />
              </button>
            </div>

            {/* Form */}

            <div className="grid grid-cols-2 gap-5 mt-8">
              <div>
                <label className="block mb-2 text-sm text-gray-400">
                  Farm Name
                </label>

                <input
                  name="farm_name"
                  value={form.farm_name}
                  onChange={handleInput}
                  placeholder="Green Valley Farm"
                  className="w-full bg-[#07160B] border border-[#1B4D2A] rounded-xl px-4 py-3 outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">
                  Location
                </label>

                <input
                  name="location"
                  value={form.location}
                  onChange={handleInput}
                  placeholder="Bhubaneswar"
                  className="w-full bg-[#07160B] border border-[#1B4D2A] rounded-xl px-4 py-3 outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">
                  Soil Type
                </label>

                <select
                  name="soil_type"
                  value={form.soil_type}
                  onChange={handleInput}
                  className="w-full bg-[#07160B] border border-[#1B4D2A] rounded-xl px-4 py-3 outline-none"
                >
                  <option value="">Select</option>
                  <option>Loamy</option>
                  <option>Clay</option>
                  <option>Sandy</option>
                  <option>Silt</option>
                  <option>Peaty</option>
                  <option>Chalky</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">
                  Soil pH
                </label>

                <input
                  type="number"
                  step="0.1"
                  name="soil_ph"
                  value={form.soil_ph}
                  onChange={handleInput}
                  placeholder="6.8"
                  className="w-full bg-[#07160B] border border-[#1B4D2A] rounded-xl px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">
                  Area (Hectares)
                </label>

                <input
                  type="number"
                  step="0.1"
                  name="area_hectares"
                  value={form.area_hectares}
                  onChange={handleInput}
                  placeholder="12.5"
                  className="w-full bg-[#07160B] border border-[#1B4D2A] rounded-xl px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">
                  Latitude
                </label>

                <input
                  type="number"
                  step="0.000001"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleInput}
                  placeholder="20.2961"
                  className="w-full bg-[#07160B] border border-[#1B4D2A] rounded-xl px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">
                  Longitude
                </label>

                <input
                  type="number"
                  step="0.000001"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleInput}
                  placeholder="85.8245"
                  className="w-full bg-[#07160B] border border-[#1B4D2A] rounded-xl px-4 py-3 outline-none"
                />
              </div>
            </div>

            {/* Buttons */}

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-3 rounded-xl border border-[#1B4D2A]"
              >
                Cancel
              </button>

              <button
                onClick={saveFarm}
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl"
              >
                {editingId ? "Update Farm" : "Save Farm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================
          Farm Cards
      ============================= */}
      {loading ? (
        <div className="grid grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-[#0D2311] border border-[#1B4D2A] rounded-2xl p-6 animate-pulse h-60"
            />
          ))}
        </div>
      ) : filteredFarms.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-[#0D2311] flex items-center justify-center border border-[#1B4D2A]">
            <Tractor size={42} className="text-green-500" />
          </div>

          <h2 className="text-2xl font-bold mt-6">No Farms Found</h2>

          <p className="text-gray-400 mt-2">
            Create your first farm to start managing crop predictions.
          </p>

          <button
            onClick={openAddModal}
            className="mt-6 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl flex items-center gap-2"
          >
            <Plus size={18} />
            Add Farm
          </button>
        </div>
      ) : (
        <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6 mt-8">
          {filteredFarms.map((farm) => (
            <div
              key={farm.id}
              className="bg-[#0D2311] border border-[#1B4D2A] rounded-2xl p-6 hover:border-green-500 transition duration-300"
            >
              <div className="flex justify-between items-start">
                <div
                  onClick={() => router.push(`/farms/${farm.id}`)}
                  className="cursor-pointer"
                >
                  <h2 className="text-xl font-bold hover:text-green-400 transition">
                    {farm.farm_name}
                  </h2>

                  <div className="flex items-center gap-2 text-gray-400 mt-2">
                    <MapPin size={16} />
                    {farm.location || "Unknown Location"}
                  </div>
                </div>

                <div className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm">
                  Farm
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Sprout size={18} className="text-green-500" />

                    <span className="text-gray-400">Soil Type</span>
                  </div>

                  <span>{farm.soil_type || "-"}</span>
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <FlaskConical size={18} className="text-purple-400" />

                    <span className="text-gray-400">Soil pH</span>
                  </div>

                  <span>{farm.soil_ph ?? "-"}</span>
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Ruler size={18} className="text-orange-400" />

                    <span className="text-gray-400">Area</span>
                  </div>

                  <span>
                    {farm.area_hectares ? `${farm.area_hectares} ha` : "-"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Latitude</span>

                  <span>{farm.latitude ?? "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Longitude</span>

                  <span>{farm.longitude ?? "-"}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(farm);
                  }}
                  className="flex-1 bg-[#17351E] hover:bg-green-700 rounded-xl py-3 flex justify-center items-center gap-2"
                >
                  <Pencil size={18} />
                  Edit
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFarm(farm.id);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl py-3 flex justify-center items-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}