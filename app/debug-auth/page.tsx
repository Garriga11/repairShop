'use client';

import { useSession } from 'next-auth/react';

export default function AuthDebugPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">🔍 Auth Debug Page</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Session Status:</h2>
        <p>Status: {status}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Session Data:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">User Role Check:</h2>
        <p>Role: {(session?.user as any)?.role}</p>
        <p>RoleId: {(session?.user as any)?.roleId}</p>
        <p>Email: {session?.user?.email}</p>
        <p>Name: {session?.user?.name}</p>
      </div>

      <div className="mt-4">
        <a href="/dashboard/admin" className="bg-blue-600 text-white px-4 py-2 rounded">
          Test Dashboard Access
        </a>
      </div>
    </div>
  );
}
