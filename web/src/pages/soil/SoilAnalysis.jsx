import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Droplets,
  FlaskConical,
  Leaf,
  LoaderCircle,
  MapPinned,
  Search,
  ShieldCheck,
  Sprout,
  TestTube2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import DashboardLayout from "../../layouts/dashboard/DashboardLayout";

import {
  getSoilAnalysis,
  getSoilAnalysisOptions,
} from "../../services/soilAnalysisService";


export default function SoilAnalysis() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] =
    useState("");

  const [analysis, setAnalysis] =
    useState(null);

  const [optionsLoading, setOptionsLoading] =
    useState(true);

  const [analysisLoading, setAnalysisLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function loadOptions() {
    try {
      setError("");
      setOptionsLoading(true);

      const data =
        await getSoilAnalysisOptions();

      const availableStates =
        data.states || [];

      setStates(availableStates);

      if (availableStates.length) {
        setSelectedState(
          (currentState) =>
            currentState ||
            availableStates[0]
        );
      }
    } catch (requestError) {
      const message = getErrorMessage(
        requestError,
        "Unable to load soil analysis options."
      );

      setError(message);
      toast.error(message);
    } finally {
      setOptionsLoading(false);
    }
  }
  useEffect(() => {
    loadOptions();
  }, []);


  async function handleAnalyzeSoil() {
    if (!selectedState) {
      const message =
        "Please select a state.";

      setError(message);
      toast.error(message);

      return;
    }

    try {
      setError("");
      setAnalysisLoading(true);

      const data =
        await getSoilAnalysis(
          selectedState
        );

      setAnalysis(data);

      toast.success(
        "Soil analysis generated successfully."
      );
    } catch (requestError) {
      const message = getErrorMessage(
        requestError,
        "Unable to generate soil analysis."
      );

      setError(message);
      toast.error(message);
    } finally {
      setAnalysisLoading(false);
    }
  }


  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        <SoilAnalysisHeader />

        <SoilFilterCard
          states={states}
          selectedState={selectedState}
          setSelectedState={
            setSelectedState
          }
          loading={
            optionsLoading ||
            analysisLoading
          }
          onAnalyze={
            handleAnalyzeSoil
          }
        />

        {error ? (
          <ErrorCard message={error} />
        ) : null}

        {optionsLoading ? (
          <LoadingCard
            title="Loading soil data"
            description="Preparing available states and soil reference information..."
          />
        ) : null}

        {!optionsLoading &&
        !analysis &&
        !analysisLoading ? (
          <EmptyState />
        ) : null}

        {analysisLoading ? (
          <LoadingCard
            title="Analyzing soil health"
            description="Evaluating nitrogen, phosphorus, potassium and pH levels..."
          />
        ) : null}

        {analysis &&
        !analysisLoading ? (
          <>
            <AnalysisInformation
              analysis={analysis}
            />

            <SoilSummarySection
              analysis={analysis}
            />

            <SoilNutrientVisualization
              summary={
                analysis.summary
              }
            />

            <OverallHealthSection
              analysis={analysis}
            />

            <RecommendationsSection
              recommendations={
                analysis.recommendations ||
                []
              }
            />
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}


function SoilAnalysisHeader() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-6 shadow-sm sm:p-8">
      <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
            <Sprout size={16} />

            Agricultural Soil Intelligence
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Soil Analysis
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Examine state-level soil
            nutrients, understand soil
            health and receive practical
            recommendations for improving
            crop productivity.
          </p>
        </div>

        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-emerald-200 bg-white shadow-sm">
          <Sprout
            size={46}
            className="text-emerald-600"
          />
        </div>
      </div>
    </section>
  );
}


function SoilFilterCard({
  states,
  selectedState,
  setSelectedState,
  loading,
  onAnalyze,
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900">
            Select State
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose a state to inspect its
            soil nutrient reference data.
          </p>

          <div className="mt-5">
            <StateSelect
              states={states}
              value={selectedState}
              onChange={
                setSelectedState
              }
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={onAnalyze}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
          ) : (
            <Search size={18} />
          )}

          {loading
            ? "Please wait..."
            : "Analyze Soil"}
        </button>
      </div>
    </section>
  );
}


function StateSelect({
  states,
  value,
  onChange,
  disabled,
}) {
  const [open, setOpen] =
    useState(false);

  const sortedStates = useMemo(
    () =>
      [...states].sort((a, b) =>
        a.localeCompare(b)
      ),
    [states]
  );

  return (
    <div className="relative max-w-xl">
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        State
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          setOpen((current) => !current)
        }
        className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-slate-300 bg-white px-4 text-left text-sm font-semibold text-slate-800 shadow-sm transition hover:border-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        <span className="flex min-w-0 items-center gap-3">
          <MapPinned
            size={18}
            className="shrink-0 text-emerald-600"
          />

          <span className="truncate">
            {value ||
              "Select a state"}
          </span>
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-500 transition ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close state dropdown"
            onClick={() =>
              setOpen(false)
            }
            className="fixed inset-0 z-20 cursor-default"
          />

          <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            {sortedStates.length ? (
              sortedStates.map(
                (state) => {
                  const selected =
                    state === value;

                  return (
                    <button
                      key={state}
                      type="button"
                      onClick={() => {
                        onChange(state);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                        selected
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{state}</span>

                      {selected ? (
                        <CheckCircle2
                          size={17}
                        />
                      ) : null}
                    </button>
                  );
                }
              )
            ) : (
              <div className="px-3 py-8 text-center text-sm text-slate-500">
                No states available.
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}


function AnalysisInformation({
  analysis,
}) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          Selected Region
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          {analysis.state}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          State-level soil reference
          assessment
        </p>
      </div>

      <HealthBadge
        health={
          analysis.overall_health
        }
      />
    </section>
  );
}


function SoilSummarySection({
  analysis,
}) {
  const summary =
    analysis.summary;

  const metrics = [
    {
      key: "nitrogen",
      title: "Nitrogen",
      symbol: "N",
      value:
        summary.nitrogen.average,
      status:
        summary.nitrogen.status,
      unit: "",
      icon: Leaf,
      description:
        "Supports leaf growth and plant development.",
    },
    {
      key: "phosphorus",
      title: "Phosphorus",
      symbol: "P",
      value:
        summary.phosphorus.average,
      status:
        summary.phosphorus.status,
      unit: "",
      icon: FlaskConical,
      description:
        "Supports roots, flowering and crop maturity.",
    },
    {
      key: "potassium",
      title: "Potassium",
      symbol: "K",
      value:
        summary.potassium.average,
      status:
        summary.potassium.status,
      unit: "",
      icon: Droplets,
      description:
        "Improves crop strength and resistance.",
    },
    {
      key: "ph",
      title: "Soil pH",
      symbol: "pH",
      value: summary.ph.average,
      status: summary.ph.status,
      unit: "",
      icon: TestTube2,
      description:
        "Controls nutrient availability in soil.",
    },
  ];

  return (
    <section>
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Soil Nutrient Overview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Current nutrient values and their
          qualitative condition.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <SoilMetricCard
            key={metric.key}
            {...metric}
          />
        ))}
      </div>
    </section>
  );
}


function SoilMetricCard({
  title,
  symbol,
  value,
  status,
  unit,
  icon: Icon,
  description,
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
          <Icon
            size={22}
            className="text-emerald-600"
          />
        </div>

        <StatusBadge
          status={status}
        />
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-500">
        {title}
      </p>

      <div className="mt-2 flex items-end gap-2">
        <span className="text-3xl font-bold text-slate-900">
          {formatNumber(value)}
        </span>

        {unit ? (
          <span className="pb-1 text-sm font-semibold text-slate-500">
            {unit}
          </span>
        ) : null}
      </div>

      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-emerald-600">
        {symbol}
      </p>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </article>
  );
}


function SoilNutrientVisualization({
  summary,
}) {
  const nutrients = [
    {
      label: "Nitrogen",
      value:
        summary.nitrogen.average,
      maximum: 500,
      status:
        summary.nitrogen.status,
    },
    {
      label: "Phosphorus",
      value:
        summary.phosphorus.average,
      maximum: 60,
      status:
        summary.phosphorus.status,
    },
    {
      label: "Potassium",
      value:
        summary.potassium.average,
      maximum: 400,
      status:
        summary.potassium.status,
    },
    {
      label: "Soil pH",
      value: summary.ph.average,
      maximum: 14,
      status: summary.ph.status,
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
          <FlaskConical
            size={22}
            className="text-emerald-600"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Nutrient Visualization
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Relative nutrient levels based
            on practical reference ranges.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {nutrients.map(
          (nutrient) => {
            const percentage =
              Math.min(
                100,
                Math.max(
                  0,
                  (Number(
                    nutrient.value
                  ) /
                    nutrient.maximum) *
                    100
                )
              );

            return (
              <div
                key={nutrient.label}
              >
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {nutrient.label}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {nutrient.status}
                    </p>
                  </div>

                  <p className="text-sm font-bold text-slate-900">
                    {formatNumber(
                      nutrient.value
                    )}
                  </p>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-500 transition-all duration-700"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}


function OverallHealthSection({
  analysis,
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-lime-50 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
            <ShieldCheck
              size={28}
              className="text-emerald-600"
            />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Overall Soil Health
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              {
                analysis.overall_health
              }
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              This rating summarizes the
              balance of nitrogen,
              phosphorus, potassium and soil
              pH for the selected state.
            </p>
          </div>
        </div>

        <HealthBadge
          health={
            analysis.overall_health
          }
        />
      </div>
    </section>
  );
}


function RecommendationsSection({
  recommendations,
}) {
  return (
    <section>
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Soil Recommendations
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Practical actions based on the
          detected soil condition.
        </p>
      </div>

      {recommendations.length ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {recommendations.map(
            (recommendation, index) => (
              <RecommendationCard
                key={`${recommendation.title}-${index}`}
                recommendation={
                  recommendation
                }
              />
            )
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2
            size={34}
            className="mx-auto text-emerald-600"
          />

          <p className="mt-3 font-bold text-slate-900">
            No corrective action required
          </p>

          <p className="mt-1 text-sm text-slate-500">
            The current soil reference
            values are within the preferred
            ranges.
          </p>
        </div>
      )}
    </section>
  );
}


function RecommendationCard({
  recommendation,
}) {
  return (
    <article className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
        <Leaf
          size={21}
          className="text-amber-600"
        />
      </div>

      <div>
        <h3 className="font-bold text-slate-900">
          {recommendation.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {recommendation.message}
        </p>
      </div>
    </article>
  );
}


function StatusBadge({
  status,
}) {
  const normalized =
    String(status || "")
      .trim()
      .toLowerCase();

  const className =
    normalized === "optimal" ||
    normalized === "neutral"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : normalized === "low" ||
          normalized === "acidic"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : normalized === "high" ||
            normalized === "alkaline"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-bold ${className}`}
    >
      {status || "Unknown"}
    </span>
  );
}


function HealthBadge({
  health,
}) {
  const normalized =
    String(health || "")
      .trim()
      .toLowerCase();

  let className =
    "border-slate-200 bg-slate-100 text-slate-700";

  if (
    normalized === "excellent"
  ) {
    className =
      "border-emerald-200 bg-emerald-100 text-emerald-800";
  } else if (
    normalized === "healthy"
  ) {
    className =
      "border-green-200 bg-green-100 text-green-800";
  } else if (
    normalized === "moderate"
  ) {
    className =
      "border-amber-200 bg-amber-100 text-amber-800";
  } else if (
    normalized === "poor"
  ) {
    className =
      "border-rose-200 bg-rose-100 text-rose-800";
  }

  return (
    <span
      className={`inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-bold ${className}`}
    >
      <ShieldCheck size={17} />

      {health || "Unknown"}
    </span>
  );
}


function LoadingCard({
  title,
  description,
}) {
  return (
    <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center shadow-sm">
      <LoaderCircle
        size={38}
        className="mx-auto animate-spin text-emerald-600"
      />

      <h2 className="mt-4 text-lg font-bold text-slate-900">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
        {description}
      </p>
    </section>
  );
}


function EmptyState() {
  return (
    <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <Sprout
          size={32}
          className="text-slate-400"
        />
      </div>

      <h2 className="mt-4 text-xl font-bold text-slate-900">
        No soil analysis generated
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        Select a state and click Analyze
        Soil to view nutrient values,
        overall soil health and
        recommendations.
      </p>
    </section>
  );
}


function ErrorCard({
  message,
}) {
  return (
    <section className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <AlertTriangle
        size={21}
        className="mt-0.5 shrink-0 text-rose-600"
      />

      <p className="flex-1 text-sm font-semibold leading-6 text-rose-700">
        {message}
      </p>

      <X
        size={18}
        className="shrink-0 text-rose-500"
      />
    </section>
  );
}


function getErrorMessage(
  error,
  fallbackMessage
) {
  const detail =
    error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (
    Array.isArray(detail) &&
    detail.length
  ) {
    return (
      detail[0]?.msg ||
      fallbackMessage
    );
  }

  return fallbackMessage;
}


function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.00";
  }

  return number.toFixed(2);
}