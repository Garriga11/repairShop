import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      select: {
        id: true,
        name: true,
        balance: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, initialBalance = 0 } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Account name is required' },
        { status: 400 }
      );
    }

    const account = await prisma.account.create({
      data: {
        name,
        balance: initialBalance,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
