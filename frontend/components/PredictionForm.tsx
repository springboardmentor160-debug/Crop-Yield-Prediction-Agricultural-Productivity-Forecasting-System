import React, { useState } from "react";
import { Thermometer, CloudRain, Activity, Sprout, Send, RefreshCw } from "lucide-react";

interface PredictionFormProps {
  onPredict: (data: any) => void;
  isLoading?: boolean;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({ onPredict, isLoading = false }) => {
  const [cropName, setCropName] = useState("Rice");
  const [avgTemp, setAvgTemp] = useState("27.5");
  const [rainfall, setRainfall] = useState("1200");
  const [soilPh, setSoilPh] = useState("6.8");
  const [nitrogen, setNitrogen] = useState("90");
  const [phosphorus, setPhosphorus] = useState("42");
  const [potassium, setPotassium] = useState("58");
  const [organicMatter, setOrganicMatter] = useState("2.8");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPredict({
      crop_name: cropName,
      avg_temp: parseFloat(avgTemp),
      rainfall: parseFloat(rainfall),
      soil_ph: parseFloat(soilPh),
      nitrogen: nitrogen ? parseFloat(nitrogen) : null,
      phosphorus: phosphorus ? parseFloat(phosphorus) : null,
      potassium: potassium ? parseFloat(potassium) : null,
      organic_matter: organicMatter ? parseFloat(organicMatter) : null,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-800 pb-4">
        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
          <Sprout className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Yield Prediction Form</h2>
          <p className="text-xs text-slate-400">Enter environmental and soil parameters to forecast yield ($kg/ha$)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Crop Selection</label>
            <select
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="Rice">Rice</option>
              <option value="Wheat">Wheat</option>
              <option value="Maize">Maize</option>
              <option value="Groundnut">Groundnut</option>
              <option value="Sugarcane">Sugarcane</option>
              <option value="Cotton">Cotton</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>Average Temperature (°C)</span>
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={avgTemp}
              onChange={(e) => setAvgTemp(e.target.value)}
              placeholder="e.g. 27.5"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              <span>Annual Rainfall (mm)</span>
            </label>
            <input
              type="number"
              step="1"
              required
              value={rainfall}
              onChange={(e) => setRainfall(e.target.value)}
              placeholder="e.g. 1200"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Soil pH Level</span>
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={soilPh}
              onChange={(e) => setSoilPh(e.target.value)}
              placeholder="e.g. 6.8"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-2">Optional Soil Nutrients &amp; Properties</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Nitrogen (N)</label>
              <input
                type="number"
                value={nitrogen}
                onChange={(e) => setNitrogen(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Phosphorus (P)</label>
              <input
                type="number"
                value={phosphorus}
                onChange={(e) => setPhosphorus(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Potassium (K)</label>
              <input
                type="number"
                value={potassium}
                onChange={(e) => setPotassium(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Organic Matter (%)</label>
              <input
                type="number"
                step="0.1"
                value={organicMatter}
                onChange={(e) => setOrganicMatter(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Running Machine Learning Model...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Predict Yield</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
export default PredictionForm;
