'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function closeTicketAndInvoice(ticketId: string, total: number) {
  // Check authentication
  const session = await getServerSession();
  if (!session) {
    throw new Error('Authentication required');
  }

  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: 'closed' },
    include: { 
      account: true,
      repairType: {
        include: {
          parts: true // Parts needed for this repair type
        }
      }
    },
  });

  // Handle inventory deduction if repair type has required parts
  const partsDeducted = [];
  if (ticket.repairType && ticket.repairType.parts && ticket.repairType.parts.length > 0) {
    for (const part of ticket.repairType.parts) {
      // Check if we have enough inventory
      if (part.quantity < 1) {
        throw new Error(`Insufficient inventory for ${part.name}. Required: 1, Available: ${part.quantity}`);
      }

      // Update inventory quantity
      const updatedItem = await prisma.inventoryItem.update({
        where: { id: part.id },
        data: {
          quantity: {
            decrement: 1
          }
        }
      });

      // Create stock movement record
      await prisma.stockMovement.create({
        data: {
          inventoryId: part.id,
          type: 'STOCK_OUT',
          quantity: -1,
          reason: `Used for ticket ${ticket.id} - ${ticket.repairType.name}`,
          reference: ticket.id
        }
      });

      // Create ticket part usage record
      await prisma.ticketPart.create({
        data: {
          ticketId: ticket.id,
          inventoryId: part.id,
          quantityUsed: 1,
          costAtTime: part.cost
        }
      });

      partsDeducted.push({
        name: part.name,
        quantityUsed: 1,
        remainingStock: updatedItem.quantity
      });
    }
  }

  // Sum deposits
  const deposits = await prisma.payment.aggregate({
    where: {
      accountId: ticket.accountId as string, 
      invoiceId: null,
    },
    _sum: { amount: true },
  });

  const paidAmount = deposits._sum.amount || 0;
  const dueAmount = Math.max(total - paidAmount, 0);

  const invoice = await prisma.invoice.create({
    data: {
      ticketId,
      accountId: ticket.accountId as string,
      total,
      paidAmount,
      dueAmount,
    },
  });

  // Apply remaining balance to account
  if (!ticket.accountId) {
    throw new Error('Account ID is missing for the ticket.');
  }
  await prisma.account.update({
    where: { id: ticket.accountId },
    data: {
      balance: {
        increment: dueAmount,
      },
    },
  });

  return {
    invoiceId: invoice.id,
    dueAmount,
    partsDeducted
  };
}
