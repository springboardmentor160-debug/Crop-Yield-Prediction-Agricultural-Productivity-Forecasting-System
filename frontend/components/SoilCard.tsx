import React from "react";
import { Layers, CheckCircle, Info } from "lucide-react";

interface SoilCardProps {
  soilData?: {
    ph?: number;
    soil_ph?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    organic_matter?: number;
    soil_quality?: string;
    suitability?: string;
    recommendation?: string;
    score?: number;
    ph_status?: string;
  };
}

export const SoilCard: React.FC<SoilCardProps> = ({ soilData }) => {
  const ph = soilData?.ph ?? soilData?.soil_ph ?? 6.8;
  const n = soilData?.nitrogen ?? 90;
  const p = soilData?.phosphorus ?? 42;
  const k = soilData?.potassium ?? 58;
  const organic = soilData?.organic_matter ?? 2.8;
  const fertilityScore = soilData?.score ?? 84.5;
  const recommendation = soilData?.recommendation || "Maintain balanced N-P-K applications.";
  const condition = soilData?.ph_status || "Crop-suitable pH";

  let fertilityLevel = "Optimal Fertility";
  let fertilityColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  if (fertilityScore < 55) {
    fertilityLevel = "Low Fertility";
    fertilityColor = "text-rose-400 bg-rose-500/10 border-rose-500/30";
  } else if (fertilityScore < 75) {
    fertilityLevel = "Medium Fertility";
    fertilityColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Soil Analysis</h3>
            <p className="text-[11px] text-slate-400">N-P-K & pH suitability</p>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-full font-semibold">
          Soil Nutrients
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2 text-center">
          <span className="text-[10px] text-slate-400 block">pH</span>
          <span className="text-sm font-bold text-emerald-400">{ph}</span>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2 text-center">
          <span className="text-[10px] text-slate-400 block">Nitrogen</span>
          <span className="text-sm font-bold text-slate-200">{n}</span>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2 text-center">
          <span className="text-[10px] text-slate-400 block">Phosphorus</span>
          <span className="text-sm font-bold text-slate-200">{p}</span>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2 text-center">
          <span className="text-[10px] text-slate-400 block">Potassium</span>
          <span className="text-sm font-bold text-slate-200">{k}</span>
        </div>
      </div>

      <div className="space-y-3 bg-slate-800/40 rounded-lg p-3 border border-slate-800 text-xs">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Organic Matter</span>
            <span className="font-semibold text-slate-200">{organic}%</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Soil Fertility</span>
            <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold ${fertilityColor}`}>
              {fertilityLevel}
            </span>
          </div>
          <span className="text-[11px] text-emerald-300 font-mono">Score: {fertilityScore}%</span>
        </div>
        <div className="border-t border-slate-850 pt-2">
          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Recommendation</span>
          <span className="font-semibold text-slate-200">{recommendation}</span>
        </div>
        <div className="border-t border-slate-850 pt-2">
          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Soil Condition</span>
          <span className="font-semibold text-slate-200">{condition}</span>
        </div>
      </div>
    </div>
  );
};
export default SoilCard;
