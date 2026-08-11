'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState('Farmer');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'Administrator') {
      router.push('/dashboard/admin');
    } else if (role === 'Researcher') {
      router.push('/dashboard/researcher');
    } else {
      router.push('/dashboard/farmer');
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                placeholder="user@example.com" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                placeholder="••••••••" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="Farmer">Farmer</option>
                <option value="Administrator">Administrator</option>
                <option value="Researcher">Researcher</option>
              </select>
            </div>
            
            <button type="submit" className="w-full btn-primary mt-2">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
