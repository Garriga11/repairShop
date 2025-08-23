import { getUnpaidInvoices } from '@/app/payment/manual/actions';
import PaymentForm from '@/app/payment//manual/PaymentForm';

export default async function ManualPaymentPage() {
  const invoicesResult = await getUnpaidInvoices();
  
  if (!invoicesResult.success) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-600">❌ Failed to load invoices</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">💰 Process Payment</h1>
        <div className="text-sm text-gray-600">
          {invoicesResult.data.length} unpaid invoices
        </div>
      </div>

      {invoicesResult.data.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-lg">🎉 All invoices are paid!</div>
          <p className="text-green-600 mt-2">No outstanding balances.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invoice List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">🧾 Unpaid Invoices</h2>
            <div className="space-y-3">
              {invoicesResult.data.map((invoice) => (
                <div key={invoice.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {invoice.ticket?.customerName || 'No customer'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {invoice.ticket?.device || 'No device'} - {invoice.ticket?.status}
                      </div>
                      <div className="text-xs text-gray-500">
                        Invoice #{invoice.id.slice(-8)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ${invoice.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-green-600">
                        Paid: ${invoice.paidAmount.toFixed(2)}
                      </div>
                      <div className="text-sm text-red-600 font-semibold">
                        Due: ${invoice.dueAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">💳 Record Payment</h2>
            <PaymentForm invoices={invoicesResult.data} />
          </div>
        </div>
      )}
    </div>
  );
}
