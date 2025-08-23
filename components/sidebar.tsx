'use client'
// components/sidebar.tsx
import { useSession } from "next-auth/react";
import Link from "next/link";

const Sidebar = () => {
  const { data: session } = useSession();

  return (
    <div className="w-64 bg-white justify-items-start relative text-gray-800 p-4 mb-4 m-8 rounded min-h-screen p-5">
      <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>
      <ul className="space-y-4">
        <li>
          <Link href="/dashboard"
             className="hover:text-gray-300">Home
          </Link>
        </li>
        
        {session?.user.role === "ADMIN" && (
          <li>
            <Link href="/dashboard/admin"className="hover:text-gray-300">Admin Dashboard
            </Link>
          </li>
        )}

        {session?.user.role === "USER" && (
          <li>
            <Link href="/dashboard/user"className="hover:text-gray-300"> User Dashboard
            </Link>
          </li>
        )}

        {/* Add other links as needed */}
        <li>
          <Link href="/app/checlklist"
            className="hover:text-gray-300">View Open Tickets
          </Link>
        </li>
          <li>
          <Link href="/app/account"
            className="hover:text-gray-300">Add an Account
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
