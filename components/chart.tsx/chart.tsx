'use client'

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

// 1. Define your slice shape
export type StatusSlice = {
  status: string;
  value: number;
};

// 2. Props for the chart component
export type StatusChartProps = {
  data: StatusSlice[];
};

const COLORS = ["#4ADE80", "#A3A3A3"];

export default function StatusChart({ data }: StatusChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        {/* ✅ No generic here */}
        <Pie
          data={data}
          dataKey="value"
          nameKey="status"
          outerRadius={80}
          label
        >
          {data.map((entry, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
