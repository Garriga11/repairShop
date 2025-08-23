'use client';

import { useState, useEffect } from 'react';
import { closeTicketAndInvoice } from '@/app/closeTicket/action';
import Link from 'next/link';

interface Ticket {
  id: string;
  device: string | null;
  deviceSN: string | null;
  location: string | null;
  status: string;
  ticketBalance: string | null;
  description: string | null;
  customerName: string | null;
  customerPhone: string | null;
  createdAt: string;
  account: {
    name: string;
    balance: number;
  } | null;
}

export default function CloseTicketPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [total, setTotal] = useState(0);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchOpenTickets();
  }, []);

  const fetchOpenTickets = async () => {
    try {
      console.log('Fetching open tickets...');
      // Try without status filter first to test if API works
      const response = await fetch('/api/tickets');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Tickets data:', data);
        // Filter for OPEN tickets on frontend temporarily
        const openTickets = (data.tickets || []).filter((ticket: any) => ticket.status === 'OPEN');
        setTickets(openTickets);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch tickets:', response.status, errorText);
        alert(`Failed to fetch tickets: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      alert(`Error fetching tickets: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowInvoiceForm(true);
    // Pre-fill total with ticket balance if available
    const balance = parseFloat(ticket.ticketBalance || '0');
    setTotal(balance > 0 ? balance : 0);
  };

  const handleCloseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setProcessing(true);
    try {
      console.log('🎫 Starting close ticket process...');
      console.log('Selected ticket:', selectedTicket);
      console.log('Total amount:', total);
      
      const result = await closeTicketAndInvoice(selectedTicket.id, total);
      console.log('🎯 Close ticket result:', result);
      
      if (result && result.invoiceId) {
        console.log('✅ Invoice created successfully:', result.invoiceId);
        console.log('💰 Due amount:', result.dueAmount);
        console.log('🔧 Repair type:', result.repairType);
        console.log('📦 Parts used:', result.partsUsed);
        console.log('📋 Parts deducted:', result.partsDeducted);
        
        let message = `Ticket closed! Invoice ${result.invoiceId} created. Due: $${result.dueAmount}`;
        
        // Add repair type info
        if (result.repairType && result.repairType !== 'No repair type specified') {
          message += `\nRepair Type: ${result.repairType}`;
        }
        
        // Add inventory information if parts were deducted
        if (result.partsDeducted && result.partsDeducted.length > 0) {
          message += '\n\nInventory deducted:';
          result.partsDeducted.forEach(part => {
            message += `\n• ${part.name}: ${part.quantityUsed} units (${part.remainingStock} remaining)`;
          });
        } else {
          message += '\n\nNo inventory was deducted.';
          if (!result.repairType || result.repairType === 'No repair type specified') {
            message += '\nReason: No repair type assigned to ticket.';
          } else if (result.partsUsed === 0) {
            message += '\nReason: No parts mapped to this repair type.';
          }
        }
        
        alert(message);
        
        // Remove closed ticket from list
        setTickets(prev => prev.filter(t => t.id !== selectedTicket.id));
        setSelectedTicket(null);
        setShowInvoiceForm(false);
        setTotal(0);
      } else {
        throw new Error('Invalid response from close ticket action');
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
      alert(`Failed to close ticket and create invoice: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Loading open tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Close Tickets & Generate Invoices</h1>

        {!showInvoiceForm ? (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-4">Open Tickets ({tickets.length})</h2>
              {tickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No open tickets found.</p>
                  <a href="/ticket/new" className="text-blue-600 hover:underline">
                    Create a new ticket
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">
                              {ticket.customerName || 'No Customer Name'} - {ticket.device || 'Unknown Device'}
                            </h3>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                              {ticket.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                            <p><strong>Phone:</strong> {ticket.customerPhone || 'N/A'}</p>
                            <p><strong>Serial:</strong> {ticket.deviceSN || 'N/A'}</p>
                            <p><strong>Location:</strong> {ticket.location || 'N/A'}</p>
                            <p><strong>Balance:</strong> ${ticket.ticketBalance || '0'}</p>
                          </div>

                          {ticket.description && (
                            <p className="text-gray-700 mb-2">
                              <strong>Description:</strong> {ticket.description}
                            </p>
                          )}

                          {ticket.account && (
                            <p className="text-sm text-blue-600">
                              <strong>Account:</strong> {ticket.account.name} (Balance: ${ticket.account.balance.toFixed(2)})
                            </p>
                          )}

                          <p className="text-xs text-gray-500 mt-2">
                            Created: {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <button
                          onClick={() => handleSelectTicket(ticket)}
                          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                          Close Ticket
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <button
                onClick={() => {
                  setShowInvoiceForm(false);
                  setSelectedTicket(null);
                  setTotal(0);
                }}
                className="text-blue-600 hover:text-blue-700 mb-4"
              >
                ← Back to Tickets
              </button>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  Closing Ticket: {selectedTicket?.customerName || 'Unknown Customer'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p><strong>Device:</strong> {selectedTicket?.device || 'N/A'}</p>
                  <p><strong>Serial:</strong> {selectedTicket?.deviceSN || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedTicket?.customerPhone || 'N/A'}</p>
                  <p><strong>Current Balance:</strong> ${selectedTicket?.ticketBalance || '0'}</p>
                </div>
                {selectedTicket?.description && (
                  <p className="mt-2"><strong>Issue:</strong> {selectedTicket.description}</p>
                )}
              </div>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Generate Invoice</h3>
              <form onSubmit={handleCloseTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Total Repair Cost
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter total repair cost"
                    required
                    className="w-full border p-3 rounded"
                    value={total || ''}
                    onChange={(e) => setTotal(parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This will be the total amount on the invoice
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={processing}
                    className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Processing...' : 'Close Ticket & Generate Invoice'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowInvoiceForm(false);
                      setSelectedTicket(null);
                      setTotal(0);
                    }}
                    className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link href="/ticket" className="text-blue-600 hover:underline mr-4">
            View All Tickets
          </Link>
          <a href="/invoice" className="text-blue-600 hover:underline">
            View Invoices
          </a>
        </div>
      </div>
    </div>
  );
}
