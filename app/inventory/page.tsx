'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  deviceModel?: string;
  quantity: number;
  reorderLevel: number;
  cost: number;
  sellPrice?: number;
  needsReorder: boolean;
  isActive: boolean;
}

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    fetchInventory();
  }, [status, router]);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.deviceModel && item.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()));
    
    switch (filter) {
      case 'low-stock':
        return matchesSearch && item.quantity <= item.reorderLevel;
      case 'out-of-stock':
        return matchesSearch && item.quantity === 0;
      case 'needs-reorder':
        return matchesSearch && item.needsReorder;
      default:
        return matchesSearch && item.isActive;
    }
  });

  if (status === 'loading' || loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <div className="flex gap-2">
          <Link 
            href="/inventory/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add New Item
          </Link>
          <Link 
            href="/inventory/stock-movement"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Adjust Stock
          </Link>
          <Link 
            href="/inventory/reorder-report"
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            Reorder Report
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilter('low-stock')}
            className={`px-3 py-1 rounded ${filter === 'low-stock' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}
          >
            Low Stock
          </button>
          <button
            onClick={() => setFilter('out-of-stock')}
            className={`px-3 py-1 rounded ${filter === 'out-of-stock' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
          >
            Out of Stock
          </button>
          <button
            onClick={() => setFilter('needs-reorder')}
            className={`px-3 py-1 rounded ${filter === 'needs-reorder' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
          >
            Needs Reorder
          </button>
        </div>
        
        <input
          type="text"
          placeholder="Search by name, SKU, or device model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded-lg flex-1 min-w-64"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Total Items</h3>
          <p className="text-2xl font-bold text-blue-600">{inventory.filter(i => i.isActive).length}</p>
        </div>
        <div className="bg-orange-100 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-800">Low Stock</h3>
          <p className="text-2xl font-bold text-orange-600">
            {inventory.filter(i => i.quantity <= i.reorderLevel).length}
          </p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800">Out of Stock</h3>
          <p className="text-2xl font-bold text-red-600">
            {inventory.filter(i => i.quantity === 0).length}
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Total Value</h3>
          <p className="text-2xl font-bold text-green-600">
            ${inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device Model
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInventory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.sku}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.name}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.deviceModel || '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.category || '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.quantity === 0 ? 'bg-red-100 text-red-800' :
                    item.quantity <= item.reorderLevel ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.quantity}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${item.cost.toFixed(2)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {item.quantity === 0 ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Out of Stock
                    </span>
                  ) : item.quantity <= item.reorderLevel ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      Low Stock
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      In Stock
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/inventory/edit/${item.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/inventory/history/${item.id}`}
                    className="text-green-600 hover:text-green-900"
                  >
                    History
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredInventory.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No inventory items found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
