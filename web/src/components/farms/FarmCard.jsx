import { Link } from "react-router-dom";
import {
  Droplets,
  MapPinned,
  Sprout,
  Tractor,
} from "lucide-react";

import FarmStatusBadge from "./FarmStatusBadge";

function FarmCard({ farm, showOwner = false }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-green-100 p-3 text-green-700">
            <Tractor size={25} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {farm.farm_name}
            </h2>

            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <MapPinned size={15} />
              {farm.village ? `${farm.village}, ` : ""}
              {farm.district}, {farm.state}
            </p>
          </div>
        </div>

        <FarmStatusBadge isActive={farm.is_active} />
      </div>

      {showOwner && (
        <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
          <p>
            <span className="font-semibold">Owner:</span>{" "}
            {farm.owner_name}
          </p>
          <p className="mt-1">{farm.owner_email}</p>
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Area</p>
          <p className="mt-1 font-bold text-gray-900">
            {farm.area_hectares} ha
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-3">
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <Sprout size={14} />
            Primary Crop
          </p>

          <p className="mt-1 font-bold text-gray-900">
            {farm.primary_crop || "Not provided"}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-3">
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <Droplets size={14} />
            Irrigation
          </p>

          <p className="mt-1 font-bold text-gray-900">
            {farm.irrigation_type || "Not provided"}
          </p>
        </div>
      </div>

      <Link
        to={`/farms/${farm.id}`}
        className="mt-5 inline-flex rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
      >
        View Farm
      </Link>
    </div>
  );
}

export default FarmCard;