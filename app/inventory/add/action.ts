// app/inventory/actions.ts
"use server";

import { prisma } from "@/lib/prisma"; // adjust to your prisma client import

export async function createInventoryItem(formData: any) {
  try {
    const item = await prisma.inventory.create({
      data: {
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        deviceModel: formData.deviceModel,
        quantity: Number(formData.quantity),
        reorderLevel: Number(formData.reorderLevel),
        cost: Number(formData.cost),
        sellPrice: formData.sellPrice ? Number(formData.sellPrice) : null,
        location: formData.location,
        binNumber: formData.binNumber,
      },
    });

    return { success: true, item };
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return { success: false, error: "Failed to create inventory item" };
  }
}