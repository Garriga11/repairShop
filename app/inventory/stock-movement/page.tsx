'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  deviceModel?: string;
}

export default function StockMovementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    type: 'STOCK_IN',
    quantity: '',
    reason: '',
    reference: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem) {
      alert('Please select an inventory item');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/inventory/stock-movement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inventoryId: selectedItem,
          type: formData.type,
          quantity: formData.type === 'STOCK_OUT' ? -Math.abs(parseInt(formData.quantity)) : parseInt(formData.quantity),
          reason: formData.reason,
          reference: formData.reference
        }),
      });

      if (response.ok) {
        router.push('/inventory');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating stock movement:', error);
      alert('Failed to create stock movement');
    } finally {
      setLoading(false);
    }
  };

  const selectedItemData = inventory.find(item => item.id === selectedItem);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="mr-4 text-blue-600 hover:text-blue-800"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold">Stock Movement / Adjustment</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Movement Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Movement Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="STOCK_IN">Stock In (Add Inventory)</option>
            <option value="STOCK_OUT">Stock Out (Remove Inventory)</option>
            <option value="ADJUSTMENT">Adjustment (Correction)</option>
            <option value="DAMAGED">Damaged (Write Off)</option>
            <option value="RETURNED">Returned (Customer Return)</option>
          </select>
        </div>

        {/* Item Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Inventory Item *
          </label>
          <input
            type="text"
            placeholder="Search by item name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          />
          
          <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
            {filteredInventory.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item.id)}
                className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-200 ${
                  selectedItem === item.id ? 'bg-blue-50 border-blue-300' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.sku} | {item.deviceModel || 'Universal'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Current: {item.quantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedItemData && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="font-medium">Selected: {selectedItemData.name}</p>
              <p className="text-sm text-gray-600">Current Stock: {selectedItemData.quantity} units</p>
            </div>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity *
          </label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="Enter quantity"
          />
          {selectedItemData && formData.quantity && (
            <p className="text-sm text-gray-600 mt-1">
              New stock level will be: {
                formData.type === 'STOCK_OUT' 
                  ? Math.max(0, selectedItemData.quantity - parseInt(formData.quantity))
                  : selectedItemData.quantity + parseInt(formData.quantity)
              } units
            </p>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason *
          </label>
          <select
            value={formData.reason}
            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select reason...</option>
            {formData.type === 'STOCK_IN' && (
              <>
                <option value="New stock received">New stock received</option>
                <option value="Vendor delivery">Vendor delivery</option>
                <option value="Transfer from other location">Transfer from other location</option>
                <option value="Return to stock">Return to stock</option>
                <option value="Initial inventory">Initial inventory</option>
              </>
            )}
            {formData.type === 'STOCK_OUT' && (
              <>
                <option value="Used in repair">Used in repair</option>
                <option value="Sold separately">Sold separately</option>
                <option value="Transfer to other location">Transfer to other location</option>
                <option value="Sample/demo">Sample/demo</option>
              </>
            )}
            {formData.type === 'ADJUSTMENT' && (
              <>
                <option value="Count correction">Count correction</option>
                <option value="System error correction">System error correction</option>
                <option value="Physical inventory adjustment">Physical inventory adjustment</option>
              </>
            )}
            {formData.type === 'DAMAGED' && (
              <>
                <option value="Damaged during handling">Damaged during handling</option>
                <option value="Defective from vendor">Defective from vendor</option>
                <option value="Customer damage">Customer damage</option>
                <option value="Expired/obsolete">Expired/obsolete</option>
              </>
            )}
            {formData.type === 'RETURNED' && (
              <>
                <option value="Customer return">Customer return</option>
                <option value="Warranty return">Warranty return</option>
                <option value="Vendor return">Vendor return</option>
              </>
            )}
          </select>
        </div>

        {/* Reference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reference (Optional)
          </label>
          <input
            type="text"
            value={formData.reference}
            onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Ticket #123, PO #456, Invoice #789"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={loading || !selectedItem}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Update Stock'}
          </button>
          
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
