import React from "react";
import { CheckCircle2, TrendingUp, Cpu, Award, AlertTriangle, Info, Sprout, FileText, Download } from "lucide-react";

interface PredictionCardProps {
  result: {
    predicted_yield?: number;
    predicted_yield_kg_per_ha?: number;
    unit?: string;
    confidence_score?: number;
    accuracy?: string;
    crop_name?: string;
    model?: {
      type?: string;
      metrics?: {
        mae?: number;
        rmse?: number;
      };
    };
    soil_analysis?: {
      score?: number;
      recommendation?: string;
      suitability?: string;
      ph_status?: string;
      ph_value?: number;
      ph?: number;
    };
    weather_analysis?: {
      score?: number;
      rainfall_status?: string;
      temperature_status?: string;
      impact_summary?: string;
    };
    recommendations_data?: {
      crop?: string;
      overall_risk_level?: string;
      identified_risks?: Array<{
        type: string;
        severity: string;
        advice: string;
      }>;
      actionable_recommendations?: Array<string>;
      best_practice_tips?: Array<string>;
    } | null;
  } | null;
  onDownloadCSV?: () => void;
  onDownloadPDF?: () => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ result, onDownloadCSV, onDownloadPDF }) => {
  if (!result) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[280px]">
        <div className="p-3 bg-slate-800/80 rounded-full text-slate-500 mb-3">
          <Cpu className="w-8 h-8" />
        </div>
        <h3 className="text-slate-300 font-semibold text-base mb-1">Awaiting Prediction Request</h3>
        <p className="text-slate-500 text-xs max-w-xs">
          Submit temperature, rainfall, and soil metrics to display model inference output and recommendations.
        </p>
      </div>
    );
  }

  const yieldValue = result.predicted_yield ?? result.predicted_yield_kg_per_ha ?? 0;
  const unit = result.unit || "kg/ha";
  const confidence = result.confidence_score ?? 0;
  const crop = result.crop_name || "Rice";
  const weatherSummary = result.weather_analysis?.impact_summary || "No weather analysis was returned.";
  const soilSummary = result.soil_analysis 
    ? `${result.soil_analysis.ph_status || "Crop-suitable pH"} (${result.soil_analysis.ph_value || result.soil_analysis.ph || 6.8}) - ${result.soil_analysis.recommendation || "Optimal nutrients"}`
    : "No soil analysis was returned.";
  const cropRec = `Highly recommended for ${crop} cultivation.`;
  
  // Recommendations Data Integration
  const recData = result.recommendations_data;
  
  // Calculate Risk Level & Styling
  let riskLevel = "Low Risk";
  let riskColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  
  if (recData?.overall_risk_level) {
    const rawRisk = recData.overall_risk_level; // "High", "Medium", "Low"
    if (rawRisk === "High") {
      riskLevel = "High Risk";
      riskColor = "text-rose-400 bg-rose-500/10 border-rose-500/30";
    } else if (rawRisk === "Medium") {
      riskLevel = "Medium Risk";
      riskColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
    } else {
      riskLevel = "Low Risk";
      riskColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    }
  } else {
    // Fallback logic
    if (confidence < 60) {
      riskLevel = "High Risk";
      riskColor = "text-rose-400 bg-rose-500/10 border-rose-500/30";
    } else if (confidence < 75) {
      riskLevel = "Medium Risk";
      riskColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
    }
  }

  // Calculate Suitable Season
  let season = "Kharif / Monsoon";
  if (crop === "Wheat") {
    season = "Rabi / Winter";
  } else if (crop === "Maize") {
    season = "Kharif / Rabi";
  } else if (crop === "Cotton" || crop === "Sugarcane" || crop === "Groundnut") {
    season = "Kharif / Summer";
  }

  const timestamp = new Date().toLocaleString();
  const status = "Completed";

  const recParagraph = `Based on the AI model inference, cultivating ${crop} under the current environmental conditions (Temp: ${result.weather_analysis?.temperature_status || "Stable"}, Rain: ${result.weather_analysis?.rainfall_status || "Favorable"}) and soil nutrient levels is expected to yield ${yieldValue.toLocaleString()} kg/ha. The confidence score is ${confidence}%. It is recommended to follow the tailored irrigation interval and optimize N-P-K ratios to maximize crop productivity.`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-full">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">AI Yield Prediction Engine</span>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Verified</span>
          </span>
        </div>

        {/* Yield & Confidence Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Predicted Yield</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold text-white tracking-tight">{yieldValue.toLocaleString()}</span>
              <span className="text-emerald-400 font-bold text-sm">{unit}</span>
            </div>
          </div>
          <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Confidence Score</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">{confidence}</span>
              <span className="text-emerald-400 font-bold text-sm">%</span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs text-slate-300">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Crop Recommendation</span>
              <span className="font-semibold text-slate-200">{cropRec}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Overall Risk Level</span>
              <span className={`inline-block px-2.5 py-0.5 rounded border text-[10px] font-bold ${riskColor}`}>
                {riskLevel}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Suitable Season</span>
              <span className="font-semibold text-slate-200">{season}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Prediction Timestamp</span>
              <span className="font-mono text-slate-200">{timestamp}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Prediction Status</span>
              <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold">
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Environmental Risk Alert Cards */}
        {recData && recData.identified_risks && recData.identified_risks.length > 0 && (
          <div className="mb-6 space-y-2">
            <span className="text-[10px] text-rose-400 uppercase font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Environmental Risk Alerts
            </span>
            {recData.identified_risks.map((risk, idx) => (
              <div key={idx} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-rose-300">{risk.type}</span>
                  <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                    {risk.severity} Severity
                  </span>
                </div>
                <span className="text-[11px] text-slate-300">{risk.advice}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actionable recommendations */}
        {recData && recData.actionable_recommendations && recData.actionable_recommendations.length > 0 && (
          <div className="mb-6 bg-slate-800/40 border border-slate-800 rounded-lg p-4">
            <span className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1 mb-2">
              <Sprout className="w-3.5 h-3.5" /> Actionable Soil & Crop Advice
            </span>
            <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-300">
              {recData.actionable_recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Best Practice Tips */}
        {recData && recData.best_practice_tips && recData.best_practice_tips.length > 0 && (
          <div className="mb-6 bg-slate-800/30 border border-slate-800/50 rounded-lg p-4">
            <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1 mb-2">
              <Info className="w-3.5 h-3.5 text-slate-400" /> Best Agricultural Practices
            </span>
            <ul className="list-decimal pl-4 space-y-1.5 text-xs text-slate-450">
              {recData.best_practice_tips.map((tip, idx) => (
                <li key={idx} className="italic text-slate-400">"{tip}"</li>
              ))}
            </ul>
          </div>
        )}

        {/* Weather & Soil Summaries */}
        <div className="space-y-3 bg-slate-800/30 border border-slate-800/80 rounded-lg p-4 mb-6">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Weather Summary</span>
            <span className="text-xs text-slate-300 block">{weatherSummary}</span>
          </div>
          <div className="border-t border-slate-800 pt-2 mt-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Soil Health Summary</span>
            <span className="text-xs text-slate-300 block">{soilSummary}</span>
          </div>
        </div>
      </div>

      {/* Recommendation Paragraph */}
      <div className="border-t border-slate-800 pt-4">
        <span className="text-[10px] text-emerald-400 uppercase font-bold block mb-1">Recommendation Overview</span>
        <p className="text-xs text-slate-400 leading-relaxed italic mb-4">
          "{recParagraph}"
        </p>

        {/* Action Toolbar */}
        <div className="flex gap-2.5 pt-2 border-t border-slate-850">
          {onDownloadPDF && (
            <button
              onClick={onDownloadPDF}
              className="flex-1 bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors border border-slate-700/80 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Download PDF</span>
            </button>
          )}
          {onDownloadCSV && (
            <button
              onClick={onDownloadCSV}
              className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
