/**
 * YieldSense AI  -  Add Farm Page
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin, Ruler, Wheat, FlaskConical, ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { farmService } from "@/services/farmService";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ROUTES, CROP_OPTIONS } from "@/utils/constants";
import type { FarmCreate } from "@/types/farm";

export default function AddFarmPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FarmCreate>({
    name: "",
    location: "",
    latitude: 0,
    longitude: 0,
    area: 0,
    crop: "",
    soil_ph: 7.0,
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof FarmCreate, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Farm name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (formData.latitude < -90 || formData.latitude > 90) newErrors.latitude = "Must be between -90 and 90";
    if (formData.longitude < -180 || formData.longitude > 180) newErrors.longitude = "Must be between -180 and 180";
    if (formData.area <= 0) newErrors.area = "Area must be greater than 0";
    if (!formData.crop) newErrors.crop = "Crop type is required";
    if (formData.soil_ph < 0 || formData.soil_ph > 14) newErrors.soil_ph = "pH must be between 0 and 14";
    if (formData.nitrogen < 0) newErrors.nitrogen = "Cannot be negative";
    if (formData.phosphorus < 0) newErrors.phosphorus = "Cannot be negative";
    if (formData.potassium < 0) newErrors.potassium = "Cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await farmService.createFarm(formData);
      toast.success("Farm created successfully!");
      router.push(ROUTES.FARMS);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create farm";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Farm
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Enter your farm details to start tracking yields
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="h-5 w-5 text-green-600" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Farm Name"
              placeholder="My Green Farm"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              error={errors.name}
            />
            <Input
              label="Location"
              placeholder="Village, District, State"
              value={formData.location}
              onChange={(e) => updateField("location", e.target.value)}
              error={errors.location}
            />
            <Input
              label="Latitude"
              type="number"
              step="any"
              placeholder="20.5937"
              value={formData.latitude || ""}
              onChange={(e) => updateField("latitude", parseFloat(e.target.value) || 0)}
              error={errors.latitude}
              helperText="-90 to 90"
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              placeholder="78.9629"
              value={formData.longitude || ""}
              onChange={(e) => updateField("longitude", parseFloat(e.target.value) || 0)}
              error={errors.longitude}
              helperText="-180 to 180"
            />
          </div>
        </Card>

        {/* Crop & Area */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-5">
            <Wheat className="h-5 w-5 text-amber-600" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Crop & Area
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Crop Type
              </label>
              <select
                value={formData.crop}
                onChange={(e) => updateField("crop", e.target.value)}
                className={`
                  w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-gray-900
                  text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                  transition-all duration-200
                  ${errors.crop ? "border-red-400" : "border-gray-200 dark:border-gray-700"}
                `}
              >
                <option value="">Select crop...</option>
                {CROP_OPTIONS.map((crop) => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
              {errors.crop && <p className="mt-1 text-xs text-red-500">{errors.crop}</p>}
            </div>
            <Input
              label="Area (hectares)"
              type="number"
              step="any"
              placeholder="10.5"
              value={formData.area || ""}
              onChange={(e) => updateField("area", parseFloat(e.target.value) || 0)}
              error={errors.area}
              icon={<Ruler className="h-4 w-4" />}
            />
          </div>
        </Card>

        {/* Soil Data */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-5">
            <FlaskConical className="h-5 w-5 text-purple-600" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Soil Data
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Soil pH"
              type="number"
              step="0.1"
              placeholder="6.5"
              value={formData.soil_ph || ""}
              onChange={(e) => updateField("soil_ph", parseFloat(e.target.value) || 0)}
              error={errors.soil_ph}
              helperText="0 to 14 scale"
            />
            <Input
              label="Nitrogen (kg/ha)"
              type="number"
              step="any"
              placeholder="80"
              value={formData.nitrogen || ""}
              onChange={(e) => updateField("nitrogen", parseFloat(e.target.value) || 0)}
              error={errors.nitrogen}
            />
            <Input
              label="Phosphorus (kg/ha)"
              type="number"
              step="any"
              placeholder="42"
              value={formData.phosphorus || ""}
              onChange={(e) => updateField("phosphorus", parseFloat(e.target.value) || 0)}
              error={errors.phosphorus}
            />
            <Input
              label="Potassium (kg/ha)"
              type="number"
              step="any"
              placeholder="38"
              value={formData.potassium || ""}
              onChange={(e) => updateField("potassium", parseFloat(e.target.value) || 0)}
              error={errors.potassium}
            />
          </div>
        </Card>

        {/* Submit */}
        <div className="flex items-center gap-3 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Create Farm
          </Button>
        </div>
      </form>
    </div>
  );
}
