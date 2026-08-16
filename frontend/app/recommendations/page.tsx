"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface RecommendationItem {
  category: string;
  description: string;
  priority: string;
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const data = await api.getRecommendations();
      setRecommendations(data.recommendations || data);
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
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
          <span className="text-2xl">💡</span>
          <span className="text-xl font-bold">Recommendations</span>
        </div>
        <Link
          href="/recommendations/predict"
          className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
        >
          Predict Yield
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">AI Farm Recommendations</h1>
          <p className="text-gray-500 text-sm">Insights and guidance based on your farm and environmental data.</p>
        </div>

        <div className="grid gap-6">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border p-6 text-center text-gray-500">Loading recommendations...</div>
          ) : recommendations.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border p-6 text-center text-gray-500">
              No recommendations available yet.
            </div>
          ) : (
            recommendations.map((rec, idx) => (
              <div key={idx} className="bg-white rounded-3xl shadow-sm border p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{rec.category}</h2>
                    <p className="text-sm text-gray-500 mt-1">Priority: {rec.priority}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-700">{rec.priority}</span>
                </div>
                <p className="text-sm text-gray-600">{rec.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
