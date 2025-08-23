'use client';

import { useState } from 'react';
import  { processManualPayment } from '@/app/payment/manual/actions';

interface Invoice {
  id: string;
  total: number;
  paidAmount: number;
  dueAmount: number;
  ticket?: {
    customerName: string | null;
    device: string | null;
    status: string;
  };
}

interface PaymentFormProps {
  invoices: Invoice[];
}

export default function PaymentForm({ invoices }: PaymentFormProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedInvoiceData = invoices.find(inv => inv.id === selectedInvoice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInvoice || !paymentAmount) {
      setMessage({ type: 'error', text: 'Please select an invoice and enter payment amount' });
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid payment amount' });
      return;
    }

    if (selectedInvoiceData && amount > selectedInvoiceData.dueAmount) {
      setMessage({ type: 'error', text: 'Payment amount cannot exceed due amount' });
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const result = await processManualPayment({
        invoiceId: selectedInvoice,
        amount,
        method: paymentMethod as 'CASH' | 'CHECK' | 'CARD' | 'BANK_TRANSFER',
        notes
      });

      if (result.success) {
        setMessage({ type: 'success', text: `Payment of $${amount.toFixed(2)} processed successfully!` });
        // Reset form
        setSelectedInvoice('');
        setPaymentAmount('');
        setNotes('');
        // Refresh page to show updated data
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to process payment' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while processing payment' });
    } finally {
      setIsProcessing(false);
    }
  };

  const setMaxPayment = () => {
    if (selectedInvoiceData) {
      setPaymentAmount(selectedInvoiceData.dueAmount.toFixed(2));
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Invoice
          </label>
          <select
            value={selectedInvoice}
            onChange={(e) => setSelectedInvoice(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Choose an invoice...</option>
            {invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.ticket?.customerName || 'No customer'} - 
                ${invoice.dueAmount.toFixed(2)} due 
                (#{invoice.id.slice(-8)})
              </option>
            ))}
          </select>
        </div>

        {/* Selected Invoice Details */}
        {selectedInvoiceData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Selected Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Customer:</span> {selectedInvoiceData.ticket?.customerName}
              </div>
              <div>
                <span className="text-blue-700">Device:</span> {selectedInvoiceData.ticket?.device}
              </div>
              <div>
                <span className="text-blue-700">Total:</span> ${selectedInvoiceData.total.toFixed(2)}
              </div>
              <div>
                <span className="text-blue-700">Already Paid:</span> ${selectedInvoiceData.paidAmount.toFixed(2)}
              </div>
              <div className="col-span-2">
                <span className="text-blue-700 font-semibold">Amount Due:</span> 
                <span className="font-bold text-red-600"> ${selectedInvoiceData.dueAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Amount
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              max={selectedInvoiceData?.dueAmount || undefined}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              required
            />
            {selectedInvoiceData && (
              <button
                type="button"
                onClick={setMaxPayment}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Pay Full
              </button>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="CASH">💵 Cash</option>
            <option value="CHECK">📄 Check</option>
            <option value="CARD">💳 Credit/Debit Card</option>
            <option value="BANK_TRANSFER">🏦 Bank Transfer</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Add any notes about this payment..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing || !selectedInvoice || !paymentAmount}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? '⏳ Processing...' : '💰 Process Payment'}
        </button>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
