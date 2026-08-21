  import { useState } from "react";
  import toast from "react-hot-toast";
  import {
    BrainCircuit,
    History,
    Sparkles,
  } from "lucide-react";
  import { Link } from "react-router-dom";

  import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
  import RecommendationForm from "./RecommendationForm";
  import RecommendationLoader from "../../components/recommendation/RecommendationLoader";
  import RecommendationResult from "../../components/recommendation/RecommendationResult";

  import { generateRecommendation } from "../../services/recommendationService";
  import { getApiErrorMessage } from "../../utils/apiError";
  const MINIMUM_ANIMATION_TIME = 4500;
  function Recommendation() {
    const [submitting, setSubmitting] = useState(false);
    const [recommendation, setRecommendation] = useState(null);
    const [showLoader, setShowLoader] = useState(false);

    const handleRecommendation = async (payload) => {
    try {
      setSubmitting(true);
      setShowLoader(true);
      setRecommendation(null);

      const animationDelay = new Promise((resolve) => {
        setTimeout(resolve, MINIMUM_ANIMATION_TIME);
      });

      const recommendationRequest =
        generateRecommendation(payload);

      const [result] = await Promise.all([
        recommendationRequest,
        animationDelay,
      ]);

      setRecommendation(result);

      setTimeout(() => {
        setShowLoader(false);

        requestAnimationFrame(() => {
          document
            .getElementById("recommendation-result")
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        });
      }, 250);
    } catch (error) {
      setShowLoader(false);

      toast.error(
        getApiErrorMessage(
          error,
          "Unable to generate crop recommendation."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

    const handleRecommendAgain = () => {
      setRecommendation(null);

      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    };

    return (
      <DashboardLayout>
        <div className="space-y-8">
          {showLoader && <RecommendationLoader />}
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-emerald-50 via-white to-white px-6 py-7 lg:px-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                    <BrainCircuit size={18} />
                    AI Crop Selection
                  </div>
                  </div>
                  <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-gray-900">
                    Crop Recommendation
                  </h1>

                  <p className="mt-4 text-base leading-8 text-gray-600">
                    Compare suitable crops using your saved farm,
                    selected season, historical yield records, soil
                    nutrients, weather references, and the trained
                    Random Forest model.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/recommendations/history"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-700 bg-white px-5 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                >
                  <History size={18} />
                  View History
                </Link>

                <div className="flex h-fit items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800 shadow-sm">
                  <Sparkles size={18} />
                  Intelligent Crop Ranking
                </div>
              </div>
            </div>
          </div>

          {!recommendation && (
            <RecommendationForm
              onSubmit={handleRecommendation}
              submitting={submitting}
            />
          )}

          {recommendation && (
  <div
    id="recommendation-result"
    className="scroll-mt-24"
  >
    <RecommendationResult
      recommendation={recommendation}
      onRecommendAgain={handleRecommendAgain}
    />
  </div>
)}
</div>
      </DashboardLayout>
    );
  }

  export default Recommendation;