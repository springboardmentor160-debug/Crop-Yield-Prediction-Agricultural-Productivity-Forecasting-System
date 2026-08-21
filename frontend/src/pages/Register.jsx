import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { value: "farmer", label: "Farmer" },
  { value: "cooperative_manager", label: "Cooperative Manager" },
  { value: "agri_consultant", label: "Agricultural Consultant" },
  { value: "gov_official", label: "Government Official" },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "farmer",
    organization: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="#122c26" strokeWidth="2.2" className="h-5 w-5">
              <path d="M12 21c-4-2-7-6-7-11a7 7 0 0114 0c0 5-3 9-7 11z" />
              <path d="M12 13v-4M9 9l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-display text-lg font-semibold text-pine-900">YieldSense AI</span>
        </div>

        <h2 className="mb-1 text-2xl font-semibold">Create your account</h2>
        <p className="mb-8 text-sm text-pine-500">Start forecasting yield for your farm in minutes.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label-field">Full name</label>
            <input required className="input-field" value={form.full_name} onChange={update("full_name")} placeholder="Jane Farmer" />
          </div>
          <div>
            <label className="label-field">Email address</label>
            <input type="email" required className="input-field" value={form.email} onChange={update("email")} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label-field">Password</label>
            <input type="password" required minLength={8} className="input-field" value={form.password} onChange={update("password")} placeholder="At least 8 characters" />
          </div>
          <div>
            <label className="label-field">Role</label>
            <select className="input-field" value={form.role} onChange={update("role")}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Organization (optional)</label>
            <input className="input-field" value={form.organization} onChange={update("organization")} placeholder="Cooperative or company name" />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-risk-high">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-pine-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-pine-700 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
