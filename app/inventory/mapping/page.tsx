'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  cost: number;
  repairTypes: Array<{ id: string; name: string }>;
}

interface RepairType {
  id: string;
  name: string;
  description?: string;
  deviceType: string;
  deviceModel: string;
  category: string;
  laborPrice: number;
  parts: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    cost: number;
  }>;
  tickets: Array<{ id: string; status: string }>;
}

interface MappingData {
  repairTypes: RepairType[];
  inventoryItems: InventoryItem[];
  summary: {
    totalRepairTypes: number;
    repairTypesWithParts: number;
    totalInventoryItems: number;
    inventoryItemsLinkedToRepairs: number;
  };
}

export default function RepairInventoryMappingPage() {
  const [data, setData] = useState<MappingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRepairType, setSelectedRepairType] = useState<string>('');
  const [selectedInventoryItems, setSelectedInventoryItems] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMappingData();
  }, []);

  const fetchMappingData = async () => {
    try {
      const response = await fetch('/api/repair-inventory-mapping');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching mapping data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMapping = async () => {
    if (!selectedRepairType || selectedInventoryItems.length === 0) {
      alert('Please select a repair type and at least one inventory item');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/repair-inventory-mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repairTypeId: selectedRepairType,
          inventoryItemIds: selectedInventoryItems
        })
      });

      if (response.ok) {
        alert('Mapping saved successfully!');
        await fetchMappingData(); // Refresh data
        setSelectedRepairType('');
        setSelectedInventoryItems([]);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving mapping:', error);
      alert('Failed to save mapping');
    } finally {
      setSaving(false);
    }
  };

  const toggleInventoryItem = (itemId: string) => {
    setSelectedInventoryItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Loading mapping data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-red-600">Failed to load mapping data</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Repair Type → Inventory Mapping</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-semibold mb-2">Total Repair Types</h3>
          <p className="text-3xl font-bold text-blue-600">{data.summary.totalRepairTypes}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold mb-2">Mapped Repair Types</h3>
          <p className="text-3xl font-bold text-green-600">{data.summary.repairTypesWithParts}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold mb-2">Total Inventory Items</h3>
          <p className="text-3xl font-bold text-purple-600">{data.summary.totalInventoryItems}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold mb-2">Linked Items</h3>
          <p className="text-3xl font-bold text-orange-600">{data.summary.inventoryItemsLinkedToRepairs}</p>
        </Card>
      </div>

      {/* Mapping Interface */}
      <Card className="mb-8">
        <h2 className="text-xl font-bold mb-4">Create New Mapping</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Repair Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Repair Type:</label>
            <select 
              value={selectedRepairType} 
              onChange={(e) => setSelectedRepairType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Choose a repair type...</option>
              {data.repairTypes.map(repair => (
                <option key={repair.id} value={repair.id}>
                  {repair.name} ({repair.deviceModel}) - {repair.parts.length} parts linked
                </option>
              ))}
            </select>
          </div>

          {/* Inventory Items Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Inventory Items:</label>
            <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto p-3">
              {data.inventoryItems.map(item => (
                <label key={item.id} className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedInventoryItems.includes(item.id)}
                    onChange={() => toggleInventoryItem(item.id)}
                    className="rounded"
                  />
                  <span className="text-sm">
                    {item.name} ({item.sku}) - Stock: {item.quantity} - ${item.cost}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Button 
            onClick={handleSaveMapping} 
            disabled={saving || !selectedRepairType || selectedInventoryItems.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Mapping'}
          </Button>
        </div>
      </Card>

      {/* Current Mappings */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Current Mappings</h2>
        
        {data.repairTypes.filter(rt => rt.parts.length > 0).length === 0 ? (
          <p className="text-gray-500 italic">No repair types are currently mapped to inventory items.</p>
        ) : (
          <div className="space-y-4">
            {data.repairTypes
              .filter(rt => rt.parts.length > 0)
              .map(repairType => (
                <div key={repairType.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-blue-600">
                    {repairType.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {repairType.deviceType} - {repairType.deviceModel} | {repairType.category}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    Labor Price: ${repairType.laborPrice} | Active Tickets: {repairType.tickets.filter(t => t.status !== 'CLOSED').length}
                  </p>
                  
                  <div className="bg-gray-50 rounded p-3">
                    <h4 className="font-medium mb-2">Required Parts:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {repairType.parts.map(part => (
                        <div key={part.id} className="bg-white border rounded p-2">
                          <p className="font-medium text-sm">{part.name}</p>
                          <p className="text-xs text-gray-600">SKU: {part.sku}</p>
                          <p className="text-xs text-gray-600">Stock: {part.quantity}</p>
                          <p className="text-xs text-gray-600">Cost: ${part.cost}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}
