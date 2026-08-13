"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setSession, redirectPathForRole } from "@/lib/auth";

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // NEW: single place that decides where each role lands after auth.
  // Keep this in sync with whatever routes actually exist under app/.
  const redirectForRole = (role: string) => {
    switch (role) {
      case "Admin":
        router.push("/admin");
        break;
      case "Analyst":
        router.push("/analyst");
        break;
      default:
        router.push("/dashboard");
    }
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
      setSession(data.access_token, data.user);
      router.push(redirectPathForRole(data.user.role));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--color-bg)]">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-[var(--color-primary)] text-white p-12">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-sm">
            🌾
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            YieldSense AI
          </span>
        </div>

        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight mb-4">
            Know your yield
            <br />
            before you sow it.
          </h1>
          <p className="text-white/70 max-w-sm text-[15px] leading-relaxed">
            Soil, weather, and field data turned into forecasts and
            recommendations you can act on this season.
          </p>
        </div>

        <div className="flex gap-6 text-sm text-white/60 font-mono-num">
          <div>
            <div className="text-2xl text-white font-semibold">92%</div>
            forecast accuracy
          </div>
          <div>
            <div className="text-2xl text-white font-semibold">12k+</div>
            farms tracked
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="text-2xl">🌾</span>
            <span className="font-display text-lg font-semibold text-[var(--color-primary)]">
              YieldSense AI
            </span>
          </div>

          <h2 className="font-display text-2xl font-semibold mb-1">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-[var(--color-ink-soft)] text-sm mb-6">
            {isLogin
              ? "Sign in to view your farms and forecasts."
              : "Set up your account to start forecasting yield."}
          </p>

          <div className="flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-1 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                isLogin
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                !isLogin
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required={!isLogin}
                  placeholder="John Farmer"
                  className="w-full border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="farmer@example.com"
                className="w-full border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]"
                >
                  <option value="Farmer">Farmer</option>
                  <option value="Admin">Admin</option>
                  <option value="Analyst">Analyst</option>
                </select>
              </div>
            )}

            {error && (
              <div className="bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 text-[var(--color-danger)] text-sm rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Please wait…" : isLogin ? "Log in" : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--color-ink-soft)] mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-[var(--color-primary)] font-medium hover:underline"
            >
              {isLogin ? "Register" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}