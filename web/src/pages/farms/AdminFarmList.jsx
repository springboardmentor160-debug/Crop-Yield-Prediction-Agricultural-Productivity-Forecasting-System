import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  MapPinned,
  Ruler,
  ShieldCheck,
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
  owner_email: "",
  state: "",
  district: "",
  primary_crop: "",
  is_active: "",
};

function AdminFarmList() {
  const { user, isAdmin } = useAuth();
  const [farms, setFarms] = useState([]);
  const [summary, setSummary] = useState(null);

  const [filters, setFilters] = useState(initialFilters);
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

      if (!isAdmin) {
        setFarms([]);
        setSummary(null);
        return;
      }

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
        farmService.getAdminFarms(listParams),
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
          "Unable to load administrator farm records."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [isAdmin, page, appliedFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

    if (filters.owner_email.trim()) {
      nextFilters.owner_email =
        filters.owner_email.trim();
    }

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

    toast.success("Admin farm filters applied");
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters({});
    setPage(1);

    toast.success("Admin farm filters cleared");
  };

  if (!loading && user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <ShieldCheck
            className="mx-auto text-amber-700"
            size={42}
          />

          <h1 className="mt-4 text-2xl font-bold text-amber-900">
            Admin Access Required
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-amber-800">
            Only administrators can view farms belonging to every
            user.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          All Farms
        </h1>

        <p className="mt-2 text-gray-600">
          Monitor farm records across all registered users.
        </p>
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
          showOwnerEmail
          showStatus
        />
      </div>

      <div className="mt-7">
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-gray-500 shadow-sm">
            Loading administrator farm records...
          </div>
        ) : farms.length === 0 ? (
          <EmptyFarmState
            title="No farm records found"
            message="No farms match the selected administrator filters."
            showCreateButton={false}
          />
        ) : (
          <>
            <div className="grid gap-5 xl:grid-cols-2">
              {farms.map((farm) => (
                <FarmCard
                  key={farm.id}
                  farm={farm}
                  showOwner
                />
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

export default AdminFarmList;