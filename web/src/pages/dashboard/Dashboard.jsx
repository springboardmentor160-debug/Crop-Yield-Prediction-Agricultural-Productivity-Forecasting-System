import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  CloudRain,
  Database,
  MapPinned,
  ShieldCheck,
  Sprout,
  Upload,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";

import { getApiErrorMessage } from "../../utils/apiError";
import { datasetService } from "../../services/datasetService";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import SummaryCard from "../../components/datasets/SummaryCard";

function Dashboard() {
  const { user } = useAuth();
  const [yieldSummary, setYieldSummary] = useState(null);
  const [soilSummary, setSoilSummary] = useState(null);
  const [weatherSummary, setWeatherSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [
          yieldResult,
          soilResult,
          weatherResult,
        ] = await Promise.all([
          datasetService.getHistoricalYieldSummary(),
          datasetService.getSoilSummary(),
          datasetService.getWeatherSummary(),
        ]);

        setYieldSummary(yieldResult);
        setSoilSummary(soilResult);
        setWeatherSummary(weatherResult);
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
            "Unable to load dashboard information."
          )
        );
      }finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <DashboardLayout>
      <section>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              YieldSense AI
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Welcome, {user?.full_name || "User"}
            </h1>

            <p className="mt-2 text-gray-600">
              Monitor farms, generate crop yield predictions, review recommendations,
              and explore agricultural insights.
            </p>
          </div>

          {user && (
            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-green-100 p-3 text-green-700">
                  <UserRound size={22} />
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    {user.full_name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm">
                <ShieldCheck size={17} className="text-green-700" />

                <span className="capitalize text-gray-700">
                  {user.role}
                </span>

                <span className="text-gray-400">•</span>

                <span className="text-green-700">
                  {user.is_verified ? "Verified" : "Not verified"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Link
              to="/datasets/historical-yield"
              aria-label="View historical crop yield records"
              className="block rounded-2xl transition duration-200 hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-green-100"
            >
              <SummaryCard
                title="Historical Records"
                value={
                  loading
                    ? "Loading..."
                    : yieldSummary?.total_records?.toLocaleString() || 0
                }
                subtitle="Crop yield dataset rows"
                icon={Database}
              />
            </Link>

            <Link
              to="/datasets/historical-yield"
              aria-label="View available crop types"
              className="block rounded-2xl transition duration-200 hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-green-100"
            >
              <SummaryCard
                title="Crop Types"
                value={
                  loading
                    ? "Loading..."
                    : yieldSummary?.total_crops || 0
                }
                subtitle="Unique crops"
                icon={Sprout}
              />
            </Link>

            <Link
              to="/datasets/soil"
              aria-label="View state soil reference data"
              className="block rounded-2xl transition duration-200 hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-green-100"
            >
              <SummaryCard
                title="Soil States"
                value={
                  loading
                    ? "Loading..."
                    : soilSummary?.total_states || 0
                }
                subtitle="State soil references"
                icon={MapPinned}
              />
            </Link>

            <Link
              to="/datasets/weather"
              aria-label="View state weather records"
              className="block rounded-2xl transition duration-200 hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-green-100"
            >
              <SummaryCard
                title="Weather Records"
                value={
                  loading
                    ? "Loading..."
                    : weatherSummary?.total_records?.toLocaleString() || 0
                }
                subtitle="State and year records"
                icon={CloudRain}
              />
            </Link>
          </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">
          Reference Data
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Review the agricultural datasets used for prediction, analysis,
          and recommendations.
        </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <ModuleCard
              icon={Database}
              title="Historical Crop Yield"
              description="Review crop, year, season, state, area, production, rainfall, fertilizer, pesticide, and yield records."
              path="/datasets/historical-yield"
              buttonText="View Yield Data"
            />

            <ModuleCard
              icon={Sprout}
              title="State Soil Data"
              description="Review nitrogen, phosphorus, potassium, and pH reference values for each state."
              path="/datasets/soil"
              buttonText="View Soil Data"
            />

            <ModuleCard
              icon={CloudRain}
              title="State Weather Data"
              description="Review annual temperature, rainfall, and humidity information by state."
              path="/datasets/weather"
              buttonText="View Weather Data"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Dataset Coverage
            </h2>

            <div className="mt-5 space-y-4">
              <CoverageRow
                label="Historical years"
                value={
                  yieldSummary?.minimum_year &&
                  yieldSummary?.maximum_year
                    ? `${yieldSummary.minimum_year} – ${yieldSummary.maximum_year}`
                    : "No data"
                }
              />

              <CoverageRow
                label="Yield dataset states"
                value={yieldSummary?.total_states ?? 0}
              />

              <CoverageRow
                label="Weather years"
                value={
                  weatherSummary?.minimum_year &&
                  weatherSummary?.maximum_year
                    ? `${weatherSummary.minimum_year} – ${weatherSummary.maximum_year}`
                    : "No data"
                }
              />

              <CoverageRow
                label="Weather dataset states"
                value={weatherSummary?.total_states ?? 0}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Quick Actions
            </h2>

            <div className="mt-5 space-y-3">
                {isAdmin && (
                  <Link
                    to="/datasets/upload"
                    className="flex items-center justify-between rounded-xl bg-green-700 px-5 py-4 font-semibold text-white transition hover:bg-green-800"
                  >
                    <span className="flex items-center gap-3">
                      <Upload size={20} />
                      Upload Reference Datasets
                    </span>

                    <span aria-hidden="true">→</span>
                  </Link>
                )}

                {!isAdmin && (
                  <>
                    <Link
                      to="/prediction"
                      className="flex items-center justify-between rounded-xl border border-gray-300 px-5 py-4 font-semibold text-gray-700 transition hover:border-green-300 hover:bg-green-50"
                    >
                      <span className="flex items-center gap-3">
                        <Sprout
                          size={20}
                          className="text-green-700"
                        />
                        Generate Yield Prediction
                      </span>

                      <span aria-hidden="true">→</span>
                    </Link>

                    <Link
                      to="/recommendation"
                      className="flex items-center justify-between rounded-xl border border-gray-300 px-5 py-4 font-semibold text-gray-700 transition hover:border-green-300 hover:bg-green-50"
                    >
                      <span className="flex items-center gap-3">
                        <MapPinned
                          size={20}
                          className="text-green-700"
                        />
                        Crop Recommendation
                      </span>

                      <span aria-hidden="true">→</span>
                    </Link>
                  </>
                )}

                <Link
                  to="/analytics"
                  className="flex items-center justify-between rounded-xl border border-gray-300 px-5 py-4 font-semibold text-gray-700 transition hover:border-green-300 hover:bg-green-50"
                >
                  <span className="flex items-center gap-3">
                    <Database
                      size={20}
                      className="text-green-700"
                    />
                    Analytics Dashboard
                  </span>

                  <span aria-hidden="true">→</span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center justify-between rounded-xl border border-gray-300 px-5 py-4 font-semibold text-gray-700 transition hover:border-green-300 hover:bg-green-50"
                >
                  <span className="flex items-center gap-3">
                    <UserRound size={20} />
                    Manage Profile
                  </span>

                  <span aria-hidden="true">→</span>
                </Link>
              </div>

            {!isAdmin && user && (
              <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                Dataset uploading is restricted to administrators. Farmer
                accounts can view the imported reference data.
              </p>
            )}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

function ModuleCard({
  icon: Icon,
  title,
  description,
  path,
  buttonText,
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="w-fit rounded-xl bg-green-100 p-3 text-green-700">
        <Icon size={25} />
      </div>

      <h3 className="mt-5 text-lg font-bold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">
        {description}
      </p>

      <Link
        to={path}
        className="mt-5 inline-flex items-center justify-center rounded-xl bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800"
      >
        {buttonText}
      </Link>
    </div>
  );
}

function CoverageRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      <span className="text-sm text-gray-600">{label}</span>

      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

export default Dashboard;