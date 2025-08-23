'use client';

import { useState } from 'react';
import { closeTicketAndInvoice } from '@/app/ticket/closeTicket/action';

export default function CloseTicketForm({ ticketId }: { ticketId: string }) {
  const [total, setTotal] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await closeTicketAndInvoice(ticketId, total);
      
      let message = `Invoice ${result.invoiceId} created. Due: $${result.dueAmount}`;
      
      // Add inventory information if parts were deducted
      if (result.partsDeducted && result.partsDeducted.length > 0) {
        message += '\n\nInventory deducted:';
        result.partsDeducted.forEach(part => {
          message += `\n• ${part.name}: ${part.quantityUsed} unit(s) (${part.remainingStock} remaining)`;
        });
      }
      
      alert(message);
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="number"
        min="1"
        placeholder="Total repair cost"
        required
        className="w-full border p-2"
        value={total}
        onChange={(e) => setTotal(parseFloat(e.target.value))}
      />
      <button className="bg-green-600 text-white px-4 py-2 rounded">
        Close Ticket & Generate Invoice
      </button>
    </form>
  );
}
