import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';

// GET single inventory item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { 
        id: params.id,
        isActive: true 
      }
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory item' }, { status: 500 });
  }
}

// PUT update inventory item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      sku,
      name,
      description,
      category,
      deviceModel,
      quantity,
      reorderLevel,
      cost,
      sellPrice,
      location,
      binNumber
    } = data;

    const itemId = params.id;

    // Check if item exists
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id: itemId, isActive: true }
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Check if SKU is being changed and if new SKU already exists
    if (sku !== existingItem.sku) {
      const skuExists = await prisma.inventoryItem.findUnique({
        where: { sku }
      });

      if (skuExists) {
        return NextResponse.json({ error: 'SKU already exists' }, { status: 400 });
      }
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        sku,
        name,
        description,
        category,
        deviceModel,
        quantity: parseInt(quantity) || 0,
        reorderLevel: parseInt(reorderLevel) || 5,
        cost: parseFloat(cost),
        sellPrice: sellPrice ? parseFloat(sellPrice) : null,
        location,
        binNumber,
        needsReorder: parseInt(quantity) <= parseInt(reorderLevel)
      }
    });

    // Create stock movement record if quantity changed
    const quantityChange = parseInt(quantity) - existingItem.quantity;
    if (quantityChange !== 0) {
      await prisma.stockMovement.create({
        data: {
          inventoryId: itemId,
          type: quantityChange > 0 ? 'STOCK_IN' : 'STOCK_OUT',
          quantity: Math.abs(quantityChange),
          reason: 'Manual adjustment',
          userId: session.user.id
        }
      });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
  }
}

// DELETE inventory item (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const itemId = params.id;

    // Check if item exists
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id: itemId, isActive: true }
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Soft delete the item
    const deletedItem = await prisma.inventoryItem.update({
      where: { id: itemId },
      data: { isActive: false }
    });

    // Create stock movement record for deletion
    await prisma.stockMovement.create({
      data: {
        inventoryId: itemId,
        type: 'STOCK_OUT',
        quantity: existingItem.quantity,
        reason: 'Item deleted',
        userId: session.user.id
      }
    });

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 });
  }
}
