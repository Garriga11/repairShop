import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth'; // Make sure this path is correct
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all repair types with their associated parts
    const repairTypes = await prisma.repairType.findMany({
      include: {
        parts: {
          select: {
            id: true,
            name: true,
            sku: true,
            quantity: true,
            cost: true
          }
        },
        tickets: {
          select: {
            id: true,
            status: true
          }
        }
      }
    });

    // Get all inventory items
    const inventoryItems = await prisma.inventoryItem.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        cost: true,
        repairTypes: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      repairTypes,
      inventoryItems,
      summary: {
        totalRepairTypes: repairTypes.length,
        repairTypesWithParts: repairTypes.filter(rt => rt.parts.length > 0).length,
        totalInventoryItems: inventoryItems.length,
        inventoryItemsLinkedToRepairs: inventoryItems.filter(item => item.repairTypes.length > 0).length
      }
    });

  } catch (error) {
    console.error('Error fetching repair-inventory mapping:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repairTypeId, inventoryItemIds } = await request.json();

    if (!repairTypeId || !Array.isArray(inventoryItemIds)) {
      return NextResponse.json({
        error: 'repairTypeId and inventoryItemIds array are required'
      }, { status: 400 });
    }

    // Update the repair type to link with inventory items
    const updatedRepairType = await prisma.repairType.update({
      where: { id: repairTypeId },
      data: {
        parts: {
          set: inventoryItemIds.map((id: string) => ({ id }))
        }
      },
      include: {
        parts: true
      }
    });

    return NextResponse.json({
      message: 'Repair type linked to inventory items successfully',
      repairType: updatedRepairType
    });

  } catch (error) {
    console.error('Error linking repair type to inventory:', error);
    return NextResponse.json({ error: 'Failed to link items' }, { status: 500 });
  }
}