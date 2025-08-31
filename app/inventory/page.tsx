import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // your prisma client

export async function GET() {
  try {
    const items = await prisma.inventory.findMany({
      orderBy: { name: "asc" }, // optional sorting
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}