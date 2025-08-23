'use server';

import prisma from '@/lib/prisma';

// ✅ SAFE REVENUE TRACKING - Uses existing Invoice/Payment data only!
// No schema changes needed - your ticket system stays intact! 🛡️

// Get revenue data from existing invoices (SAFE - no schema changes)
export async function getRevenueFromInvoices() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        Payment: true,
        ticket: {
          select: {
            customerName: true,
            device: true,
            status: true,
            createdAt: true,
          }
        },
        account: {
          select: {
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
    const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const totalDue = invoices.reduce((sum, invoice) => sum + invoice.dueAmount, 0);

    return {
      success: true,
      data: {
        totalRevenue,
        totalInvoiced,
        totalDue,
        invoiceCount: invoices.length,
        invoices: invoices.slice(0, 10), // Recent 10 invoices
        averageInvoice: invoices.length > 0 ? totalInvoiced / invoices.length : 0,
        collectionRate: totalInvoiced > 0 ? (totalRevenue / totalInvoiced) * 100 : 0,
      }
    };
  } catch (error) {
    console.error('Error getting revenue from invoices:', error);
    return { success: false, error: 'Failed to get revenue data' };
  }
}

// Get payment data for revenue analysis (SAFE - uses existing Payment table)
export async function getPaymentAnalysis() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        invoice: {
          include: {
            ticket: {
              select: {
                customerName: true,
                device: true,
              }
            }
          }
        },
        account: {
          select: {
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Group by payment method
    const paymentsByMethod = payments.reduce((acc, payment) => {
      if (!acc[payment.method]) {
        acc[payment.method] = { total: 0, count: 0 };
      }
      acc[payment.method].total += payment.amount;
      acc[payment.method].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return {
      success: true,
      data: {
        totalPayments,
        paymentCount: payments.length,
        paymentsByMethod,
        recentPayments: payments.slice(0, 10),
        averagePayment: payments.length > 0 ? totalPayments / payments.length : 0,
      }
    };
  } catch (error) {
    console.error('Error getting payment analysis:', error);
    return { success: false, error: 'Failed to get payment data' };
  }
}

// Get daily revenue from invoices (SAFE - uses existing data)
export async function getDailyRevenueFromInvoices(days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        paidAmount: true,
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const dailyRevenue = invoices.reduce((acc, invoice) => {
      const date = invoice.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { paid: 0, invoiced: 0, count: 0 };
      }
      acc[date].paid += invoice.paidAmount;
      acc[date].invoiced += invoice.total;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { paid: number; invoiced: number; count: number }>);

    return { success: true, data: dailyRevenue };
  } catch (error) {
    console.error('Error getting daily revenue:', error);
    return { success: false, error: 'Failed to get daily revenue' };
  }
}

// Combined dashboard data (SAFE - uses existing Invoice/Payment tables)
export async function getDashboardRevenue() {
  try {
    const [invoiceResult, paymentResult] = await Promise.all([
      getRevenueFromInvoices(),
      getPaymentAnalysis()
    ]);

    if (
      !invoiceResult.success ||
      !paymentResult.success ||
      !invoiceResult.data ||
      !paymentResult.data
    ) {
      throw new Error('Failed to fetch revenue data');
    }

    return {
      success: true,
      data: {
        // Invoice data
        totalRevenue: invoiceResult.data.totalRevenue,
        totalInvoiced: invoiceResult.data.totalInvoiced,
        totalDue: invoiceResult.data.totalDue,
        invoiceCount: invoiceResult.data.invoiceCount,
        averageInvoice: invoiceResult.data.averageInvoice,
        collectionRate: invoiceResult.data.collectionRate,
        
        // Payment data
        totalPayments: paymentResult.data.totalPayments,
        paymentCount: paymentResult.data.paymentCount,
        paymentsByMethod: paymentResult.data.paymentsByMethod,
        averagePayment: paymentResult.data.averagePayment,
        
        // Recent activity
        recentInvoices: invoiceResult.data.invoices,
        recentPayments: paymentResult.data.recentPayments,
      }
    };
  } catch (error) {
    console.error('Error getting dashboard revenue:', error);
    return { success: false, error: 'Failed to get dashboard data' };
  }
}

// Get revenue by ticket status (SAFE - uses existing Ticket/Invoice data)
export async function getRevenueByTicketStatus() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        invoice: {
          select: {
            total: true,
            paidAmount: true,
            dueAmount: true,
          }
        }
      }
    });

    const revenueByStatus = tickets.reduce((acc, ticket) => {
      if (!acc[ticket.status]) {
        acc[ticket.status] = { 
          totalInvoiced: 0, 
          totalPaid: 0, 
          totalDue: 0, 
          ticketCount: 0 
        };
      }

      // Handle invoice as array or single object/null
      const invoices = Array.isArray(ticket.invoice)
        ? ticket.invoice
        : ticket.invoice
          ? [ticket.invoice]
          : [];

      const invoiceTotal = invoices.reduce((sum: number, inv: { total: number }) => sum + inv.total, 0);
      const paidTotal = invoices.reduce((sum: number, inv: { paidAmount: number }) => sum + inv.paidAmount, 0);
      const dueTotal = invoices.reduce((sum: number, inv: { dueAmount: number }) => sum + inv.dueAmount, 0);

      acc[ticket.status].totalInvoiced += invoiceTotal;
      acc[ticket.status].totalPaid += paidTotal;
      acc[ticket.status].totalDue += dueTotal;
      acc[ticket.status].ticketCount += 1;

      return acc;
    }, {} as Record<string, { totalInvoiced: number; totalPaid: number; totalDue: number; ticketCount: number }>);

    return { success: true, data: revenueByStatus };
  } catch (error) {
    console.error('Error getting revenue by ticket status:', error);
    return { success: false, error: 'Failed to get revenue by ticket status' };
  }
}
