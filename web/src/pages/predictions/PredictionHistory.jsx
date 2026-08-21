import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  BrainCircuit,
  ChartNoAxesCombined,
  History,
  Layers3,
  Package,
  Plus,
  Sprout,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import PredictionHistoryCard from "../../components/prediction/PredictionHistoryCard";
import PredictionFilters from "../../components/prediction/PredictionFilters";
import FarmPagination from "../../components/farms/FarmPagination";

import { datasetService } from "../../services/datasetService";
import { farmService } from "../../services/farmService";
import { predictionService } from "../../services/predictionService";
import { getApiErrorMessage } from "../../utils/apiError";

const PAGE_SIZE = 12;

const initialFilters = {
  farm_id: "",
  crop: "",
  state: "",
  season: "",
  crop_year: "",
};

function PredictionHistory() {
  const [predictions, setPredictions] =
    useState([]);

  const [summary, setSummary] = useState(null);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [seasons, setSeasons] = useState([]);

  const [filters, setFilters] =
    useState(initialFilters);

  const [appliedFilters, setAppliedFilters] =
    useState({});

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] =
    useState(true);
  
  const [exportingFormat, setExportingFormat] =
    useState("");

  const loadOptions = useCallback(async () => {
    try {
      setOptionsLoading(true);

      const [farmResult, optionResult] =
        await Promise.all([
          farmService.getFarms({
            page: 1,
            page_size: 100,
            is_active: true,
          }),
          datasetService.getFarmOptions(),
        ]);

      setFarms(farmResult.items || []);
      setCrops(optionResult.crops || []);
      setSeasons(optionResult.seasons || []);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to load prediction filters."
        )
      );
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  const loadPredictions = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page,
        page_size: PAGE_SIZE,
        ...appliedFilters,
      };

      const [historyResult, summaryResult] =
        await Promise.all([
          predictionService.getPredictions(params),
          predictionService.getPredictionSummary(
            appliedFilters
          ),
        ]);

      setPredictions(historyResult.items || []);

      setPagination({
        total: historyResult.total || 0,
        total_pages:
          historyResult.total_pages || 0,
      });

      setSummary(summaryResult);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to load prediction history."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [page, appliedFilters]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const applyFilters = (event) => {
    event.preventDefault();

    const nextFilters = {};

    if (filters.farm_id) {
      nextFilters.farm_id = Number(
        filters.farm_id
      );
    }

    if (filters.crop) {
      nextFilters.crop = filters.crop;
    }

    if (filters.state.trim()) {
      nextFilters.state =
        filters.state.trim();
    }

    if (filters.season) {
      nextFilters.season =
        filters.season;
    }

    if (filters.crop_year) {
      nextFilters.crop_year = Number(
        filters.crop_year
      );
    }

    setPage(1);
    setAppliedFilters(nextFilters);

    toast.success(
      "Prediction filters applied"
    );
  };

  const getReportFilters = () => {
    const reportFilters = {};

    if (appliedFilters.farm_id) {
      reportFilters.farm_id =
        appliedFilters.farm_id;
    }

    if (appliedFilters.crop) {
      reportFilters.crop =
        appliedFilters.crop;
    }

    if (appliedFilters.season) {
      reportFilters.season =
        appliedFilters.season;
    }

    return reportFilters;
  };

  const handleExport = async (format) => {
    try {
      setExportingFormat(format);

      const reportFilters = getReportFilters();

      if (format === "csv") {
        await predictionService.exportPredictionsCsv(
          reportFilters
        );
      } else {
        await predictionService.exportPredictionsPdf(
          reportFilters
        );
      }

      toast.success(
        `Prediction ${format.toUpperCase()} report downloaded`
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          `Unable to export prediction ${format.toUpperCase()} report.`
        )
      );
    } finally {
      setExportingFormat("");
    }
  };

    const clearFilters = () => {
      setFilters(initialFilters);
      setAppliedFilters({});
      setPage(1);

      toast.success(
        "Prediction filters cleared"
      );
    };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
            <History size={18} />
            Saved Forecasts
          </div>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Prediction History
          </h1>

          <p className="mt-2 text-gray-600">
            Review, filter, and compare your previously
            generated crop-yield forecasts.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => handleExport("csv")}
            disabled={
              loading ||
              exportingFormat !== "" ||
              pagination.total === 0
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-700 bg-white px-4 py-3 font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exportingFormat === "csv" ? (
              <Download
                size={18}
                className="animate-bounce"
              />
            ) : (
              <FileSpreadsheet size={18} />
            )}

            {exportingFormat === "csv"
              ? "Exporting..."
              : "Export CSV"}
          </button>

          <button
            type="button"
            onClick={() => handleExport("pdf")}
            disabled={
              loading ||
              exportingFormat !== "" ||
              pagination.total === 0
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-600 bg-white px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exportingFormat === "pdf" ? (
              <Download
                size={18}
                className="animate-bounce"
              />
            ) : (
              <FileText size={18} />
            )}

            {exportingFormat === "pdf"
              ? "Exporting..."
              : "Export PDF"}
          </button>

          <Link
            to="/prediction"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800"
          >
            <Plus size={19} />
            New Prediction
          </Link>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Predictions"
          value={formatWholeNumber(
            summary?.total_predictions
          )}
          note="Saved AI forecasts"
          icon={BrainCircuit}
          tone="green"
        />

        <SummaryCard
          title="Average Yield"
          value={`${formatNumber(
            summary?.average_predicted_yield
          )} t/ha`}
          note="Metric tons per hectare"
          icon={Sprout}
          tone="emerald"
        />

        <SummaryCard
          title="Maximum Yield"
          value={`${formatNumber(
            summary?.maximum_predicted_yield
          )} t/ha`}
          note="Highest predicted yield"
          icon={ChartNoAxesCombined}
          tone="blue"
        />

        <SummaryCard
          title="Total Production"
          value={`${formatNumber(
            summary?.total_estimated_production
          )} t`}
          note="Estimated metric tons"
          icon={Package}
          tone="amber"
        />
      </div>

      <div className="mt-7">
        <PredictionFilters
          filters={filters}
          farms={farms}
          crops={crops}
          seasons={seasons}
          onChange={handleFilterChange}
          onApply={applyFilters}
          onClear={clearFilters}
          loading={loading || optionsLoading}
        />
      </div>

      <div className="mt-7">
        {loading ? (
          <HistoryLoadingState />
        ) : predictions.length === 0 ? (
          <EmptyHistoryState
            hasFilters={
              Object.keys(appliedFilters).length > 0
            }
          />
        ) : (
          <>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Layers3
                  size={17}
                  className="text-green-700"
                />

                {pagination.total} prediction{" "}
                {pagination.total === 1
                  ? "record"
                  : "records"}
              </div>

              {Object.keys(appliedFilters).length >
                0 && (
                <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                  Filters applied
                </span>
              )}
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              {predictions.map((prediction) => (
                <PredictionHistoryCard
                  key={prediction.id}
                  prediction={prediction}
                />
              ))}
            </div>

            {pagination.total_pages > 1 && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <FarmPagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={pagination.total}
                  totalPages={
                    pagination.total_pages
                  }
                  disabled={loading}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function SummaryCard({
  title,
  value,
  note,
  icon: Icon,
  tone,
}) {
  const toneClasses = {
    green: {
      card: "border-green-200 bg-green-50",
      icon: "bg-green-100 text-green-700",
    },
    emerald: {
      card: "border-emerald-200 bg-emerald-50",
      icon:
        "bg-emerald-100 text-emerald-700",
    },
    blue: {
      card: "border-blue-200 bg-blue-50",
      icon: "bg-blue-100 text-blue-700",
    },
    amber: {
      card: "border-amber-200 bg-amber-50",
      icon: "bg-amber-100 text-amber-700",
    },
  };

  const selectedTone =
    toneClasses[tone] || toneClasses.green;

  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm ${selectedTone.card}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-600">
            {title}
          </p>

          <p className="mt-3 break-words text-2xl font-black text-gray-900">
            {value}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${selectedTone.icon}`}
        >
          <Icon size={22} />
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        {note}
      </p>
    </article>
  );
}

function HistoryLoadingState() {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {Array.from({ length: 4 }).map(
        (_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gray-200" />

              <div className="flex-1">
                <div className="h-5 w-32 rounded bg-gray-200" />
                <div className="mt-3 h-4 w-44 rounded bg-gray-100" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="h-24 rounded-xl bg-gray-100" />
              <div className="h-24 rounded-xl bg-gray-100" />
            </div>
          </div>
        )
      )}
    </div>
  );
}

function EmptyHistoryState({ hasFilters }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
      <History
        size={46}
        className="mx-auto text-green-700"
      />

      <h2 className="mt-4 text-xl font-bold text-gray-900">
        No predictions found
      </h2>

      <p className="mx-auto mt-2 max-w-md text-gray-500">
        {hasFilters
          ? "No prediction records match the selected filters. Clear or adjust the filters and try again."
          : "Generate your first crop-yield prediction to begin building prediction history."}
      </p>

      {!hasFilters && (
        <Link
          to="/prediction"
          className="mt-5 inline-flex rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800"
        >
          Generate Prediction
        </Link>
      )}
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

function formatWholeNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return Math.round(number).toLocaleString();
}

export default PredictionHistory;