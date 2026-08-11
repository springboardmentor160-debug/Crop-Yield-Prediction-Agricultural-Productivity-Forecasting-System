'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('system');

  return (
    <div className="flex h-screen bg-gray-50 font-sans flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h1 className="font-bold text-gray-900 text-xl">YieldSense AI</h1>
          <p className="text-sm text-gray-500">Admin Portal</p>
        </div>

        <nav className="p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible flex-1">
          <button 
            onClick={() => setActiveTab('system')} 
            className={`whitespace-nowrap text-left px-4 py-2 rounded-md font-medium ${activeTab === 'system' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            System Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`whitespace-nowrap text-left px-4 py-2 rounded-md font-medium ${activeTab === 'users' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            User Management
          </button>
          <button 
            onClick={() => setActiveTab('logs')} 
            className={`whitespace-nowrap text-left px-4 py-2 rounded-md font-medium ${activeTab === 'logs' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Platform Logs
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
          
          {activeTab === 'system' && (
            <>
              <header className="mb-8 border-b border-gray-200 pb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Platform Administration</h2>
                <p className="text-gray-600 mt-1">Monitor system health and review high-level metrics.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card">
                  <h3 className="text-sm font-bold text-gray-500 uppercase">Total Users</h3>
                  <div className="text-4xl font-extrabold text-gray-900 mt-2">1,248</div>
                </div>
                <div className="card">
                  <h3 className="text-sm font-bold text-gray-500 uppercase">Active Farmers</h3>
                  <div className="text-4xl font-extrabold text-gray-900 mt-2">892</div>
                </div>
                <div className="card">
                  <h3 className="text-sm font-bold text-gray-500 uppercase">System Status</h3>
                  <div className="text-xl md:text-2xl font-bold text-green-700 mt-2">All Operational</div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <>
              <header className="mb-8 border-b border-gray-200 pb-4 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h2>
                  <p className="text-gray-600 mt-1">Manage registered accounts and roles.</p>
                </div>
                <button className="btn-primary text-sm px-3 py-1.5">Add User</button>
              </header>

              <div className="card overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-sm">
                      <th className="pb-2">Name</th>
                      <th className="pb-2">Role</th>
                      <th className="pb-2">Region</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    <tr className="border-b border-gray-100">
                      <td className="py-3 font-medium">John Doe</td>
                      <td className="py-3">Farmer</td>
                      <td className="py-3">Midwest Region</td>
                      <td className="py-3 text-green-600 font-medium">Active</td>
                      <td className="py-3 text-blue-600 hover:underline cursor-pointer">Edit</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 font-medium">Dr. Smith</td>
                      <td className="py-3">Researcher</td>
                      <td className="py-3">Global</td>
                      <td className="py-3 text-green-600 font-medium">Active</td>
                      <td className="py-3 text-blue-600 hover:underline cursor-pointer">Edit</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium">Jane Roe</td>
                      <td className="py-3">Farmer</td>
                      <td className="py-3">Pacific Northwest</td>
                      <td className="py-3 text-yellow-600 font-medium">Pending</td>
                      <td className="py-3 text-blue-600 hover:underline cursor-pointer">Edit</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'logs' && (
            <>
              <header className="mb-8 border-b border-gray-200 pb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Platform Logs</h2>
                <p className="text-gray-600 mt-1">Recent system activities and API calls.</p>
              </header>

              <div className="card bg-gray-900 text-green-400 font-mono text-sm h-96 overflow-y-auto">
                <p>[2026-08-08 14:32:01] INFO: User 892 logged in successfully.</p>
                <p>[2026-08-08 14:35:12] POST /api/v1/predict-yield HTTP/1.1 200 OK</p>
                <p>[2026-08-08 14:35:13] POST /api/v1/analytics/recommendations HTTP/1.1 200 OK</p>
                <p>[2026-08-08 14:40:55] INFO: Database backup completed.</p>
                <p>[2026-08-08 14:45:22] WARN: High latency on weather API endpoint.</p>
                <p>[2026-08-08 15:02:11] POST /api/v1/predict-yield HTTP/1.1 200 OK</p>
                <p>[2026-08-08 15:10:05] INFO: Admin accessed user management module.</p>
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
