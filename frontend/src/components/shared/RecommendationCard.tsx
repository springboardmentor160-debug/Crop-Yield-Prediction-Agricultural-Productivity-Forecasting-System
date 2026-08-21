/**
 * YieldSense AI  -  Recommendation Card Component
 */

"use client";

import React, { useState } from "react";
import {
  Lightbulb, ChevronDown, ChevronUp, Sprout, Droplets,
  Scissors, CheckCircle, TrendingUp, FlaskConical,
} from "lucide-react";
import type { RecommendationResponse } from "@/types/m3types";

interface Props {
  recommendations: RecommendationResponse;
  compact?: boolean;
}

interface SectionProps {
  sectionId: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  accent?: string;
}

function Section({ title, icon, isOpen, onToggle, children, accent = "text-green-600" }: SectionProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className={accent}>{icon}</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
        </div>
        <span className="text-gray-400">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>
      {isOpen && (
        <div className="p-3 bg-white dark:bg-gray-900/30 space-y-2 animate-in border-t border-gray-100 dark:border-gray-800">
          {children}
        </div>
      )}
    </div>
  );
}

const SUITABILITY_COLORS: Record<string, string> = {
  Excellent: "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  Good: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  Fair: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
};

export default function RecommendationCard({ recommendations: rec, compact = false }: Props) {
  // Single active accordion section state
  const [activeSectionId, setActiveSectionId] = useState<string | null>("crops");

  const handleToggleSection = (sectionId: string) => {
    setActiveSectionId((prev) => (prev === sectionId ? null : sectionId));
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
      {/* Green accent top bar */}
      <div className="h-1.5 w-full bg-[#1a6b3c]" />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
          <Lightbulb className="h-5 w-5 text-[#1a6b3c]" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">Agricultural Recommendations</h3>
            <p className="text-xs text-gray-500">Confidence: {rec.confidence} · Rule-based analysis</p>
          </div>
        </div>

        {/* Crop Alternatives */}
        {rec.crop_recommendations && rec.crop_recommendations.length > 0 && (
          <Section
            sectionId="crops"
            title="Alternative Crops"
            icon={<Sprout className="h-4 w-4" />}
            isOpen={activeSectionId === "crops"}
            onToggle={() => handleToggleSection("crops")}
            accent="text-emerald-600"
          >
            <div className="grid grid-cols-1 gap-2">
              {rec.crop_recommendations.map((cr, i) => (
                <div key={i} className={`flex items-start gap-3 p-2 rounded-lg border ${SUITABILITY_COLORS[cr.suitability] || ""}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{cr.crop}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded font-medium border">{cr.suitability}</span>
                    </div>
                    <p className="text-xs mt-0.5 opacity-80">{cr.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Fertilizer Recommendations */}
        {rec.fertilizer_recommendations && rec.fertilizer_recommendations.length > 0 && (
          <Section
            sectionId="fertilizers"
            title="Fertilizer Corrections"
            icon={<FlaskConical className="h-4 w-4" />}
            isOpen={activeSectionId === "fertilizers"}
            onToggle={() => handleToggleSection("fertilizers")}
            accent="text-blue-600"
          >
            <div className="space-y-2">
              {rec.fertilizer_recommendations.map((fr, i) => {
                const pct = fr.target_level > 0 ? (fr.current_level / fr.target_level) * 100 : 100;
                const barColor = pct < 50 ? "bg-red-500" : pct < 75 ? "bg-amber-500" : "bg-green-500";
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{fr.nutrient}</span>
                      <span className="text-gray-500">{fr.current_level.toFixed(0)}/{fr.target_level.toFixed(0)} kg/ha</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                    <p className="text-xs text-gray-500">{fr.application_rate}</p>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Irrigation */}
        {rec.irrigation_advice && (
          <Section
            sectionId="irrigation"
            title="Irrigation Advice"
            icon={<Droplets className="h-4 w-4" />}
            isOpen={activeSectionId === "irrigation"}
            onToggle={() => handleToggleSection("irrigation")}
            accent="text-cyan-600"
          >
            <p className="text-sm text-gray-700 dark:text-gray-300">{rec.irrigation_advice}</p>
            {rec.irrigation_frequency && (
              <p className="text-xs text-gray-500 mt-1">
                <span className="font-semibold">Frequency:</span> {rec.irrigation_frequency}
              </p>
            )}
          </Section>
        )}

        {/* Best Practices */}
        {!compact && rec.best_practices && rec.best_practices.length > 0 && (
          <Section
            sectionId="practices"
            title="Best Farming Practices"
            icon={<CheckCircle className="h-4 w-4" />}
            isOpen={activeSectionId === "practices"}
            onToggle={() => handleToggleSection("practices")}
            accent="text-purple-600"
          >
            <ul className="space-y-1.5">
              {rec.best_practices.map((bp, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="h-3.5 w-3.5 text-purple-500 mt-0.5 shrink-0" />
                  {bp}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Yield Improvement */}
        {!compact && rec.yield_improvement_tips && rec.yield_improvement_tips.length > 0 && (
          <Section
            sectionId="tips"
            title="Yield Improvement Tips"
            icon={<TrendingUp className="h-4 w-4" />}
            isOpen={activeSectionId === "tips"}
            onToggle={() => handleToggleSection("tips")}
            accent="text-amber-600"
          >
            <ul className="space-y-1.5">
              {rec.yield_improvement_tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <TrendingUp className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
            {rec.estimated_yield_improvement && (
              <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">{rec.estimated_yield_improvement}</p>
              </div>
            )}
          </Section>
        )}

        {/* Harvest */}
        {!compact && rec.harvest_suggestions && rec.harvest_suggestions.length > 0 && (
          <Section
            sectionId="harvest"
            title="Harvest Suggestions"
            icon={<Scissors className="h-4 w-4" />}
            isOpen={activeSectionId === "harvest"}
            onToggle={() => handleToggleSection("harvest")}
            accent="text-rose-600"
          >
            <ul className="space-y-1.5">
              {rec.harvest_suggestions.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Scissors className="h-3.5 w-3.5 text-rose-500 mt-0.5 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800 pt-2">
          {rec.disclaimer}
        </p>
      </div>
    </div>
  );
}
