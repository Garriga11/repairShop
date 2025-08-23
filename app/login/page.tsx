// app/login/page.tsx
'use client'

import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const res = await signIn('credentials', {
      redirect: false, // Prevent automatic redirect, we'll handle it manually
      email,
      password,
    });

    if (res?.error) {
      setError('Invalid login credentials');
    } else {
      // Get the updated session to check user role
      const session = await getSession();
      const userRole = (session?.user as any)?.role;
      const userEmail = session?.user?.email;
      const roleId = (session?.user as any)?.roleId;
      
      console.log('🔍 Login Debug - Full Session:', {
        userRole,
        userEmail, 
        roleId,
        fullSession: session
      });
      
      // Primary routing: Use role name from database
      if (userRole === 'Admin User') {
        console.log('✅ Redirecting admin user to admin dashboard');
        router.push('/dashboard/admin');
      } else if (userRole === 'Tech User') {
        console.log('✅ Redirecting tech user to tech dashboard');
        router.push('/dashboard/tech');
      } 
      // Fallback: Use email-based routing if role is unclear
      else if (userEmail === 'admin@example.com' || userEmail?.includes('admin')) {
        console.log('🔄 Using email fallback for admin user');
        router.push('/dashboard/admin');
      } else if (userEmail === 'tech@example.com' || userEmail?.includes('tech')) {
        console.log('🔄 Using email fallback for tech user');
        router.push('/dashboard/tech');
      } 
      // Default for regular users
      else {
        console.log('🔄 Default routing for regular user');
        router.push('/dashboard/user');
      }
    }
  };

  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-2xl font-semibold mb-4 p-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button type="submit" className="w-full p-2 bg-blue-600 p-6 text-white rounded hover:bg-blue-700">
          Login
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }
  
