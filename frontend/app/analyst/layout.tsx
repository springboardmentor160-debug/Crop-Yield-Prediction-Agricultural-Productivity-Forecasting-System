// app/analyst/layout.tsx
// One guard + nav for every /analyst/* page — replaces the copy-pasted
// localStorage/router-push block that used to live at the top of each
// individual analyst page.
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser, SessionUser } from "@/lib/auth";
import AnalystNav from "@/components/analyst/AnalystNav";

export default function AnalystLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    const current = getUser();

    if (!token || !current) {
      router.push("/");
      return;
    }
    if (current.role !== "Analyst" && current.role !== "Admin") {
      router.push("/dashboard");
      return;
    }

    setUser(current);
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-[var(--color-ink-soft)] text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      <AnalystNav user={user} />
      <main className="flex-1 p-6 lg:p-10 max-w-[1400px]">{children}</main>
    </div>
  );
}
