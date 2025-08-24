import {  NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    // Fetch tickets with related account data
    const [tickets, totalCount] = await Promise.all([
      prisma.ticket.findMany({
        where: whereClause,
        include: {
          account: {
            select: {
              name: true,
              balance: true,
            }
          },
          User: {
            select: {
              name: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.ticket.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      tickets,
      totalPages,
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const ticket = await prisma.ticket.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        device: data.device,
        deviceSN: data.deviceSN,
        location: data.location,
        description: data.description,
        ticketBalance: data.ticketBalance,
        status: data.status || 'OPEN',
        accountId: data.accountId,
        userId: data.userId,
      },
      include: {
        account: true,
        User: true,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}