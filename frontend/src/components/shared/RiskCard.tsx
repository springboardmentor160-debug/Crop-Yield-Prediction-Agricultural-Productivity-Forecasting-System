/**
 * YieldSense AI  -  Risk Assessment Card Component
 */

"use client";

import React, { useState } from "react";
import {
  AlertTriangle, ShieldCheck, ShieldAlert, ShieldX,
  ChevronDown, ChevronUp, Zap, AlertCircle,
} from "lucide-react";
import type { RiskAssessmentResponse, RiskItem } from "@/types/m3types";

interface Props {
  risk: RiskAssessmentResponse;
  compact?: boolean;
}

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  Low: {
    bg: "bg-green-50 dark:bg-green-950/20",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  Medium: {
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  High: {
    bg: "bg-orange-50 dark:bg-orange-950/20",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
    icon: <ShieldAlert className="h-4 w-4" />,
  },
  Critical: {
    bg: "bg-red-50 dark:bg-red-950/20",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    icon: <ShieldX className="h-4 w-4" />,
  },
};

const OVERALL_STYLES: Record<string, { badge: string; icon: React.ReactNode }> = {
  Low: {
    badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    icon: <ShieldCheck className="h-5 w-5 text-green-600" />,
  },
  Medium: {
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
  },
  High: {
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
  },
  Critical: {
    badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    icon: <ShieldX className="h-5 w-5 text-red-600" />,
  },
};

interface RiskItemRowProps {
  riskItem: RiskItem;
  isOpen: boolean;
  onToggle: () => void;
}

function RiskItemRow({ riskItem, isOpen, onToggle }: RiskItemRowProps) {
  const style = SEVERITY_STYLES[riskItem.severity] || SEVERITY_STYLES.Low;

  return (
    <div className={`rounded-lg border ${style.border} overflow-hidden`}>
      <button
        type="button"
        className={`w-full flex items-center justify-between p-3 ${style.bg} hover:opacity-90 transition-opacity text-left cursor-pointer`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className={style.text}>{style.icon}</span>
          <span className={`text-sm font-semibold ${style.text}`}>{riskItem.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.bg} ${style.text} border ${style.border}`}>
            {riskItem.severity}
          </span>
          <span className="text-xs text-gray-400">{riskItem.category}</span>
        </div>
        <span className={`${style.text} shrink-0 ml-2`}>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {isOpen && (
        <div className="p-3 bg-white dark:bg-gray-900/50 space-y-2 border-t border-gray-100 dark:border-gray-800 animate-in">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Why this is a risk
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{riskItem.reason}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">
              Recommended Action
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{riskItem.mitigation}</p>
          </div>
          {riskItem.affected_aspects && riskItem.affected_aspects.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {riskItem.affected_aspects.map((aspect) => (
                <span
                  key={aspect}
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                >
                  {aspect}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RiskCard({ risk, compact = false }: Props) {
  const [showAll, setShowAll] = useState(false);
  // Single active expanded accordion state
  const [activeRiskIndex, setActiveRiskIndex] = useState<number | null>(null);

  const overall = OVERALL_STYLES[risk.overall_risk_level] || OVERALL_STYLES.Low;
  const displayedRisks = showAll ? risk.risks : risk.risks.slice(0, 3);
  const remainingCount = risk.risks.length - 3;

  const handleToggleRisk = (index: number) => {
    setActiveRiskIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
      {/* Risk level accent top bar */}
      <div
        className={`h-1.5 w-full ${
          risk.overall_risk_level === "Low"
            ? "bg-green-500"
            : risk.overall_risk_level === "Medium"
            ? "bg-amber-500"
            : risk.overall_risk_level === "High"
            ? "bg-orange-500"
            : "bg-red-500"
        }`}
      />

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {overall.icon}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">Risk Assessment</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {risk.crop} · {risk.detected_risk_count} risk{risk.detected_risk_count !== 1 ? "s" : ""} detected
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${overall.badge}`}>
              {risk.overall_risk_level} Risk
            </span>
            <span className="text-xs text-gray-400">Score: {risk.risk_score.toFixed(1)}/100</span>
          </div>
        </div>

        {/* Priority Reason */}
        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{risk.priority_level}</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">{risk.priority_reason}</p>
        </div>

        {/* Accordion Risk List */}
        {!compact && risk.risks.length > 0 && (
          <div className="space-y-2">
            {displayedRisks.map((riskItem, idx) => (
              <RiskItemRow
                key={idx}
                riskItem={riskItem}
                isOpen={activeRiskIndex === idx}
                onToggle={() => handleToggleRisk(idx)}
              />
            ))}

            {/* Correct Pluralization */}
            {risk.risks.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="text-xs text-green-700 dark:text-green-400 hover:underline font-medium flex items-center gap-1 pt-1"
              >
                {showAll ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {showAll
                  ? "Show fewer"
                  : `Show ${remainingCount} more risk${remainingCount === 1 ? "" : "s"}`}
              </button>
            )}
          </div>
        )}

        {/* Category Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
          <span>Category: <strong className="text-gray-700 dark:text-gray-300">{risk.risk_category}</strong></span>
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${overall.badge}`}>
            {risk.risk_category === "Stable" ? "No Action Needed" : risk.priority_level}
          </span>
        </div>
      </div>
    </div>
  );
}
