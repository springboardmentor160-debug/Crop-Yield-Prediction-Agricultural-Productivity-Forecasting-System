'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('system');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('Farmer');
  const [formPassword, setFormPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

  const fetchSystemLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/analytics/system-logs`);
      if (res.ok) {
        const data = await res.json();
        setSystemLogs(data);
      }
    } catch (err) {
      console.error('Failed to load system logs:', err);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/users`);
      if (!res.ok) throw new Error('Failed to retrieve user accounts.');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSystemLogs();
  }, [activeTab]);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedUserId(null);
    setFormName('');
    setFormEmail('');
    setFormRole('Farmer');
    setFormPassword('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setModalMode('edit');
    setSelectedUserId(user.id);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormPassword(''); // leave blank unless changing
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload: any = {
      email: formEmail,
      name: formName,
      role: formRole,
    };

    if (modalMode === 'create' || formPassword) {
      payload.password = formPassword;
    }

    try {
      let response;
      if (modalMode === 'create') {
        response = await fetch(`${API_BASE}/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_BASE}/api/v1/auth/users/${selectedUserId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process user registration.');
      }

      await fetchUsers();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed.');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete user.');
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans flex-col md:flex-row md:h-screen md:overflow-hidden text-gray-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h1 className="font-bold text-gray-900 text-xl">YieldSense AI</h1>
          <p className="text-sm text-gray-500">Admin Portal</p>
        </div>

        <nav className="p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible flex-1">
          <button 
            onClick={() => setActiveTab('system')} 
            className={`whitespace-nowrap text-left px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'system' ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            System Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`whitespace-nowrap text-left px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'users' ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            User Management
          </button>
          <button 
            onClick={() => setActiveTab('logs')} 
            className={`whitespace-nowrap text-left px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'logs' ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Platform Logs
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
          
          {activeTab === 'system' && (
            <>
              <header className="mb-8 border-b border-gray-200 pb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Platform Administration</h2>
                <p className="text-gray-600 mt-1">Monitor system health and review high-level metrics.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card">
                  <h3 className="text-sm font-bold text-gray-500 uppercase">Total User Accounts</h3>
                  <div className="text-4xl font-extrabold text-gray-900 mt-2">{users.length}</div>
                </div>
                <div className="card">
                  <h3 className="text-sm font-bold text-gray-500 uppercase">Active Roles</h3>
                  <div className="text-4xl font-extrabold text-gray-900 mt-2">
                    {Array.from(new Set(users.map(u => u.role))).length}
                  </div>
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
                  <p className="text-gray-600 mt-1">Manage registered accounts and roles dynamically.</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary text-sm px-3 py-1.5">
                  Add User
                </button>
              </header>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading user list...</div>
              ) : (
                <div className="card overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500 text-sm">
                        <th className="pb-2">ID</th>
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Email Address</th>
                        <th className="pb-2">Role</th>
                        <th className="pb-2">Date Created</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition">
                          <td className="py-3 font-mono text-sm">#{user.id}</td>
                          <td className="py-3 font-medium">{user.name}</td>
                          <td className="py-3 font-mono text-sm">{user.email}</td>
                          <td className="py-3">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'Administrator' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'Researcher' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-sm flex gap-3">
                            <button 
                              onClick={() => openEditModal(user)} 
                              className="text-blue-600 hover:text-blue-900 font-medium hover:underline"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id)} 
                              className="text-red-600 hover:text-red-900 font-medium hover:underline"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === 'logs' && (
            <>
              <header className="mb-8 border-b border-gray-200 pb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Platform Logs</h2>
                <p className="text-gray-600 mt-1">Recent system activities and API calls.</p>
              </header>

              <div className="card bg-gray-900 text-green-400 font-mono text-sm h-96 overflow-y-auto p-4 space-y-1">
                {systemLogs.length > 0 ? (
                  systemLogs.map((logStr, idx) => (
                    <p key={idx}>{logStr}</p>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No logs generated yet.</p>
                )}
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

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-200 overflow-hidden">
            <header className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-lg">
                {modalMode === 'create' ? 'Add User Account' : 'Edit User Account'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </header>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 focus:outline-none focus:ring-2" 
                  placeholder="e.g. Jane Doe" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 focus:outline-none focus:ring-2" 
                  placeholder="name@example.com" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role / Permissions</label>
                <select 
                  value={formRole} 
                  onChange={(e) => setFormRole(e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 focus:outline-none focus:ring-2 bg-white"
                >
                  <option value="Farmer">Farmer</option>
                  <option value="Researcher">Researcher</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {modalMode === 'create' ? 'Password' : 'Password (leave blank to keep current)'}
                </label>
                <input 
                  type="password" 
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 focus:outline-none focus:ring-2" 
                  placeholder={modalMode === 'create' ? '••••••••' : 'leave blank unless changing'}
                  required={modalMode === 'create'}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary px-4 py-2 text-white font-medium"
                >
                  {modalMode === 'create' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
