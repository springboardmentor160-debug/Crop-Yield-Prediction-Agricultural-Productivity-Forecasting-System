// app/gis/page.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { MapPin, Trash2 } from "lucide-react";
import { FarmLocation } from "@/types/farm";

// Leaflet reads `window`, so this component must never run on the server.
// ssr: false is required here, not optional.
const FarmMap = dynamic(() => import("@/components/FarmMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 text-sm">
      Loading map...
    </div>
  ),
});

// Starter markers so the page isn't empty on first load. Replace with a
// fetch to your backend once farm locations are stored in PostgreSQL.
const INITIAL_LOCATIONS: FarmLocation[] = [
  {
    id: "1",
    name: "North Field",
    latitude: 20.2961,
    longitude: 85.8245,
    cropType: "Rice",
    notes: "Primary irrigation zone",
  },
  {
    id: "2",
    name: "South Field",
    latitude: 20.27,
    longitude: 85.84,
    cropType: "Wheat",
  },
];

export default function GisPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<FarmLocation[]>(INITIAL_LOCATIONS);
  const [selected, setSelected] = useState<FarmLocation | null>(null);

  const [form, setForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    cropType: "",
  });
  const [error, setError] = useState("");

  const handleAddMarker = () => {
    const lat = Number(form.latitude);
    const lng = Number(form.longitude);

    if (!form.name.trim()) {
      setError("Field name is required.");
      return;
    }
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      setError("Latitude must be a number between -90 and 90.");
      return;
    }
    if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      setError("Longitude must be a number between -180 and 180.");
      return;
    }

    setError("");
    setLocations((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: form.name,
        latitude: lat,
        longitude: lng,
        cropType: form.cropType || undefined,
      },
    ]);
    setForm({ name: "", latitude: "", longitude: "", cropType: "" });
  };

  const handleRemove = (id: string) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-green-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🗺️ Farm GIS Map</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          ← Dashboard
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-8 grid md:grid-cols-3 gap-6">
        {/* Map */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-md p-4 h-[500px]">
          <FarmMap
            locations={locations}
            onMarkerClick={(loc) => setSelected(loc)}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Add marker form */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Add Field Marker</h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Field name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="border rounded-lg p-2 w-full"
              />
              <input
                type="number"
                placeholder="Latitude"
                value={form.latitude}
                onChange={(e) =>
                  setForm((f) => ({ ...f, latitude: e.target.value }))
                }
                className="border rounded-lg p-2 w-full"
                step="0.0001"
              />
              <input
                type="number"
                placeholder="Longitude"
                value={form.longitude}
                onChange={(e) =>
                  setForm((f) => ({ ...f, longitude: e.target.value }))
                }
                className="border rounded-lg p-2 w-full"
                step="0.0001"
              />
              <input
                type="text"
                placeholder="Crop type (optional)"
                value={form.cropType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cropType: e.target.value }))
                }
                className="border rounded-lg p-2 w-full"
              />
            </div>

            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}

            <button
              onClick={handleAddMarker}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition"
            >
              <MapPin className="w-4 h-4" />
              Add Marker
            </button>

            <p className="text-xs text-gray-400 mt-2">
              Tip: right-click a spot on Google Maps to copy its lat/lng.
            </p>
          </div>

          {/* Marker list */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Fields ({locations.length})</h2>

            {locations.length === 0 ? (
              <p className="text-sm text-gray-400">No fields added yet.</p>
            ) : (
              <ul className="space-y-2">
                {locations.map((loc) => (
                  <li
                    key={loc.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                      selected?.id === loc.id
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelected(loc)}
                  >
                    <div>
                      <p className="font-medium text-gray-800">{loc.name}</p>
                      <p className="text-xs text-gray-500">
                        {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                        {loc.cropType ? ` · ${loc.cropType}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(loc.id);
                      }}
                      className="text-gray-400 hover:text-red-600 p-1"
                      aria-label={`Remove ${loc.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}