// components/recentTickets.tsx
import Link from "next/link";
import type { Ticket } from "@prisma/client";

export default function RecentTickets({
  tickets = [],
}: {
  tickets?: Pick<Ticket, "id" | "serialNumber" | "status" | "createdAt">[];
}) {
  return (
    <div className="overflow-auto bg-white rounded shadow">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2">Serial Number</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {tickets.length > 0 ? (
            tickets.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">
                  <Link
                    href={`/dashboard/tickets/${t.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {t.serialNumber}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded ${
                      t.status === "OPEN" ? "bg-green-100" : "bg-gray-200"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {new Date(t.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-4 py-2 text-center text-gray-500">
                No recent tickets
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
