import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("farmer1@yieldsense.ai");
  const [password, setPassword] = useState("YieldSense@123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to sign in. Check your credentials.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="bg-rows relative hidden w-1/2 flex-col justify-between bg-pine-800 p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="#122c26" strokeWidth="2.2" className="h-5 w-5">
              <path d="M12 21c-4-2-7-6-7-11a7 7 0 0114 0c0 5-3 9-7 11z" />
              <path d="M12 13v-4M9 9l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-display text-lg font-semibold text-white">YieldSense AI</span>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold-300">
            Crop Yield Prediction &amp; Agricultural Forecasting
          </p>
          <h1 className="max-w-md font-display text-4xl font-semibold leading-tight text-white">
            Data-driven decisions for every hectare.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-pine-200">
            Forecast yield, read soil and weather signals, and get an automated
            agronomic recommendation for every crop cycle — powered by a
            trained machine learning pipeline.
          </p>
        </div>

        <div className="flex gap-8 text-white">
          <div>
            <p className="font-mono text-2xl font-semibold">98.2%</p>
            <p className="text-xs text-pine-300">Model R² on validation</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-semibold">8</p>
            <p className="text-xs text-pine-300">Crop profiles supported</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-semibold">5</p>
            <p className="text-xs text-pine-300">Role-based access levels</p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-canvas px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h2 className="mb-1 text-2xl font-semibold">Welcome back</h2>
          <p className="mb-8 text-sm text-pine-500">Sign in to your YieldSense AI account.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label-field">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label-field">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-risk-high">{error}</p>}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-pine-100 bg-white p-3.5 text-xs text-pine-500">
            <p className="mb-1 font-semibold text-pine-700">Demo accounts (password: YieldSense@123)</p>
            <p>farmer1@yieldsense.ai · consultant@yieldsense.ai · admin@yieldsense.ai</p>
          </div>

          <p className="mt-6 text-center text-sm text-pine-500">
            New to YieldSense AI?{" "}
            <Link to="/register" className="font-semibold text-pine-700 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
