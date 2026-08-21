/**
 * YieldSense AI  -  AI Yield Prediction Page
 *
 * Guided multi-step prediction workflow with dynamic preview,
 * step validation, farm auto-fill, risk assessment, and recommendations.
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3, Wheat, CloudRain, Layers, Send,
  Thermometer, Droplets, Wind, AlertTriangle,
  CheckCircle2, TrendingUp, MapPin, Sprout, FileText,
  History, ShieldAlert, Lightbulb, ChevronRight, ChevronLeft,
  Edit2, Check, Info, Sparkles
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { predictionService } from "@/services/predictionService";
import { farmService } from "@/services/farmService";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import RiskCard from "@/components/shared/RiskCard";
import RecommendationCard from "@/components/shared/RecommendationCard";
import { CROP_OPTIONS, ROUTES } from "@/utils/constants";
import type { PredictionRequest, PredictionResponse } from "@/types/prediction";
import type { Farm } from "@/types/farm";
import type { RiskAssessmentResponse, RecommendationResponse } from "@/types/m3types";

const SEASON_OPTIONS = ["Kharif", "Rabi", "Annual"];

const STEPS = [
  { id: 1, name: "Farm & Crop", shortName: "Farm & Crop", icon: Sprout, description: "Select crop variety, season, state, and cultivated area." },
  { id: 2, name: "Environment", shortName: "Environment", icon: CloudRain, description: "Specify temperature, annual rainfall, and humidity levels." },
  { id: 3, name: "Soil Parameters", shortName: "Soil", icon: Layers, description: "Enter soil pH and NPK (Nitrogen, Phosphorus, Potassium) ratings." },
  { id: 4, name: "Agricultural Inputs", shortName: "Inputs", icon: Wheat, description: "Specify annual fertilizer and pesticide application rates." },
  { id: 5, name: "Location", shortName: "Location", icon: MapPin, description: "Optional coordinates to enable live localized weather forecasts." },
  { id: 6, name: "Review & Generate", shortName: "Review", icon: CheckCircle2, description: "Review entered parameters and generate AI yield forecast." },
];

const defaultForm: PredictionRequest = {
  crop: "Rice",
  season: "Kharif",
  state: "Punjab",
  area: 10,
  temperature: 28,
  annual_rainfall: 1000,
  humidity: 65,
  soil_ph: 6.5,
  nitrogen: 80,
  phosphorus: 40,
  potassium: 35,
  fertilizer_usage: 150,
  pesticide_usage: 10,
  production: 0,
  latitude: undefined,
  longitude: undefined,
};

type ResultTab = "prediction" | "risk" | "recommendations";

export default function PredictionPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<PredictionRequest>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [autoFilledFarmName, setAutoFilledFarmName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>("prediction");

  useEffect(() => {
    const loadFarms = async () => {
      try {
        const data = await farmService.listFarms(1, 100);
        setFarms(data.farms);
      } catch {
        /* ignore error if offline */
      }
    };
    loadFarms();
  }, []);

  const handleFarmSelect = (farmId: string) => {
    setSelectedFarmId(farmId);
    if (!farmId) {
      setAutoFilledFarmName(null);
      return;
    }
    const farm = farms.find((f) => f.id === farmId);
    if (farm) {
      setForm((prev) => ({
        ...prev,
        crop: farm.crop || prev.crop,
        area: farm.area > 0 ? farm.area : prev.area,
        soil_ph: farm.soil_ph > 0 ? farm.soil_ph : prev.soil_ph,
        nitrogen: farm.nitrogen >= 0 ? farm.nitrogen : prev.nitrogen,
        phosphorus: farm.phosphorus >= 0 ? farm.phosphorus : prev.phosphorus,
        potassium: farm.potassium >= 0 ? farm.potassium : prev.potassium,
        latitude: farm.latitude || undefined,
        longitude: farm.longitude || undefined,
        state: farm.location || prev.state,
      }));
      setAutoFilledFarmName(farm.name);
      toast.success(`Populated fields from "${farm.name}"`);
    }
  };

  const updateField = (key: keyof PredictionRequest, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // Step Validation logic
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!form.crop) newErrors.crop = "Please select a crop.";
      if (!form.season) newErrors.season = "Please select a season.";
      if (form.area === undefined || form.area === null || isNaN(form.area) || form.area <= 0) {
        newErrors.area = "Area must be a positive number greater than 0.";
      }
    } else if (step === 2) {
      if (form.temperature === undefined || isNaN(form.temperature) || form.temperature < -20 || form.temperature > 65) {
        newErrors.temperature = "Enter a valid temperature between -20°C and 65°C.";
      }
      if (form.annual_rainfall === undefined || isNaN(form.annual_rainfall) || form.annual_rainfall < 0) {
        newErrors.annual_rainfall = "Annual rainfall must be 0 or greater.";
      }
      if (form.humidity !== undefined && form.humidity !== null && !isNaN(form.humidity)) {
        if (form.humidity < 0 || form.humidity > 100) {
          newErrors.humidity = "Humidity must be between 0% and 100%.";
        }
      }
    } else if (step === 3) {
      if (form.soil_ph === undefined || isNaN(form.soil_ph) || form.soil_ph < 3.0 || form.soil_ph > 10.5) {
        newErrors.soil_ph = "Soil pH must be between 3.0 and 10.5.";
      }
      if (form.nitrogen === undefined || isNaN(form.nitrogen) || form.nitrogen < 0) {
        newErrors.nitrogen = "Nitrogen must be 0 or greater.";
      }
      if (form.phosphorus === undefined || isNaN(form.phosphorus) || form.phosphorus < 0) {
        newErrors.phosphorus = "Phosphorus must be 0 or greater.";
      }
      if (form.potassium === undefined || isNaN(form.potassium) || form.potassium < 0) {
        newErrors.potassium = "Potassium must be 0 or greater.";
      }
    } else if (step === 4) {
      if (form.fertilizer_usage === undefined || isNaN(form.fertilizer_usage) || form.fertilizer_usage < 0) {
        newErrors.fertilizer_usage = "Fertilizer usage must be 0 or greater.";
      }
      if (form.pesticide_usage === undefined || isNaN(form.pesticide_usage) || form.pesticide_usage < 0) {
        newErrors.pesticide_usage = "Pesticide usage must be 0 or greater.";
      }
    } else if (step === 5) {
      if (form.latitude !== undefined && form.latitude !== null && (isNaN(form.latitude) || form.latitude < -90 || form.latitude > 90)) {
        newErrors.latitude = "Latitude must be between -90 and 90.";
      }
      if (form.longitude !== undefined && form.longitude !== null && (isNaN(form.longitude) || form.longitude < -180 || form.longitude > 180)) {
        newErrors.longitude = "Longitude must be between -180 and 180.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      toast.error("Please fix the highlighted errors before continuing.");
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepClick = (stepId: number) => {
    // Can jump back to any previous step or next step if current is valid
    if (stepId < currentStep) {
      setCurrentStep(stepId);
    } else if (stepId === currentStep + 1) {
      handleNext();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4) || !validateStep(5)) {
      toast.error("Form contains invalid parameters. Please review each step.");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const payload: PredictionRequest = {
        ...form,
        area: Number(form.area),
        temperature: Number(form.temperature),
        annual_rainfall: Number(form.annual_rainfall),
        humidity: form.humidity ? Number(form.humidity) : 65,
        soil_ph: Number(form.soil_ph),
        nitrogen: Number(form.nitrogen),
        phosphorus: Number(form.phosphorus),
        potassium: Number(form.potassium),
        fertilizer_usage: Number(form.fertilizer_usage),
        pesticide_usage: Number(form.pesticide_usage),
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      };

      const prediction = await predictionService.predictYield(payload);
      setResult(prediction);
      setActiveTab("prediction");
      toast.success("Yield prediction generated & saved to history!");
    } catch (err: any) {
      toast.error(err.message || "Yield prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const risk = result?.risk_assessment as RiskAssessmentResponse | undefined;
  const recommendations = result?.recommendations as RecommendationResponse | undefined;

  const tabs: { id: ResultTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "prediction", label: "Results", icon: <TrendingUp className="h-4 w-4" /> },
    ...(risk ? [{ id: "risk" as ResultTab, label: "Risk", icon: <ShieldAlert className="h-4 w-4" />, badge: risk.overall_risk_level }] : []),
    ...(recommendations ? [{ id: "recommendations" as ResultTab, label: "Recommendations", icon: <Lightbulb className="h-4 w-4" /> }] : []),
  ];

  return (
    <div className="space-y-6 animate-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-green-600 shrink-0" />
            AI Yield Prediction Workflow
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete the guided steps below to generate an instant ML yield forecast, risk assessment, and recommendations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={ROUTES.HISTORY}>
            <Button variant="outline" size="sm">
              <History className="h-4 w-4" /> History
            </Button>
          </Link>
          <Link href={ROUTES.REPORTS}>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4" /> Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: Form Stepper on Left (col-span-2) + Preview/Results on Right (col-span-1) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* LEFT AREA: Step-Based Prediction Form */}
        <div className="xl:col-span-2 space-y-6">
          <Card padding="md">
            
            {/* Stepper Progress Indicator */}
            <div className="mb-6">
              {/* Mobile Step Header */}
              <div className="sm:hidden mb-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5 font-medium">
                  <span>Step {currentStep} of {STEPS.length}</span>
                  <span className="text-green-700 dark:text-green-400 font-semibold">{STEPS[currentStep - 1].name}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-green-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Desktop Horizontal Stepper Bar */}
              <div className="hidden sm:grid grid-cols-6 gap-1 bg-gray-50 dark:bg-gray-900/60 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  const isCurrent = currentStep === step.id;
                  const isCompleted = step.id < currentStep;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => handleStepClick(step.id)}
                      disabled={step.id > currentStep}
                      className={`
                        flex flex-col items-center justify-center p-2 rounded-lg text-xs transition-all duration-150 relative
                        ${
                          isCurrent
                            ? "bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 font-semibold shadow-sm border border-green-200 dark:border-green-800"
                            : isCompleted
                            ? "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60 cursor-pointer"
                            : "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60"
                        }
                      `}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {isCompleted ? (
                          <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 flex items-center justify-center">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : (
                          <Icon className={`h-4 w-4 ${isCurrent ? "text-green-600 dark:text-green-400" : "text-gray-400"}`} />
                        )}
                        <span className="font-semibold">{step.id}</span>
                      </div>
                      <span className="truncate max-w-[80px] text-[11px]">{step.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Step Description Banner */}
            <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                    Step {currentStep}
                  </span>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {STEPS[currentStep - 1].name}
                  </h2>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {STEPS[currentStep - 1].description}
                </p>
              </div>

              {autoFilledFarmName && currentStep === 1 && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Auto-filled from {autoFilledFarmName}</span>
                </div>
              )}
            </div>

            {/* Form Step Contents */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1: FARM & CROP */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in">
                  {/* Farm Auto-Fill Selector */}
                  {farms.length > 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Auto-fill from Saved Farm (Optional)
                      </label>
                      <select
                        value={selectedFarmId}
                        onChange={(e) => handleFarmSelect(e.target.value)}
                        className="form-select text-sm"
                      >
                        <option value="">Select a farm to auto-fill parameters...</option>
                        {farms.map((farm) => (
                          <option key={farm.id} value={farm.id}>
                            {farm.name}  -  {farm.crop} ({farm.area} ha)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Crop Variety <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.crop}
                        onChange={(e) => updateField("crop", e.target.value)}
                        className={`form-select ${errors.crop ? "border-red-400 focus:ring-red-500" : ""}`}
                      >
                        {CROP_OPTIONS.filter((c) => c !== "Other").map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {errors.crop && <p className="mt-1 text-xs text-red-600">{errors.crop}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Growing Season <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.season}
                        onChange={(e) => updateField("season", e.target.value)}
                        className={`form-select ${errors.season ? "border-red-400 focus:ring-red-500" : ""}`}
                      >
                        {SEASON_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {errors.season && <p className="mt-1 text-xs text-red-600">{errors.season}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Cultivated Area (hectares) *"
                      type="number"
                      step="any"
                      min="0.1"
                      value={String(form.area || "")}
                      onChange={(e) => updateField("area", parseFloat(e.target.value) || 0)}
                      error={errors.area}
                      helperText="Total farm area used for this crop cycle."
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        State / Region
                      </label>
                      <input
                        type="text"
                        value={form.state}
                        onChange={(e) => updateField("state", e.target.value)}
                        placeholder="e.g. Punjab, Maharashtra"
                        className="form-select"
                      />
                      <p className="mt-1 text-xs text-gray-500">Helps customize yield regional baseline.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: ENVIRONMENT */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Average Temperature (°C) *"
                      type="number"
                      step="0.1"
                      value={String(form.temperature ?? "")}
                      onChange={(e) => updateField("temperature", parseFloat(e.target.value))}
                      error={errors.temperature}
                      helperText="Average temperature during growing season."
                    />

                    <Input
                      label="Annual Rainfall (mm) *"
                      type="number"
                      step="1"
                      value={String(form.annual_rainfall ?? "")}
                      onChange={(e) => updateField("annual_rainfall", parseFloat(e.target.value))}
                      error={errors.annual_rainfall}
                      helperText="Total annual precipitation in millimeters."
                    />

                    <Input
                      label="Relative Humidity (%)"
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={String(form.humidity ?? "")}
                      onChange={(e) => updateField("humidity", parseFloat(e.target.value))}
                      error={errors.humidity}
                      helperText="Average humidity level (default: 65%)."
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 flex items-start gap-2.5">
                    <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      <strong>Climate Safety:</strong> Predictions automatically apply agronomic boundary safety rules if extreme drought (&lt; 50mm) or temperature (&lt; 5°C or &gt; 48°C) are detected.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: SOIL PARAMETERS */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Soil pH *"
                      type="number"
                      step="0.1"
                      min="3.0"
                      max="10.5"
                      value={String(form.soil_ph ?? "")}
                      onChange={(e) => updateField("soil_ph", parseFloat(e.target.value))}
                      error={errors.soil_ph}
                      helperText="Measures acidity/alkalinity (6.0 – 7.5 is optimal)."
                    />

                    <Input
                      label="Nitrogen (N) - kg/ha *"
                      type="number"
                      step="1"
                      min="0"
                      value={String(form.nitrogen ?? "")}
                      onChange={(e) => updateField("nitrogen", parseFloat(e.target.value))}
                      error={errors.nitrogen}
                      helperText="Available nitrogen content in soil."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Phosphorus (P) - kg/ha *"
                      type="number"
                      step="1"
                      min="0"
                      value={String(form.phosphorus ?? "")}
                      onChange={(e) => updateField("phosphorus", parseFloat(e.target.value))}
                      error={errors.phosphorus}
                      helperText="Available phosphorus rating."
                    />

                    <Input
                      label="Potassium (K) - kg/ha *"
                      type="number"
                      step="1"
                      min="0"
                      value={String(form.potassium ?? "")}
                      onChange={(e) => updateField("potassium", parseFloat(e.target.value))}
                      error={errors.potassium}
                      helperText="Available potassium rating."
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: AGRICULTURAL INPUTS */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Fertilizer Usage (kg/ha) *"
                      type="number"
                      step="1"
                      min="0"
                      value={String(form.fertilizer_usage ?? "")}
                      onChange={(e) => updateField("fertilizer_usage", parseFloat(e.target.value))}
                      error={errors.fertilizer_usage}
                      helperText="Total NPK fertilizer applied per hectare."
                    />

                    <Input
                      label="Pesticide Usage (kg/ha) *"
                      type="number"
                      step="0.1"
                      min="0"
                      value={String(form.pesticide_usage ?? "")}
                      onChange={(e) => updateField("pesticide_usage", parseFloat(e.target.value))}
                      error={errors.pesticide_usage}
                      helperText="Total pesticide application per hectare."
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: LOCATION */}
              {currentStep === 5 && (
                <div className="space-y-4 animate-in">
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Optional Location Coordinates</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                        Providing coordinates enables live localized Open-Meteo weather fetching and 7-day forecasts. If left blank, state baselines will be used.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Latitude (optional)"
                      type="number"
                      step="any"
                      placeholder="e.g. 30.7333"
                      value={form.latitude !== undefined && form.latitude !== null ? String(form.latitude) : ""}
                      onChange={(e) => updateField("latitude", e.target.value ? parseFloat(e.target.value) : undefined)}
                      error={errors.latitude}
                    />

                    <Input
                      label="Longitude (optional)"
                      type="number"
                      step="any"
                      placeholder="e.g. 76.7794"
                      value={form.longitude !== undefined && form.longitude !== null ? String(form.longitude) : ""}
                      onChange={(e) => updateField("longitude", e.target.value ? parseFloat(e.target.value) : undefined)}
                      error={errors.longitude}
                    />
                  </div>
                </div>
              )}

              {/* STEP 6: REVIEW & GENERATE */}
              {currentStep === 6 && (
                <div className="space-y-4 animate-in">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Review Parameter Summary
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Farm & Crop Summary */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 relative group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <Sprout className="h-3.5 w-3.5 text-green-600" /> Farm & Crop
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 font-medium"
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                      </div>
                      <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                        <p><strong className="text-gray-900 dark:text-white">Crop:</strong> {form.crop}</p>
                        <p><strong className="text-gray-900 dark:text-white">Season:</strong> {form.season}</p>
                        <p><strong className="text-gray-900 dark:text-white">Area:</strong> {form.area} ha</p>
                        <p><strong className="text-gray-900 dark:text-white">State:</strong> {form.state || "Unknown"}</p>
                      </div>
                    </div>

                    {/* Environment Summary */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 relative group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <CloudRain className="h-3.5 w-3.5 text-blue-500" /> Environment
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 font-medium"
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                      </div>
                      <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                        <p><strong className="text-gray-900 dark:text-white">Temperature:</strong> {form.temperature}°C</p>
                        <p><strong className="text-gray-900 dark:text-white">Annual Rainfall:</strong> {form.annual_rainfall} mm</p>
                        <p><strong className="text-gray-900 dark:text-white">Humidity:</strong> {form.humidity || 65}%</p>
                      </div>
                    </div>

                    {/* Soil Summary */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 relative group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-amber-600" /> Soil Parameters
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 font-medium"
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                      </div>
                      <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                        <p><strong className="text-gray-900 dark:text-white">Soil pH:</strong> {form.soil_ph}</p>
                        <p><strong className="text-gray-900 dark:text-white">NPK Ratio:</strong> N:{form.nitrogen} / P:{form.phosphorus} / K:{form.potassium} kg/ha</p>
                      </div>
                    </div>

                    {/* Inputs & Location Summary */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 relative group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <Wheat className="h-3.5 w-3.5 text-green-700" /> Inputs & Location
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(4)}
                          className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 font-medium"
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                      </div>
                      <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                        <p><strong className="text-gray-900 dark:text-white">Fertilizer:</strong> {form.fertilizer_usage} kg/ha</p>
                        <p><strong className="text-gray-900 dark:text-white">Pesticide:</strong> {form.pesticide_usage} kg/ha</p>
                        <p><strong className="text-gray-900 dark:text-white">Coordinates:</strong> {form.latitude && form.longitude ? `${form.latitude}, ${form.longitude}` : "State baselines"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Controls Bar */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    disabled={loading}
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                  >
                    Next Step <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-green-700 hover:bg-green-800 text-white"
                    isLoading={loading}
                  >
                    <Send className="h-4 w-4" /> Generate Yield Prediction
                  </Button>
                )}
              </div>

            </form>
          </Card>
        </div>

        {/* RIGHT SECONDARY AREA: Dynamic Live Summary Preview OR Final Prediction Results */}
        <div className="xl:col-span-1 space-y-4">
          
          {loading && (
            <Card padding="md">
              <LoadingSpinner text="Processing yield prediction, evaluating risk rules, and fetching climate summary..." />
            </Card>
          )}

          {/* STATE A: Pre-Prediction Dynamic Preview Panel */}
          {!result && !loading && (
            <Card padding="md" className="space-y-4 border-l-4 border-l-green-600">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Prediction Summary
                  </h3>
                </div>
                <Badge variant="info" size="sm">Step {currentStep} of 6</Badge>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Parameters updated in real time as you complete the input workflow:
              </p>

              {/* Dynamic Parameter Grid */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Crop Variety</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{form.crop}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Season</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{form.season}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Cultivated Area</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{form.area} ha</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Avg Temperature</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{form.temperature}°C</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Annual Rainfall</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{form.annual_rainfall} mm</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Soil pH</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{form.soil_ph}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">NPK Ratio</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{form.nitrogen}/{form.phosphorus}/{form.potassium}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Inputs (Fert / Pest)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{form.fertilizer_usage} / {form.pesticide_usage} kg/ha</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900/40 p-3 rounded-lg flex items-start gap-2">
                <Info className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <span>
                  Click <strong>Next Step</strong> or finish all 6 steps to generate the official AI prediction result.
                </span>
              </div>
            </Card>
          )}

          {/* STATE B: Post-Prediction Full Results Panel */}
          {result && !loading && (
            <>
              {/* Tab Navigation */}
              <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        tab.badge === "Low" ? "bg-green-100 text-green-700" :
                        tab.badge === "Medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>{tab.badge}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab 1: Prediction Results */}
              {activeTab === "prediction" && (
                <div className="space-y-4 animate-in">
                  <Card padding="md" className="border-2 border-green-200 dark:border-green-800">
                    <div className="text-center">
                      <div className="w-14 h-14 mx-auto rounded-lg bg-[#e8f5ec] dark:bg-green-900/20 flex items-center justify-center text-[#1a6b3c] dark:text-green-400 mb-3">
                        <TrendingUp className="h-7 w-7" />
                      </div>
                      <p className="text-xs text-gray-500 mb-1">Predicted Yield</p>
                      <p className="text-4xl font-bold text-[#1a6b3c] dark:text-green-400">
                        {result.predicted_yield.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 mb-4">{result.prediction_unit}</p>
                    </div>

                    <div className="space-y-2.5 text-xs pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-gray-500">Total Expected Production</span>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {result.total_production.toFixed(1)} tons
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-gray-500">Crop & Season</span>
                        <span className="font-medium text-gray-900 dark:text-white">{result.crop} ({result.season})</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-gray-500">Cultivated Area</span>
                        <span className="font-medium text-gray-900 dark:text-white">{result.area} ha</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-gray-500">ML Model R² Score</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {result.model_accuracy ? (result.model_accuracy * 100).toFixed(1) + "%" : "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap pt-2">
                        <Badge variant={result.confidence === "High" ? "success" : result.confidence === "Medium" ? "warning" : "danger"}>
                          {result.confidence} Confidence
                        </Badge>
                        {risk && (
                          <Badge variant={
                            risk.overall_risk_level === "Low" ? "success" :
                            risk.overall_risk_level === "Medium" ? "warning" : "danger"
                          }>
                            {risk.overall_risk_level} Risk
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Weather & Soil Cards */}
                  {result.weather_summary && (
                    <Card padding="md">
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                        <CloudRain className="h-4 w-4 text-blue-500" /> Live Weather Summary
                      </h4>
                      <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between"><span>Temperature:</span><span className="font-semibold text-gray-900 dark:text-white">{result.weather_summary.temperature}°C</span></div>
                        <div className="flex justify-between"><span>Humidity:</span><span className="font-semibold text-gray-900 dark:text-white">{result.weather_summary.humidity}%</span></div>
                        <div className="flex justify-between"><span>Rainfall:</span><span className="font-semibold text-gray-900 dark:text-white">{result.weather_summary.rainfall} mm</span></div>
                      </div>
                    </Card>
                  )}

                  {result.soil_summary && (
                    <Card padding="md">
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-amber-600" /> Soil Health Index
                      </h4>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Score:</span>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{result.soil_summary.health_score} / 100 ({result.soil_summary.health_label})</span>
                      </div>
                    </Card>
                  )}

                  {/* Report Download Banner */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-blue-800 dark:text-blue-300">Prediction saved to history!</span>
                    <Link href={ROUTES.REPORTS}>
                      <Button size="sm" variant="outline">
                        <FileText className="h-3.5 w-3.5" /> Export PDF
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Tab 2: Risk Assessment */}
              {activeTab === "risk" && risk && (
                <div className="animate-in">
                  <RiskCard risk={risk} />
                </div>
              )}

              {/* Tab 3: Recommendations */}
              {activeTab === "recommendations" && recommendations && (
                <div className="animate-in">
                  <RecommendationCard recommendations={recommendations} />
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
