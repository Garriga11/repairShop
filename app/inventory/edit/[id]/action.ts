"use server";

import { prisma } from "@/lib/prisma";

// Fetch single item
export async function getInventoryItem(id: string) {
  try {
    const item = await prisma.inventory.findUnique({
      where: { id },
    });
    if (!item) {
      return { success: false, error: "Item not found" };
    }
    return { success: true, item };
  } catch (err) {
    console.error("Error fetching inventory item:", err);
    return { success: false, error: "Failed to fetch inventory item" };
  }
}

// Update item
export async function updateInventoryItem(id: string, data: any) {
  try {
    const updated = await prisma.inventory.update({
      where: { id },
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description || null,
        category: data.category || null,
        deviceModel: data.deviceModel || null,
        quantity: Number(data.quantity),
        reorderLevel: Number(data.reorderLevel),
        cost: Number(data.cost),
        sellPrice: data.sellPrice ? Number(data.sellPrice) : null,
        location: data.location || null,
        binNumber: data.binNumber || null,
      },
    });
    return { success: true, item: updated };
  } catch (err) {
    console.error("Error updating inventory item:", err);
    return { success: false, error: "Failed to update inventory item" };
  }
}

// Delete item
export async function deleteInventoryItem(id: string) {
  try {
    await prisma.inventory.delete({ where: { id } });
    return { success: true };
  } catch (err) {
    console.error("Error deleting inventory item:", err);
    return { success: false, error: "Failed to delete inventory item" };
  }
}