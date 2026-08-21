import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import FarmForm from "../../components/farms/FarmForm";

import { farmService } from "../../services/farmService";
import { getApiErrorMessage } from "../../utils/apiError";

function EditFarm() {
  const { farmId } = useParams();
  const navigate = useNavigate();

  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadFarm = useCallback(async () => {
    try {
      setLoading(true);

      const result = await farmService.getFarm(farmId);
      setFarm(result);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to load the farm.")
      );

      if (
        error.response?.status === 403 ||
        error.response?.status === 404
      ) {
        navigate("/farms", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [farmId, navigate]);

  useEffect(() => {
    loadFarm();
  }, [loadFarm]);

  const handleUpdateFarm = async (payload) => {
    try {
      setSubmitting(true);

      const updatedFarm = await farmService.updateFarm(
        farmId,
        payload
      );

      toast.success("Farm updated successfully");

      navigate(`/farms/${updatedFarm.id}`);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update the farm.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-gray-500 shadow-sm">
          Loading farm information...
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
      <div className="mb-7">
        <Link
          to={`/farms/${farm.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800"
        >
          <ArrowLeft size={18} />
          Back to Farm Details
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Edit Farm
        </h1>

        <p className="mt-2 text-gray-600">
          Update location, agricultural, area, or coordinate
          information for {farm.farm_name}.
        </p>
      </div>

      <FarmForm
        key={farm.id}
        initialValues={farm}
        onSubmit={handleUpdateFarm}
        submitting={submitting}
        submitLabel="Update Farm"
      />
    </DashboardLayout>
  );
}

export default EditFarm;