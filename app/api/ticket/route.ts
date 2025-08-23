// app/api/tickets/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "USER") {
    return new Response("Unauthorized", { status: 403 });
  }

  const { device, deviceSN, location, accountId, description,  } = await req.json();

  const ticket = await prisma.ticket.create({
    data: {
      device,
      deviceSN,
      location,
      accountId,
      description,
      status: "OPEN",
      userId: session.user.id,
    },
  });

  return Response.json(ticket);
}
