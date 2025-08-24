import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { inventoryId, type, quantity, reason, reference } = data;

    // Get current inventory item
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id: inventoryId }
    });

    if (!inventoryItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    // Calculate new quantity
    const newQuantity = Math.max(0, inventoryItem.quantity + quantity);

    // Check for negative stock
    if (newQuantity < 0) {
      return NextResponse.json({ 
        error: 'Insufficient stock. Cannot reduce below 0.' 
      }, { status: 400 });
    }

    // Create stock movement record
    const stockMovement = await prisma.stockMovement.create({
      data: {
        inventoryId,
        type,
        quantity,
        reason,
        reference,
        userId: session.user.id
      }
    });

    // Update inventory quantity and reorder status
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: inventoryId },
      data: {
        quantity: newQuantity,
        needsReorder: newQuantity <= inventoryItem.reorderLevel,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      stockMovement,
      updatedItem
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating stock movement:', error);
    return NextResponse.json({ 
      error: 'Failed to create stock movement' 
    }, { status: 500 });
  }
}
