// app/account/actions.ts
'use server'

import prisma from '@/lib/prisma'

export async function getTotalRevenue() {
  const invoices = await prisma.invoice.findMany({
    select: { paidAmount: true },
  })
  const total = invoices.reduce((sum, acc) => sum + acc.paidAmount, 0)
  return total
}
