import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import MetricCard from "@/components/metricCard";
import prisma from "@/lib/prisma";
import { TicketIcon, WrenchScrewdriverIcon } from "@heroicons/react/16/solid";
import RecentTickets from "@/components/recentTickets";
import StatusChart, { StatusSlice } from "@/components/chart.tsx/chart";
import Link from "next/link";

export default async function TechDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    // handle unauthenticated...
  }

  // Tech-focused metrics
  const [total, open, inProgress, completed] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: "OPEN" } }),
    prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
    prisma.ticket.count({ where: { status: "COMPLETED" } }),
  ]);

  // Fetch recent tickets assigned to tech or all tickets for tech view
  const recentTicketsRaw = await prisma.ticket.findMany({
    orderBy: { createdAt: "desc" },
    take: 8, // Show more tickets for tech
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

  // Map deviceSN to serialNumber to match RecentTickets prop requirements
  const recentTickets = recentTicketsRaw.map(ticket => ({
    ...ticket,
    serialNumber: ticket.deviceSN,
  }));

  // Chart data for tech dashboard
  const chartData: StatusSlice[] = [
    { status: "Open", value: open },
    { status: "In Progress", value: inProgress },
    { status: "Completed", value: completed },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔧 Tech Dashboard</h1>
          <p className="text-gray-600">Welcome back, {session?.user?.name}!</p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/ticket/new" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ New Ticket
          </Link>
          <Link 
            href="/closeTicket" 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            ✅ Close Ticket
          </Link>
        </div>
      </div>

      {/* Tech Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Tickets" value={total} icon={<TicketIcon />} />
        <MetricCard title="Open Tickets" value={open} icon={<TicketIcon />} />
        <MetricCard title="In Progress" value={inProgress} icon={<WrenchScrewdriverIcon />} />
        <MetricCard title="Completed" value={completed} icon={<TicketIcon />} />
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📈 Ticket Status Overview</h2>
          <StatusChart data={chartData} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link 
              href="/ticket/new" 
              className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-2xl mr-3">➕</span>
              <div>
                <div className="font-semibold text-blue-900">Create New Ticket</div>
                <div className="text-sm text-blue-600">Add a new repair request</div>
              </div>
            </Link>
            
            <Link 
              href="/closeTicket" 
              className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="text-2xl mr-3">✅</span>
              <div>
                <div className="font-semibold text-green-900">Close Ticket</div>
                <div className="text-sm text-green-600">Complete and invoice tickets</div>
              </div>
            </Link>
            
            <Link 
              href="/payment/manual" 
              className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span className="text-2xl mr-3">💳</span>
              <div>
                <div className="font-semibold text-purple-900">Process Payment</div>
                <div className="text-sm text-purple-600">Record customer payments</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">🎫 Recent Tickets</h2>
        <RecentTickets tickets={recentTickets} />
      </div>
    </div>
  );
}
