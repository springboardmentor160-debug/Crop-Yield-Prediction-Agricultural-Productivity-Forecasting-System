import AnalystShell from "@/components/layout/AnalystShell";

export default function AnalystLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnalystShell>{children}</AnalystShell>;
}
