import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  BrainCircuit,
  CalendarDays,
  CircleAlert,
  CloudRain,
  Droplets,
  FlaskConical,
  History,
  Leaf,
  MapPinned,
  Plus,
  Sprout,
  ThermometerSun,
  Tractor,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";

import DashboardLayout from "../../layouts/dashboard/DashboardLayout";

import { predictionService } from "../../services/predictionService";
import { getApiErrorMessage } from "../../utils/apiError";

function PredictionDetails() {
  const { predictionId } = useParams();
  const navigate = useNavigate();

  const [prediction, setPrediction] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const loadPrediction = useCallback(async () => {
    const numericId = Number(predictionId);

    if (
      !Number.isInteger(numericId) ||
      numericId <= 0
    ) {
      toast.error("Invalid prediction ID.");

      navigate("/predictions/history", {
        replace: true,
      });

      return;
    }

    try {
      setLoading(true);

      const result =
        await predictionService.getPrediction(
          numericId
        );

      setPrediction(result);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to load prediction details."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [predictionId, navigate]);

  useEffect(() => {
    loadPrediction();
  }, [loadPrediction]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-20 text-center text-gray-500 shadow-sm">
          Loading prediction details...
        </div>
      </DashboardLayout>
    );
  }

  if (!prediction) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-20 text-center shadow-sm">
          <CircleAlert
            size={48}
            className="mx-auto text-red-500"
          />

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Prediction unavailable
          </h1>

          <p className="mx-auto mt-2 max-w-md text-gray-500">
            The prediction could not be found, or you do not
            have permission to view it.
          </p>

          <Link
            to="/predictions/history"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            <History size={18} />
            Return to History
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const generatedAt = prediction.created_at
    ? new Date(
        prediction.created_at
      ).toLocaleString()
    : "Recently";

  const categoryStyle = getCategoryStyle(
    prediction.yield_category
  );

  const estimatedKilograms =
    Number(prediction.estimated_production) * 1000;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/predictions/history"
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            <ArrowLeft size={17} />
            Back to Prediction History
          </Link>

          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Prediction Details
          </h1>

          <p className="mt-2 text-gray-600">
            Review the complete farm, crop, soil, weather,
            model, and prediction information.
          </p>
        </div>

        <Link
          to="/prediction"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
        >
          <Plus size={19} />
          New Prediction
        </Link>
      </div>

      <section className="mt-7 overflow-hidden rounded-3xl border border-green-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-green-900 via-green-800 to-emerald-700 px-6 py-8 text-white lg:px-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-100">
            <BrainCircuit size={18} />
            AI Crop Yield Prediction
          </div>

          <h2 className="mt-3 text-3xl font-black">
            {prediction.crop}
          </h2>

          <p className="mt-2 text-green-100">
            {prediction.farm_name} · {prediction.state}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold">
              {prediction.season}
            </span>

            <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold">
              {prediction.crop_year}
            </span>

            <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold">
              {generatedAt}
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-sm font-bold ${categoryStyle.badge}`}
            >
              {categoryStyle.symbol}{" "}
              {prediction.yield_category_label}
            </span>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <MetricCard
                icon={Sprout}
                label="Predicted Yield"
                value={`${formatNumber(
                  prediction.predicted_yield
                )} t/ha`}
                note="Metric tons per hectare"
                tone="green"
              />

              <MetricCard
                icon={Package}
                label="Estimated Production"
                value={`${formatNumber(
                  prediction.estimated_production
                )} metric tons`}
                note={`Approximately ${formatWholeNumber(
                  estimatedKilograms
                )} kg for ${formatNumber(
                  prediction.area_hectares
                )} hectares`}
                tone="amber"
              />
          </div>

          <div className="mt-7 grid gap-6 xl:grid-cols-2">
            <DetailsSection
              title="Farm and Crop"
              icon={Tractor}
            >
              <DetailRow
                icon={Tractor}
                label="Farm"
                value={prediction.farm_name}
              />

              <DetailRow
                icon={MapPinned}
                label="State"
                value={prediction.state}
              />

              <DetailRow
                icon={Sprout}
                label="Crop"
                value={prediction.crop}
              />

              <DetailRow
                icon={CalendarDays}
                label="Prediction Year"
                value={prediction.crop_year}
              />

              <DetailRow
                icon={Sprout}
                label="Season"
                value={prediction.season}
              />

              <DetailRow
                icon={Tractor}
                label="Farm Area"
                value={`${formatNumber(
                  prediction.area_hectares
                )} hectares`}
                last
              />
            </DetailsSection>

            <DetailsSection
              title="Agricultural Inputs"
              icon={FlaskConical}
            >
              <DetailRow
                icon={FlaskConical}
                label="Fertilizer"
                value={`${formatNumber(
                    prediction.fertilizer
                )} kg`}
              />

              <DetailRow
                icon={Leaf}
                label="Pesticide"
                value={`${formatNumber(
                    prediction.pesticide
                )} kg`}
              />

              <DetailRow
                icon={CloudRain}
                label="Annual Rainfall"
                value={`${formatNumber(
                    prediction.annual_rainfall
                )} mm`}
                last
              />
            </DetailsSection>

            <DetailsSection
              title="Soil Reference"
              icon={Sprout}
            >
              <DetailRow
                label="Nitrogen (N)"
                value={`${formatNumber(prediction.nitrogen)} kg/ha`}
              />

              <DetailRow
                label="Phosphorus (P)"
                value={`${formatNumber(prediction.phosphorus)} kg/ha`}
              />

              <DetailRow
                label="Potassium (K)"
                value={`${formatNumber(prediction.potassium)} kg/ha`}
              />

              <DetailRow
                label="Soil pH"
                value={`${formatNumber(prediction.ph)} pH`}
                last
              />
            </DetailsSection>

            <DetailsSection
              title="Weather Information"
              icon={ThermometerSun}
            >
              <DetailRow
                icon={ThermometerSun}
                label="Average Temperature"
                value={`${formatNumber(
                  prediction.average_temperature_c
                )} °C`}
              />

              <DetailRow
                icon={CloudRain}
                label="Total Rainfall"
                value={`${formatNumber(
                  prediction.total_rainfall_mm
                )} mm`}
              />

              <DetailRow
                icon={Droplets}
                label="Average Humidity"
                value={`${formatNumber(
                  prediction.average_humidity_percent
                )}%`}
                last
              />
            </DetailsSection>
          </div>

          <div className="mt-6">
          <DetailsSection
            title="Yield Classification"
            icon={Sprout}
          >
            <DetailRow
              label="Category"
              value={
                prediction.yield_category_label
              }
            />

            <DetailRow
              label="Interpretation"
              value={
                prediction.yield_category_description
              }
              last
            />
          </DetailsSection>
        </div>

          <div className="mt-6">
            <DetailsSection
              title="Model Information"
              icon={BrainCircuit}
            >
              <DetailRow
                icon={BrainCircuit}
                label="Model Name"
                value={prediction.model_name}
              />

              <DetailRow
                label="Model Version"
                value={prediction.model_version}
              />

              <DetailRow
                label="Generated At"
                value={generatedAt}
                last
              />
            </DetailsSection>
          </div>

          {prediction.explanation && (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white p-3 text-blue-700 shadow-sm">
                  <CircleAlert size={21} />
                </div>

                <div>
                  <h3 className="font-bold text-blue-950">
                    Prediction Information
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-blue-900">
                    {prediction.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
}) {
  const toneClass =
    tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-green-200 bg-green-50 text-green-900";

  return (
    <div
      className={`rounded-2xl border p-6 ${toneClass}`}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <Icon size={24} />
        </div>

        <p className="font-semibold">
          {label}
        </p>
      </div>

      <p className="mt-5 text-4xl font-black">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 opacity-75">
        {note}
      </p>
    </div>
  );
}

function DetailsSection({
  title,
  icon: Icon,
  children,
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="rounded-xl bg-green-100 p-2.5 text-green-700">
          <Icon size={20} />
        </div>

        <h3 className="font-bold text-gray-900">
          {title}
        </h3>
      </div>

      <div className="mt-2">
        {children}
      </div>
    </section>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  last = false,
}) {
  return (
    <div
      className={[
        "flex items-start justify-between gap-5 py-3",
        last
          ? ""
          : "border-b border-gray-100",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center gap-2 text-sm text-gray-500">
        {Icon && <Icon size={16} />}

        <span>{label}</span>
      </div>

      <p className="max-w-[58%] break-words text-right text-sm font-bold text-gray-900">
        {value ?? "—"}
      </p>
    </div>
  );
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getCategoryStyle(category) {
  switch (category) {
    case "excellent":
      return {
        symbol: "🟢",
        badge:
          "bg-emerald-100 text-emerald-900",
      };

    case "good":
      return {
        symbol: "🟢",
        badge:
          "bg-green-100 text-green-900",
      };

    case "average":
      return {
        symbol: "🟡",
        badge:
          "bg-amber-100 text-amber-900",
      };

    case "low":
      return {
        symbol: "🔴",
        badge:
          "bg-red-100 text-red-900",
      };

    default:
      return {
        symbol: "⚪",
        badge:
          "bg-white/10 text-white",
      };
  }
}

function formatWholeNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return Math.round(number).toLocaleString();
}

export default PredictionDetails;