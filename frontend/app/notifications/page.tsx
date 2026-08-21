"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((current) => current.map((item) => item.id === id ? { ...item, is_read: true } : item));
    } catch {
      alert("Unable to mark notification read.");
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
    } catch {
      alert("Unable to mark all notifications read.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-700 text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
          >
            ← Dashboard
          </button>
          <span className="text-2xl">🔔</span>
          <span className="text-xl font-bold">Notifications</span>
        </div>
        <button
          onClick={markAllRead}
          className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
        >
          Mark all read
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Activity Notifications</h1>
          <p className="text-gray-500 text-sm">Keep track of important farm insights and alerts.</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border p-6 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-6 text-center text-gray-500">No notifications yet.</div>
        ) : (
          <div className="grid gap-4">
            {notifications.map((note) => (
              <div
                key={note.id}
                className={`rounded-3xl border p-5 transition ${note.is_read ? "border-gray-200 bg-gray-50" : "border-green-200 bg-white shadow-sm"}`}
              >
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{note.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{new Date(note.created_at).toLocaleString()}</p>
                  </div>
                  {!note.is_read && (
                    <button
                      onClick={() => markRead(note.id)}
                      className="text-sm font-semibold text-green-700 hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600">{note.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
