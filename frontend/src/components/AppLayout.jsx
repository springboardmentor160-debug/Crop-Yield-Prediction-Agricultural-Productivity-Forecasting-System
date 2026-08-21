import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { to: "/farms", label: "Farms", icon: "sprout" },
  { to: "/predictions", label: "Yield Prediction", icon: "trending-up" },
  { to: "/recommendations", label: "Recommendations", icon: "lightbulb" },
  { to: "/analytics", label: "Analytics", icon: "bar-chart" },
];

const ICONS = {
  "layout-dashboard": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
      <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  sprout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
      <path d="M7 20h10M12 20v-8" strokeLinecap="round" />
      <path d="M12 12c0-3 -2-5-6-5 0 4 2 6 6 6" />
      <path d="M12 12c0-4 2-7 7-7 0 5 -2 8-7 7" />
    </svg>
  ),
  "trending-up": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
      <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  lightbulb: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
      <path d="M9 18h6M10 22h4" strokeLinecap="round" />
      <path d="M12 2a7 7 0 00-4 12.7c.5.4.8 1 .8 1.7V17h6.4v-.6c0-.7.3-1.3.8-1.7A7 7 0 0012 2z" />
    </svg>
  ),
  "bar-chart": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
      <path d="M4 20V10M12 20V4M20 20v-7" strokeLinecap="round" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
      <circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 3-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16 8.5a3 3 0 110-5.9M21.5 20c0-3-2-5.2-4.8-5.8" strokeLinecap="round" />
    </svg>
  ),
};

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = user?.role === "admin" || user?.role === "gov_official"
    ? [...NAV_ITEMS, { to: "/users", label: "Users", icon: "users" }]
    : NAV_ITEMS;

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="bg-rows relative flex w-64 flex-col bg-pine-800 px-4 py-6">
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="#122c26" strokeWidth="2.2" className="h-5 w-5">
              <path d="M12 21c-4-2-7-6-7-11a7 7 0 0114 0c0 5-3 9-7 11z" />
              <path d="M12 13v-4M9 9l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="font-display text-base font-semibold leading-none text-white">YieldSense</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-gold-300">AI Platform</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
            >
              {ICONS[item.icon]}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-3.5">
          <p className="truncate text-sm font-semibold text-white">{user?.full_name}</p>
          <p className="mt-0.5 text-xs capitalize text-pine-200">{user?.role?.replace("_", " ")}</p>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="mt-3 w-full rounded-md border border-white/15 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
