import { ReactNode } from "react"

// components/Dashboard/MetricCard.tsx
interface MetricCardProps {
  title: string
  value: number | string
  icon: ReactNode
}
export default function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <div className="flex items-center bg-white p-4 rounded shadow hover:">
      <div className="text-2xl mr-4">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  )
}
