import {
  Droplets,
  MapPinned,
  Ruler,
  Sprout,
  Tractor,
} from "lucide-react";

function PredictionFarmPreview({
  farm,
  loading = false,
}) {
  return (
    <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-green-100 p-3 text-green-700">
          <Tractor size={22} />
        </div>

        <div>
          <h2 className="font-bold text-gray-900">
            Selected Farm
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Farm information used automatically by the model.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-12 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      ) : !farm ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <MapPinned
            size={30}
            className="mx-auto text-gray-400"
          />

          <p className="mt-3 font-semibold text-gray-700">
            No farm selected
          </p>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Select an active farm to view the information that
            will be used for prediction.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 rounded-2xl bg-gradient-to-br from-green-700 to-green-900 p-5 text-white">
            <p className="text-sm text-green-100">
              Active Farm
            </p>

            <h3 className="mt-1 text-xl font-bold">
              {farm.farm_name}
            </h3>

            <div className="mt-3 flex items-center gap-2 text-sm text-green-100">
              <MapPinned size={16} />

              <span>
                {farm.village ? `${farm.village}, ` : ""}
                {farm.district}, {farm.state}
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-1">
            <PreviewRow
              icon={Ruler}
              label="Farm Area"
              value={`${farm.area_hectares} hectares`}
            />

            <PreviewRow
              icon={Sprout}
              label="Primary Crop"
              value={farm.primary_crop || "Not provided"}
            />

            <PreviewRow
              icon={Sprout}
              label="Soil Type"
              value={farm.soil_type || "Not provided"}
            />

            <PreviewRow
              icon={Droplets}
              label="Irrigation"
              value={farm.irrigation_type || "Not provided"}
            />
          </div>

          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800">
            The model automatically uses this farm’s state and
            area. Soil nutrients and weather values are resolved
            by the backend reference datasets.
          </div>
        </>
      )}
    </aside>
  );
}

function PreviewRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 py-3 last:border-b-0">
      <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}

export default PredictionFarmPreview;