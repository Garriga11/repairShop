'use server';

import  prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function closeTicketAndInvoice(ticketId: string, total: number) {
  console.log(`🎫 Starting closeTicketAndInvoice for ticket: ${ticketId}, total: ${total}`);
  
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Unauthorized - must be logged in to close tickets');
  }

  console.log(`👤 User authenticated: ${session.user?.email}`);

  // Get ticket with repair type and associated parts
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { 
      account: true,
      repairType: {
        include: {
          parts: true
        }
      }
    },
  });

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  console.log(`🔍 Ticket found:`, {
    id: ticket.id,
    status: ticket.status,
    repairTypeId: ticket.repairTypeId,
    repairTypeName: ticket.repairType?.name,
    partsCount: ticket.repairType?.parts?.length || 0
  });

  // Update ticket status to closed
  const updatedTicket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: 'CLOSED' },
    include: { account: true },
  });

  // Deduct inventory for repair type parts
  console.log(`🔧 Checking for inventory deduction...`);
  console.log(`📋 Ticket repair type:`, ticket.repairType ? {
    id: ticket.repairType.id,
    name: ticket.repairType.name,
    partsCount: ticket.repairType.parts?.length || 0,
    parts: ticket.repairType.parts?.map(p => ({ id: p.id, name: p.name, quantity: p.quantity }))
  } : 'No repair type');

  if (ticket.repairType && ticket.repairType.parts.length > 0) {
    console.log(`🔧 Processing inventory deduction for repair: ${ticket.repairType.name}`);
    
    for (const part of ticket.repairType.parts) {
      console.log(`📦 Deducting part: ${part.name} (${part.sku}) - Current stock: ${part.quantity}`);
      
      // Check if we have enough stock
      if (part.quantity <= 0) {
        console.warn(`⚠️ Warning: ${part.name} is out of stock but repair was completed`);
        // Continue anyway - maybe part was obtained elsewhere
      }

      // Deduct 1 unit from inventory (assuming 1 part per repair)
      const quantityToDeduct = 1;
      const newQuantity = Math.max(0, part.quantity - quantityToDeduct);

      console.log(`🔄 Updating ${part.name}: ${part.quantity} → ${newQuantity}`);

      // Update inventory quantity
      await prisma.inventoryItem.update({
        where: { id: part.id },
        data: {
          quantity: newQuantity,
          needsReorder: newQuantity <= part.reorderLevel,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Updated inventory for ${part.name}`);

      // Create stock movement record for audit trail
      await prisma.stockMovement.create({
        data: {
          inventoryId: part.id,
          type: 'STOCK_OUT',
          quantity: -quantityToDeduct,
          reason: 'Used in repair',
          reference: `Ticket ${ticketId}`,
          userId: (session.user as any)?.id || null
        }
      });

      console.log(`📋 Created stock movement record for ${part.name}`);

      // Create ticket-part usage record
      await prisma.ticketPart.create({
        data: {
          ticketId: ticketId,
          inventoryId: part.id,
          quantityUsed: quantityToDeduct,
          costAtTime: part.cost
        }
      });

      console.log(`🔗 Created ticket-part usage record for ${part.name}`);
    }
  } else {
    console.log(`❌ No inventory deduction: ${!ticket.repairType ? 'No repair type assigned' : 'No parts mapped to repair type'}`);
  }

  // Sum deposits for invoice calculation
  const deposits = await prisma.payment.aggregate({
    where: {
      accountId: updatedTicket.accountId as string, 
      invoiceId: null,
    },
    _sum: { amount: true },
  });

  const paidAmount = deposits._sum.amount || 0;
  const dueAmount = Math.max(total - paidAmount, 0);

  // Create invoice
  const invoice = await prisma.invoice.create({
    data: {
      ticketId,
      accountId: updatedTicket.accountId as string,
      total,
      paidAmount,
      dueAmount,
    },
  });

  // Apply remaining balance to account
  if (!updatedTicket.accountId) {
    throw new Error('Account ID is missing for the ticket.');
  }
  await prisma.account.update({
    where: { id: updatedTicket.accountId },
    data: {
      balance: {
        increment: dueAmount,
      },
    },
  });

  console.log(`💰 Invoice created: ${invoice.id}, Due amount: ${dueAmount}`);

  const result = {
    invoiceId: invoice.id,
    dueAmount,
    partsUsed: ticket.repairType?.parts.length || 0,
    repairType: ticket.repairType?.name || 'No repair type specified',
    partsDeducted: ticket.repairType?.parts?.map(part => ({
      name: part.name,
      quantityUsed: 1,
      remainingStock: Math.max(0, part.quantity - 1)
    })) || []
  };

  console.log(`🎯 Final result:`, result);
  return result;
}
