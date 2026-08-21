import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YieldSense AI",
  description:
    "AI-powered crop yield prediction and agricultural productivity forecasting",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}