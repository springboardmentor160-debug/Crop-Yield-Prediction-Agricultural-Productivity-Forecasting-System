import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CloudSun,
  Database,
  FileText,
  FlaskConical,
  Leaf,
  Mail,
  MapPin,
  Menu,
  Sprout,
  Tractor,
  X,
} from "lucide-react";

const features = [
  {
    title: "Farm Management",
    description:
      "Create, organize, and manage farm locations, crop details, soil types, irrigation information, and farm status.",
    icon: Tractor,
  },
  {
    title: "AI Yield Prediction",
    description:
      "Estimate crop yield and total production using a trained machine-learning model and agricultural data.",
    icon: BrainCircuit,
  },
  {
    title: "Crop Recommendation",
    description:
      "Receive intelligent crop recommendations based on farm, soil, weather, season, and nutrient information.",
    icon: Sprout,
  },
  {
    title: "Weather Analysis",
    description:
      "Analyze rainfall, temperature, humidity, and historical climate trends that influence agricultural productivity.",
    icon: CloudSun,
  },
  {
    title: "Soil Analysis",
    description:
      "Evaluate soil nutrients, pH, fertility, and crop suitability to support improved cultivation planning.",
    icon: FlaskConical,
  },
  {
    title: "Analytics & Reports",
    description:
      "Explore dashboards, prediction histories, recommendation histories, charts, and downloadable agricultural reports.",
    icon: BarChart3,
  },
];

function Landing() {
  const [activePage, setActivePage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  function changePage(page) {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-green-50 via-white to-emerald-100">
      {/* Navigation */}
      <nav className="relative z-50 border-b border-green-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[86px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => changePage("home")}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-700 text-white shadow-md">
              <Leaf size={26} />
            </div>

            <div>
              <p className="text-xl font-extrabold leading-none text-green-800">
                YieldSense AI
              </p>

              <p className="mt-1 text-xs font-semibold text-green-600">
                Smart Agricultural Intelligence
              </p>
            </div>
          </button>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            <button
              type="button"
              onClick={() => changePage("home")}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activePage === "home"
                  ? "bg-green-100 text-green-800"
                  : "text-slate-600 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => changePage("features")}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activePage === "features"
                  ? "bg-green-100 text-green-800"
                  : "text-slate-600 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              Features
            </button>

            <button
              type="button"
              onClick={() => changePage("contact")}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activePage === "contact"
                  ? "bg-green-100 text-green-800"
                  : "text-slate-600 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              Contact
            </button>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              to="/login"
              className="rounded-xl border border-green-700 px-5 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-50"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"
            >
              Create Account
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen((current) => !current)
            }
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-green-200 bg-white text-green-700 sm:hidden"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? (
              <X size={23} />
            ) : (
              <Menu size={23} />
            )}
          </button>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-green-100 bg-white px-4 py-4 sm:hidden">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => changePage("home")}
                className="rounded-xl px-4 py-3 text-left font-semibold text-slate-700 hover:bg-green-50"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => changePage("features")}
                className="rounded-xl px-4 py-3 text-left font-semibold text-slate-700 hover:bg-green-50"
              >
                Features
              </button>

              <button
                type="button"
                onClick={() => changePage("contact")}
                className="rounded-xl px-4 py-3 text-left font-semibold text-slate-700 hover:bg-green-50"
              >
                Contact
              </button>

              <div className="mt-2 grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  className="rounded-xl border border-green-700 px-4 py-3 text-center text-sm font-semibold text-green-700"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-xl bg-green-700 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Home page */}
      {activePage === "home" && (
        <main className="relative flex min-h-[calc(100vh-86px)] items-center overflow-hidden">
          <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-green-200/40 blur-3xl" />
          <div className="absolute -right-20 top-12 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />

          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:px-8 lg:py-16">
            {/* Hero content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow-sm">
                <Leaf size={16} />
                AI-powered smart farming platform
              </div>

              <h1 className="mt-7 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-[3.65rem] lg:leading-[1.12]">
                AI-Powered Crop Yield Prediction and Agricultural Forecasting
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg lg:mx-0">
                Empower farmers with intelligent yield
                predictions, crop recommendations, weather and
                soil analysis, farm management, analytics
                dashboards, and detailed agricultural reports.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3.5 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-green-800"
                >
                  Get Started
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-green-700 bg-white px-6 py-3.5 font-semibold text-green-700 transition hover:bg-green-50"
                >
                  Login to Account
                </Link>

                <button
                  type="button"
                  onClick={() => changePage("features")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-green-300 hover:text-green-700"
                >
                  Explore Features
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative mx-auto w-full max-w-lg">
              <div className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-2xl shadow-green-900/10">
                <div className="rounded-3xl bg-gradient-to-br from-green-700 to-emerald-600 p-7 text-white">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-sm font-medium text-green-100">
                        YieldSense AI
                      </p>

                      <h2 className="mt-2 max-w-sm text-2xl font-bold leading-snug">
                        Smarter farming starts with better data
                      </h2>
                    </div>

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                      <Leaf size={30} />
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                      <BrainCircuit size={25} />

                      <p className="mt-3 text-sm font-semibold">
                        ML Predictions
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                      <Sprout size={25} />

                      <p className="mt-3 text-sm font-semibold">
                        Crop Planning
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                      <CloudSun size={25} />

                      <p className="mt-3 text-sm font-semibold">
                        Climate Insights
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                      <FileText size={25} />

                      <p className="mt-3 text-sm font-semibold">
                        Smart Reports
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-green-100 bg-white p-4 shadow-lg sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <Tractor size={23} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Farm Intelligence
                    </p>

                    <p className="font-bold text-slate-900">
                      Data-driven decisions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Features page */}
      {activePage === "features" && (
        <main className="min-h-[calc(100vh-86px)] bg-gradient-to-br from-green-50 via-white to-emerald-50 px-6 py-14 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <button
              type="button"
              onClick={() => changePage("home")}
              className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-green-700 shadow-sm transition hover:bg-green-50"
            >
              <ArrowLeft size={17} />
              Back to Home
            </button>

            <div className="mx-auto mt-8 max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
                Platform Features
              </p>

              <h1 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Complete agricultural intelligence in one
                platform
              </h1>

              <p className="mt-5 text-base leading-7 text-slate-600">
                YieldSense AI combines farm data, machine
                learning, weather information, soil analysis,
                crop recommendations, analytics, and reports to
                support smarter agricultural planning.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl hover:shadow-green-900/5"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700 transition group-hover:bg-green-700 group-hover:text-white">
                      <Icon size={31} />
                    </div>

                    <h2 className="mt-6 text-xl font-bold text-slate-900">
                      {feature.title}
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="mt-12 rounded-[2rem] bg-gradient-to-r from-green-800 to-emerald-700 px-7 py-10 text-center text-white shadow-xl sm:px-12">
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                Start making data-driven farming decisions
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-green-100">
                Create an account to manage farms, generate
                predictions, receive recommendations, and access
                analytical reports.
              </p>

              <Link
                to="/register"
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-green-800 transition hover:bg-green-50"
              >
                Create Account
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </main>
      )}

      {/* Contact page */}
      {activePage === "contact" && (
        <main className="min-h-[calc(100vh-86px)] bg-gradient-to-br from-green-50 via-white to-emerald-50 px-6 py-14 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <button
              type="button"
              onClick={() => changePage("home")}
              className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-green-700 shadow-sm transition hover:bg-green-50"
            >
              <ArrowLeft size={17} />
              Back to Home
            </button>

            <div className="mx-auto mt-8 max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
                Contact Information
              </p>

              <h1 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Learn more about YieldSense AI
              </h1>

              <p className="mt-5 text-base leading-7 text-slate-600">
                YieldSense AI is an AI-powered crop yield
                prediction and agricultural productivity
                forecasting platform designed to support smarter
                farming decisions.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                  <Mail size={27} />
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  Email
                </h2>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Contact the YieldSense AI project team for
                  project information, technical discussions, or
                  support.
                </p>

                <a
                  href="mailto:support@yieldsense.ai"
                  className="mt-5 inline-flex font-semibold text-green-700 hover:text-green-800"
                >
                  support@yieldsense.ai
                </a>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                  <MapPin size={27} />
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  Project
                </h2>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  AI-Powered Crop Yield Prediction and
                  Agricultural Productivity Forecasting System.
                </p>

                <p className="mt-5 font-semibold text-green-700">
                  YieldSense AI · 2026
                </p>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                  <Database size={27} />
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  Technology Stack
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    "React",
                    "React Native",
                    "FastAPI",
                    "Python",
                    "PostgreSQL",
                    "Machine Learning",
                  ].map((technology) => (
                    <span
                      key={technology}
                      className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700"
                    >
                      {technology}
                    </span>
                  ))}
                </div>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                  <Database size={27} />
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  Source Code
                </h2>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  The project source code includes the web
                  application, mobile application, backend APIs,
                  database integration, and machine-learning
                  pipeline.
                </p>

                <p className="mt-5 text-sm font-semibold text-slate-500">
                  https://github.com/springboardmentor656-alt/Title-YieldSense-AI-Crop-Yield-Prediction-Agricultural-Productivity-Forecasting-System/tree/Kowshik
                </p>
              </article>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default Landing;