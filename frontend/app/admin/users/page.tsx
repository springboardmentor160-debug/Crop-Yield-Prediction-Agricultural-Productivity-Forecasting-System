"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export default function ManageUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    const userData = localStorage.getItem("user");
    if (userData && JSON.parse(userData).role !== "Admin") { router.push("/"); return; }
    load();
  }, []);

  const load = async () => {
    try {
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (id: number, role: string) => {
    try {
      await api.updateUserRole(id, role);
      setUsers(users.map(u => (u.id === id ? { ...u, role } : u)));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Unknown error");
    }
  };

  const removeUser = async (id: number, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await api.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Unknown error");
    }
  };

  const filtered = users.filter(
    u =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = (role: string) => {
    if (role === "Admin") return "#ef4444";
    if (role === "Analyst") return "#3b82f6";
    return "#22c55e";
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a14", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#ffffff" }}>
      <nav style={{ backgroundColor: "#0d0d1a", borderBottom: "1px solid #1a1a2e", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={() => router.push("/admin")} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: "13px" }}>← Back to Admin</button>
        <span style={{ color: "#4a4a7a", fontSize: "13px" }}>/ Manage Users</span>
      </nav>

      <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800 }}>Manage Users</h1>
            <p style={{ fontSize: "13px", color: "#6b6b9e" }}>{users.length} registered accounts</p>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email..."
            style={{ backgroundColor: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "8px 14px", color: "#fff", fontSize: "13px", width: "260px" }}
          />
        </div>

        {error && <div style={{ color: "#ef4444", marginBottom: "16px" }}>{error}</div>}

        {loading ? (
          <div style={{ color: "#6b6b9e", textAlign: "center", padding: "60px 0" }}>Loading users...</div>
        ) : (
          <div style={{ backgroundColor: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1fr", gap: "12px", padding: "12px 20px", backgroundColor: "#0a0a14", fontSize: "11px", color: "#4a4a7a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <div>Name</div><div>Email</div><div>Role</div><div>Joined</div><div>Actions</div>
            </div>
            {filtered.map(u => (
              <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1fr", gap: "12px", padding: "14px 20px", borderTop: "1px solid #1a1a2e", alignItems: "center" }}>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{u.full_name}</div>
                <div style={{ fontSize: "13px", color: "#6b6b9e" }}>{u.email}</div>
                <select
                  value={u.role}
                  onChange={e => changeRole(u.id, e.target.value)}
                  style={{ backgroundColor: "#0a0a14", border: `1px solid ${roleColor(u.role)}40`, color: roleColor(u.role), borderRadius: "6px", padding: "5px 8px", fontSize: "12px", fontWeight: 600 }}
                >
                  <option value="Farmer">Farmer</option>
                  <option value="Analyst">Analyst</option>
                  <option value="Admin">Admin</option>
                </select>
                <div style={{ fontSize: "12px", color: "#4a4a7a" }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"}</div>
                <button
                  onClick={() => removeUser(u.id, u.full_name)}
                  style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", padding: "5px 12px", color: "#ef4444", cursor: "pointer", fontSize: "12px", width: "fit-content" }}
                >
                  Delete
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: "40px", textAlign: "center", color: "#4a4a7a", fontSize: "13px" }}>No users match your search.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}