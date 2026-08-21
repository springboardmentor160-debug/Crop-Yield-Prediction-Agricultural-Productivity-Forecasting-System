import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Layers3,
  MapPinned,
  Plus,
  Ruler,
  Tractor,
} from "lucide-react";
import toast from "react-hot-toast";

import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import FarmCard from "../../components/farms/FarmCard";
import FarmFilters from "../../components/farms/FarmFilters";
import FarmPagination from "../../components/farms/FarmPagination";
import FarmSummaryCard from "../../components/farms/FarmSummaryCard";
import EmptyFarmState from "../../components/farms/EmptyFarmState";

import { useAuth } from "../../hooks/useAuth";
import { farmService } from "../../services/farmService";
import { getApiErrorMessage } from "../../utils/apiError";

const PAGE_SIZE = 12;

const initialFilters = {
  state: "",
  district: "",
  primary_crop: "",
  is_active: "true",
};

function FarmList() {
  const {isFarmer } = useAuth();

  const [farms, setFarms] = useState([]);
  const [summary, setSummary] = useState(null);

  const [filters, setFilters] = useState(initialFilters);

  const [appliedFilters, setAppliedFilters] = useState({
    is_active: true,
  });

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 0,
  });

  const [loading, setLoading] = useState(true);

  const loadFarms = useCallback(async () => {
    try {
      setLoading(true);

      const listParams = {
        page,
        page_size: PAGE_SIZE,
        ...appliedFilters,
      };

      const summaryParams = {};

      if (appliedFilters.state) {
        summaryParams.state = appliedFilters.state;
      }

      if (appliedFilters.district) {
        summaryParams.district = appliedFilters.district;
      }

      if (appliedFilters.primary_crop) {
        summaryParams.primary_crop =
          appliedFilters.primary_crop;
      }

      const [farmResult, summaryResult] = await Promise.all([
        farmService.getFarms(listParams),
        farmService.getSummary(summaryParams),
      ]);

      setFarms(farmResult.items || []);

      setPagination({
        total: farmResult.total || 0,
        total_pages: farmResult.total_pages || 0,
      });

      setSummary(summaryResult);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to load farm information."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [page, appliedFilters]);


  useEffect(() => {
    if (isFarmer) {
      loadFarms();
    }
  }, [isFarmer, loadFarms]);

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

    if (filters.state.trim()) {
      nextFilters.state = filters.state.trim();
    }

    if (filters.district.trim()) {
      nextFilters.district = filters.district.trim();
    }

    if (filters.primary_crop.trim()) {
      nextFilters.primary_crop =
        filters.primary_crop.trim();
    }

    if (filters.is_active !== "") {
      nextFilters.is_active =
        filters.is_active === "true";
    }

    setPage(1);
    setAppliedFilters(nextFilters);

    toast.success("Farm filters applied");
  };

  const clearFilters = () => {
    setFilters(initialFilters);

    setPage(1);

    setAppliedFilters({
      is_active: true,
    });

    toast.success("Farm filters cleared");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Farms
          </h1>

          <p className="mt-2 text-gray-600">
            Create and manage farms linked to your YieldSense AI
            account.
          </p>
        </div>

        <Link
          to="/farms/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
        >
          <Plus size={19} />
          Add Farm
        </Link>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FarmSummaryCard
          title="Total Farms"
          value={summary?.total_farms}
          icon={Tractor}
        />

        <FarmSummaryCard
          title="Active Farms"
          value={summary?.active_farms}
          icon={Activity}
        />

        <FarmSummaryCard
          title="Total Area"
          value={
            summary?.total_area_hectares != null
              ? `${Number(
                  summary.total_area_hectares
                ).toFixed(2)} ha`
              : "—"
          }
          icon={Ruler}
        />

        <FarmSummaryCard
          title="Districts"
          value={summary?.total_districts}
          subtitle={
            summary?.total_states != null
              ? `${summary.total_states} state(s)`
              : undefined
          }
          icon={MapPinned}
        />
      </div>

      <div className="mt-7">
        <FarmFilters
          filters={filters}
          onChange={handleFilterChange}
          onApply={applyFilters}
          onClear={clearFilters}
        />
      </div>

      <div className="mt-7">
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-gray-500 shadow-sm">
            Loading farms...
          </div>
        ) : farms.length === 0 ? (
          <EmptyFarmState
            title="No matching farms found"
            message={
              Object.keys(appliedFilters).length > 1 ||
              appliedFilters.is_active !== true
                ? "Try changing or clearing the current filters."
                : "Create your first farm to begin managing agricultural information."
            }
          />
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
              <Layers3 size={17} className="text-green-700" />
              {pagination.total} farm record(s)
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              {farms.map((farm) => (
                <FarmCard key={farm.id} farm={farm} />
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <FarmPagination
                page={page}
                pageSize={PAGE_SIZE}
                total={pagination.total}
                totalPages={pagination.total_pages}
                disabled={loading}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default FarmList;