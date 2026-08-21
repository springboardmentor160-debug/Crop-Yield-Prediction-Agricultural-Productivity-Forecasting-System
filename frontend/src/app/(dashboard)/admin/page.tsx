/**
 * YieldSense AI  -  Admin Control Center Page
 *
 * Dedicated system administration dashboard for admins:
 * - System-wide platform metrics & stats
 * - Registered User Management & Role Assignment
 * - ML Model Status & Retraining
 * - System-wide Prediction Audit Trail
 * - Access-control guard (Admin access required)
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert, Users, UserCheck, Sprout, BarChart3,
  FileText, Cpu, CheckCircle2, Shield, RefreshCw,
  Search, ArrowUpRight, Lock, UserPlus, Zap, Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { adminService, type AdminStats, type SystemUser, type SystemPrediction } from "@/services/adminService";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ROUTES } from "@/utils/constants";
import { getRelativeTime, formatDate } from "@/utils/formatters";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [predictions, setPredictions] = useState<SystemPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [searchUser, setSearchUser] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "predictions" | "system">("users");

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, predData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.listUsers(),
        adminService.listSystemPredictions(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setPredictions(predData);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load admin dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (profile && profile.role === "admin") {
        loadAdminData();
      } else {
        setLoading(false);
      }
    }
  }, [profile, authLoading]);

  // Handle role change
  const handleToggleRole = async (targetUser: SystemUser) => {
    const newRole: "farmer" | "admin" = targetUser.role === "admin" ? "farmer" : "admin";
    if (!confirm(`Change role of "${targetUser.display_name}" (${targetUser.email}) to ${newRole.toUpperCase()}?`)) return;

    setUpdatingUid(targetUser.uid);
    try {
      await adminService.updateUserRole(targetUser.uid, newRole);
      toast.success(`Role updated to ${newRole.toUpperCase()}`);
      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUser.uid ? { ...u, role: newRole } : u))
      );
      // Refresh stats
      const newStats = await adminService.getAdminStats();
      setStats(newStats);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update user role.");
    } finally {
      setUpdatingUid(null);
    }
  };

  // Auth Guard: Not Logged In or Not Admin
  if (authLoading || loading) {
    return <LoadingSpinner text="Loading Admin Control Center..." />;
  }

  if (!profile || profile.role !== "admin") {
    return (
      <div className="max-w-xl mx-auto mt-12 space-y-6 text-center animate-in">
        <Card padding="lg" className="border-red-200 dark:border-red-900/30">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Access Required
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-md mx-auto">
            You are logged in as a <strong>{profile?.role || "farmer"}</strong>. The Admin Control Center is reserved exclusively for system administrators.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => router.push(ROUTES.DASHBOARD)}>
              Go to Farmer Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.display_name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.role.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="h-7 w-7 text-green-600" />
              Admin Control Center
            </h1>
            <Badge variant="info" size="sm">System Admin</Badge>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Platform governance, user management, ML status, and system audit log.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAdminData}>
          <RefreshCw className="h-4 w-4" /> Refresh System Data
        </Button>
      </div>

      {/* Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Registered Users",
              value: stats.total_users,
              sub: `${stats.farmers_count} Farmers · ${stats.admin_count} Admins`,
              icon: <Users className="h-5 w-5" />,
              color: "from-blue-500 to-indigo-600",
            },
            {
              label: "System Total Farms",
              value: stats.total_farms,
              sub: "Across all registered farmers",
              icon: <Sprout className="h-5 w-5" />,
              color: "from-green-500 to-emerald-600",
            },
            {
              label: "Total AI Predictions",
              value: stats.total_predictions,
              sub: "Platform yield forecasts",
              icon: <BarChart3 className="h-5 w-5" />,
              color: "from-purple-500 to-violet-600",
            },
            {
              label: "Generated Reports",
              value: stats.total_reports,
              sub: "Exported PDF & CSV files",
              icon: <FileText className="h-5 w-5" />,
              color: "from-amber-500 to-orange-600",
            },
          ].map((card) => (
            <Card key={card.label} padding="md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-lg`}>
                  {card.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Model & System Health Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card padding="md" className="md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-green-600" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  ML Model & Engine Status
                </h2>
              </div>
              <Badge variant={stats.model_status === "ready" ? "success" : "warning"}>
                {stats.model_status.toUpperCase()}
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm pt-2 border-t border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-xs text-gray-400">Model Name</p>
                <p className="font-semibold text-gray-900 dark:text-white">{stats.model_name || " - "}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Accuracy (R²)</p>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  {stats.model_accuracy ? `${(stats.model_accuracy * 100).toFixed(2)}%` : " - "}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Engine Version</p>
                <p className="font-semibold text-gray-900 dark:text-white">{stats.version}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">System Health</p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Healthy
                </p>
              </div>
            </div>
          </Card>

          <Card padding="md" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                System administration tools for system governance.
              </p>
            </div>
            <div className="space-y-2 mt-4">
              <Link href={ROUTES.PREDICTION} className="block">
                <Button size="sm" variant="outline" fullWidth className="justify-between">
                  <span>Run Yield Prediction Test</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "users"
              ? "border-green-600 text-green-600 dark:text-green-400"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="h-4 w-4" /> User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("predictions")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "predictions"
              ? "border-green-600 text-green-600 dark:text-green-400"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <BarChart3 className="h-4 w-4" /> System Predictions Stream ({predictions.length})
        </button>
      </div>

      {/* TAB 1: User Management */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="max-w-md">
            <Input
              placeholder="Search user by name, email, or role..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          <Card padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Joined</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                        No users found matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.uid} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {u.display_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{u.display_name}</p>
                              <p className="text-xs text-gray-400 font-mono">UID: {u.uid.slice(0, 10)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{u.email}</td>
                        <td className="px-5 py-3.5">
                          <Badge variant={u.role === "admin" ? "info" : "success"} size="sm">
                            {u.role.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs">
                          {u.created_at ? formatDate(u.created_at) : " - "}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Button
                            size="sm"
                            variant={u.role === "admin" ? "outline" : "primary"}
                            disabled={updatingUid === u.uid || u.uid === profile.uid}
                            onClick={() => handleToggleRole(u)}
                          >
                            {updatingUid === u.uid
                              ? "Updating..."
                              : u.role === "admin"
                              ? "Demote to Farmer"
                              : "Promote to Admin"}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: System Predictions Stream */}
      {activeTab === "predictions" && (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-5 py-3.5">Prediction ID</th>
                  <th className="px-5 py-3.5">User UID</th>
                  <th className="px-5 py-3.5">Crop & Season</th>
                  <th className="px-5 py-3.5">Yield (t/ha)</th>
                  <th className="px-5 py-3.5">Total Production</th>
                  <th className="px-5 py-3.5">Risk Level</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {predictions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                      No system predictions recorded yet.
                    </td>
                  </tr>
                ) : (
                  predictions.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{p.id.slice(0, 12)}...</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{p.user_id?.slice(0, 10)}...</td>
                      <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">
                        {p.crop} <span className="text-xs text-gray-400">({p.season})</span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-green-600 dark:text-green-400">
                        {p.predicted_yield?.toFixed(3)} t/ha
                      </td>
                      <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300">
                        {p.total_production?.toFixed(1)} tons
                      </td>
                      <td className="px-5 py-3.5">
                        {p.risk_level ? (
                          <Badge
                            variant={
                              p.risk_level === "Low"
                                ? "success"
                                : p.risk_level === "Medium"
                                ? "warning"
                                : "danger"
                            }
                            size="sm"
                          >
                            {p.risk_level}
                          </Badge>
                        ) : (
                          " - "
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">
                        {p.created_at ? getRelativeTime(p.created_at) : " - "}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
