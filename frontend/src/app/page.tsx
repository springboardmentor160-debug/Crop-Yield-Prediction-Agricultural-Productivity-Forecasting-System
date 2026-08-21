/**
 * YieldSense AI  -  Landing Page
 *
 * Specific, honest, and practical.
 * No gradient blobs, no gradient text, no fabricated statistics.
 */

"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3, Cloud, Layers, Shield, ArrowRight,
} from "lucide-react";
import { ROUTES } from "@/utils/constants";
import Button from "@/components/ui/Button";

const features = [
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Crop Yield Prediction",
    description:
      "Enter your farm conditions  -  soil nutrients, rainfall, temperature  -  and get a predicted yield in tonnes per hectare using a machine learning model trained on historical agricultural data.",
  },
  {
    icon: <Cloud className="h-5 w-5" />,
    title: "Real-time Weather Data",
    description:
      "Pull live weather conditions and a 7-day forecast for any farm location. Understand how upcoming weather patterns will affect your current crop cycle.",
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: "Soil Health Analysis",
    description:
      "Analyze nitrogen, phosphorus, potassium, and soil pH for any of your farms. Get targeted fertilizer and irrigation recommendations based on your actual readings.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Risk Assessment",
    description:
      "Automatically detect drought risk, heat stress, soil deficiency, and other crop threats. Each risk comes with a clear explanation and a specific mitigation step.",
  },
];

const steps = [
  {
    num: "1",
    title: "Create your account",
    description: "Register as a farmer. Set up your account in under a minute.",
  },
  {
    num: "2",
    title: "Add your farms",
    description: "Enter farm name, location, crop type, area, and soil data. Save multiple farms.",
  },
  {
    num: "3",
    title: "Run a prediction",
    description: "Input crop and environmental data. Get a yield forecast with risk and recommendation analysis.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" style={{ zoom: "175%" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#1a6b3c] flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 1.5C7 1.5 2.5 4 2.5 8C2.5 10.5 4.5 12.5 7 12.5C9.5 12.5 11.5 10.5 11.5 8C11.5 4 7 1.5 7 1.5Z" fill="white" fillOpacity="0.9"/>
                  <path d="M7 5V12.5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">YieldSense AI</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href={ROUTES.SIGNUP}>
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#1a6b3c] mb-3 uppercase tracking-wide">
              Agricultural Yield Forecasting
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
              Forecast crop yields.<br />
              Make better farming decisions.
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6 max-w-xl">
              YieldSense AI predicts crop yields using soil data, weather conditions, and
              historical records. Understand your risk, get fertilizer recommendations, and
              plan your season with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={ROUTES.SIGNUP}>
                <Button size="lg">
                  Create free account <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={ROUTES.LOGIN}>
                <Button variant="outline" size="lg">
                  Sign in to your account
                </Button>
              </Link>
            </div>

            {/* Honest capability markers */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
              {[
                "50+ supported crop types",
                "Real-time weather data",
                "Soil NPK analysis",
                "Free to use",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1a6b3c] shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              What YieldSense AI does
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              A set of practical tools for farmers to understand their land, plan their crops, and reduce uncertainty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6"
              >
                <div className="w-9 h-9 rounded-md bg-[#e8f5ec] dark:bg-green-900/20 flex items-center justify-center text-[#1a6b3c] dark:text-green-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              How it works
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Three steps from signup to your first prediction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-[#1a6b3c] text-[#1a6b3c] text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1a6b3c] rounded-lg px-8 py-12 sm:px-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Start using YieldSense AI today
            </h2>
            <p className="text-green-100 max-w-md mx-auto mb-8 text-sm leading-relaxed">
              Create a free account, add your farm, and run your first crop yield prediction
              in under five minutes.
            </p>
            <Link href={ROUTES.SIGNUP}>
              <Button
                variant="outline"
                size="lg"
                className="bg-white text-[#1a6b3c] border-white hover:bg-green-50 hover:border-green-50"
              >
                Create free account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#1a6b3c] flex items-center justify-center shrink-0">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 1.5C7 1.5 2.5 4 2.5 8C2.5 10.5 4.5 12.5 7 12.5C9.5 12.5 11.5 10.5 11.5 8C11.5 4 7 1.5 7 1.5Z" fill="white" fillOpacity="0.9"/>
                  <path d="M7 5V12.5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">YieldSense AI</span>
            </div>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} YieldSense AI. Crop yield prediction and agricultural forecasting.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
