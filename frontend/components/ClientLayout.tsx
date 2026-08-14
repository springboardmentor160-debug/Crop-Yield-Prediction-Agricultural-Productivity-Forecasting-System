"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const showSidebar =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/farm-profile");

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Public pages
    if (
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/"
    ) {
      return;
    }

    // Redirect to login if not logged in
    if (!token) {
    router.replace("/login");
}
  }, [pathname, router]);

  return (
    <>
      {showSidebar && <Sidebar />}

      <main className={showSidebar ? "mainContent" : ""}>
        {children}
      </main>
    </>
  );
}