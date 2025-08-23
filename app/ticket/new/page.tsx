'use client';

import { useState, useEffect } from 'react';
import { createSimpleTicketAction } from '@/app/ticket/new/actions';

interface RepairType {
  id: string;
  name: string;
  description?: string;
  deviceType: string;
  deviceModel: string;
  category: string;
  laborPrice: number;
  parts: {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    cost: number;
  }[];
}

export default function NewTicketForm() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [device, setDevice] = useState('');
  const [deviceSN, setDeviceSN] = useState('');
  const [location, setLocation] = useState('');
  const [ticketBalance, setTicketBalance] = useState('');
  const [status, setStatus] = useState('OPEN');
  const [repairTypeId, setRepairTypeId] = useState('');
  
  // New state for repair types
  const [repairTypes, setRepairTypes] = useState<RepairType[]>([]);
  const [selectedRepairType, setSelectedRepairType] = useState<RepairType | null>(null);

  useEffect(() => {
    fetchRepairTypes();
  }, []);

  const fetchRepairTypes = async () => {
    try {
      const response = await fetch('/api/repair-types');
      if (response.ok) {
        const data = await response.json();
        setRepairTypes(data);
      }
    } catch (error) {
      console.error('Error fetching repair types:', error);
    }
  };

  const handleRepairTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setRepairTypeId(selectedId);
    
    const repairType = repairTypes.find(rt => rt.id === selectedId);
    setSelectedRepairType(repairType || null);
    
    // Auto-fill device info if repair type is selected
    if (repairType) {
      setDevice(repairType.deviceModel);
      setDescription(repairType.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await createSimpleTicketAction({
        customerName,
        customerPhone,
        device,
        deviceSN,
        description,
        location,
        ticketBalance,
        status,
        repairTypeId: repairTypeId || undefined,
      });

      if (res.success) {
        setSuccessMessage(`Ticket created: ${res.ticketId}. Account: ${res.accountName} (${res.accountId})`);
        
        // Reset form
        setDescription('');
        setCustomerName('');
        setCustomerPhone('');
        setDevice('');
        setDeviceSN('');
        setLocation('');
        setTicketBalance('');
        setStatus('OPEN');
        setRepairTypeId('');
        setSelectedRepairType(null);
      } else {
        alert(res.error || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow space-y-4"
    >
      {successMessage && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
          {successMessage}
        </div>
      )}

      {/* Repair Type Selection */}
      <div>
        <label className="block mb-1 font-semibold">Repair Type (Optional):</label>
        <select
          value={repairTypeId}
          onChange={handleRepairTypeChange}
          className="w-full border rounded p-2"
        >
          <option value="">Select a repair type...</option>
          {repairTypes.map((repairType) => (
            <option key={repairType.id} value={repairType.id}>
              {repairType.name} - {repairType.deviceModel} (${repairType.laborPrice})
            </option>
          ))}
        </select>
        {selectedRepairType && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
            <p><strong>Labor:</strong> ${selectedRepairType.laborPrice}</p>
            <p><strong>Category:</strong> {selectedRepairType.category}</p>
            {selectedRepairType.parts.length > 0 && (
              <div>
                <p><strong>Required Parts:</strong></p>
                <ul className="list-disc list-inside ml-2">
                  {selectedRepairType.parts.map(part => (
                    <li key={part.id}>
                      {part.name} ({part.sku}) - Stock: {part.quantity}
                      {part.quantity === 0 && <span className="text-red-600 ml-1">(Out of stock!)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block mb-1 font-semibold">Customer Name:</label>
        <input
          type="text"
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Customer Phone:</label>
        <input
          type="text"
          value={customerPhone}
          onChange={e => setCustomerPhone(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Description:</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the issue or repair needed..."
          required
          rows={3}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Model:</label>
        <input
          type="text"
          value={device}
          onChange={e => setDevice(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Serial Number:</label>
        <input
          type="text"
          value={deviceSN}
          onChange={e => setDeviceSN(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Location:</label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Ticket Balance:</label>
        <input
          type="text"
          value={ticketBalance}
          onChange={e => setTicketBalance(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Status:</label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Ticket...' : 'Create Ticket'}
      </button>
    </form>
  );
}