import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Droplets,
  MapPinned,
  Navigation,
  Sprout,
  Tractor,
} from "lucide-react";

import { datasetService } from "../../services/datasetService";
import { getApiErrorMessage } from "../../utils/apiError";

const initialFormValues = {
  farm_name: "",
  state: "",
  district: "",
  village: "",
  area_hectares: "",
  soil_type: "",
  primary_crop: "",
  irrigation_type: "",
  latitude: "",
  longitude: "",
};

const initialReferenceOptions = {
  states: [],
  crops: [],
  irrigation_types: [],
};

function FarmForm({
  initialValues,
  onSubmit,
  submitting = false,
  submitLabel = "Save Farm",
}) {
  const startingValues = useMemo(
    () => ({
      ...initialFormValues,
      ...initialValues,
      area_hectares:
        initialValues?.area_hectares?.toString() || "",
      latitude:
        initialValues?.latitude != null
          ? initialValues.latitude.toString()
          : "",
      longitude:
        initialValues?.longitude != null
          ? initialValues.longitude.toString()
          : "",
    }),
    [initialValues]
  );

  const [form, setForm] = useState(startingValues);
  const [errors, setErrors] = useState({});

  const [referenceOptions, setReferenceOptions] = useState(
    initialReferenceOptions
  );

  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState(false);

  useEffect(() => {
    setForm(startingValues);
  }, [startingValues]);

  useEffect(() => {
    let mounted = true;

    const loadReferenceOptions = async () => {
      try {
        setOptionsLoading(true);
        setOptionsError(false);

        const result = await datasetService.getFarmOptions();

        if (!mounted) {
          return;
        }

        setReferenceOptions({
          states: result.states || [],
          crops: result.crops || [],
          irrigation_types:
            result.irrigation_types || [],
        });
      } catch (error) {
        if (!mounted) {
          return;
        }

        setOptionsError(true);

        toast.error(
          getApiErrorMessage(
            error,
            "Unable to load farm reference options."
          )
        );
      } finally {
        if (mounted) {
          setOptionsLoading(false);
        }
      }
    };

    loadReferenceOptions();

    return () => {
      mounted = false;
    };
  }, []);

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

  const optionExists = (options, value) => {
    if (!value) {
      return true;
    }

    return options.some(
      (option) => option.value === value
    );
  };

  const validateForm = () => {
    const nextErrors = {};

    if (form.farm_name.trim().length < 2) {
      nextErrors.farm_name =
        "Farm name must contain at least 2 characters.";
    }

    if (!form.state) {
      nextErrors.state = "State is required.";
    } else if (
      !optionExists(
        referenceOptions.states,
        form.state
      )
    ) {
      nextErrors.state =
        "Select a valid state from the list.";
    }

    if (form.district.trim().length < 2) {
      nextErrors.district =
        "District is required.";
    }

    const area = Number(form.area_hectares);

    if (
      !form.area_hectares ||
      Number.isNaN(area) ||
      area <= 0
    ) {
      nextErrors.area_hectares =
        "Area must be greater than zero.";
    }

    if (
      form.primary_crop &&
      !optionExists(
        referenceOptions.crops,
        form.primary_crop
      )
    ) {
      nextErrors.primary_crop =
        "Select a valid crop from the list.";
    }

    if (
      form.irrigation_type &&
      !optionExists(
        referenceOptions.irrigation_types,
        form.irrigation_type
      )
    ) {
      nextErrors.irrigation_type =
        "Select a valid irrigation type.";
    }

    if (form.latitude !== "") {
      const latitude = Number(form.latitude);

      if (
        Number.isNaN(latitude) ||
        latitude < -90 ||
        latitude > 90
      ) {
        nextErrors.latitude =
          "Latitude must be between -90 and 90.";
      }
    }

    if (form.longitude !== "") {
      const longitude = Number(form.longitude);

      if (
        Number.isNaN(longitude) ||
        longitude < -180 ||
        longitude > 180
      ) {
        nextErrors.longitude =
          "Longitude must be between -180 and 180.";
      }
    }

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
      farm_name: form.farm_name.trim(),
      state: form.state,
      district: form.district.trim(),
      village: form.village.trim() || null,
      area_hectares: Number(form.area_hectares),
      soil_type: form.soil_type.trim() || null,
      primary_crop: form.primary_crop || null,
      irrigation_type:
        form.irrigation_type || null,
      latitude:
        form.latitude === ""
          ? null
          : Number(form.latitude),
      longitude:
        form.longitude === ""
          ? null
          : Number(form.longitude),
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

  const submitDisabled =
    submitting || optionsLoading || optionsError;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-green-100 p-3 text-green-700">
          <Tractor size={24} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Farm Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter the farm location, area, crop, soil, and
            irrigation details.
          </p>
        </div>
      </div>

      {optionsError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Farm reference options could not be loaded. Refresh
          the page before submitting the form.
        </div>
      )}

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <FormField
          label="Farm Name"
          required
          error={errors.farm_name}
        >
          <input
            name="farm_name"
            value={form.farm_name}
            onChange={updateField}
            placeholder="Example: Green Valley Farm"
            className={fieldClass("farm_name")}
          />
        </FormField>

        <FormField
          label="Area in Hectares"
          required
          error={errors.area_hectares}
        >
          <input
            name="area_hectares"
            type="number"
            step="0.01"
            min="0"
            value={form.area_hectares}
            onChange={updateField}
            placeholder="Example: 4.5"
            className={fieldClass("area_hectares")}
          />
        </FormField>
      </div>

      <div className="mt-7 flex items-center gap-2 border-b border-gray-200 pb-3">
        <MapPinned
          size={20}
          className="text-green-700"
        />

        <h3 className="font-bold text-gray-900">
          Location
        </h3>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <FormField
          label="State"
          required
          error={errors.state}
        >
          <select
            name="state"
            value={form.state}
            onChange={updateField}
            disabled={optionsLoading || optionsError}
            className={fieldClass("state")}
          >
            <option value="">
              {optionsLoading
                ? "Loading states..."
                : "Select state"}
            </option>

            {referenceOptions.states.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="District"
          required
          error={errors.district}
        >
          <input
            name="district"
            value={form.district}
            onChange={updateField}
            placeholder="Example: Mysuru"
            className={fieldClass("district")}
          />
        </FormField>

        <FormField label="Village">
          <input
            name="village"
            value={form.village}
            onChange={updateField}
            placeholder="Example: Nanjangud"
            className={fieldClass("village")}
          />
        </FormField>
      </div>

      <div className="mt-7 flex items-center gap-2 border-b border-gray-200 pb-3">
        <Sprout
          size={20}
          className="text-green-700"
        />

        <h3 className="font-bold text-gray-900">
          Agricultural Details
        </h3>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <FormField label="Soil Type">
          <input
            name="soil_type"
            value={form.soil_type}
            onChange={updateField}
            placeholder="Example: Red Soil"
            className={fieldClass("soil_type")}
          />
        </FormField>

        <FormField
          label="Primary Crop"
          error={errors.primary_crop}
        >
          <select
            name="primary_crop"
            value={form.primary_crop}
            onChange={updateField}
            disabled={optionsLoading || optionsError}
            className={fieldClass("primary_crop")}
          >
            <option value="">
              {optionsLoading
                ? "Loading crops..."
                : "Select primary crop"}
            </option>

            {referenceOptions.crops.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Irrigation Type"
          error={errors.irrigation_type}
        >
          <div className="relative">
            <Droplets
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <select
              name="irrigation_type"
              value={form.irrigation_type}
              onChange={updateField}
              disabled={optionsLoading || optionsError}
              className={`${fieldClass(
                "irrigation_type"
              )} pl-11`}
            >
              <option value="">
                {optionsLoading
                  ? "Loading irrigation types..."
                  : "Select irrigation type"}
              </option>

              {referenceOptions.irrigation_types.map(
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
      </div>

      <div className="mt-7 flex items-center gap-2 border-b border-gray-200 pb-3">
        <Navigation
          size={20}
          className="text-green-700"
        />

        <div>
          <h3 className="font-bold text-gray-900">
            Farm Coordinates
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Optional now, useful later for location-based
            weather integration.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <FormField
          label="Latitude"
          error={errors.latitude}
        >
          <input
            name="latitude"
            type="number"
            step="any"
            value={form.latitude}
            onChange={updateField}
            placeholder="Between -90 and 90"
            className={fieldClass("latitude")}
          />
        </FormField>

        <FormField
          label="Longitude"
          error={errors.longitude}
        >
          <input
            name="longitude"
            type="number"
            step="any"
            value={form.longitude}
            onChange={updateField}
            placeholder="Between -180 and 180"
            className={fieldClass("longitude")}
          />
        </FormField>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={submitDisabled}
          className="min-w-40 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {optionsLoading
            ? "Loading Options..."
            : submitting
              ? "Saving Farm..."
              : submitLabel}
        </button>
      </div>
    </form>
  );
}

function FormField({
  label,
  required = false,
  error,
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

      {error && (
        <span className="mt-1.5 block text-xs font-medium text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

export default FarmForm;