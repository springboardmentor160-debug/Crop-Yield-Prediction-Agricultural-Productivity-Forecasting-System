import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Droplets,
  Edit3,
  MapPinned,
  Navigation,
  Power,
  PowerOff,
  Ruler,
  Sprout,
  Trash2,
  Tractor,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import FarmStatusBadge from "../../components/farms/FarmStatusBadge";

import { farmService } from "../../services/farmService";
import { getApiErrorMessage } from "../../utils/apiError";

function FarmDetails() {
  const { farmId } = useParams();
  const navigate = useNavigate();

  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    variant: "danger",
  });
  const closeConfirmDialog = () => {
  if (actionLoading) {
    return;
  }

  setConfirmDialog({
    open: false,
    action: null,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    variant: "danger",
  });
};

  const loadFarm = useCallback(async () => {
    try {
      setLoading(true);

      const result = await farmService.getFarm(farmId);
      setFarm(result);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to load farm details.")
      );

      if (error.response?.status === 404) {
        navigate("/farms", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [farmId, navigate]);

  useEffect(() => {
    loadFarm();
  }, [loadFarm]);

  const handleDeactivate = () => {
    setConfirmDialog({
      open: true,
      action: "deactivate",
      title: "Deactivate Farm",
      message:
        "This farm will remain safely stored, but it will no longer appear in the default active farm list.",
      confirmLabel: "Deactivate",
      variant: "warning",
    });
  };

  const handleReactivate = () => {
    setConfirmDialog({
      open: true,
      action: "reactivate",
      title: "Reactivate Farm",
      message:
        "This farm will return to the active farm list and become available for normal use again.",
      confirmLabel: "Reactivate",
      variant: "success",
    });
  };
  const handleSoftDelete = () => {
    setConfirmDialog({
      open: true,
      action: "delete",
      title: "Delete Farm",
      message:
        "This uses soft deletion. The farm will become inactive instead of being permanently removed, and it can be reactivated later.",
      confirmLabel: "Delete Farm",
      variant: "danger",
    });
  };

  const handleConfirmAction = async () => {
    if (!farm || !confirmDialog.action) {
      return;
    }

    try {
      setActionLoading(true);

      let updatedFarm;

      if (confirmDialog.action === "deactivate") {
        updatedFarm = await farmService.deactivateFarm(farm.id);
        toast.success("Farm deactivated successfully");
      } else if (confirmDialog.action === "reactivate") {
        updatedFarm = await farmService.reactivateFarm(farm.id);
        toast.success("Farm reactivated successfully");
      } else if (confirmDialog.action === "delete") {
        updatedFarm = await farmService.softDeleteFarm(farm.id);
        toast.success("Farm moved to inactive records");
      }

      setFarm(updatedFarm);
      closeConfirmDialog();
    } catch (error) {
      const fallbackMessages = {
        deactivate: "Unable to deactivate the farm.",
        reactivate: "Unable to reactivate the farm.",
        delete: "Unable to delete the farm.",
      };

      toast.error(
        getApiErrorMessage(
          error,
          fallbackMessages[confirmDialog.action] ||
            "Unable to complete this action."
        )
      );
    } finally {
      setActionLoading(false);

      setConfirmDialog({
        open: false,
        action: null,
        title: "",
        message: "",
        confirmLabel: "Confirm",
        variant: "danger",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-gray-500 shadow-sm">
          Loading farm details...
        </div>
      </DashboardLayout>
    );
  }

  if (!farm) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-gray-500 shadow-sm">
          Farm information is unavailable.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            to="/farms"
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            <ArrowLeft size={18} />
            Back to Farms
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              {farm.farm_name}
            </h1>

            <FarmStatusBadge isActive={farm.is_active} />
          </div>

          <p className="mt-2 flex items-center gap-2 text-gray-600">
            <MapPinned size={18} className="text-green-700" />
            {farm.village ? `${farm.village}, ` : ""}
            {farm.district}, {farm.state}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to={`/farms/${farm.id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            <Edit3 size={18} />
            Edit Farm
          </Link>

          {farm.is_active ? (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeactivate}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 font-semibold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PowerOff size={18} />
                Deactivate
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSoftDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleReactivate}
              className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Power size={18} />
              Reactivate
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <InformationCard
          title="Area"
          value={`${farm.area_hectares} hectares`}
          icon={Ruler}
        />

        <InformationCard
          title="Primary Crop"
          value={farm.primary_crop || "Not provided"}
          icon={Sprout}
        />

        <InformationCard
          title="Soil Type"
          value={farm.soil_type || "Not provided"}
          icon={Tractor}
        />

        <InformationCard
          title="Irrigation"
          value={farm.irrigation_type || "Not provided"}
          icon={Droplets}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Location Details
          </h2>

          <div className="mt-5 space-y-4">
            <DetailRow label="State" value={farm.state} />
            <DetailRow label="District" value={farm.district} />
            <DetailRow
              label="Village"
              value={farm.village || "Not provided"}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Navigation size={21} className="text-green-700" />
            <h2 className="text-xl font-bold text-gray-900">
              Coordinates
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            <DetailRow
              label="Latitude"
              value={
                farm.latitude != null
                  ? farm.latitude
                  : "Not provided"
              }
            />

            <DetailRow
              label="Longitude"
              value={
                farm.longitude != null
                  ? farm.longitude
                  : "Not provided"
              }
            />
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          Record Information
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailBlock label="Farm ID" value={farm.id} />
          <DetailBlock label="Owner ID" value={farm.owner_id} />
          <DetailBlock
            label="Created"
            value={formatDate(farm.created_at)}
          />
          <DetailBlock
            label="Last Updated"
            value={formatDate(farm.updated_at)}
          />
        </div>
      </section>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        loading={actionLoading}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmAction}
      />
    </DashboardLayout>
  );
}

function InformationCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="rounded-xl bg-green-100 p-3 text-green-700 w-fit">
        <Icon size={23} />
      </div>

      <p className="mt-4 text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-lg font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-right font-semibold text-gray-900">
        {value}
      </span>
    </div>
  );
}

function DetailBlock({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}

export default FarmDetails;

