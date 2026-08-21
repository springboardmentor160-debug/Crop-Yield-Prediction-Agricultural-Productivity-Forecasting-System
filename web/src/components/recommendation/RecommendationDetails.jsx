import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  LoaderCircle,
  Sprout,
} from "lucide-react";

import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import RecommendationResult from "../../components/recommendation/RecommendationResult";

import { getRecommendation } from "../../services/recommendationService";
import { getApiErrorMessage } from "../../utils/apiError";

function RecommendationDetails() {
  const { recommendationId } = useParams();

  const [recommendation, setRecommendation] =
    useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendation = async () => {
      try {
        setLoading(true);

        const response = await getRecommendation(
          recommendationId
        );

        setRecommendation(response);
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
            "Unable to load recommendation details."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecommendation();
  }, [recommendationId]);

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-green-50 via-white to-white px-6 py-7 lg:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                  <Sprout size={18} />
                  Recommendation Details
                </div>

                <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900">
                  Crop Recommendation Record
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
                  Review the complete crop recommendation,
                  supporting reasons, predicted performance,
                  and alternative crop options.
                </p>
              </div>

              <Link
                to="/recommendations/history"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-700 bg-white px-5 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
              >
                <ArrowLeft size={18} />
                Back to History
              </Link>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="text-center">
              <LoaderCircle
                size={34}
                className="mx-auto animate-spin text-green-700"
              />

              <p className="mt-4 text-sm font-medium text-gray-600">
                Loading recommendation details...
              </p>
            </div>
          </div>
        ) : recommendation ? (
          <RecommendationResult
            recommendation={recommendation}
            onRecommendAgain={() => {
              window.location.href = "/recommendation";
            }}
          />
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Recommendation not found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              This recommendation may no longer be available.
            </p>

            <Link
              to="/recommendations/history"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800"
            >
              Return to History
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default RecommendationDetails;