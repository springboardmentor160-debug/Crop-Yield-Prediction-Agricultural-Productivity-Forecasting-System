"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profile = await api.getProfile();
      setUser(profile);
      setFullName(profile.full_name);
      setEmail(profile.email);
    } catch (err) {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const updated = await api.updateProfile({ full_name: fullName });
      setUser(updated);
      setMessage("Profile updated successfully.");
    } catch (err: unknown) {
      setMessage("Update failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500">Manage account details and role settings.</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl shadow-sm border p-8 text-center text-gray-500">Loading profile...</div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  value={email}
                  disabled
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50"
                />
              </div>
            </div>

            <button
              onClick={handleUpdate}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700"
            >
              Save Changes
            </button>
            {message && <div className="mt-4 text-sm text-green-700">{message}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
