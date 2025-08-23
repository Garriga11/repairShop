'use server';

import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test query to see tickets with repair types and parts
    const ticketsWithRepairInfo = await prisma.ticket.findMany({
      where: {
        status: 'OPEN',
        repairTypeId: { not: null }
      },
      include: {
        repairType: {
          include: {
            parts: {
              select: {
                id: true,
                name: true,
                sku: true,
                quantity: true
              }
            }
          }
        }
      },
      take: 5
    });

    // Count total tickets
    const totalTickets = await prisma.ticket.count();
    const ticketsWithRepairType = await prisma.ticket.count({
      where: { repairTypeId: { not: null } }
    });

    // Check repair types
    const repairTypes = await prisma.repairType.findMany({
      include: {
        parts: true,
        _count: {
          select: { tickets: true }
        }
      }
    });

    return NextResponse.json({
      debug: {
        totalTickets,
        ticketsWithRepairType,
        openTicketsWithRepairType: ticketsWithRepairInfo.length,
        repairTypesCount: repairTypes.length,
        repairTypesWithParts: repairTypes.filter(rt => rt.parts.length > 0).length
      },
      sampleTickets: ticketsWithRepairInfo.map(ticket => ({
        id: ticket.id,
        status: ticket.status,
        repairType: ticket.repairType?.name || 'No repair type',
        partsCount: ticket.repairType?.parts.length || 0,
        parts: ticket.repairType?.parts || []
      })),
      repairTypes: repairTypes.map(rt => ({
        id: rt.id,
        name: rt.name,
        ticketCount: rt._count.tickets,
        partsCount: rt.parts.length,
        parts: rt.parts.map(p => ({ id: p.id, name: p.name, quantity: p.quantity }))
      }))
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Debug failed', details: error }, { status: 500 });
  }
}
