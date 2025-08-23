'use server';

import prisma from '@/lib/prisma';

// Get all unpaid invoices
export async function getUnpaidInvoices() {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        dueAmount: {
          gt: 0, // Greater than 0 means there's still money owed
        },
      },
      include: {
        ticket: {
          select: {
            customerName: true,
            device: true,
            status: true,
          },
        },
        account: {
          select: {
            name: true,
          },
        },
        Payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: invoices,
    };
  } catch (error) {
    console.error('Error getting unpaid invoices:', error);
    return {
      success: false,
      error: 'Failed to get unpaid invoices',
      data: [],
    };
  }
}

// Process manual payment
export async function processManualPayment(data: {
  invoiceId: string;
  amount: number;
  method: 'CASH' | 'CHECK' | 'CARD' | 'BANK_TRANSFER';
  notes?: string;
}) {
  try {
    // Get the invoice to validate payment
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: {
        ticket: true,
        account: true,
      },
    });

    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    if (data.amount > invoice.dueAmount) {
      return { success: false, error: 'Payment amount exceeds due amount' };
    }

    if (data.amount <= 0) {
      return { success: false, error: 'Payment amount must be greater than 0' };
    }

    // Create the payment record
    const payment = await prisma.payment.create({
      data: {
        amount: data.amount,
        method: data.method,
    
        invoiceId: data.invoiceId,
        accountId: invoice.accountId,
      },
    });

    // Update the invoice amounts
    const newPaidAmount = invoice.paidAmount + data.amount;
    const newDueAmount = invoice.total - newPaidAmount;

    await prisma.invoice.update({
      where: { id: data.invoiceId },
      data: {
        paidAmount: newPaidAmount,
        dueAmount: newDueAmount,
      },
    });

    // If invoice is fully paid, update ticket status to COMPLETED
    if (newDueAmount <= 0) {
      await prisma.ticket.update({
        where: { id: invoice.ticketId },
        data: { status: 'COMPLETED' },
      });
    }

    return {
      success: true,
      paymentId: payment.id,
      message: `Payment of $${data.amount.toFixed(2)} processed successfully`,
    };
  } catch (error) {
    console.error('Error processing manual payment:', error);
    return {
      success: false,
      error: 'Failed to process payment',
    };
  }
}

// Get payment history for an invoice
export async function getPaymentHistory(invoiceId: string) {
  try {
    const payments = await prisma.payment.findMany({
      where: { invoiceId },
      include: {
        account: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: payments,
    };
  } catch (error) {
    console.error('Error getting payment history:', error);
    return {
      success: false,
      error: 'Failed to get payment history',
      data: [],
    };
  }
}
