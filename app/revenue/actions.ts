'use server';

import prisma from "@/lib/prisma";

// Create revenue record when payment is received
export async function revenue(data: {
  amount: number;
  source: 'REPAIR_SERVICE' | 'PARTS_SALE' | 'LABOR_CHARGE' | 'DIAGNOSTIC_FEE' | 'RUSH_SERVICE' | 'WARRANTY_WORK' | 'OTHER';
  description?: string;
  invoiceId?: string;
  ticketId?: string;
  accountId?: string;
  paymentDate?: Date;
}) {
  
    const revenue = await prisma.revenue.create({
      data: {
        amount: data.amount,
        source: data.source,
        description: data.description,
        invoiceId: data.invoiceId,
        ticketId: data.ticketId,
        accountId: data.accountId,
        paymentDate: data.paymentDate || new Date(),
      },
    });

    return { success: true, revenueId: revenue.id };
  }



export async function getRevenueSummary(
  startDate: Date, 
  endDate: Date
) {
  try {
    const revenue = await prisma.revenue.findMany({
      where: {
        paymentDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        invoice: true,
        ticket: true,
        account: true,
      },
      orderBy: {
        paymentDate: 'desc',
      },
    });

    // Calculate totals by source
    const summary = revenue.reduce((acc: any , rev: any) => {
      if (!acc[rev.source]) {
        acc[rev.source] = { total: 0, count: 0 };
      }
      acc[rev.source].total += rev.amount;
      acc[rev.source].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const totalRevenue = revenue.reduce((sum: any, rev: any) => sum + rev.amount, 0);

    return {
      success: true,
      revenue,
      summary,
      totalRevenue,
      period: { startDate, endDate },
    };
  } catch (error) {
    console.error('Error getting revenue summary:', error);
    return { success: false, error: 'Failed to get revenue summary' };
  }
}

// Get daily revenue for charts
export async function getDailyRevenue(days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenue = await prisma.revenue.findMany({
      where: {
        paymentDate: {
          gte: startDate,
        },
      },
      select: {
        amount: true,
        paymentDate: true,
        source: true,
      },
      orderBy: {
        paymentDate: 'asc',
      },
    });

    // Group by date
    const dailyRevenue = revenue.reduce((acc: any, rev: any) => {
      const date = rev.paymentDate.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += rev.amount;
      return acc;
    }, {} as Record<string, number>);

    return { success: true, dailyRevenue };
  } catch (error) {
    console.error('Error getting daily revenue:', error);
    return { success: false, error: 'Failed to get daily revenue' };
  }
}
