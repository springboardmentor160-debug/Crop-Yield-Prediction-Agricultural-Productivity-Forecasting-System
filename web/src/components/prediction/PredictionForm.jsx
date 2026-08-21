import {
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import {
  BrainCircuit,
  CalendarDays,
  FlaskConical,
  Leaf,
  Sprout,
  Tractor,
} from "lucide-react";

import PredictionFarmPreview from "./PredictionFarmPreview";
import PredictionWeatherCard from "./PredictionWeatherCard";

import { datasetService } from "../../services/datasetService";
import { farmService } from "../../services/farmService";
import { getApiErrorMessage } from "../../utils/apiError";

const currentYear = new Date().getFullYear();

const initialForm = {
  farm_id: "",
  crop: "",
  crop_year: String(currentYear),
  season: "",
  fertilizer: "",
  pesticide: "",
  annual_rainfall: "",
  average_temperature_c: "",
  total_rainfall_mm: "",
  average_humidity_percent: "",
};

function PredictionForm({
  onSubmit,
  submitting = false,
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [farms, setFarms] = useState([]);

  const [referenceOptions, setReferenceOptions] =
    useState({
      crops: [],
      seasons: [],
    });

  const [optionsLoading, setOptionsLoading] =
    useState(true);

  const [optionsError, setOptionsError] =
    useState(false);

  const [
    showAdvancedWeather,
    setShowAdvancedWeather,
  ] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        setOptionsLoading(true);
        setOptionsError(false);

        const [farmResult, datasetResult] =
          await Promise.all([
            farmService.getFarms({
              page: 1,
              page_size: 100,
              is_active: true,
            }),
            datasetService.getFarmOptions(),
          ]);

        if (!mounted) {
          return;
        }

        setFarms(farmResult.items || []);

        setReferenceOptions({
          crops: datasetResult.crops || [],
          seasons: datasetResult.seasons || [],
        });
      } catch (error) {
        if (!mounted) {
          return;
        }

        setOptionsError(true);

        toast.error(
          getApiErrorMessage(
            error,
            "Unable to load prediction options."
          )
        );
      } finally {
        if (mounted) {
          setOptionsLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedFarm = useMemo(
    () =>
      farms.find(
        (farm) =>
          String(farm.id) === form.farm_id
      ) || null,
    [farms, form.farm_id]
  );

  useEffect(() => {
    if (
      !selectedFarm?.primary_crop ||
      form.crop ||
      referenceOptions.crops.length === 0
    ) {
      return;
    }

    const isSupported =
      referenceOptions.crops.some(
        (option) =>
          option.value ===
          selectedFarm.primary_crop
      );

    if (isSupported) {
      setForm((current) => ({
        ...current,
        crop: selectedFarm.primary_crop,
      }));
    }
  }, [
    selectedFarm,
    form.crop,
    referenceOptions.crops,
  ]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.farm_id) {
      nextErrors.farm_id =
        "Select an active farm.";
    }

    if (!form.crop) {
      nextErrors.crop = "Select a crop.";
    }

    if (!form.season) {
      nextErrors.season = "Select a season.";
    }

    const cropYear = Number(form.crop_year);

    if (
      !Number.isInteger(cropYear) ||
      cropYear < 1990 ||
      cropYear > 2100
    ) {
      nextErrors.crop_year =
        "Year must be between 1990 and 2100.";
    }

    validateRequiredNumber(
      form.fertilizer,
      "fertilizer",
      nextErrors,
      "Enter a valid fertilizer amount."
    );

    validateRequiredNumber(
      form.pesticide,
      "pesticide",
      nextErrors,
      "Enter a valid pesticide amount."
    );

    validateOptionalNumber(
      form.annual_rainfall,
      "annual_rainfall",
      nextErrors,
      {
        minimum: 0,
        message:
          "Annual rainfall cannot be negative.",
      }
    );

    validateOptionalNumber(
      form.average_temperature_c,
      "average_temperature_c",
      nextErrors,
      {
        minimum: -50,
        maximum: 60,
        message:
          "Temperature must be between -50 and 60°C.",
      }
    );

    validateOptionalNumber(
      form.total_rainfall_mm,
      "total_rainfall_mm",
      nextErrors,
      {
        minimum: 0,
        message:
          "Total rainfall cannot be negative.",
      }
    );

    validateOptionalNumber(
      form.average_humidity_percent,
      "average_humidity_percent",
      nextErrors,
      {
        minimum: 0,
        maximum: 100,
        message:
          "Humidity must be between 0 and 100.",
      }
    );

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      optionsLoading ||
      optionsError ||
      !validateForm()
    ) {
      return;
    }

    const payload = {
      farm_id: Number(form.farm_id),
      crop: form.crop,
      crop_year: Number(form.crop_year),
      season: form.season,
      fertilizer: Number(form.fertilizer),
      pesticide: Number(form.pesticide),
      annual_rainfall: toOptionalNumber(
        form.annual_rainfall
      ),
      average_temperature_c:
        toOptionalNumber(
          form.average_temperature_c
        ),
      total_rainfall_mm: toOptionalNumber(
        form.total_rainfall_mm
      ),
      average_humidity_percent:
        toOptionalNumber(
          form.average_humidity_percent
        ),
    };

    await onSubmit(payload);
  };

  const fieldClass = (fieldName) =>
    [
      "w-full rounded-xl border bg-white px-4 py-3 outline-none transition",
      "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500",
      errors[fieldName]
        ? "border-red-500 focus:border-red-600"
        : "border-gray-300 focus:border-green-600",
    ].join(" ");

  const formDisabled =
    submitting || optionsLoading || optionsError;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-green-100 p-3 text-green-700">
            <BrainCircuit size={24} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Generate Prediction
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enter the farming details required by the
              prediction model.
            </p>
          </div>
        </div>

        {optionsError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Prediction options could not be loaded.
            Refresh this page before trying again.
          </div>
        )}

        {!optionsLoading &&
          !optionsError &&
          farms.length === 0 && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              No active farms are available. Create or
              reactivate a farm before generating a
              prediction.
            </div>
          )}

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <FormField
            label="Farm"
            required
            error={errors.farm_id}
          >
            <div className="relative">
              <Tractor
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <select
                name="farm_id"
                value={form.farm_id}
                onChange={updateField}
                disabled={formDisabled}
                className={`${fieldClass(
                  "farm_id"
                )} pl-11`}
              >
                <option value="">
                  {optionsLoading
                    ? "Loading farms..."
                    : "Select active farm"}
                </option>

                {farms.map((farm) => (
                  <option
                    key={farm.id}
                    value={farm.id}
                  >
                    {farm.farm_name}
                  </option>
                ))}
              </select>
            </div>
          </FormField>

          <FormField
            label="Prediction Year"
            required
            error={errors.crop_year}
          >
            <div className="relative">
              <CalendarDays
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                name="crop_year"
                type="number"
                min="1990"
                max="2100"
                value={form.crop_year}
                onChange={updateField}
                disabled={submitting}
                className={`${fieldClass(
                  "crop_year"
                )} pl-11`}
              />
            </div>
          </FormField>

          <FormField
            label="Crop"
            required
            error={errors.crop}
          >
            <div className="relative">
              <Sprout
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <select
                name="crop"
                value={form.crop}
                onChange={updateField}
                disabled={formDisabled}
                className={`${fieldClass(
                  "crop"
                )} pl-11`}
              >
                <option value="">
                  {optionsLoading
                    ? "Loading crops..."
                    : "Select crop"}
                </option>

                {referenceOptions.crops.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>
          </FormField>

          <FormField
            label="Season"
            required
            error={errors.season}
          >
            <select
              name="season"
              value={form.season}
              onChange={updateField}
              disabled={formDisabled}
              className={fieldClass("season")}
            >
              <option value="">
                {optionsLoading
                  ? "Loading seasons..."
                  : "Select season"}
              </option>

              {referenceOptions.seasons.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </FormField>

          <FormField
            label="Fertilizer"
            required
            error={errors.fertilizer}
            help="Enter the amount using the same unit as the historical dataset."
          >
            <div className="relative">
              <FlaskConical
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                name="fertilizer"
                type="number"
                min="0"
                step="any"
                value={form.fertilizer}
                onChange={updateField}
                disabled={submitting}
                placeholder="Example: 1250"
                className={`${fieldClass(
                  "fertilizer"
                )} pl-11`}
              />
            </div>
          </FormField>

          <FormField
            label="Pesticide"
            required
            error={errors.pesticide}
            help="Enter the amount using the same unit as the historical dataset."
          >
            <div className="relative">
              <Leaf
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                name="pesticide"
                type="number"
                min="0"
                step="any"
                value={form.pesticide}
                onChange={updateField}
                disabled={submitting}
                placeholder="Example: 25"
                className={`${fieldClass(
                  "pesticide"
                )} pl-11`}
              />
            </div>
          </FormField>
        </div>

        <PredictionWeatherCard
          expanded={showAdvancedWeather}
          onToggle={() =>
            setShowAdvancedWeather(
              (current) => !current
            )
          }
          form={form}
          errors={errors}
          onChange={updateField}
          disabled={submitting}
          fieldClass={fieldClass}
        />

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={
              formDisabled ||
              farms.length === 0
            }
            className="min-w-56 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {optionsLoading
              ? "Loading Options..."
              : submitting
                ? "Generating Prediction..."
                : "Generate Prediction"}
          </button>
        </div>
      </form>

      <PredictionFarmPreview
        farm={selectedFarm}
        loading={optionsLoading}
      />
    </div>
  );
}

function FormField({
  label,
  required = false,
  error,
  help,
  children,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}

      {help && !error && (
        <span className="mt-1.5 block text-xs leading-5 text-gray-500">
          {help}
        </span>
      )}

      {error && (
        <span className="mt-1.5 block text-xs font-medium text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

function validateRequiredNumber(
  value,
  fieldName,
  errors,
  message
) {
  const number = Number(value);

  if (
    value === "" ||
    Number.isNaN(number) ||
    number < 0
  ) {
    errors[fieldName] = message;
  }
}

function validateOptionalNumber(
  value,
  fieldName,
  errors,
  {
    minimum,
    maximum,
    message,
  }
) {
  if (value === "") {
    return;
  }

  const number = Number(value);

  if (
    Number.isNaN(number) ||
    number < minimum ||
    (maximum != null && number > maximum)
  ) {
    errors[fieldName] = message;
  }
}

function toOptionalNumber(value) {
  return value === "" ? null : Number(value);
}

export default PredictionForm;