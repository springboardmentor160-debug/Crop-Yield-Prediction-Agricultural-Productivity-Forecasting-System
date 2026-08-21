import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BrainCircuit,
  History,
  Sparkles,
} from "lucide-react";

import DashboardLayout from "../layouts/dashboard/DashboardLayout";
import PredictionForm from "../components/prediction/PredictionForm";
import PredictionLoader from "../components/prediction/PredictionLoader";
import PredictionResult from "../components/prediction/PredictionResult";

import { predictionService } from "../services/predictionService";
import { getApiErrorMessage } from "../utils/apiError";

const MINIMUM_ANIMATION_TIME = 4600;

function Prediction() {
  const [submitting, setSubmitting] =
    useState(false);

  const [showLoader, setShowLoader] =
    useState(false);

  const [prediction, setPrediction] =
    useState(null);

  const handlePrediction = async (payload) => {
    try {
      setSubmitting(true);
      setShowLoader(true);
      setPrediction(null);

      const animationDelay = new Promise(
        (resolve) => {
          setTimeout(
            resolve,
            MINIMUM_ANIMATION_TIME
          );
        }
      );

      const predictionRequest =
        predictionService.createPrediction(
          payload
        );

      const [result] = await Promise.all([
        predictionRequest,
        animationDelay,
      ]);

      setPrediction(result);

      setTimeout(() => {
        setShowLoader(false);

        requestAnimationFrame(() => {
          document
            .getElementById(
              "prediction-result"
            )
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
          "Unable to generate prediction."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePredictAgain = () => {
    setPrediction(null);

    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  };

  return (
    <DashboardLayout>
      {showLoader && <PredictionLoader />}

      <div className="space-y-8">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-green-50 via-white to-white px-6 py-7 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                  <BrainCircuit size={18} />
                  AI Yield Forecasting
                </div>

                <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-gray-900">
                  Crop Yield Prediction
                </h1>

                <p className="mt-4 text-base leading-8 text-gray-600">
                  Generate crop-yield and production
                  estimates using your saved farm,
                  historical agricultural records,
                  state soil nutrients, and weather
                  references.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/predictions/history"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-700 bg-white px-5 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                >
                  <History size={18} />
                  View History
                </Link>

                <div className="flex h-fit items-center justify-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-bold text-green-800 shadow-sm">
                  <Sparkles size={18} />
                  Random Forest Model
                </div>
              </div>
            </div>
          </div>
        </div>

        {!prediction && (
          <PredictionForm
            onSubmit={handlePrediction}
            submitting={submitting}
          />
        )}

        {prediction && (
          <div
            id="prediction-result"
            className="scroll-mt-24"
          >
            <PredictionResult
              prediction={prediction}
              onPredictAgain={handlePredictAgain}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Prediction;