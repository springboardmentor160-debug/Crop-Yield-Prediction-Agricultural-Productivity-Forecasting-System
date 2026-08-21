import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import FarmForm from "../../components/farms/FarmForm";
import { farmService } from "../../services/farmService";
import { getApiErrorMessage } from "../../utils/apiError";

function CreateFarm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleCreateFarm = async (payload) => {
    try {
      setSubmitting(true);

      const createdFarm = await farmService.createFarm(payload);

      toast.success("Farm created successfully");

      navigate(`/farms/${createdFarm.id}`);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to create the farm.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-7">
        <Link
          to="/farms"
          className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800"
        >
          <ArrowLeft size={18} />
          Back to Farms
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Create Farm
        </h1>

        <p className="mt-2 text-gray-600">
          Register a farm under your authenticated YieldSense AI
          account.
        </p>
      </div>

      <FarmForm
        onSubmit={handleCreateFarm}
        submitting={submitting}
        submitLabel="Create Farm"
      />
    </DashboardLayout>
  );
}

export default CreateFarm;