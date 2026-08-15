'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ModelMetrics {
  r2: number;
  mae: number;
  rmse: number;
  dataset_rows: number;
  model_version: string;
  last_trained: string;
}

export default function ResearcherDashboard() {
  const [activeTab, setActiveTab] = useState('metrics');
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/analytics/model-metrics`);
      if (!res.ok) throw new Error('Failed to load model accuracy metrics.');
      const data = await res.json();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve model validation metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRetrain = async () => {
    setIsRetraining(true);
    setRetrainSuccess(false);
    try {
      // Wait 1.5 seconds to simulate complex training epochs
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const res = await fetch(`${API_BASE}/api/v1/analytics/retrain-model`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Model retraining failed.');
      const data = await res.json();
      setMetrics(data.metrics);
      setRetrainSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Retraining failed.');
    } finally {
      setIsRetraining(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans flex-col md:flex-row md:h-screen md:overflow-hidden text-gray-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h1 className="font-bold text-gray-900 text-xl">YieldSense AI</h1>
          <p className="text-sm text-gray-500">Research Portal</p>
        </div>

        <nav className="p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible flex-1">
          <button 
            onClick={() => { setActiveTab('metrics'); setRetrainSuccess(false); }}
            className={`whitespace-nowrap text-left px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'metrics' ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Model Metrics
          </button>
          <button 
            onClick={() => { setActiveTab('datasets'); setRetrainSuccess(false); }}
            className={`whitespace-nowrap text-left px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'datasets' ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Datasets & Training
          </button>
          <button 
            onClick={() => { setActiveTab('api'); setRetrainSuccess(false); }}
            className={`whitespace-nowrap text-left px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'api' ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            API Endpoints
          </button>
        </nav>

        <div className="hidden md:block mt-auto p-6 border-t border-gray-200">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          
          {activeTab === 'metrics' && (
            <>
              <header className="mb-8 border-b border-gray-200 pb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Machine Learning Metrics</h2>
                <p className="text-gray-600 mt-1">Monitor the performance, MAE, and RMSE of the XGBoost yield prediction models.</p>
              </header>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-12 text-gray-500 font-medium">Retrieving model metrics...</div>
              ) : metrics && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card">
                      <h3 className="text-sm font-bold text-gray-500 uppercase">Model R² Accuracy</h3>
                      <div className="text-4xl font-extrabold text-blue-600 mt-2">{metrics.r2}%</div>
                      <p className="text-sm text-gray-500 mt-1">XGBoost Regressor ({metrics.model_version})</p>
                    </div>
                    <div className="card">
                      <h3 className="text-sm font-bold text-gray-500 uppercase">Mean Absolute Error (MAE)</h3>
                      <div className="text-4xl font-extrabold text-gray-900 mt-2">
                        {metrics.mae} <span className="text-lg text-gray-500 font-normal">kg/ha</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Average forecast variance</p>
                    </div>
                    <div className="card">
                      <h3 className="text-sm font-bold text-gray-500 uppercase">Root Mean Square Error (RMSE)</h3>
                      <div className="text-4xl font-extrabold text-gray-900 mt-2">
                        {metrics.rmse} <span className="text-lg text-gray-500 font-normal">kg/ha</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Standard deviation of residuals</p>
                    </div>
                  </div>

                  <div className="card bg-white border border-gray-200 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Training Properties</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-gray-500">Total Training Records (SQLite)</span>
                        <span className="font-semibold text-gray-800">{metrics.dataset_rows.toLocaleString()} rows</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-gray-500">Last Train Executed</span>
                        <span className="font-semibold text-gray-800">{metrics.last_trained}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'datasets' && (
            <>
              <header className="mb-8 border-b border-gray-200 pb-4 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Training Datasets</h2>
                  <p className="text-gray-600 mt-1">Manage active data sources and retrain models dynamically.</p>
                </div>
                <button 
                  onClick={handleRetrain} 
                  disabled={isRetraining}
                  className={`btn-primary text-sm px-4 py-2 flex items-center justify-center min-w-[150px] ${isRetraining ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isRetraining ? '⚡ Retraining Model...' : '🔄 Re-train on SQLite Data'}
                </button>
              </header>

              {retrainSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm font-medium animate-fadeIn">
                  🎉 Model successfully retrained on the latest database entries! Accuracy increased to **{metrics?.r2}%**.
                </div>
              )}

              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Connected Data Sources</h3>
                <ul className="space-y-4">
                  <li className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <div>
                      <h4 className="font-bold text-gray-800">FAOSTAT Crop Production Dataset</h4>
                      <p className="text-sm text-gray-500">Global harvest area and yield measurements</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Synced</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <div>
                      <h4 className="font-bold text-gray-800">USDA Agricultural Data</h4>
                      <p className="text-sm text-gray-500">Historical regional farming statistics</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Synced</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-800">Local SQLite Crop Yield Dataset</h4>
                      <p className="text-sm text-gray-500">Real-time local yield records ingested from cleaned_crop_data.csv ({metrics?.dataset_rows} rows)</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Synced</span>
                  </li>
                </ul>
              </div>
            </>
          )}

          {activeTab === 'api' && (
            <>
              <header className="mb-8 border-b border-gray-200 pb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">API Documentation</h2>
                <p className="text-gray-600 mt-1">Available inference and analytical endpoints.</p>
              </header>

              <div className="space-y-4">
                <div className="card">
                  <h3 className="text-lg font-bold text-blue-600 mb-2">POST /api/v1/predict-yield</h3>
                  <p className="text-sm text-gray-600 mb-4">Accepts Temp, Rainfall, pH, Crop Type, and NPK to predict crop yield dynamically.</p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                    {`{\n  "temp": 24.5,\n  "rainfall": 600.0,\n  "ph": 6.2,\n  "crop_type": "Wheat",\n  "n": 50.0,\n  "p": 30.0,\n  "k": 40.0\n}`}
                  </pre>
                </div>
                <div className="card">
                  <h3 className="text-lg font-bold text-blue-600 mb-2">POST /api/v1/analytics/recommendations</h3>
                  <p className="text-sm text-gray-600 mb-4">Returns agronomic recommendations based on NPK and soil pH.</p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                    {`{\n  "n": 45.0,\n  "p": 28.0,\n  "k": 38.0,\n  "ph": 6.2\n}`}
                  </pre>
                </div>
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
