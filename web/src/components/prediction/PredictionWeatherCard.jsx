import {
  ChevronDown,
  CloudRain,
  CloudSun,
  Droplets,
  ThermometerSun,
} from "lucide-react";

function PredictionWeatherCard({
  expanded,
  onToggle,
  form,
  errors,
  onChange,
  disabled = false,
  fieldClass,
}) {
  return (
    <div className="mt-7 overflow-hidden rounded-2xl border border-blue-200 bg-blue-50">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="flex w-full items-center justify-between gap-4 p-5 text-left disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white p-3 text-blue-700 shadow-sm">
            <CloudSun size={22} />
          </div>

          <div>
            <p className="font-bold text-gray-900">
              Advanced Weather Inputs
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-600">
              Optional. Leave these fields empty to use stored
              weather and historical rainfall references.
            </p>
          </div>
        </div>

        <ChevronDown
          size={20}
          className={`shrink-0 text-gray-500 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="grid gap-5 border-t border-blue-200 p-5 md:grid-cols-2">
          <WeatherField
            label="Annual Rainfall"
            icon={CloudRain}
            name="annual_rainfall"
            value={form.annual_rainfall}
            onChange={onChange}
            disabled={disabled}
            placeholder="Example: 950"
            min="0"
            error={errors.annual_rainfall}
            fieldClass={fieldClass}
          />

          <WeatherField
            label="Average Temperature (°C)"
            icon={ThermometerSun}
            name="average_temperature_c"
            value={form.average_temperature_c}
            onChange={onChange}
            disabled={disabled}
            placeholder="Example: 27.5"
            min="-50"
            max="60"
            error={errors.average_temperature_c}
            fieldClass={fieldClass}
          />

          <WeatherField
            label="Total Rainfall (mm)"
            icon={CloudRain}
            name="total_rainfall_mm"
            value={form.total_rainfall_mm}
            onChange={onChange}
            disabled={disabled}
            placeholder="Example: 940"
            min="0"
            error={errors.total_rainfall_mm}
            fieldClass={fieldClass}
          />

          <WeatherField
            label="Average Humidity (%)"
            icon={Droplets}
            name="average_humidity_percent"
            value={form.average_humidity_percent}
            onChange={onChange}
            disabled={disabled}
            placeholder="Example: 72"
            min="0"
            max="100"
            error={errors.average_humidity_percent}
            fieldClass={fieldClass}
          />
        </div>
      )}
    </div>
  );
}

function WeatherField({
  label,
  icon: Icon,
  name,
  value,
  onChange,
  disabled,
  placeholder,
  min,
  max,
  error,
  fieldClass,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </span>

      <div className="relative">
        <Icon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          name={name}
          type="number"
          step="any"
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`${fieldClass(name)} pl-11`}
        />
      </div>

      {error && (
        <span className="mt-1.5 block text-xs font-medium text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

export default PredictionWeatherCard;