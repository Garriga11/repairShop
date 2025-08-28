"use server";

import { prisma } from "@/lib/prisma";

export async function getInventoryHistory(id: string) {
  try {
    const item = await prisma.inventory.findUnique({
      where: { id },
      select: {
        id: true,
        sku: true,
        name: true,
        quantity: true,
        stockMovements: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    return {
      success: true,
      item: {
        id: item.id,
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
      },
      movements: item.stockMovements.map((m) => ({
        id: m.id,
        type: m.type,
        quantity: m.quantity,
        reason: m.reason,
        createdAt: m.createdAt,
        user: m.user,
      })),
    };
  } catch (err) {
    console.error("Error fetching inventory history:", err);
    return { success: false, error: "Failed to fetch inventory history" };
  }
}
