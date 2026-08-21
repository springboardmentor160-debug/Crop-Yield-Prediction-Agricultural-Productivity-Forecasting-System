/**
 * YieldSense AI  -  Farm Details Page
 */

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Edit, Trash2, Save, X,
  Wheat, FlaskConical, Ruler, Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import { farmService } from "@/services/farmService";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Dialog from "@/components/ui/Dialog";
import FarmAdvisoryPanel from "@/components/farms/FarmAdvisoryPanel";
import { ROUTES, CROP_OPTIONS } from "@/utils/constants";
import { formatDate } from "@/utils/formatters";
import type { Farm, FarmUpdate } from "@/types/farm";

export default function FarmDetailPage() {
  const params = useParams();
  const router = useRouter();
  const farmId = params.id as string;

  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<FarmUpdate>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadFarm = async () => {
      try {
        const data = await farmService.getFarm(farmId);
        setFarm(data);
      } catch {
        toast.error("Farm not found");
        router.push(ROUTES.FARMS);
      } finally {
        setLoading(false);
      }
    };
    loadFarm();
  }, [farmId, router]);

  const startEditing = () => {
    if (farm) {
      setEditData({
        name: farm.name,
        location: farm.location,
        latitude: farm.latitude,
        longitude: farm.longitude,
        area: farm.area,
        crop: farm.crop,
        soil_ph: farm.soil_ph,
        nitrogen: farm.nitrogen,
        phosphorus: farm.phosphorus,
        potassium: farm.potassium,
      });
      setEditing(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await farmService.updateFarm(farmId, editData);
      setFarm(updated);
      setEditing(false);
      toast.success("Farm updated successfully");
    } catch {
      toast.error("Failed to update farm");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await farmService.deleteFarm(farmId);
      toast.success("Farm deleted");
      router.push(ROUTES.FARMS);
    } catch {
      toast.error("Failed to delete farm");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading farm details..." />;
  if (!farm) return null;

  const detailSections = [
    {
      title: "Location",
      icon: <MapPin className="h-5 w-5 text-green-600" />,
      items: [
        { label: "Location", value: farm.location, field: "location", type: "text" },
        { label: "Latitude", value: farm.latitude, field: "latitude", type: "number" },
        { label: "Longitude", value: farm.longitude, field: "longitude", type: "number" },
      ],
    },
    {
      title: "Crop & Area",
      icon: <Wheat className="h-5 w-5 text-amber-600" />,
      items: [
        { label: "Crop", value: farm.crop, field: "crop", type: "select" },
        { label: "Area", value: `${farm.area} ha`, field: "area", type: "number" },
      ],
    },
    {
      title: "Soil Data",
      icon: <FlaskConical className="h-5 w-5 text-purple-600" />,
      items: [
        { label: "Soil pH", value: farm.soil_ph, field: "soil_ph", type: "number" },
        { label: "Nitrogen", value: `${farm.nitrogen} kg/ha`, field: "nitrogen", type: "number" },
        { label: "Phosphorus", value: `${farm.phosphorus} kg/ha`, field: "phosphorus", type: "number" },
        { label: "Potassium", value: `${farm.potassium} kg/ha`, field: "potassium", type: "number" },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(ROUTES.FARMS)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {farm.name}
              </h1>
              <Badge variant="success">{farm.crop}</Badge>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Calendar className="h-3.5 w-3.5" />
              Created {formatDate(farm.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button size="sm" isLoading={saving} onClick={handleSave}>
                <Save className="h-4 w-4" /> Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={startEditing}>
                <Edit className="h-4 w-4" /> Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Detail Cards */}
      {detailSections.map((section) => (
        <Card key={section.title} padding="md">
          <div className="flex items-center gap-2 mb-5">
            {section.icon}
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {section.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.items.map((item) => (
              <div key={item.field}>
                {editing ? (
                  item.type === "select" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {item.label}
                      </label>
                      <select
                        value={(editData as Record<string, unknown>)[item.field] as string || ""}
                        onChange={(e) => setEditData((prev) => ({ ...prev, [item.field]: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      >
                        {CROP_OPTIONS.map((crop) => (
                          <option key={crop} value={crop}>{crop}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <Input
                      label={item.label}
                      type={item.type}
                      step="any"
                      value={(editData as Record<string, unknown>)[item.field] as string || ""}
                      onChange={(e) => {
                        const val = item.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
                        setEditData((prev) => ({ ...prev, [item.field]: val }));
                      }}
                    />
                  )
                ) : (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                      {item.value}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Week 6  -  Farm Advisory Panel */}
      <FarmAdvisoryPanel farmId={farmId} />

      {/* Delete Dialog */}
      <Dialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Farm"
        maxWidth="sm"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <strong>{farm.name}</strong>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" isLoading={deleting} onClick={handleDelete}>
            Delete Farm
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
