/**
 * YieldSense AI  -  Profile Page
 */

"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Shield, Calendar, Save } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/userService";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatDate } from "@/utils/formatters";
import type { UserProfile } from "@/types/user";

export default function ProfilePage() {
  const { profile, loading, refreshProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    phone: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userService.updateProfile({
        display_name: formData.display_name,
        phone: formData.phone || undefined,
      });
      await refreshProfile();
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 animate-in">
        <Card padding="lg" className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <User className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Unavailable</h2>
            <p className="text-sm text-gray-500">
              We couldn't retrieve your user profile details. This might be due to an expired session, missing record, or connection issue.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={() => refreshProfile()} className="w-full">
              Retry Connection
            </Button>
            <Button variant="outline" onClick={() => logout()} className="w-full">
              Logout & Login Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Profile
        </h1>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <User className="h-4 w-4" /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" isLoading={saving} onClick={handleSave}>
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
        )}
      </div>

      {/* Avatar & Name */}
      <Card padding="md">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-lg bg-[#1a6b3c] flex items-center justify-center text-white text-xl font-bold shrink-0">
            {profile.display_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {profile.display_name}
            </h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <Badge variant={profile.role === "admin" ? "info" : "success"} className="mt-2">
              <Shield className="h-3 w-3 mr-1" />
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Details */}
      <Card padding="md">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
          Account Details
        </h3>
        <div className="space-y-4">
          {editing ? (
            <>
              <Input
                label="Display Name"
                value={formData.display_name}
                onChange={(e) => setFormData((p) => ({ ...p, display_name: e.target.value }))}
                icon={<User className="h-4 w-4" />}
              />
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                icon={<Phone className="h-4 w-4" />}
                placeholder="+91 98765 43210"
              />
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-800">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-800">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {profile.phone || "Not provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Member Since</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(profile.created_at)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
