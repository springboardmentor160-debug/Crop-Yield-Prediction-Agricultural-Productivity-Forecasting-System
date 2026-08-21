"use client";

import type { ReactNode } from "react";
import { AlertTriangle, ShieldCheck, AlertOctagon } from "lucide-react";

type RiskSeverity = "Low" | "Medium" | "High";

interface RiskItem {
  type: string;
  severity: RiskSeverity;
  advice: string;
}

interface RiskAlertWidgetProps {
  overallRiskLevel: RiskSeverity;
  risks: RiskItem[];
}

const SEVERITY_STYLES: Record<
  RiskSeverity,
  { badge: string; card: string; icon: ReactNode }
> = {
  Low: {
    badge: "bg-green-100 text-green-800 border-green-300",
    card: "border-green-300 bg-green-50",
    icon: <ShieldCheck className="w-5 h-5 text-green-700" />,
  },
  Medium: {
    badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
    card: "border-yellow-300 bg-yellow-50",
    icon: <AlertTriangle className="w-5 h-5 text-yellow-700" />,
  },
  High: {
    badge: "bg-red-100 text-red-800 border-red-300",
    card: "border-red-300 bg-red-50",
    icon: <AlertOctagon className="w-5 h-5 text-red-700" />,
  },
};

export default function RiskAlertWidget({
  overallRiskLevel,
  risks,
}: RiskAlertWidgetProps) {
  const overallStyle = SEVERITY_STYLES[overallRiskLevel];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-green-700">🚨 Risk Assessment</h3>
        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full border ${overallStyle.badge}`}
        >
          Overall: {overallRiskLevel} Risk
        </span>
      </div>

      {risks.length === 0 ? (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-300 rounded-lg p-4 text-sm">
          <ShieldCheck className="w-5 h-5" />
          No environmental risks flagged for the current inputs.
        </div>
      ) : (
        <div className="space-y-3">
          {risks.map((risk, index) => {
            const style = SEVERITY_STYLES[risk.severity];
            return (
              <div
                key={index}
                className={`flex items-start gap-3 border rounded-lg p-4 ${style.card}`}
              >
                {style.icon}
                <div>
                  <p className="font-semibold text-gray-800">
                    {risk.type}{" "}
                    <span
                      className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full border ${style.badge}`}
                    >
                      {risk.severity}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{risk.advice}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}