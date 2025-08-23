import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repairTypes = await prisma.repairType.findMany({
      where: { isActive: true },
      include: {
        parts: {
          select: {
            id: true,
            name: true,
            sku: true,
            quantity: true,
            cost: true
          }
        }
      },
      orderBy: [
        { deviceType: 'asc' },
        { deviceModel: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(repairTypes);
  } catch (error) {
    console.error('Error fetching repair types:', error);
    return NextResponse.json({ error: 'Failed to fetch repair types' }, { status: 500 });
  }
}
