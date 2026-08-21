/**
 * YieldSense AI  -  Notifications Page
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  Bell, Info, CheckCircle, AlertTriangle, XCircle,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { notificationService } from "@/services/notificationService";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { getRelativeTime } from "@/utils/formatters";
import type { Notification } from "@/types/notification";

const typeIcons: Record<string, React.ReactNode> = {
  info: <Info className="h-5 w-5 text-blue-500" />,
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
};

const typeBadges: Record<string, "info" | "success" | "warning" | "danger"> = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "danger",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      } catch {
        // No notifications yet  -  this is fine
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  if (loading) return <LoadingSpinner text="Loading notifications..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8 text-gray-400" />}
          title="No notifications yet"
          description="You'll see notifications about farm updates, predictions, and weather alerts here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              padding="md"
              className={`${!notification.is_read ? "border-l-4 border-l-green-500" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5">{typeIcons[notification.type] || typeIcons.info}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        {notification.message}
                      </p>
                    </div>
                    <Badge variant={typeBadges[notification.type] || "default"} size="sm">
                      {notification.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400">
                      {getRelativeTime(notification.created_at)}
                    </span>
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                      >
                        <Check className="h-3 w-3" /> Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
