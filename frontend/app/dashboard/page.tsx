"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { api, type FarmResponse } from "@/lib/api";

function DashboardMetric({ title, value, subtitle }: { title: string; value: string | React.ReactNode; subtitle?: string }) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between group hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-all"></div>
      <h3 className="text-textSecondary text-sm font-medium mb-4 uppercase tracking-wider">{title}</h3>
      <div className="font-display text-4xl font-bold text-white mb-2">{value}</div>
      {subtitle && <p className="text-xs text-textMuted">{subtitle}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [farms, setFarms] = useState<FarmResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [cropInput, setCropInput] = useState<string>("rice");

  useEffect(() => {
    loadFarms();
  }, []);

  async function loadFarms() {
    try {
      const data = await api.listFarms();
      setFarms(data);
      if (data && data.length > 0) {
        loadLatestAnalysis(data[0].id);
        loadHistory(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load farms");
    }
  }

  async function loadHistory(farmId: number) {
    try {
      const result = await api.getHistory(farmId);
      setHistory(result);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadLatestAnalysis(farmId: number) {
    try {
      const result = await api.getLatestAnalysis(farmId);
      if (result.prediction || result.recommendation || result.weather) {
          setAnalysisResult(result);
      }
    } catch (err) {
      // no analysis found yet
    }
  }

  async function handleAnalyze(farmId: number) {
    setAnalyzingId(farmId);
    setError(null);
    try {
      const res = await api.runAnalysis(farmId, cropInput);
      setAnalysisResult({
        prediction: { predicted_yield: res.predicted_yield, yield_unit: res.yield_unit },
        recommendation: { recommended_crop: res.recommendation, confidence: res.recommendation_confidence },
        weather: res.weather,
        risk_level: res.risk_level
      });
      loadHistory(farmId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzingId(null);
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col pb-20">
      <div className="absolute top-0 left-1/4 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none -translate-y-1/2"></div>
      <Navbar role="Farmer" />
      
      <div className="flex-1 max-w-6xl w-full mx-auto px-6 mt-12 animate-fade-in relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-block mb-3 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary font-mono text-xs uppercase tracking-widest">
              Command Center
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white">Your Dashboard</h1>
          </div>
          <Link href="/onboarding" className="btn-primary inline-flex items-center gap-2 whitespace-nowrap shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add New Farm
          </Link>
        </div>

        {error && (
          <div role="alert" className="mb-8 bg-danger/10 border border-danger/30 rounded-lg p-4">
            <p className="text-sm text-danger font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-danger inline-block"></span>
              {error}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <DashboardMetric 
            title="Total Acreage" 
            value={farms ? farms.length : <span className="animate-pulse bg-white/10 w-24 h-10 rounded block"></span>} 
            subtitle="Active registered farms" 
          />
          <DashboardMetric 
            title="Yield Forecast" 
            value={analysisResult?.prediction?.predicted_yield ? `${analysisResult.prediction.predicted_yield}` : <span className="text-primary/70 italic text-2xl font-light">Pending</span>} 
            subtitle={analysisResult?.prediction?.yield_unit || "Run analysis"} 
          />
          <DashboardMetric 
            title="Recommended Crop" 
            value={analysisResult?.recommendation?.recommended_crop ? analysisResult.recommendation.recommended_crop : <span className="text-primary/70 italic text-2xl font-light">Pending</span>} 
            subtitle={analysisResult?.recommendation?.confidence ? `Confidence: ${(analysisResult.recommendation.confidence * 100).toFixed(0)}%` : "Run analysis"} 
          />
          <DashboardMetric 
            title="Climate Risk" 
            value={analysisResult?.risk_level ? <span className="text-danger italic text-lg font-light">{analysisResult.risk_level}</span> : <span className="text-primary/70 italic text-2xl font-light">Pending</span>} 
            subtitle="API sync" 
          />
        </div>

        <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          Registered Locations
        </h2>

        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-textSecondary font-medium">Farm Name</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-textSecondary font-medium">Coordinates</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-textSecondary font-medium">Soil pH</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-textSecondary font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {farms === null && !error && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span className="text-textMuted text-sm">Synchronizing ledger...</span>
                    </div>
                  </td>
                </tr>
              )}
              {farms?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <p className="text-textSecondary mb-2">No farms registered yet</p>
                  </td>
                </tr>
              )}
              {farms?.map((farm) => (
                <tr key={farm.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5 font-medium text-white flex items-center gap-3">
                    {farm.farm_name}
                  </td>
                  <td className="px-6 py-5 font-mono text-sm text-textSecondary">
                    {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
                  </td>
                  <td className="px-6 py-5 font-mono text-sm text-white">
                    {farm.soil_ph?.toFixed(2) ?? "—"}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <input type="text" className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white w-24" placeholder="Crop..." value={cropInput} onChange={e => setCropInput(e.target.value)} />
                        <button 
                            disabled={analyzingId === farm.id}
                            onClick={() => handleAnalyze(farm.id)} 
                            className="btn-secondary py-1 px-3 text-sm">
                            {analyzingId === farm.id ? "Analyzing..." : "Run Analysis"}
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {analysisResult?.weather && (
            <div className="glass-panel rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-white">Latest Weather Observation</h3>
                <div className="flex gap-8">
                    <div><span className="text-textMuted block text-sm">Temperature</span> <span className="font-mono text-xl">{analysisResult.weather.temperature}°C</span></div>
                    <div><span className="text-textMuted block text-sm">Humidity</span> <span className="font-mono text-xl">{analysisResult.weather.humidity}%</span></div>
                    <div><span className="text-textMuted block text-sm">Rainfall</span> <span className="font-mono text-xl">{analysisResult.weather.rainfall}mm</span></div>
                </div>
            </div>
        )}

        {history && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
                Agricultural Analytics & History
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Yield History */}
                <div className="glass-panel rounded-2xl p-6 overflow-hidden">
                  <h3 className="text-sm text-textMuted uppercase tracking-wider mb-4">Yield Prediction History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-white/10">
                        <tr>
                          <th className="pb-2 text-xs text-textSecondary font-medium">Date</th>
                          <th className="pb-2 text-xs text-textSecondary font-medium">Crop</th>
                          <th className="pb-2 text-xs text-textSecondary font-medium">Prediction</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {history.predictions?.length === 0 && (
                            <tr><td colSpan={3} className="py-4 text-sm text-textMuted italic">No history available yet.</td></tr>
                        )}
                        {history.predictions?.slice(0, 5).map((p: any) => (
                          <tr key={p.id}>
                            <td className="py-3 text-sm text-white font-mono">{new Date(p.created_at).toLocaleDateString()}</td>
                            <td className="py-3 text-sm text-white">{p.crop}</td>
                            <td className="py-3 text-sm text-primary font-mono">{p.predicted_yield.toFixed(2)} {p.yield_unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recommendation History */}
                <div className="glass-panel rounded-2xl p-6 overflow-hidden">
                  <h3 className="text-sm text-textMuted uppercase tracking-wider mb-4">Recommendation History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-white/10">
                        <tr>
                          <th className="pb-2 text-xs text-textSecondary font-medium">Date</th>
                          <th className="pb-2 text-xs text-textSecondary font-medium">Recommended</th>
                          <th className="pb-2 text-xs text-textSecondary font-medium">Confidence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {history.recommendations?.length === 0 && (
                            <tr><td colSpan={3} className="py-4 text-sm text-textMuted italic">No history available yet.</td></tr>
                        )}
                        {history.recommendations?.slice(0, 5).map((r: any) => (
                          <tr key={r.id}>
                            <td className="py-3 text-sm text-white font-mono">{new Date(r.created_at).toLocaleDateString()}</td>
                            <td className="py-3 text-sm text-white capitalize">{r.recommended_crop}</td>
                            <td className="py-3 text-sm text-primary font-mono">{(r.confidence * 100).toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
        )}
      </div>
    </main>
  );
}
