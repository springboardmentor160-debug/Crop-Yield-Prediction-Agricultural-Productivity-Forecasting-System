/**
 * YieldSense AI  -  Soil Analysis Page
 *
 * Soil health analysis with NPK inputs, health score, and recommendations.
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Layers, Activity, AlertTriangle, CheckCircle,
  Send, Leaf,
} from "lucide-react";
import toast from "react-hot-toast";
import { predictionService } from "@/services/predictionService";
import { farmService } from "@/services/farmService";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CROP_OPTIONS } from "@/utils/constants";
import type { SoilAnalysisRequest, SoilAnalysisResponse } from "@/types/prediction";
import type { Farm } from "@/types/farm";

export default function SoilPage() {
  const [form, setForm] = useState<SoilAnalysisRequest>({
    soil_ph: 6.5,
    nitrogen: 80,
    phosphorus: 40,
    potassium: 35,
    crop: "Rice",
  });
  const [result, setResult] = useState<SoilAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState<Farm[]>([]);

  useEffect(() => {
    const loadFarms = async () => {
      try {
        const data = await farmService.listFarms(1, 100);
        setFarms(data.farms);
      } catch { /* ignore */ }
    };
    loadFarms();
  }, []);

  const handleFarmSelect = (farmId: string) => {
    const farm = farms.find((f) => f.id === farmId);
    if (farm) {
      setForm({
        soil_ph: farm.soil_ph,
        nitrogen: farm.nitrogen,
        phosphorus: farm.phosphorus,
        potassium: farm.potassium,
        crop: farm.crop,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await predictionService.analyzeSoil(form);
      setResult(data);
      toast.success("Soil analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  const getStatusColor = (status: string): "success" | "info" | "warning" | "danger" => {
    switch (status) {
      case "Optimal": return "success";
      case "High": return "info";
      case "Medium": return "warning";
      case "Low": return "danger";
      default: return "default" as any;
    }
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Layers className="h-7 w-7 text-amber-600" />
          Soil Analysis
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Analyze soil health and get recommendations for your farm
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card padding="md">
          <form onSubmit={handleSubmit} className="space-y-5">
            {farms.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Auto-fill from Farm
                </label>
                <select
                  onChange={(e) => handleFarmSelect(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Select a farm (optional)</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>{farm.name}</option>
                  ))}
                </select>
              </div>
            )}

            <Input label="Soil pH" type="number" value={String(form.soil_ph)} onChange={(e) => setForm({ ...form, soil_ph: Number(e.target.value) })} />
            <Input label="Nitrogen (kg/ha)" type="number" value={String(form.nitrogen)} onChange={(e) => setForm({ ...form, nitrogen: Number(e.target.value) })} />
            <Input label="Phosphorus (kg/ha)" type="number" value={String(form.phosphorus)} onChange={(e) => setForm({ ...form, phosphorus: Number(e.target.value) })} />
            <Input label="Potassium (kg/ha)" type="number" value={String(form.potassium)} onChange={(e) => setForm({ ...form, potassium: Number(e.target.value) })} />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Crop (for suitability)</label>
              <select
                value={form.crop || ""}
                onChange={(e) => setForm({ ...form, crop: e.target.value })}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">No crop selected</option>
                {CROP_OPTIONS.filter(c => c !== "Other").map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>

            <Button type="submit" className="w-full" isLoading={loading}>
              <Send className="h-4 w-4" /> Analyze Soil
            </Button>
          </form>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {loading && <LoadingSpinner text="Analyzing soil..." />}

          {result && !loading && (
            <>
              {/* Health Score */}
              <Card padding="md" className="text-center">
                <div className="space-y-3">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                    <span className={`text-3xl font-bold ${getScoreColor(result.health_score)}`}>
                      {result.health_score}
                    </span>
                  </div>
                  <div>
                    <Badge variant={result.health_label === "Excellent" ? "success" : result.health_label === "Good" ? "info" : result.health_label === "Fair" ? "warning" : "danger"} size="md">
                      {result.health_label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{result.ph_status}</p>
                  {result.suitability_rating && (
                    <p className="text-sm">
                      Crop Suitability: <span className="font-semibold">{result.suitability_rating}</span>
                    </p>
                  )}
                </div>
              </Card>

              {/* Nutrient Ratings */}
              <Card padding="md">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-600" /> Nutrient Levels
                </h3>
                <div className="space-y-4">
                  {result.nutrient_ratings.map((nutrient) => (
                    <div key={nutrient.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{nutrient.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{nutrient.value} {nutrient.unit}</span>
                          <Badge variant={getStatusColor(nutrient.status)} size="sm">{nutrient.status}</Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            nutrient.status === "Optimal" ? "bg-green-500" :
                            nutrient.status === "High" ? "bg-blue-500" :
                            nutrient.status === "Medium" ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(100, (nutrient.status === "Optimal" ? 100 : nutrient.status === "High" ? 80 : nutrient.status === "Medium" ? 50 : 25))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Warnings & Suggestions */}
              {(result.warnings.length > 0 || result.suggestions.length > 0) && (
                <Card padding="md">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-600" /> Recommendations
                  </h3>
                  {result.warnings.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {result.warnings.map((w, i) => (
                        <p key={i} className="text-sm text-amber-600 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> {w}
                        </p>
                      ))}
                    </div>
                  )}
                  {result.suggestions.length > 0 && (
                    <div className="space-y-2">
                      {result.suggestions.map((s, i) => (
                        <p key={i} className="text-sm text-green-600 flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" /> {s}
                        </p>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </>
          )}

          {!result && !loading && (
            <Card padding="md" className="text-center">
              <div className="py-12">
                <Layers className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">Enter soil parameters to see the analysis</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
