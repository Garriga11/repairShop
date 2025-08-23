import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';

// GET stock movements for an inventory item
export async function GET(
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
    const item = await prisma.inventoryItem.findUnique({
      where: {
        id: itemId,
        isActive: true
      }
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Fetch stock movements for this item
    const movements = await prisma.stockMovement.findMany({
      where: { inventoryId: itemId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(movements);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    return NextResponse.json({ error: 'Failed to fetch stock movements' }, { status: 500 });
  }
}