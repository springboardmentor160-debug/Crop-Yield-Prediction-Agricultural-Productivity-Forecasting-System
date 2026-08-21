/**
 * YieldSense AI  -  Dashboard Layout (Server Component)
 *
 * Server wrapper that forces dynamic rendering and renders the client layout.
 */

import DashboardShell from "./_components/DashboardShell";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
