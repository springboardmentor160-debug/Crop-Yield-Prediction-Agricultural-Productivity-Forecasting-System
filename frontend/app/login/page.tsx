"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import FieldInput from "@/components/FieldInput";
import { api, storeSession } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await api.login(email, password);
      storeSession(token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

      <div className="w-full max-w-md z-10 animate-fade-in">
        <Link href="/" className="inline-block mb-8 text-primary hover:text-emerald-400 transition-colors font-medium text-sm flex items-center gap-2">
          ← Back to Home
        </Link>
        
        <div className="glass-panel rounded-2xl p-8 md:p-10">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-textSecondary">Access your predictive dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldInput
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              autoComplete="email"
            />
            <FieldInput
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            {error && (
              <div role="alert" className="bg-danger/10 border border-danger/30 rounded-lg p-4">
                <p className="text-sm text-danger font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-danger inline-block"></span>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary mt-2 flex justify-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Authenticating...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-textSecondary">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:text-emerald-400 font-medium transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
