'use client'

import { useSession } from 'next-auth/react';

export default function DebugSession() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Session Debug</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Session Status: {status}</h2>
        
        {session ? (
          <>
            <div className="mb-4">
              <h3 className="font-semibold">User Info:</h3>
              <pre className="bg-white p-2 rounded text-sm overflow-auto">
                {JSON.stringify(session.user, null, 2)}
              </pre>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold">Full Session:</h3>
              <pre className="bg-white p-2 rounded text-sm overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold">Role Analysis:</h3>
              <ul className="list-disc pl-5">
                <li>Email: {session.user?.email}</li>
                <li>Role: {(session.user as any)?.role || 'Not found'}</li>
                <li>Role ID: {(session.user as any)?.roleId || 'Not found'}</li>
                <li>Expected Dashboard: {
                  (session.user as any)?.role === 'Admin User' ? '/dashboard/admin' :
                  (session.user as any)?.role === 'Tech User' ? '/dashboard/tech' :
                  session.user?.email?.includes('admin') ? '/dashboard/admin (email fallback)' :
                  session.user?.email?.includes('tech') ? '/dashboard/tech (email fallback)' :
                  '/dashboard/user (default)'
                }</li>
              </ul>
            </div>
          </>
        ) : (
          <p>No session found - please log in</p>
        )}
      </div>
    </div>
  );
}
