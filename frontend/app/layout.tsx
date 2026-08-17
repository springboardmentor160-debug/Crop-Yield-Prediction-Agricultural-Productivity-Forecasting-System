import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YieldSense AI",
  description: "AI Crop Yield Prediction & Agricultural Productivity Forecasting System"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
