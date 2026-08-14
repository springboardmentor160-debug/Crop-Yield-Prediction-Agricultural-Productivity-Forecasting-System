"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "./sidebar.css";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menu = [
    { name: "Dashboard", icon: "🏠", path: "/dashboard" },
    { name: "Farm Profile", icon: "🚜", path: "/farm-profile" },
    { name: "AI Prediction", icon: "🤖", path: "/dashboard/predict" },
    { name: "Soil Analysis", icon: "🌱", path: "/dashboard/soil" },
    { name: "Weather", icon: "☁️", path: "/dashboard/weather" },
    { name: "Analytics", icon: "📊", path: "/dashboard/analytics" },
    { name: "Recommendation", icon: "💡", path: "/dashboard/recommendation" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("email");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    router.replace("/login");
  };

  return (
    <aside className="sidebar">

      <h2 className="logo">🌾 YieldSense AI</h2>

      <div className="menu">
        {menu.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={pathname === item.path ? "menuItem active" : "menuItem"}
          >
            <span>{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </div>

      <button className="logout" onClick={handleLogout}>
        🚪 Logout
      </button>

    </aside>
  );
}