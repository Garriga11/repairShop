"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Ticket } from "@prisma/client";

interface Post {
  id: number;
  serialNumber: string;
  model: string;
  location: string;
  status: string
  createdAt: string;
  user?: {
    name: string;
  };
}


function TicketList() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  const [ticket, setTicket] = useState<Ticket[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  async function fetchTickets() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ticket?page=${page}`);
      if (!res.ok) {
        throw new Error("Failed to fetch tickets");
      }

      // await the JSON and destructure properly
      const { tickets, totalPages } = await res.json();

      // update your state
      setTicket(tickets);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setIsLoading(false);
    }
  }

  

    fetchTickets();
  }, [page]);

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2 min-h-[200px]">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 animate-pulse">Loading...</p>
        </div>
      ) : (
        <>
          {ticket.length === 0 ? (
            <p className="text-gray-600 text-center font-semibold">No Tickets</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto mt-8">
              {ticket.map((ticket) => (
                <div
                  key={ticket.id}
                  className="relative border-0 rounded-2xl shadow-xl bg-gradient-to-br from-blue-50 via-white to-pink-100 p-8 flex flex-col transition-transform duration-300 hover:scale-105 hover:shadow-2xl group"
                >
                  <div className="absolute -top-4 -right-4 bg-gradient-to-tr from-pink-400 to-blue-400 rounded-full w-16 h-16 opacity-20 blur-2xl pointer-events-none"></div>
                  <Link
                    href={`/ticket/${ticket.id}`}
                    className="text-2xl font-extrabold text-gray-900 mb-2 hover:text-blue-600 transition-colors"
                  >
                    {ticket.}
                  </Link>
                  <p className="text-sm text-gray-500 mb-1">
                    by <span className="font-semibold">{ticket.userId}</span>
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <div className="flex-1" />
                  <Link
                    href={`/ticket/${ticket.id}`}
                    className="inline-block mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 text-white font-semibold shadow hover:from-pink-500 hover:to-blue-500 transition-all"
                  >
                    View 
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-center space-x-4 mt-12">
            {page > 1 && (
              <Link href={`/ticket?page=${page - 1}`}>
                <button className="px-5 py-2 bg-gradient-to-r from-blue-500 to-pink-500 text-white rounded-full shadow hover:from-pink-500 hover:to-blue-500 transition-all">
                  Previous
                </button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/ticket?page=${page + 1}`}>
                <button className="px-5 py-2 bg-gradient-to-r from-blue-500 to-pink-500 text-white rounded-full shadow hover:from-pink-500 hover:to-blue-500 transition-all">
                  Next
                </button>
              </Link>
            )}
          </div>
        </>
      )}
    </>
  );
}
