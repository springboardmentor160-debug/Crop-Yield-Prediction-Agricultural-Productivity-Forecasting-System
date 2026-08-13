"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface ReportData {
    total_users: number;
    total_farms: number;
    total_predictions: number;
    total_notifications: number;
    average_accuracy: number;
}

export default function AdminReportsPage() {
    const router = useRouter();

    const [report, setReport] = useState<ReportData | null>(null);
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

        loadReport();
    }, []);

    async function loadReport() {
        try {
            const data = await api.getAdminReports();
            setReport(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function exportCSV() {
        await api.downloadAdminReportCSV();
    }

    async function exportExcel() {
        await api.downloadAdminReportExcel();
    }

    async function exportPDF() {
        await api.downloadAdminReportPDF();
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
            {/* Header */}
            <nav
                style={{
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 32px",
                    backgroundColor: "#0d0d1a",
                    borderBottom: "1px solid #1a1a2e",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
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
                        ← Back
                    </button>

                    <span style={{ color: "#6b6b9e", fontSize: "13px" }}>
                        Admin / Reports
                    </span>
                </div>

                <button
                    onClick={loadReport}
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
            </nav>

            <div
                style={{
                    maxWidth: "1400px",
                    margin: "0 auto",
                    padding: "32px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "30px",
                    }}
                >
                    <div>
                        <h1
                            style={{
                                fontSize: "30px",
                                fontWeight: 800,
                                marginBottom: "6px",
                            }}
                        >
                            Reports & Analytics
                        </h1>

                        <p
                            style={{
                                color: "#6b6b9e",
                                fontSize: "14px",
                            }}
                        >
                            Export system reports and monitor platform statistics.
                        </p>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                        }}
                    >
                        <button
                            onClick={exportCSV}
                            style={{
                                backgroundColor: "#22c55e",
                                color: "#fff",
                                border: "none",
                                padding: "10px 18px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: 600,
                            }}
                        >
                            CSV
                        </button>

                        <button
                            onClick={exportExcel}
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
                            Excel
                        </button>

                        <button
                            onClick={exportPDF}
                            style={{
                                backgroundColor: "#ef4444",
                                color: "#fff",
                                border: "none",
                                padding: "10px 18px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: 600,
                            }}
                        >
                            PDF
                        </button>
                    </div>
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
                            padding: "80px",
                            color: "#6b6b9e",
                        }}
                    >
                        Loading reports...
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
                            gap: "20px",
                        }}
                    >
                        {/* Total Users */}
                        <div
                            style={{
                                backgroundColor: "#0d0d1a",
                                border: "1px solid #1a1a2e",
                                borderRadius: "14px",
                                padding: "24px",
                            }}
                        >
                            <div style={{ fontSize: "12px", color: "#6b6b9e" }}>
                                Total Users
                            </div>

                            <div
                                style={{
                                    marginTop: "10px",
                                    fontSize: "34px",
                                    fontWeight: 700,
                                    color: "#8b5cf6",
                                }}
                            >
                                {report?.total_users ?? 0}
                            </div>
                        </div>

                        {/*
                        {/* Total Farms */}
                        <div
                            style={{
                                backgroundColor: "#0d0d1a",
                                border: "1px solid #1a1a2e",
                                borderRadius: "14px",
                                padding: "24px",
                            }}
                        >
                            <div style={{ fontSize: "12px", color: "#6b6b9e" }}>
                                Total Farms
                            </div>

                            <div
                                style={{
                                    marginTop: "10px",
                                    fontSize: "34px",
                                    fontWeight: 700,
                                    color: "#22c55e",
                                }}
                            >
                                {report?.total_farms ?? 0}
                            </div>
                        </div>

                        {/* Total Predictions */}
                        <div
                            style={{
                                backgroundColor: "#0d0d1a",
                                border: "1px solid #1a1a2e",
                                borderRadius: "14px",
                                padding: "24px",
                            }}
                        >
                            <div style={{ fontSize: "12px", color: "#6b6b9e" }}>
                                Total Predictions
                            </div>

                            <div
                                style={{
                                    marginTop: "10px",
                                    fontSize: "34px",
                                    fontWeight: 700,
                                    color: "#3b82f6",
                                }}
                            >
                                {report?.total_predictions ?? 0}
                            </div>
                        </div>

                        {/* Notifications */}
                        <div
                            style={{
                                backgroundColor: "#0d0d1a",
                                border: "1px solid #1a1a2e",
                                borderRadius: "14px",
                                padding: "24px",
                            }}
                        >
                            <div style={{ fontSize: "12px", color: "#6b6b9e" }}>
                                Notifications
                            </div>

                            <div
                                style={{
                                    marginTop: "10px",
                                    fontSize: "34px",
                                    fontWeight: 700,
                                    color: "#f59e0b",
                                }}
                            >
                                {report?.total_notifications ?? 0}
                            </div>
                        </div>

                        {/* AI Accuracy */}
                        <div
                            style={{
                                backgroundColor: "#0d0d1a",
                                border: "1px solid #1a1a2e",
                                borderRadius: "14px",
                                padding: "24px",
                            }}
                        >
                            <div style={{ fontSize: "12px", color: "#6b6b9e" }}>
                                AI Model Accuracy
                            </div>

                            <div
                                style={{
                                    marginTop: "10px",
                                    fontSize: "34px",
                                    fontWeight: 700,
                                    color: "#06b6d4",
                                }}
                            >
                                {report?.average_accuracy ?? 0}%
                            </div>
                        </div>

                        {/* Summary Card */}
                        <div
                            style={{
                                gridColumn: "1 / -1",
                                backgroundColor: "#0d0d1a",
                                border: "1px solid #1a1a2e",
                                borderRadius: "14px",
                                padding: "28px",
                                marginTop: "8px",
                            }}
                        >
                            <h2
                                style={{
                                    margin: 0,
                                    marginBottom: "18px",
                                    fontSize: "20px",
                                    fontWeight: 700,
                                }}
                            >
                                Report Summary
                            </h2>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                                    gap: "18px",
                                }}
                            >
                                <div>
                                    <div style={{ color: "#6b6b9e", fontSize: "12px" }}>
                                        Registered Users
                                    </div>

                                    <div style={{ fontSize: "18px", fontWeight: 600 }}>
                                        {report?.total_users ?? 0}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ color: "#6b6b9e", fontSize: "12px" }}>
                                        Farms Registered
                                    </div>

                                    <div style={{ fontSize: "18px", fontWeight: 600 }}>
                                        {report?.total_farms ?? 0}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ color: "#6b6b9e", fontSize: "12px" }}>
                                        Predictions Generated
                                    </div>

                                    <div style={{ fontSize: "18px", fontWeight: 600 }}>
                                        {report?.total_predictions ?? 0}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ color: "#6b6b9e", fontSize: "12px" }}>
                                        Average AI Accuracy
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "18px",
                                            fontWeight: 600,
                                            color: "#22c55e",
                                        }}
                                    >
                                        {report?.average_accuracy ?? 0}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}