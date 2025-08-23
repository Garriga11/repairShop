import { getTotalRevenue } from "./action";

function Total({ totalRevenue }: { totalRevenue: number }) {
  return <div>Total Revenue: {totalRevenue}</div>;
}

export default async function RevenuePage() {
  const totalRevenue = await getTotalRevenue();

  
  return (
    <main className="space-y-6 p-6">
      <Total totalRevenue={totalRevenue} />
      {/* other components like AccountForm */}
    </main>
  )
}
