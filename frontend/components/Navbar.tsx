"use client"
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar({ role }: { role?: "Farmer" | "Admin" }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-lg border-b border-white/5" : "bg-transparent border-transparent"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="text-black text-sm font-black">Y</span>
          </div>
          YieldSense
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/dashboard" className="text-textSecondary hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/onboarding" className="text-textSecondary hover:text-primary transition-colors">
            Farms
          </Link>
          {role && (
            <span className="border border-primary/20 bg-primary/10 text-primary px-3 py-1 rounded-full font-mono text-xs shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              {role}
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
