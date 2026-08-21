import { useCallback, useEffect, useState } from "react";
import {
  FlaskConical,
  MapPinned,
  Sprout,
} from "lucide-react";
import toast from "react-hot-toast";

import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import SummaryCard from "../../components/datasets/SummaryCard";
import Pagination from "../../components/datasets/Pagination";
import { datasetService } from "../../services/datasetService";

const PAGE_SIZE = 20;

function SoilData() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [stateFilter, setStateFilter] = useState("");
  const [appliedState, setAppliedState] = useState("");

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
      };

      if (appliedState) {
        params.state = appliedState;
      }

      const [recordsResult, summaryResult] = await Promise.all([
        datasetService.getSoil(params),
        datasetService.getSoilSummary(),
      ]);

      setRecords(recordsResult.items);
      setPagination({
        total: recordsResult.total,
        total_pages: recordsResult.total_pages,
      });
      setSummary(summaryResult);
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to load soil data"
      );
    } finally {
      setLoading(false);
    }
  }, [page, appliedState]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applyFilter = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedState(stateFilter.trim());
  };

  const clearFilter = () => {
    setStateFilter("");
    setAppliedState("");
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          State Soil Reference
        </h1>

        <p className="mt-2 text-gray-600">
          Review state-level nitrogen, phosphorus, potassium, and pH
          reference values.
        </p>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="States"
          value={summary?.total_states}
          icon={MapPinned}
        />

        <SummaryCard
          title="Average N"
          value={
            summary?.average_nitrogen != null
              ? Number(summary.average_nitrogen).toFixed(2)
              : "—"
          }
          icon={Sprout}
        />

        <SummaryCard
          title="Average P"
          value={
            summary?.average_phosphorus != null
              ? Number(summary.average_phosphorus).toFixed(2)
              : "—"
          }
          icon={Sprout}
        />

        <SummaryCard
          title="Average K"
          value={
            summary?.average_potassium != null
              ? Number(summary.average_potassium).toFixed(2)
              : "—"
          }
          icon={Sprout}
        />

        <SummaryCard
          title="Average pH"
          value={
            summary?.average_ph != null
              ? Number(summary.average_ph).toFixed(2)
              : "—"
          }
          icon={FlaskConical}
        />
      </div>

      <form
        onSubmit={applyFilter}
        className="mt-7 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row"
      >
        <input
          value={stateFilter}
          onChange={(event) => setStateFilter(event.target.value)}
          placeholder="Filter by state"
          className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
        />

        <button
          type="submit"
          className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
        >
          Apply
        </button>

        <button
          type="button"
          onClick={clearFilter}
          className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Clear
        </button>
      </form>

      <div className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-5 py-4">State</th>
                <th className="px-5 py-4">Nitrogen</th>
                <th className="px-5 py-4">Phosphorus</th>
                <th className="px-5 py-4">Potassium</th>
                <th className="px-5 py-4">pH</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Loading soil data...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No matching soil records found.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr
                    key={record.id}
                    className="text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {record.state}
                    </td>
                    <td className="px-5 py-4">{record.nitrogen}</td>
                    <td className="px-5 py-4">{record.phosphorus}</td>
                    <td className="px-5 py-4">{record.potassium}</td>
                    <td className="px-5 py-4 font-semibold text-green-700">
                      {record.ph}
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

export default SoilData;