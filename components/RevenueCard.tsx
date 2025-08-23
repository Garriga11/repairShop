
import { getRevenueFromInvoices } from '../app/revenue/actions-safe';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

export default async function RevenueCard() {
  const result = await getRevenueFromInvoices();

  if (!result.success) {
    return (
      <Card className="p-6">
        <div className="text-red-500">Failed to load revenue data</div>
      </Card>
    );
  }

  const { data } = result;
  
  if (!data) {
    return (
      <Card className="p-6">
        <div className="text-red-500">Revenue data is unavailable</div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <div className="h-4 w-4 text-green-600">💰</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data.totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            From {data.invoiceCount} invoices
          </p>
        </CardContent>
      </Card>

      {/* Collection Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
          <div className="h-4 w-4 text-blue-600">📊</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.collectionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            ${data.totalRevenue.toFixed(2)} of ${data.totalInvoiced.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      {/* Outstanding Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          <div className="h-4 w-4 text-orange-600">⏳</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data.totalDue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Amount due from customers
          </p>
        </CardContent>
      </Card>

      {/* Average Invoice */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Invoice</CardTitle>
          <div className="h-4 w-4 text-purple-600">🧾</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data.averageInvoice.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Per invoice amount
          </p>
        </CardContent>
      </Card>

      
      
{/* Payment Methods section removed due to missing paymentsByMethod property */}
      {/* Recent Activity */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.invoices.slice(0, 5).map((invoice: any) => (
              <div key={invoice.id} className="flex justify-between items-center py-1">
                <div>
                  <div className="font-medium text-sm">{invoice.ticket?.customerName || 'No customer'}</div>
                  <div className="text-xs text-muted-foreground">{invoice.ticket?.device || 'No device'}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">${invoice.total.toFixed(2)}</div>
                  <div className="text-xs text-green-600">Paid: ${invoice.paidAmount.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
