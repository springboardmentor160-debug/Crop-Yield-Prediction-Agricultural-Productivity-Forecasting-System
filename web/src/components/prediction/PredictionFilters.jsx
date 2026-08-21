import {
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";

function PredictionFilters({
  filters,
  farms,
  crops,
  seasons,
  onChange,
  onApply,
  onClear,
  loading = false,
}) {
  return (
    <form
      onSubmit={onApply}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <Filter
          size={19}
          className="text-green-700"
        />

        <h2 className="font-bold text-gray-900">
          Prediction Filters
        </h2>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <FilterField label="Farm">
          <select
            name="farm_id"
            value={filters.farm_id}
            onChange={onChange}
            className={inputClass}
          >
            <option value="">All farms</option>

            {farms.map((farm) => (
              <option
                key={farm.id}
                value={farm.id}
              >
                {farm.farm_name}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Crop">
          <select
            name="crop"
            value={filters.crop}
            onChange={onChange}
            className={inputClass}
          >
            <option value="">All crops</option>

            {crops.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Season">
          <select
            name="season"
            value={filters.season}
            onChange={onChange}
            className={inputClass}
          >
            <option value="">All seasons</option>

            {seasons.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="State">
          <input
            name="state"
            value={filters.state}
            onChange={onChange}
            placeholder="Example: Karnataka"
            className={inputClass}
          />
        </FilterField>

        <FilterField label="Prediction Year">
          <input
            name="crop_year"
            type="number"
            min="1990"
            max="2100"
            value={filters.crop_year}
            onChange={onChange}
            placeholder="Example: 2026"
            className={inputClass}
          />
        </FilterField>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RotateCcw size={17} />
          Clear
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
        >
          <Search size={17} />
          Apply Filters
        </button>
      </div>
    </form>
  );
}

function FilterField({ label, children }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </span>

      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-green-600";

export default PredictionFilters;