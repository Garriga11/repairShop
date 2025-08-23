'use server';

import prisma from '@/lib/prisma';

export async function createTicketAction({
  description,
  accountId,
  depositAmount,
}: {
  description: string;
  accountId: string;
  depositAmount: number;
}) {
  const ticket = await prisma.ticket.create({
    data: {
      description,
      account: { connect: { id: accountId } },
    },
  });

  if (depositAmount > 0) {
    await prisma.payment.create({
      data: {
        accountId,
        amount: depositAmount,
        method: 'cash',
      },
    });

    // Reduce account balance (credit)
    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: { decrement: depositAmount },
      },
    });
  }

  return { ticketId: ticket.id };
}

// New action for the simple ticket form with customer info
export async function createSimpleTicketAction(data: {
  customerName: string;
  customerPhone: string;
  device: string;
  deviceSN: string;
  description: string;
  location: string;
  ticketBalance: string;
  status: string;
  repairTypeId?: string;
}) {
  try {
    // First, try to find existing account by customer name
    let account = await prisma.account.findFirst({
      where: {
        name: {
          contains: data.customerName,
          mode: 'insensitive' // Case insensitive search
        }
      }
    });

    // If no account exists, create a new one
    if (!account) {
      account = await prisma.account.create({
        data: {
          name: data.customerName,
          balance: 0.0
        }
      });
      console.log(`Created new account for customer: ${data.customerName}`);
    } else {
      console.log(`Found existing account for customer: ${data.customerName}`);
    }

    console.log(`🎫 Creating ticket with data:`, {
      customerName: data.customerName,
      repairTypeId: data.repairTypeId,
      device: data.device,
      accountId: account.id
    });

    // Create the ticket with the account
    const ticket = await prisma.ticket.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        device: data.device,
        deviceSN: data.deviceSN,
        description: data.description,
        location: data.location,
        ticketBalance: data.ticketBalance,
        status: data.status,
        accountId: account.id, // Link to the account
        repairTypeId: data.repairTypeId || null, // Add repair type if selected
      },
    });

    console.log(`✅ Ticket created successfully:`, {
      ticketId: ticket.id,
      repairTypeId: ticket.repairTypeId,
      status: ticket.status
    });

    return { 
      success: true, 
      ticketId: ticket.id,
      accountId: account.id,
      accountName: account.name 
    };
  } catch (error) {
    console.error('Error creating ticket:', error);
    return { success: false, error: 'Failed to create ticket' };
  }
}

// Action to manually create an account
export async function createAccountAction(data: {
  name: string;
  initialBalance?: number;
  phone?: string;
  email?: string;
}) {
  try {
    const account = await prisma.account.create({
      data: {
        name: data.name,
        balance: data.initialBalance || 0.0,
      },
    });

    return { 
      success: true, 
      accountId: account.id, 
      accountName: account.name,
      balance: account.balance 
    };
  } catch (error) {
    console.error('Error creating account:', error);
    return { success: false, error: 'Failed to create account' };
  }
}
