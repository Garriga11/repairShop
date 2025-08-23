'use server';

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get all open tickets with their repair type info
    const tickets = await prisma.ticket.findMany({
      where: { 
        status: { not: 'CLOSED' }
      },
      include: {
        repairType: {
          include: {
            parts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const ticketInfo = tickets.map(ticket => ({
      id: ticket.id,
      status: ticket.status,
      customerName: ticket.customerName,
      device: ticket.device,
      hasRepairType: !!ticket.repairTypeId,
      repairTypeId: ticket.repairTypeId,
      repairTypeName: ticket.repairType?.name || 'No repair type',
      partsCount: ticket.repairType?.parts?.length || 0,
      canDeductInventory: !!(ticket.repairTypeId && ticket.repairType && ticket.repairType.parts && ticket.repairType.parts.length > 0)
    }));

    return NextResponse.json({
      tickets: ticketInfo,
      summary: {
        totalOpenTickets: tickets.length,
        ticketsWithRepairType: ticketInfo.filter(t => t.hasRepairType).length,
        ticketsReadyForInventoryDeduction: ticketInfo.filter(t => t.canDeductInventory).length
      }
    });

  } catch (error) {
    console.error('Error fetching ticket info:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}
