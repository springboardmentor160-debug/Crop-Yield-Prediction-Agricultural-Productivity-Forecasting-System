'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Farmer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(false);
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      });

      if (!response.ok) {
        throw new Error('Authentication failed. Check your email and password.');
      }

      const data = await response.json();
      
      // Store token and user details
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user_role', data.role);

      // Route user dynamically based on the registered role inside the SQLite database
      if (data.role === 'Administrator') {
        router.push('/dashboard/admin');
      } else if (data.role === 'Researcher') {
        router.push('/dashboard/researcher');
      } else {
        router.push('/dashboard/farmer');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-gray-900">YieldSense AI</Link>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        
        <div className="card">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm font-medium">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900" 
                placeholder="user@example.com" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900" 
                placeholder="••••••••" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selected Access Portal</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
              >
                <option value="Farmer">Farmer Portal</option>
                <option value="Administrator">Administrator Portal</option>
                <option value="Researcher">Researcher Portal</option>
              </select>
            </div>
            
            <button type="submit" disabled={isLoading} className="w-full btn-primary mt-2">
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
        
        {/* Help Panel with Real Credentials */}
        <div className="mt-6 text-center text-xs text-gray-500 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="font-semibold text-gray-700 mb-2">🎓 Demo Credentials (Database Authenticated):</p>
          <div className="space-y-1 text-left inline-block">
            <p>👨‍🌾 **Farmer:** `farmer@yieldsense.ai` / `password123`</p>
            <p>💻 **Admin:** `admin@yieldsense.ai` / `password123`</p>
            <p>🔬 **Researcher:** `researcher@yieldsense.ai` / `password123`</p>
          </div>
        </div>
      </div>
    </div>
  );
}
