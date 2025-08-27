"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma"; // adjust to your setup
import { getServerSession } from "next-auth";

interface StockMovementInput {
  inventoryId: string;
  type: string;
  quantity: number;
  reason: string;
  reference?: string;
}

export async function createStockMovement(data: StockMovementInput) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // update inventory
  const item = await prisma.inventory.update({
    where: { id: data.inventoryId },
    data: {
      quantity: {
        increment: data.quantity,
      },
    },
  });

  // record movement
  await prisma.stockMovement.create({
    data: {
      inventoryId: data.inventoryId,
      type: data.type,
      quantity: data.quantity,
      reason: data.reason,
      reference: data.reference,
      userId: session.user.id, // assumes your session has id
    },
  });

  // revalidate inventory page
  revalidatePath("/inventory");

  return item;
}