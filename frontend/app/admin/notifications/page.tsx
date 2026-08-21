"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Notification } from "@/lib/types";

export default function AdminNotificationsPage() {
    const router = useRouter();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/");
            return;
        }

        const user = localStorage.getItem("user");

        if (user && JSON.parse(user).role !== "Admin") {
            router.push("/");
            return;
        }

        loadNotifications();
    }, []);

    async function loadNotifications() {
        try {
            const data = await api.getAllNotificationsAdmin();
            setNotifications(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    async function markRead(id: number) {
        try {
            await api.markNotificationRead(id);
            loadNotifications();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Unknown error");
        }
    }

    async function deleteNotification(id: number) {
        if (!confirm("Delete this notification?")) return;

        try {
            await api.deleteNotification(id);
            loadNotifications();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Unknown error");
        }
    }
    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#0a0a14",
                color: "#ffffff",
                fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}
        >
            <nav
                style={{
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "0 32px",
                    backgroundColor: "#0d0d1a",
                    borderBottom: "1px solid #1a1a2e",
                }}
            >
                <button
                    onClick={() => router.push("/admin")}
                    style={{
                        background: "none",
                        border: "none",
                        color: "#6366f1",
                        cursor: "pointer",
                        fontSize: "13px",
                    }}
                >
                    ← Back to Admin
                </button>

                <span
                    style={{
                        color: "#4a4a7a",
                        fontSize: "13px",
                    }}
                >
                    / Notifications
                </span>
            </nav>

            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "32px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "24px",
                    }}
                >
                    <div>
                        <h1
                            style={{
                                fontSize: "26px",
                                fontWeight: 800,
                                marginBottom: "6px",
                            }}
                        >
                            Notification Center
                        </h1>

                        <p
                            style={{
                                color: "#6b6b9e",
                                fontSize: "13px",
                            }}
                        >
                            View and manage all system notifications.
                        </p>
                    </div>

                    <button
                        onClick={loadNotifications}
                        style={{
                            backgroundColor: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            padding: "10px 18px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
                    >
                        Refresh
                    </button>
                </div>

                {error && (
                    <div
                        style={{
                            color: "#ef4444",
                            marginBottom: "20px",
                        }}
                    >
                        {error}
                    </div>
                )}

                {loading ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "60px",
                            color: "#6b6b9e",
                        }}
                    >
                        Loading notifications...
                    </div>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                        }}
                    >
                        {notifications.length === 0 ? (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "60px",
                                    backgroundColor: "#0d0d1a",
                                    border: "1px solid #1a1a2e",
                                    borderRadius: "14px",
                                    color: "#6b6b9e",
                                }}
                            >
                                No notifications found.
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    style={{
                                        backgroundColor: "#0d0d1a",
                                        border: `1px solid ${notification.is_read ? "#1a1a2e" : "#3b82f6"
                                            }`,
                                        borderRadius: "14px",
                                        padding: "20px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        gap: "20px",
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                marginBottom: "10px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    backgroundColor: notification.is_read
                                                        ? "#374151"
                                                        : "#22c55e",
                                                    color: "#fff",
                                                    padding: "3px 8px",
                                                    borderRadius: "999px",
                                                    fontSize: "11px",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {notification.is_read ? "READ" : "NEW"}
                                            </span>
                                        </div>

                                        <h3
                                            style={{
                                                margin: 0,
                                                marginBottom: "8px",
                                                fontSize: "18px",
                                                fontWeight: 700,
                                            }}
                                        >
                                            {notification.title}
                                        </h3>

                                        <p
                                            style={{
                                                margin: 0,
                                                color: "#b5b5d1",
                                                lineHeight: 1.6,
                                                fontSize: "14px",
                                            }}
                                        >
                                            {notification.message}
                                        </p>

                                        <div
                                            style={{
                                                marginTop: "14px",
                                                color: "#6b6b9e",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {new Date(notification.created_at).toLocaleString()}
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "10px",
                                        }}
                                    >
                                        {!notification.is_read && (
                                            <button
                                                onClick={() => markRead(notification.id)}
                                                style={{
                                                    backgroundColor: "#22c55e",
                                                    color: "#fff",
                                                    border: "none",
                                                    padding: "8px 14px",
                                                    borderRadius: "8px",
                                                    cursor: "pointer",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Mark Read
                                            </button>
                                        )}

                                        <button
                                            onClick={() =>
                                                deleteNotification(notification.id)
                                            }
                                            style={{
                                                backgroundColor: "#ef4444",
                                                color: "#fff",
                                                border: "none",
                                                padding: "8px 14px",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                fontWeight: 600,
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}