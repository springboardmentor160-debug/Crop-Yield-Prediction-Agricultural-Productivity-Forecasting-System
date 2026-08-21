/**
 * YieldSense AI  -  Root Layout
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "YieldSense AI  -  Crop Yield Prediction & Agricultural Forecasting",
  description:
    "AI-powered Crop Yield Prediction and Agricultural Productivity Forecasting System. Help farmers make better farming decisions using historical crop data, weather, and soil analysis.",
  keywords: [
    "crop yield prediction",
    "agriculture",
    "AI farming",
    "yield forecasting",
    "smart agriculture",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'system';
                  var dark = false;
                  if (theme === 'dark') {
                    dark = true;
                  } else if (theme === 'system') {
                    dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  }
                  if (dark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "12px",
                background: "#1e293b",
                color: "#f1f5f9",
                fontSize: "14px",
              },
              success: {
                iconTheme: {
                  primary: "#16a34a",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
