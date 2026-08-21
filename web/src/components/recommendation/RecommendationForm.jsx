import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  LoaderCircle,
  MapPin,
  Sprout,
  Tractor,
} from "lucide-react";
import toast from "react-hot-toast";

import { farmService } from "../../services/farmService";
import { getApiErrorMessage } from "../../utils/apiError";

const SEASONS = [
  "Kharif",
  "Rabi",
  "Whole Year",
  "Summer",
  "Winter",
  "Autumn",
];

function extractFarms(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.farms)) {
    return response.farms;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

function RecommendationForm({
  onSubmit,
  submitting,
}) {
  const [farms, setFarms] = useState([]);
  const [loadingFarms, setLoadingFarms] = useState(true);

  const [formData, setFormData] = useState({
    farm_id: "",
    crop_year: new Date().getFullYear(),
    season: "",
  });

  useEffect(() => {
    const loadFarms = async () => {
      try {
        setLoadingFarms(true);

        const response = await farmService.getFarms({
          is_active: true,
        });

        const farmList = extractFarms(response).filter(
          (farm) => farm.is_active !== false
        );

        setFarms(farmList);

        if (farmList.length === 1) {
          setFormData((current) => ({
            ...current,
            farm_id: String(farmList[0].id),
          }));
        }
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
            "Unable to load your farms."
          )
        );
      } finally {
        setLoadingFarms(false);
      }
    };

    loadFarms();
  }, []);

  const selectedFarm = useMemo(() => {
    return farms.find(
      (farm) =>
        String(farm.id) === String(formData.farm_id)
    );
  }, [farms, formData.farm_id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.farm_id) {
      toast.error("Select a farm.");
      return;
    }

    if (!formData.crop_year) {
      toast.error("Enter the crop year.");
      return;
    }

    if (!formData.season) {
      toast.error("Select a season.");
      return;
    }

    onSubmit({
      farm_id: Number(formData.farm_id),
      crop_year: Number(formData.crop_year),
      season: formData.season,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="border-b border-gray-100 px-6 py-5 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-green-100 p-3 text-green-700">
            <Sprout size={24} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Recommendation Inputs
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select your farm, crop year, and cultivation
              season.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-6 py-7 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <label
              htmlFor="farm_id"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <Tractor size={17} className="text-green-700" />
              Farm
            </label>

            <select
              id="farm_id"
              name="farm_id"
              value={formData.farm_id}
              onChange={handleChange}
              disabled={loadingFarms || submitting}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">
                {loadingFarms
                  ? "Loading farms..."
                  : "Select a farm"}
              </option>

              {farms.map((farm) => (
                <option
                  key={farm.id}
                  value={farm.id}
                >
                  {farm.farm_name}
                  {farm.state ? ` — ${farm.state}` : ""}
                </option>
              ))}
            </select>

            {!loadingFarms && farms.length === 0 && (
              <p className="mt-2 text-sm text-amber-700">
                No active farms are available. Create or
                reactivate a farm first.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="crop_year"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <CalendarDays
                size={17}
                className="text-green-700"
              />
              Crop Year
            </label>

            <input
              id="crop_year"
              name="crop_year"
              type="number"
              min="1997"
              max={new Date().getFullYear() + 1}
              value={formData.crop_year}
              onChange={handleChange}
              disabled={submitting}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="season"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <Sprout size={17} className="text-green-700" />
              Season
            </label>

            <select
              id="season"
              name="season"
              value={formData.season}
              onChange={handleChange}
              disabled={submitting}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">Select a season</option>

              {SEASONS.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedFarm && (
          <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
            <div className="flex items-start gap-3">
              <MapPin
                size={20}
                className="mt-0.5 shrink-0 text-green-700"
              />

              <div>
                <p className="font-semibold text-green-900">
                  {selectedFarm.farm_name}
                </p>

                <p className="mt-1 text-sm text-green-800">
                  {[
                    selectedFarm.village,
                    selectedFarm.district,
                    selectedFarm.state,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>

                <p className="mt-2 text-sm text-green-700">
                  Area: {selectedFarm.area_hectares} hectares
                  {selectedFarm.soil_type
                    ? ` • Soil: ${selectedFarm.soil_type}`
                    : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm leading-6 text-blue-800">
          Soil nutrients, weather conditions, historical
          agricultural values, and candidate crops will be
          resolved automatically by the backend.
        </div>

        <button
          type="submit"
          disabled={
            submitting ||
            loadingFarms ||
            farms.length === 0
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? (
            <>
              <LoaderCircle
                size={19}
                className="animate-spin"
              />
              Comparing Crops...
            </>
          ) : (
            <>
              <Sprout size={19} />
              Generate Recommendation
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default RecommendationForm;