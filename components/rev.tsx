'use client'

import { useEffect, useState } from 'react'
import { getTotalRevenue } from '@/app/revCard/action'

export default function RevenueCard() {
  const [revenue, setRevenue] = useState(0)

  useEffect(() => {
    getTotalRevenue().then(setRevenue)
  }, [])
  return (
    <div className="p-4 rounded shadow bg-green-100 max-w-sm">
      <h3 className="text-lg font-medium">Total Revenue</h3>
      <p className="text-2xl font-bold text-green-700">
        {revenue !== null ? `$${revenue.toFixed(2)}` : 'Loading...'}
      </p>
    </div>
  )
}
