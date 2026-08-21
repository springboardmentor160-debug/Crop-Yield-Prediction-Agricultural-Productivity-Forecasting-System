/**
 * YieldSense AI  -  Farms List Page
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, MapPin, Search, Wheat, Trash2, Edit, Eye, Sprout,
} from "lucide-react";
import toast from "react-hot-toast";
import { farmService } from "@/services/farmService";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import Dialog from "@/components/ui/Dialog";
import { ROUTES } from "@/utils/constants";
import { formatDate, formatArea } from "@/utils/formatters";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import type { Farm, FarmListResponse } from "@/types/farm";


export default function FarmsListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<FarmListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; farm: Farm | null }>({
    open: false,
    farm: null,
  });
  const [deleting, setDeleting] = useState(false);

  const loadFarms = useCallback(async () => {
    setLoading(true);
    try {
      const result = await farmService.listFarms(page, 9);
      setData(result);
    } catch {
      toast.error("Failed to load farms");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadFarms();
  }, [loadFarms, user?.uid]);


  const handleDelete = async () => {
    if (!deleteDialog.farm) return;
    setDeleting(true);
    try {
      await farmService.deleteFarm(deleteDialog.farm.id);
      toast.success("Farm deleted successfully");
      setDeleteDialog({ open: false, farm: null });
      loadFarms();
    } catch {
      toast.error("Failed to delete farm");
    } finally {
      setDeleting(false);
    }
  };

  // Filter farms client-side for search
  const filteredFarms = data?.farms.filter((farm) => {
    if (!debouncedSearch) return true;
    const query = debouncedSearch.toLowerCase();
    return (
      farm.name.toLowerCase().includes(query) ||
      farm.crop.toLowerCase().includes(query) ||
      farm.location.toLowerCase().includes(query)
    );
  }) || [];

  if (loading && !data) {
    return <LoadingSpinner text="Loading farms..." />;
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Farms
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.total || 0} farm{(data?.total || 0) !== 1 ? "s" : ""} registered
          </p>
        </div>
        <Link href={ROUTES.FARM_NEW}>
          <Button>
            <Plus className="h-4 w-4" />
            Add Farm
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search by name, crop, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Farm Grid */}
      {filteredFarms.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-8 w-8 text-gray-400" />}
          title={searchQuery ? "No farms found" : "No farms yet"}
          description={
            searchQuery
              ? "Try adjusting your search terms"
              : "Add your first farm to get started with yield predictions"
          }
          actionLabel={searchQuery ? undefined : "Add Your First Farm"}
          onAction={searchQuery ? undefined : () => router.push(ROUTES.FARM_NEW)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFarms.map((farm) => (
            <Card key={farm.id} hover padding="none" onClick={() => router.push(ROUTES.FARM_DETAIL(farm.id))}>
              {/* Card Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-[#e8f5ec] dark:bg-green-900/20 flex items-center justify-center text-[#1a6b3c] dark:text-green-400">
                      <Sprout className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {farm.name}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {farm.location}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">{farm.crop}</Badge>
                </div>
              </div>

              {/* Card Stats */}
              <div className="px-5 pb-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Area</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatArea(farm.area)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Soil pH</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {farm.soil_ph}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Added</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatDate(farm.created_at)}
                  </p>
                </div>
              </div>

              {/* Card Actions */}
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); router.push(ROUTES.FARM_DETAIL(farm.id)); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, farm }); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="pt-4">
          <Pagination
            currentPage={page}
            totalPages={data.total_pages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, farm: null })}
        title="Delete Farm"
        maxWidth="sm"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <strong>{deleteDialog.farm?.name}</strong>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteDialog({ open: false, farm: null })}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={deleting}
            onClick={handleDelete}
          >
            Delete Farm
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
