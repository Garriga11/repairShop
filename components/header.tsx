"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  let dashboard = "/dashboard";

  if(role==="Admin User") dashboard = "/dashboard/admin";
  if(role==="Tech User") dashboard = "/dashboard/tech";

  return (
    <header className="w-full bg-white shadow-xl rounded-xl py-4 p-4 px-8">
      <nav className="auto-rows-auto flex justify-center p-4 gap-4">
     
        <div className="flex items-center space-x-4">
         
          {session ? (
            <>
            
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {session.user?.name && <div>{session.user.name}</div>}
                  <div>{session.user?.email}</div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="bg-black text-white md: 4 px-4 p-6 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
          
            <div>
              <Link href="/login" className="bg-black text-white px-4 py-2 p-6 rounded-lg hover:bg-blue-600 transition">
                Sign In
              </Link>

          
            
              <Link href="/dashboard" className="bg-black text-white px-4 py-2 p-6 rounded-lg hover:bg-blue-600 transition">
                Sign In
              </Link>

            </div>
          )}

          
        </div>
      </nav>
    </header>
  );
}