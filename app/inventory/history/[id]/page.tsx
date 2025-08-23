'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface StockMovement {
  id: number;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
}

export default function InventoryHistoryPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch inventory item details
        const itemResponse = await fetch(`/api/inventory/${params.id}`);
        if (itemResponse.ok) {
          const itemData = await itemResponse.json();
          setItem(itemData);
        }

        // Fetch stock movements
        const movementsResponse = await fetch(`/api/inventory/${params.id}/movements`);
        if (movementsResponse.ok) {
          const movementsData = await movementsResponse.json();
          setMovements(movementsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load inventory history');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getMovementTypeDisplay = (type: string) => {
    switch (type) {
      case 'STOCK_IN':
        return { text: 'Stock In', color: 'text-green-600 bg-green-100' };
      case 'STOCK_OUT':
        return { text: 'Stock Out', color: 'text-red-600 bg-red-100' };
      case 'ADJUSTMENT':
        return { text: 'Adjustment', color: 'text-blue-600 bg-blue-100' };
      default:
        return { text: type, color: 'text-gray-600 bg-gray-100' };
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center">Loading inventory history...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center text-red-600">Inventory item not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="mr-4 text-blue-600 hover:text-blue-800"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-3xl font-bold">Inventory History</h1>
          <p className="text-gray-600 mt-1">
            {item.name} ({item.sku}) - Current Stock: {item.quantity}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Stock Movement History</h2>
        </div>

        {movements.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No stock movements found for this item.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map((movement) => {
                  const typeDisplay = getMovementTypeDisplay(movement.type);
                  return (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(movement.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeDisplay.color}`}>
                          {typeDisplay.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.type === 'STOCK_OUT' ? '-' : '+'}{movement.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {movement.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.user.name || movement.user.email || 'Unknown'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => router.push('/inventory')}
          className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
        >
          Back to Inventory
        </button>
        
        <button
          onClick={() => router.push(`/inventory/edit/${params.id}`)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Edit Item
        </button>
      </div>
    </div>
  );
}
