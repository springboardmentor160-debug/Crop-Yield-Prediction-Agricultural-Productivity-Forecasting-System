"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: "🏠" },
    { name: "Prediction", href: "/prediction", icon: "🌾" },
    { name: "Weather", href: "/weather", icon: "🌦️" },
    { name: "Soil Health", href: "/soil", icon: "🌱" },
    { name: "History", href: "/history", icon: "📜" },
    { name: "Farm Profile", href: "/farm-profile", icon: "👨‍🌾" },
    { name: "Analytics", href: "/analytics", icon: "📊" },
  ];

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "240px",
        height: "100vh",
        background: "#1B5E20",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          color: "white",
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        🌾 YieldSense AI
      </h2>

      {menuItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          style={{
            display: "block",
            textDecoration: "none",
            padding: "14px",
            marginBottom: "10px",
            borderRadius: "10px",
            fontWeight: "bold",
            color: pathname === item.href ? "#1B5E20" : "white",
            background:
              pathname === item.href ? "#A5D6A7" : "transparent",
          }}
        >
          {item.icon} {item.name}
        </Link>
      ))}

      <div style={{ marginTop: "auto" }}>
        <Link
          href="/login"
          style={{
            display: "block",
            textDecoration: "none",
            background: "#C62828",
            color: "white",
            padding: "14px",
            borderRadius: "10px",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          🚪 Logout
        </Link>
      </div>
    </aside>
  );
}