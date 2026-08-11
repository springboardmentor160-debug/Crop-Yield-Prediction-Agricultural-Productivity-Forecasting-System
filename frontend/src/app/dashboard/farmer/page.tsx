'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API request failed: ${res.status} ${res.statusText} - ${text}`);
  }
  return res.json();
}

export default function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [cropType, setCropType] = useState('Wheat');
  const [temp, setTemp] = useState('24.5');
  const [rainfall, setRainfall] = useState('600.0');
  const [ph, setPh] = useState('6.2');
  const [n, setN] = useState('45.0');
  const [p, setP] = useState('28.0');
  const [k, setK] = useState('38.0');

  const [predictedYield, setPredictedYield] = useState<number | null>(3850.5);
  const [weatherStatus, setWeatherStatus] = useState('Optimal');
  const [soilSuitability, setSoilSuitability] = useState('Optimal Suitability');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const fetchPrediction = async () => {
    setIsLoading(true);
    try {
      const data = await fetchJson(`${API_BASE}/api/v1/predict-yield`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temp: parseFloat(temp), rainfall: parseFloat(rainfall), ph: parseFloat(ph) })
      });
      setPredictedYield(data.estimated_yield);
      setWeatherStatus(data.weather_status);
      setSoilSuitability(data.soil_suitability);
    } catch (error) {
      console.error('API Error:', error);
    }
    setIsLoading(false);
  };

  const fetchRecommendations = async () => {
    try {
      const data = await fetchJson(`${API_BASE}/api/v1/analytics/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n: parseFloat(n), p: parseFloat(p), k: parseFloat(k), ph: parseFloat(ph) })
      });
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  const handleForecast = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPrediction();
    fetchRecommendations();
  };

  const fetchDashboardData = async () => {
    try {
      const data = await fetchJson(`${API_BASE}/api/v1/dashboard/summary?farm_id=1`);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsDashboardLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    fetchDashboardData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 font-sans flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h1 className="font-bold text-gray-900 text-xl">YieldSense AI</h1>
          <p className="text-sm text-gray-500">Dashboard</p>
        </div>

        <nav className="p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible flex-1">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`whitespace-nowrap text-left px-4 py-2 rounded-md font-medium ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('weather')} 
            className={`whitespace-nowrap text-left px-4 py-2 rounded-md font-medium ${activeTab === 'weather' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Weather Logs
          </button>
        </nav>

        <div className="hidden md:block mt-auto p-6 border-t border-gray-200">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto p-8">
          
          <header className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
              <p className="text-gray-600 mt-1">Real-time yield forecasting, risk analysis, and agronomic recommendations.</p>
            </div>
            <div />
          </header>

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Productivity Score</h3>
                  <div className="text-4xl font-extrabold text-blue-600">
                    {isDashboardLoading ? '...' : (dashboardData ? `${dashboardData.productivity_score}%` : '--')}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Season Performance</p>
                </div>

                <div className="card">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Predicted Yield</h3>
                  <div className="text-4xl font-extrabold text-gray-900">
                    {isLoading ? '...' : (predictedYield ? predictedYield.toFixed(1) : '--')} <span className="text-lg text-gray-500 font-normal">kg/ha</span>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Soil Suitability</h3>
                  <div className="text-2xl font-bold text-gray-900 mt-2">
                    {soilSuitability}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">pH {ph} · NPK ({n}/{p}/{k})</p>
                </div>

                <div className={`card border-l-4 ${weatherStatus === 'Optimal' ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Weather Assessment</h3>
                  <div className={`text-2xl font-bold mt-2 ${weatherStatus === 'Optimal' ? 'text-green-700' : 'text-red-700'}`}>
                    {weatherStatus}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Temp {temp}°C · Rainfall {rainfall}mm</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Forecast Input Form */}
                <div className="card lg:col-span-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Forecast Engine</h3>
                  <form onSubmit={handleForecast} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                      <select value={cropType} onChange={(e) => setCropType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                        <option value="Wheat">Wheat</option>
                        <option value="Rice">Rice</option>
                        <option value="Maize">Maize</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Temp (°C)</label>
                        <input type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rain (mm)</label>
                        <input type="number" step="0.1" value={rainfall} onChange={(e) => setRainfall(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Soil pH</label>
                      <input type="number" step="0.1" value={ph} onChange={(e) => setPh(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-center">N</label>
                        <input type="number" step="0.1" value={n} onChange={(e) => setN(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md text-center" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-center">P</label>
                        <input type="number" step="0.1" value={p} onChange={(e) => setP(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md text-center" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-center">K</label>
                        <input type="number" step="0.1" value={k} onChange={(e) => setK(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md text-center" />
                      </div>
                    </div>
                    
                    <button type="submit" disabled={isLoading} className="w-full btn-primary mt-4">
                      {isLoading ? 'Analyzing...' : 'Run Forecast'}
                    </button>
                  </form>
                </div>

                {/* Recommendations */}
                <div className="card lg:col-span-2">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Agronomic Recommendations</h3>
                  
                  {weatherStatus !== 'Optimal' && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                      <h4 className="font-bold text-red-700">{weatherStatus} Detected</h4>
                      <p className="text-sm text-red-600 mt-1">Immediate mitigation required. Consider adjusting irrigation schedules or applying protective crop sprays.</p>
                    </div>
                  )}

                  <ul className="space-y-3 mt-4">
                    {recommendations.length > 0 ? (
                      recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
                          <span className="font-bold text-blue-500">•</span>
                          {rec}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-600 italic">No specific recommendations at this time. Maintain current practices.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
                <div className="card h-80 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Yield Progression</h3>
                  <div className="flex-1">
                    {isDashboardLoading ? (
                      <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
                    ) : dashboardData && dashboardData.yield_trend ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dashboardData.yield_trend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="season" tick={{fontSize: 12}} />
                          <YAxis tick={{fontSize: 12}} />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="yield" stroke="#2563eb" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">Not enough data yet</div>
                    )}
                  </div>
                </div>

                <div className="card h-80 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Farm Comparison</h3>
                  <div className="flex-1">
                    {isDashboardLoading ? (
                      <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
                    ) : dashboardData && dashboardData.comparison_data ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardData.comparison_data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="name" tick={{fontSize: 12}} />
                          <YAxis tick={{fontSize: 12}} />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="yield" name="Yield (kg/ha)" fill="#2563eb" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">Not enough data yet</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'weather' && (
            <>
              <header className="mb-8 border-b border-gray-200 pb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Weather & Climate Logs</h2>
                <p className="text-gray-600 mt-1">Review historical climate stress detection for drought, heat, and floods.</p>
              </header>

              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Climate Alerts</h3>
                <ul className="space-y-4">
                  <li className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <div>
                      <h4 className="font-bold text-red-700">Drought Warning</h4>
                      <p className="text-sm text-gray-500">2026-08-01 · Rainfall dropped below 200mm threshold.</p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">High Severity</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <div>
                      <h4 className="font-bold text-yellow-700">Heat Stress Detected</h4>
                      <p className="text-sm text-gray-500">2026-07-28 · Average temperature exceeded 32°C for 5 days.</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">Medium Severity</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-green-700">Optimal Growing Conditions</h4>
                      <p className="text-sm text-gray-500">2026-07-15 · pH 6.2, adequate soil moisture.</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Normal</span>
                  </li>
                </ul>
              </div>
            </>
          )}

          <div className="md:hidden mt-8 border-t border-gray-200 pt-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium w-full block text-center py-2 bg-gray-100 rounded-md">
              Sign Out
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
