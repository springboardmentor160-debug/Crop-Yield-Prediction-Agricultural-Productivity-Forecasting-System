'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ResearcherDashboard() {
  const [activeTab, setActiveTab] = useState('metrics');

  return (
    <div className="flex h-screen bg-gray-50 font-sans flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h1 className="font-bold text-gray-900 text-xl">YieldSense AI</h1>
          <p className="text-sm text-gray-500">Research Portal</p>
        </div>

        <nav className="p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible flex-1">
          <button 
            onClick={() => setActiveTab('metrics')}
            className={`whitespace-nowrap text-left px-4 py-2 rounded-md font-medium ${activeTab === 'metrics' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Model Metrics
          </button>
          <button 
            onClick={() => setActiveTab('datasets')}
            className={`whitespace-nowrap text-left px-4 py-2 rounded-md font-medium ${activeTab === 'datasets' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Datasets
          </button>
          <button 
            onClick={() => setActiveTab('api')}
            className={`whitespace-nowrap text-left px-4 py-2 rounded-md font-medium ${activeTab === 'api' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            API Endpoints
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
        <div className="max-w-7xl mx-auto">
          
          {activeTab === 'metrics' && (
            <>
              <header className="mb-8 border-b border-gray-200 pb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Machine Learning Metrics</h2>
                <p className="text-gray-600 mt-1">Monitor the performance, MAE, and RMSE of the XGBoost yield prediction models.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card">
                  <h3 className="text-sm font-bold text-gray-500 uppercase">Model Accuracy</h3>
                  <div className="text-4xl font-extrabold text-blue-600 mt-2">92.4%</div>
                  <p className="text-sm text-gray-500 mt-1">XGBoost Regressor (v1.2.0)</p>
                </div>
                <div className="card">
                  <h3 className="text-sm font-bold text-gray-500 uppercase">Mean Absolute Error (MAE)</h3>
                  <div className="text-4xl font-extrabold text-gray-900 mt-2">142.5 <span className="text-lg text-gray-500 font-normal">kg/ha</span></div>
                </div>
                <div className="card">
                  <h3 className="text-sm font-bold text-gray-500 uppercase">Root Mean Square Error (RMSE)</h3>
                  <div className="text-4xl font-extrabold text-gray-900 mt-2">189.3 <span className="text-lg text-gray-500 font-normal">kg/ha</span></div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'datasets' && (
            <>
              <header className="mb-8 border-b border-gray-200 pb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Training Datasets</h2>
                <p className="text-gray-600 mt-1">Manage active data sources connected to the platform.</p>
              </header>

              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Data Sources</h3>
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
                      <h4 className="font-bold text-gray-800">Kaggle Weather & Soil Characteristics</h4>
                      <p className="text-sm text-gray-500">Rainfall, temperature, and soil NPK profiles</p>
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
                  <p className="text-sm text-gray-600 mb-4">Accepts Temp, Rainfall, and pH to predict XGBoost crop yield.</p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                    {`{\n  "temp": 24.5,\n  "rainfall": 600.0,\n  "ph": 6.2\n}`}
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
