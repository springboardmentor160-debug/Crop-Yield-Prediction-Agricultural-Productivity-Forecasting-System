"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await api.getProfile();
        setProfile(data);
        setFormData({
          full_name: data.full_name,
          email: data.email,
        });
      } catch (err: any) {
        setError(err?.message || "Failed to load profile");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateProfile(formData);
      setProfile(updated);
      setEditMode(false);
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)] rounded-full animate-spin" />
          <p className="mt-4 text-[var(--color-ink)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-[var(--color-danger)]">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="bg-[var(--color-primary)]/5 backdrop-blur-sm border-b border-[var(--color-border)]/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
            >
              <span>←</span>
              <span>Dashboard</span>
            </button>
            <h1 className="font-display text-2xl font-bold text-[var(--color-primary)]">
              Farmer Profile
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {error && (
          <div className="bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/20 rounded-lg px-6 py-4 mb-6 flex items-center gap-3">
            <span className="text-[var(--color-danger)]">������⚠������️</span>
            <span>{error}</span>
          </div>
        )}

          <div className="space-y-8">
            {/* Profile Header */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">���������👨‍���������🌾</span>
              </div>
              <h2 className="font-display text-3xl font-bold text-[var(--color-primary)]">
                {profile.full_name || "Farmer"}
              </h2>
              <p className="text-[var(--color-ink-soft)] text-lg">
                {profile.email}
              </p>
              <p className="text-[var(--color-ink-soft)] mt-2">
                Role: <span className="font-medium text-[var(--color-primary)]">{profile.role}</span>
              </p>
            </div>

            {/* Profile Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[var(--color-surface)]/50 backdrop-blur rounded-xl p-6 border border-[var(--color-border)]/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[var(--color-ink-soft)] text-sm font-medium">
                    Total Farms
                  </div>
                  <div className="text-2xl font-bold text-[var(--color-primary)]">
                    0
                  </div>
                </div>
                <p className="text-[var(--color-ink-soft)] text-sm">
                  Add your first farm to get started
                </p>
              </div>

              <div className="bg-[var(--color-surface)]/50 backdrop-blur rounded-xl p-6 border border-[var(--color-border)]/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[var(--color-ink-soft)] text-sm font-medium">
                    Predictions Made
                  </div>
                  <div className="text-2xl font-bold text-[var(--color-primary)]">
                    0
                  </div>
                </div>
                <p className="text-[var(--color-ink-soft)] text-sm">
                  Your AI yield predictions will appear here
                </p>
              </div>

              <div className="bg-[var(--color-surface)]/50 backdrop-blur rounded-xl p-6 border border-[var(--color-border)]/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[var(--color-ink-soft)] text-sm font-medium">
                    Member Since
                  </div>
                  <div className="text-[var(--color-primary)] font-semibold">
                    {new Date(profile.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <p className="text-[var(--color-ink-soft)] text-sm">
                  Joined the YieldSense community
                </p>
              </div>
            </div>

            {/* Edit Profile Section */}
            <div className="bg-[var(--color-surface)]/50 backdrop-blur rounded-xl p-6 border border-[var(--color-border)]/20">
              <h3 className="text-[var(--color-primary)] font-semibold mb-4">
                {editMode ? "Update Profile" : "Profile Information"}
              </h3>

              {editMode ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[var(--color-ink)] font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--color-ink)] font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all duration-200"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-border)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[var(--color-ink)] font-medium">
                      Full Name
                    </div>
                    <div className="text-[var(--color-primary)] font-semibold">
                      {profile.full_name}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-[var(--color-ink)] font-medium">
                      Email Address
                    </div>
                    <div className="text-[var(--color-primary)] font-semibold">
                      {profile.email}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-[var(--color-ink)] font-medium">
                      Account Role
                    </div>
                    <div className="text-[var(--color-primary)] font-semibold">
                      {profile.role}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 rounded-lg text-[var(--color-primary)] font-medium transition-colors"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Security Section */}
            <div className="bg-[var(--color-surface)]/50 backdrop-blur rounded-xl p-6 border border-[var(--color-border)]/20">
              <h3 className="text-[var(--color-primary)] font-semibold mb-4">
                Account Security
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-[var(--color-ink)] font-medium">
                    Last Login
                  </div>
                  <div className="text-[var(--color-primary)] font-semibold">
                    Today
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-[var(--color-ink)] font-medium">
                    Password Status
                  </div>
                  <div className="text-[var(--color-primary)] font-semibold">
                    Secure
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      // TODO: Implement password change modal
                      alert("Password change feature coming soon!");
                    }}
                    className="px-4 py-2 bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 rounded-lg text-[var(--color-primary)] font-medium transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-center text-[var(--color-ink-soft)] text-xs">
        YieldSense AI © 2026 • Empowering farmers with AI
      </div>
    </div>
  );
}