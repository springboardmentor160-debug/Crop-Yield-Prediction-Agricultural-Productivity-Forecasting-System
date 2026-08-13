// components/FarmMap.tsx
"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FarmLocation } from "@/types/farm";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface FarmMapProps {
  locations: FarmLocation[];
  fallbackCenter?: [number, number];
  fallbackZoom?: number;
  onMarkerClick?: (location: FarmLocation) => void;
}

function FitBounds({ locations }: { locations: FarmLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) return;

    if (locations.length === 1) {
      map.setView([locations[0].latitude, locations[0].longitude], 13);
      return;
    }

    const bounds = L.latLngBounds(
      locations.map((loc) => [loc.latitude, loc.longitude])
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [locations, map]);

  return null;
}

export default function FarmMap({
  locations,
  fallbackCenter = [20.5937, 78.9629],
  fallbackZoom = 5,
  onMarkerClick,
}: FarmMapProps) {
  return (
    <MapContainer
      center={fallbackCenter}
      zoom={fallbackZoom}
      scrollWheelZoom
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds locations={locations} />

      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.latitude, loc.longitude]}
          eventHandlers={{
            click: () => onMarkerClick?.(loc),
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{loc.name}</p>
              {loc.cropType && <p>Crop: {loc.cropType}</p>}
              {loc.notes && <p className="text-gray-600 mt-1">{loc.notes}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}