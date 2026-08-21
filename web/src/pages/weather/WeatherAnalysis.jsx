import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  CloudRain,
  Droplets,
  LoaderCircle,
  Search,
  ThermometerSun,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import WeatherTrendCharts from "../../components/weather/WeatherTrendCharts";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";

import {
  getWeatherAnalysis,
  getWeatherAnalysisOptions,
} from "../../services/weatherAnalysisService";


function WeatherAnalysis() {
  const [options, setOptions] = useState({
    states: [],
    years: [],
    minimum_year: null,
    maximum_year: null,
  });

  const [filters, setFilters] = useState({
    state: "",
    startYear: "",
    endYear: "",
  });

  const [analysis, setAnalysis] = useState(null);

  const [optionsLoading, setOptionsLoading] =
    useState(true);

  const [analysisLoading, setAnalysisLoading] =
    useState(false);


  useEffect(() => {
    async function loadOptions() {
      try {
        setOptionsLoading(true);

        const data =
          await getWeatherAnalysisOptions();

        setOptions(data);

        const defaultState =
          data.states?.[0] || "";

        const defaultStartYear =
          data.minimum_year ??
          data.years?.[0] ??
          "";

        const defaultEndYear =
          data.maximum_year ??
          data.years?.[
            data.years.length - 1
          ] ??
          "";

        setFilters({
          state: defaultState,
          startYear: String(defaultStartYear),
          endYear: String(defaultEndYear),
        });
      } catch (error) {
        const message =
          error.response?.data?.detail ||
          "Unable to load weather analysis options.";

        toast.error(message);
      } finally {
        setOptionsLoading(false);
      }
    }

    loadOptions();
  }, []);


  const availableStartYears = useMemo(() => {
    if (!filters.endYear) {
      return options.years;
    }

    return options.years.filter(
      (year) =>
        year <= Number(filters.endYear)
    );
  }, [
    options.years,
    filters.endYear,
  ]);


  const availableEndYears = useMemo(() => {
    if (!filters.startYear) {
      return options.years;
    }

    return options.years.filter(
      (year) =>
        year >= Number(filters.startYear)
    );
  }, [
    options.years,
    filters.startYear,
  ]);


  function handleFilterChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }


  async function handleAnalyzeWeather(event) {
    event.preventDefault();

    if (
      !filters.state ||
      !filters.startYear ||
      !filters.endYear
    ) {
      toast.error(
        "Please select a state and year range."
      );

      return;
    }

    if (
      Number(filters.startYear) >
      Number(filters.endYear)
    ) {
      toast.error(
        "Start year cannot be greater than end year."
      );

      return;
    }

    try {
      setAnalysisLoading(true);

      const data = await getWeatherAnalysis({
        state: filters.state,
        startYear: Number(
          filters.startYear
        ),
        endYear: Number(
          filters.endYear
        ),
      });

      setAnalysis(data);

      toast.success(
        "Weather analysis generated successfully."
      );
    } catch (error) {
      const detail =
        error.response?.data?.detail;

      const message =
        typeof detail === "string"
          ? detail
          : "Unable to generate weather analysis.";

      toast.error(message);
    } finally {
      setAnalysisLoading(false);
    }
  }


  if (optionsLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <LoaderCircle
              className="h-9 w-9 animate-spin text-emerald-600"
            />

            <p className="text-sm font-medium text-slate-600">
              Loading weather analysis...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
  <DashboardLayout>
    <div className="space-y-6 pb-8">
      <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm">
              <CloudRain className="h-4 w-4" />
              Agricultural Weather Intelligence
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Weather Analysis
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Analyze historical temperature,
              rainfall and humidity trends to
              understand their possible impact on
              agricultural productivity.
            </p>
          </div>

          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white shadow-md ring-1 ring-emerald-100">
            <CloudRain className="h-12 w-12 text-emerald-600" />
          </div>
        </div>
      </section>


      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">
            Select Analysis Period
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose a state and historical year
            range to generate the analysis.
          </p>
        </div>

        <form
          onSubmit={handleAnalyzeWeather}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <div>
            <label
              htmlFor="weather-state"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              State
            </label>

            <select
              id="weather-state"
              name="state"
              value={filters.state}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="">
                Select state
              </option>

              {options.states.map((state) => (
                <option
                  key={state}
                  value={state}
                >
                  {state}
                </option>
              ))}
            </select>
          </div>


          <div>
            <label
              htmlFor="weather-start-year"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Start Year
            </label>

            <select
              id="weather-start-year"
              name="startYear"
              value={filters.startYear}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="">
                Select start year
              </option>

              {availableStartYears.map(
                (year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                )
              )}
            </select>
          </div>


          <div>
            <label
              htmlFor="weather-end-year"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              End Year
            </label>

            <select
              id="weather-end-year"
              name="endYear"
              value={filters.endYear}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="">
                Select end year
              </option>

              {availableEndYears.map(
                (year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                )
              )}
            </select>
          </div>


          <div className="flex items-end">
            <button
              type="submit"
              disabled={analysisLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {analysisLoading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Analyze Weather
                </>
              )}
            </button>
          </div>
        </form>
      </section>


      {!analysis && (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
            <CloudRain className="h-8 w-8 text-slate-400" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            No analysis generated yet
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
            Select a state and year range, then
            click Analyze Weather to view summary
            statistics, trends and agricultural
            weather risks.
          </p>
        </section>
      )}


      {analysis && (
        <>
          <AnalysisOverview
            analysis={analysis}
            />

            <WeatherTrendCharts
            records={analysis.records}
            />

            <WeatherTrendSection
            analysis={analysis}
            />

          <WeatherAssessmentSection
            assessment={analysis.assessment}
          />

          <WeatherRecordsTable
            records={analysis.records}
          />
        </>
      )}
    </div>
    </DashboardLayout>
  );
}


function AnalysisOverview({
  analysis,
}) {
  const cards = [
    {
      title: "Average Temperature",
      value: `${formatNumber(
        analysis.summary.temperature.average
      )} °C`,
      detail: `${formatNumber(
        analysis.summary.temperature.minimum
      )} °C – ${formatNumber(
        analysis.summary.temperature.maximum
      )} °C`,
      icon: ThermometerSun,
    },
    {
      title: "Average Rainfall",
      value: `${formatNumber(
        analysis.summary.rainfall.average
      )} mm`,
      detail: `${formatNumber(
        analysis.summary.rainfall.minimum
      )} – ${formatNumber(
        analysis.summary.rainfall.maximum
      )} mm`,
      icon: CloudRain,
    },
    {
      title: "Average Humidity",
      value: `${formatNumber(
        analysis.summary.humidity.average
      )}%`,
      detail: `${formatNumber(
        analysis.summary.humidity.minimum
      )}% – ${formatNumber(
        analysis.summary.humidity.maximum
      )}%`,
      icon: Droplets,
    },
    {
      title: "Overall Weather Risk",
      value:
        analysis.assessment
          .overall_risk_level,
      detail:
        analysis.assessment
          .overall_status,
      icon: AlertTriangle,
    },
  ];

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Weather Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {analysis.state},{" "}
            {analysis.start_year}–
            {analysis.end_year}
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          {analysis.total_records} yearly
          records
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {card.value}
                  </p>

                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {card.detail}
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <Icon className="h-5 w-5 text-emerald-700" />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}


function WeatherTrendSection({
  analysis,
}) {
  const trend = analysis.trend;

  const trendItems = [
    {
      label: "Temperature Change",
      value: `${formatSignedNumber(
        trend.temperature_change_c
      )} °C`,
      direction:
        trend.temperature_direction,
    },
    {
      label: "Rainfall Change",
      value: `${formatSignedNumber(
        trend.rainfall_change_percent
      )}%`,
      direction:
        trend.rainfall_direction,
    },
    {
      label: "Humidity Change",
      value: `${formatSignedNumber(
        trend.humidity_change_percent
      )}%`,
      direction:
        trend.humidity_direction,
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">
          Climate Trend Analysis
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Change from {trend.start_year} to{" "}
          {trend.end_year}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {trendItems.map((item) => {
          const isIncreasing =
            item.direction === "increasing";

          const DirectionIcon =
            isIncreasing
              ? TrendingUp
              : TrendingDown;

          return (
            <article
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-600">
                  {item.label}
                </p>

                {item.direction !==
                  "stable" && (
                  <DirectionIcon className="h-5 w-5 text-slate-500" />
                )}
              </div>

              <p className="mt-4 text-2xl font-bold text-slate-900">
                {item.value}
              </p>

              <p className="mt-2 text-sm capitalize text-slate-500">
                {item.direction}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}


function WeatherAssessmentSection({
  assessment,
}) {
  const items = [
    {
      title: "Temperature Impact",
      data: assessment.temperature,
      icon: ThermometerSun,
    },
    {
      title: "Rainfall Impact",
      data: assessment.rainfall,
      icon: CloudRain,
    },
    {
      title: "Humidity Impact",
      data: assessment.humidity,
      icon: Droplets,
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Agricultural Weather Impact
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Farmer-friendly interpretation of
          temperature, rainfall and humidity.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <Icon className="h-5 w-5 text-emerald-700" />
                </div>

                <RiskBadge
                  riskLevel={
                    item.data.risk_level
                  }
                />
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                {item.title}
              </h3>

              <p className="mt-1 text-sm font-semibold text-emerald-700">
                {item.data.status}
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.data.message}
              </p>
            </article>
          );
        })}
      </div>

      <article className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Overall Assessment
            </p>

            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              {assessment.overall_status}
            </h3>

            <p className="mt-3 max-w-3xl leading-7 text-slate-700">
              {assessment.overall_message}
            </p>
          </div>

          <RiskBadge
            riskLevel={
              assessment.overall_risk_level
            }
          />
        </div>
      </article>
    </section>
  );
}


function WeatherRecordsTable({
  records,
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <h2 className="text-xl font-bold text-slate-900">
          Yearly Weather Records
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Historical values used in the
          analysis.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <TableHeading>
                Year
              </TableHeading>

              <TableHeading>
                Temperature
              </TableHeading>

              <TableHeading>
                Rainfall
              </TableHeading>

              <TableHeading>
                Humidity
              </TableHeading>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {records.map((record) => (
              <tr
                key={record.year}
                className="transition hover:bg-slate-50"
              >
                <TableCell>
                  <span className="font-semibold text-slate-900">
                    {record.year}
                  </span>
                </TableCell>

                <TableCell>
                  {formatNumber(
                    record.avg_temp_c
                  )}{" "}
                  °C
                </TableCell>

                <TableCell>
                  {formatNumber(
                    record.total_rainfall_mm
                  )}{" "}
                  mm
                </TableCell>

                <TableCell>
                  {formatNumber(
                    record.avg_humidity_percent
                  )}
                  %
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}


function RiskBadge({
  riskLevel,
}) {
  const normalizedRisk =
    riskLevel?.toLowerCase();

  const classes = {
    low: "border-emerald-200 bg-emerald-100 text-emerald-800",
    medium:
      "border-amber-200 bg-amber-100 text-amber-800",
    high: "border-red-200 bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
        classes[normalizedRisk] ||
        "border-slate-200 bg-slate-100 text-slate-700"
      }`}
    >
      {riskLevel} Risk
    </span>
  );
}


function TableHeading({
  children,
}) {
  return (
    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 sm:px-6">
      {children}
    </th>
  );
}


function TableCell({
  children,
}) {
  return (
    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
      {children}
    </td>
  );
}


function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.00";
  }

  return number.toFixed(2);
}


function formatSignedNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.00";
  }

  if (number > 0) {
    return `+${number.toFixed(2)}`;
  }

  return number.toFixed(2);
}


export default WeatherAnalysis;