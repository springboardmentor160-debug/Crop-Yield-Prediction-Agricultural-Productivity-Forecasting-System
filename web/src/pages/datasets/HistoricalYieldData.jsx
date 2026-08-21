import { useCallback, useEffect, useState } from "react";
import {
  Database,
  MapPinned,
  Sprout,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import SummaryCard from "../../components/datasets/SummaryCard";
import Pagination from "../../components/datasets/Pagination";
import { datasetService } from "../../services/datasetService";

const PAGE_SIZE = 20;

function HistoricalYieldData() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);

  const [filters, setFilters] = useState({
    state: "",
    crop: "",
    season: "",
    year: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 0,
  });

  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page,
        page_size: PAGE_SIZE,
        ...appliedFilters,
      };

      const summaryParams = {};

      if (appliedFilters.state) {
        summaryParams.state = appliedFilters.state;
      }

      if (appliedFilters.crop) {
        summaryParams.crop = appliedFilters.crop;
      }

      const [recordsResult, summaryResult] = await Promise.all([
        datasetService.getHistoricalYield(params),
        datasetService.getHistoricalYieldSummary(summaryParams),
      ]);

      setRecords(recordsResult.items);
      setPagination({
        total: recordsResult.total,
        total_pages: recordsResult.total_pages,
      });
      setSummary(summaryResult);
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to load historical yield data"
      );
    } finally {
      setLoading(false);
    }
  }, [page, appliedFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const applyFilters = (event) => {
    event.preventDefault();

    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value.trim() !== "")
    );

    setPage(1);
    setAppliedFilters(cleanedFilters);
  };

  const clearFilters = () => {
    setFilters({
      state: "",
      crop: "",
      season: "",
      year: "",
    });

    setPage(1);
    setAppliedFilters({});
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Historical Crop Yield
        </h1>

        <p className="mt-2 text-gray-600">
          Browse imported crop production, area, rainfall, fertilizer,
          pesticide, and yield records.
        </p>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Records"
          value={summary?.total_records?.toLocaleString()}
          icon={Database}
        />

        <SummaryCard
          title="Crops"
          value={summary?.total_crops}
          icon={Sprout}
        />

        <SummaryCard
          title="States"
          value={summary?.total_states}
          icon={MapPinned}
        />

        <SummaryCard
          title="Average Yield"
          value={
            summary?.average_yield != null
              ? Number(summary.average_yield).toFixed(2)
              : "—"
          }
          subtitle="Dataset yield unit"
          icon={TrendingUp}
        />
      </div>

      <form
        onSubmit={applyFilters}
        className="mt-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input
            name="state"
            value={filters.state}
            onChange={handleFilterChange}
            placeholder="State"
            className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
          />

          <input
            name="crop"
            value={filters.crop}
            onChange={handleFilterChange}
            placeholder="Crop"
            className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
          />

          <input
            name="season"
            value={filters.season}
            onChange={handleFilterChange}
            placeholder="Season"
            className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
          />

          <input
            name="year"
            type="number"
            value={filters.year}
            onChange={handleFilterChange}
            placeholder="Year"
            className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-xl bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800"
          >
            Apply Filters
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </form>

      <div className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1250px] w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-5 py-4">Crop</th>
                <th className="px-5 py-4">Year</th>
                <th className="px-5 py-4">Season</th>
                <th className="px-5 py-4">State</th>
                <th className="px-5 py-4">Area</th>
                <th className="px-5 py-4">Production</th>
                <th className="px-5 py-4">Rainfall</th>
                <th className="px-5 py-4">Fertilizer</th>
                <th className="px-5 py-4">Pesticide</th>
                <th className="px-5 py-4">Yield</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Loading historical yield data...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No matching records found.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr
                    key={record.id}
                    className="text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {record.crop}
                    </td>
                    <td className="px-5 py-4">{record.crop_year}</td>
                    <td className="px-5 py-4">{record.season}</td>
                    <td className="px-5 py-4">{record.state}</td>
                    <td className="px-5 py-4">{record.area}</td>
                    <td className="px-5 py-4">{record.production}</td>
                    <td className="px-5 py-4">
                      {record.annual_rainfall ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      {record.fertilizer ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      {record.pesticide ?? "—"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-green-700">
                      {record.yield_value}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={pagination.total}
          totalPages={pagination.total_pages}
          onPageChange={setPage}
        />
      </div>
    </DashboardLayout>
  );
}

export default HistoricalYieldData;