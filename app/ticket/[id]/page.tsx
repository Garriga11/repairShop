
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
export const dynamic = "force-dynamic";




export default async function Ticket({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; 

  const ticket = await prisma.ticket.findUnique({
    where: { id: resolvedParams.id },
    include: { User: true }
  });

  if (!ticket) {
    notFound();
  }

  async function deleteticket() {
    "use server";

    await prisma.ticket.delete({
      where: { id: resolvedParams.id },
    });

    redirect("/ticket");
  }

  return (
    
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <article className="max-w-3xl w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">{ticket.id} {ticket.accountId}</h1>
        <p className="text-lg text-gray-600 mb-4">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">{ticket.device} {ticket.deviceSN}</h1>
        </p>
        <p className="text-lg text-gray-600 mb-4">
          <span className="font-medium text-gray-800">{ticket.description}</span>
        </p>
        <div className="text-lg text-gray-800 leading-relaxed space-y-6 border-t pt-6">
          {ticket.device? <p>{ticket.location}, {ticket.status}</p> : <p className="italic text-gray-500">No ticket.</p>}
        </div>
      </article>

      <form action={deleteticket} className="mt-6">
        <button type="submit" className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors">
          Delete Ticket
        </button>
      </form>
    </div>
  );
}