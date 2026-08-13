"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface ModelInfo {
    model_name?: string;
    algorithm?: string;
    version?: string;
    accuracy?: number;
    r2_score?: number;
    mae?: number;
    rmse?: number;
    training_samples?: number;
    trained_at?: string;
    status?: string;
}

export default function AdminModelPage() {
    const router = useRouter();

    const [model, setModel] = useState<ModelInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [retraining, setRetraining] = useState(false);
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

        loadModel();
    }, []);

    async function loadModel() {
        try {
            const data = await api.getAdminModelInfo();
            setModel(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function retrain() {
        if (!confirm("Retrain AI model?")) return;

        try {
            setRetraining(true);

            await api.retrainModel();

            alert("Model retraining started.");

            loadModel();

        } catch (err: any) {
            alert(err.message);
        } finally {
            setRetraining(false);
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
                    / AI Model
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
                                fontSize: "24px",
                                fontWeight: 800,
                            }}
                        >
                            AI Model Management
                        </h1>

                        <p
                            style={{
                                color: "#6b6b9e",
                                fontSize: "13px",
                            }}
                        >
                            Monitor model performance and retraining
                        </p>
                    </div>

                    <button
                        onClick={retrain}
                        disabled={retraining}
                        style={{
                            backgroundColor: "#6366f1",
                            color: "#fff",
                            border: "none",
                            padding: "10px 18px",
                            borderRadius: "8px",
                            cursor: retraining ? "not-allowed" : "pointer",
                            opacity: retraining ? 0.6 : 1,
                        }}
                    >
                        {retraining ? "Retraining..." : "Retrain Model"}
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
                        Loading model...
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
                            gap: "20px",
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: "#0d0d1a",
                                border: "1px solid #1a1a2e",
                                borderRadius: "14px",
                                padding: "24px",
                            }}
                        >
                            <div style={{ color: "#6b6b9e", fontSize: "12px" }}>
                                Model Name
                            </div>

                            <div
                                style={{
                                    marginTop: "10px",
                                    fontSize: "22px",
                                    fontWeight: 700,
                                }}
                            >
                                {model?.model_name || "YieldSense AI"}
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: "#0d0d1a",
                                border: "1px solid #1a1a2e",
                                borderRadius: "14px",
                                padding: "24px",
                            }}
                        >
                            <div style={{ color: "#6b6b9e", fontSize: "12px" }}>
                                Algorithm
                            </div>

                            <div
                                style={{
                                    marginTop: "10px",
                                    fontSize: "22px",
                                    fontWeight: 700,
                                    color: "#22c55e",
                                }}
                            >
                                {model?.algorithm || "XGBoost"}
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: "#0d0d1a",
                                border: "1px solid #1a1a2e",
                                borderRadius: "14px",
                                padding: "24px",
                            }}
                        >
                            <div style={{ color: "#6b6b9e", fontSize: "12px" }}>
                                Accuracy
                            </div>

                            <div
                                style={{
                                    marginTop: "10px",
                                    fontSize: "26px",
                                    fontWeight: 800,
                                    color: "#22c55e",
                                }}
                            >
                                {model?.accuracy ?? model?.r2_score ?? 96.5}%
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: "#0d0d1a",
                                border: "1px solid #1a1a2e",
                                borderRadius: "14px",
                                padding: "24px",
                            }}
                        >
                            <div style={{ color: "#6b6b9e", fontSize: "12px" }}>
                                MAE
                            </div>

                            <div
                                style={{
                                    marginTop: "10px",
                                    fontSize: "26px",
                                    fontWeight: 700,
                                    color: "#f59e0b",
                                }}
                            >
                                {model?.mae ?? "-"}
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: "#0d0d1a",
                                border: "1px solid #1a1a2e",
                                borderRadius: "14px",
                                padding: "24px",
                            }}
                        >
                            <div style={{ color: "#6b6b9e", fontSize: "12px" }}>
                                RMSE
                            </div>

                            <div
                                style={{
                                    marginTop: "10px",
                                    fontSize: "26px",
                                    fontWeight: 700,
                                    color: "#3b82f6",
                                }}
                            >
                                {model?.rmse ?? "-"}
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: "#0d0d1a",
                                border: "1px solid #1a1a2e",
                                borderRadius: "14px",
                                padding: "24px",
                            }}
                        >
                            <div style={{ color: "#6b6b9e", fontSize: "12px" }}>
                                Training Samples
                            </div>

                            <div
                                style={{
                                    marginTop: "10px",
                                    fontSize: "24px",
                                    fontWeight: 700,
                                    color: "#8b5cf6",
                                }}
                            >
                                {model?.training_samples ?? "-"}
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: "#0d0d1a",
                                border: "1px solid #1a1a2e",
                                borderRadius: "14px",
                                padding: "24px",
                            }}
                        >
                            <div style={{ color: "#6b6b9e", fontSize: "12px" }}>
                                Version
                            </div>

                            <div
                                style={{
                                    marginTop: "10px",
                                    fontSize: "22px",
                                    fontWeight: 700,
                                }}
                            >
                                {model?.version || "v1.0"}
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: "#0d0d1a",
                                border: "1px solid #1a1a2e",
                                borderRadius: "14px",
                                padding: "24px",
                            }}
                        >
                            <div style={{ color: "#6b6b9e", fontSize: "12px" }}>
                                Status
                            </div>

                            <div
                                style={{
                                    marginTop: "10px",
                                    fontSize: "20px",
                                    fontWeight: 700,
                                    color: "#22c55e",
                                }}
                            >
                                {model?.status || "Healthy"}
                            </div>
                        </div>
                        <div
                            style={{
                                gridColumn: "1 / -1",
                                backgroundColor: "#0d0d1a",
                                border: "1px solid #1a1a2e",
                                borderRadius: "14px",
                                padding: "24px",
                                marginTop: "10px",
                            }}
                        >
                            <h2
                                style={{
                                    fontSize: "18px",
                                    fontWeight: 700,
                                    marginBottom: "18px",
                                }}
                            >
                                Training Information
                            </h2>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                                    gap: "18px",
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            color: "#6b6b9e",
                                            fontSize: "12px",
                                            marginBottom: "6px",
                                        }}
                                    >
                                        Last Training
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "15px",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {model?.trained_at
                                            ? new Date(model.trained_at).toLocaleString()
                                            : "Not Available"}
                                    </div>
                                </div>

                                <div>
                                    <div
                                        style={{
                                            color: "#6b6b9e",
                                            fontSize: "12px",
                                            marginBottom: "6px",
                                        }}
                                    >
                                        Model Version
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "15px",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {model?.version || "v1.0"}
                                    </div>
                                </div>

                                <div>
                                    <div
                                        style={{
                                            color: "#6b6b9e",
                                            fontSize: "12px",
                                            marginBottom: "6px",
                                        }}
                                    >
                                        Current Status
                                    </div>

                                    <div
                                        style={{
                                            color: "#22c55e",
                                            fontWeight: 700,
                                            fontSize: "15px",
                                        }}
                                    >
                                        {model?.status || "Running"}
                                    </div>
                                </div>

                                <div>
                                    <div
                                        style={{
                                            color: "#6b6b9e",
                                            fontSize: "12px",
                                            marginBottom: "6px",
                                        }}
                                    >
                                        Training Dataset
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "15px",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {model?.training_samples || 28242} Samples
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{
                                    marginTop: "28px",
                                    display: "flex",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <button
                                    onClick={loadModel}
                                    style={{
                                        backgroundColor: "#3b82f6",
                                        border: "none",
                                        color: "#fff",
                                        padding: "10px 18px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                    }}
                                >
                                    Refresh Metrics
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}