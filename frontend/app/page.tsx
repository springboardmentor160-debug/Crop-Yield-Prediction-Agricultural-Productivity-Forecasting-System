"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
 
export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "Farmer",
  });
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let data;
      if (isLogin) {
        data = await api.login({ email: form.email, password: form.password });
      } else {
        data = await api.register(form);
      }
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
 
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🌾</div>
          <h1 className="text-3xl font-bold text-green-700">YieldSense AI</h1>
          <p className="text-gray-500 text-sm mt-1">
            AI-powered Agricultural Forecasting
          </p>
        </div>
 
        {/* Tab Switch */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              isLogin ? "bg-white shadow text-green-700" : "text-gray-500"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              !isLogin ? "bg-white shadow text-green-700" : "text-gray-500"
            }`}
          >
            Register
          </button>
        </div>
 
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required={!isLogin}
                placeholder="John Farmer"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
 
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="farmer@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
 
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
 
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Farmer">Farmer</option>
                <option value="Admin">Admin</option>
                <option value="Analyst">Analyst</option>
              </select>
            </div>
          )}
 
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}
 
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>
 
        <p className="text-center text-sm text-gray-500 mt-6">
          {isLogin ? "Do not have an account? " : "Already have an account? "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-green-600 font-medium hover:underline"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}