import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import MetricCard from "@/components/metricCard";
import prisma from "@/lib/prisma";
import { TicketIcon } from "@heroicons/react/16/solid";
import Link from "next/link";

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    // handle unauthenticated...
  }

  // User-focused metrics (their own tickets)
  const userEmail = session?.user?.email;
  
  // Get user's tickets if we can find them by email/name
  const userTickets = await prisma.ticket.findMany({
    where: {
      OR: [
        { customerName: session?.user?.name || '' },
        // Add more conditions if you store customer info differently
      ]
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      location: true,
      status: true,
      createdAt: true,
      deviceSN: true,
      customerName: true,
      device: true,
    },
  });

  const [totalUserTickets, openUserTickets, completedUserTickets] = [
    userTickets.length,
    userTickets.filter(t => t.status === 'OPEN').length,
    userTickets.filter(t => t.status === 'COMPLETED').length,
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👤 Customer Dashboard</h1>
          <p className="text-gray-600">Welcome back, {session?.user?.name}!</p>
        </div>
        <div>
          <Link 
            href="/ticket/new" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ New Repair Request
          </Link>
        </div>
      </div>

      {/* User Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard title="My Tickets" value={totalUserTickets} icon={<TicketIcon />} />
        <MetricCard title="Open Requests" value={openUserTickets} icon={<TicketIcon />} />
        <MetricCard title="Completed" value={completedUserTickets} icon={<TicketIcon />} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/ticket/new" 
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="text-3xl mr-4">📱</span>
            <div>
              <div className="font-semibold text-blue-900">New Repair Request</div>
              <div className="text-sm text-blue-600">Submit a device for repair</div>
            </div>
          </Link>
          
          <Link 
            href="/ticket" 
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <span className="text-3xl mr-4">📋</span>
            <div>
              <div className="font-semibold text-green-900">Track My Repairs</div>
              <div className="text-sm text-green-600">Check status of your devices</div>
            </div>
          </Link>
        </div>
      </div>

      {/* User's Tickets */}
      {userTickets.length > 0 ? (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📱 My Repair Requests</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">Device</th>
                  <th className="text-left py-2">Location</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {userTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-100">
                    <td className="py-2">{ticket.device || 'Device'}</td>
                    <td className="py-2">{ticket.location || 'N/A'}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        ticket.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800'
                          : ticket.status === 'IN_PROGRESS'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-2">{ticket.createdAt.toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Repair Requests Yet</h3>
          <p className="text-gray-600 mb-4">You haven't submitted any devices for repair.</p>
          <Link 
            href="/ticket/new"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Submit Your First Request
          </Link>
        </div>
      )}
    </div>
  );
}