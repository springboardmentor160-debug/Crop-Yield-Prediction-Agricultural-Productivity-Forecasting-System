"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Farm } from "@/lib/types";

export default function ManageFarmsPage() {
    const router = useRouter();

    const [farms, setFarms] = useState<Farm[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
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

        loadFarms();
    }, []);

    async function loadFarms() {
        try {
            const data = await api.getAllFarmsAdmin();
            setFarms(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    async function deleteFarm(id: number, name: string) {
        if (!confirm(`Delete farm "${name}" ?`)) return;

        try {
            await api.deleteFarmAdmin(id);

            setFarms(farms.filter(f => f.id !== id));
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Unknown error");
        }
    }

    const filtered = farms.filter(f =>
        (f.farm_name && f.farm_name.toLowerCase().includes(search.toLowerCase())) ||
        (f.location && f.location.toLowerCase().includes(search.toLowerCase())) ||
        (f.soil_type && f.soil_type.toLowerCase().includes(search.toLowerCase()))
    );
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
                    / Manage Farms
                </span>
            </nav>

            <div
                style={{
                    maxWidth: "1300px",
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
                                fontSize: "22px",
                                fontWeight: 800,
                            }}
                        >
                            Manage Farms
                        </h1>

                        <p
                            style={{
                                color: "#6b6b9e",
                                fontSize: "13px",
                            }}
                        >
                            {farms.length} registered farms
                        </p>
                    </div>

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search farm..."
                        style={{
                            width: "260px",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #1a1a2e",
                            backgroundColor: "#0d0d1a",
                            color: "#ffffff",
                        }}
                    />
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
                            color: "#6b6b9e",
                            padding: "60px",
                        }}
                    >
                        Loading farms...
                    </div>
                ) : (
                    <div
                        style={{
                            backgroundColor: "#0d0d1a",
                            borderRadius: "14px",
                            border: "1px solid #1a1a2e",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "1.4fr 1.2fr 1fr 1fr 1fr 1fr 1fr",
                                padding: "14px 20px",
                                backgroundColor: "#0a0a14",
                                color: "#6b6b9e",
                                fontSize: "11px",
                                textTransform: "uppercase",
                                letterSpacing: ".05em",
                            }}
                        >
                            <div>Name</div>
                            <div>Location</div>
                            <div>Crop</div>
                            <div>Soil</div>
                            <div>Area</div>
                            <div>Created</div>
                            <div>Actions</div>
                        </div>
                        {filtered.map((farm) => (
                            <div
                                key={farm.id}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "1.4fr 1.2fr 1fr 1fr 1fr 1fr 1fr",
                                    padding: "16px 20px",
                                    borderTop: "1px solid #1a1a2e",
                                    alignItems: "center",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: 600,
                                    }}
                                >
                                    {farm.farm_name}
                                </div>

                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "#9ca3af",
                                    }}
                                >
                                    {farm.location}
                                </div>

                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "#22c55e",
                                        fontWeight: 600,
                                    }}
                                >
                                    {farm.soil_type || "—"}
                                </div>

                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "#f59e0b",
                                    }}
                                >
                                    {farm.area_hectares} ha
                                </div>

                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "#6b6b9e",
                                    }}
                                >
                                    {new Date(farm.created_at).toLocaleDateString()}
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                    }}
                                >
                                    <button
                                        onClick={() =>
                                            router.push(`/admin/farms/${farm.id}`)
                                        }
                                        style={{
                                            padding: "6px 12px",
                                            border: "none",
                                            borderRadius: "6px",
                                            backgroundColor: "#3b82f6",
                                            color: "#fff",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                        }}
                                    >
                                        View
                                    </button>

                                    <button
                                        onClick={() =>
                                            deleteFarm(farm.id, farm.farm_name)
                                        }
                                        style={{
                                            padding: "6px 12px",
                                            border: "none",
                                            borderRadius: "6px",
                                            backgroundColor: "#ef4444",
                                            color: "#fff",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}

                        {filtered.length === 0 && (
                            <div
                                style={{
                                    padding: "50px",
                                    textAlign: "center",
                                    color: "#6b6b9e",
                                }}
                            >
                                No farms found.
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}