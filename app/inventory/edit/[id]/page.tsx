'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  deviceModel: string | null;
  quantity: number;
  reorderLevel: number;
  cost: number;
  sellPrice: number | null;
  location: string | null;
  binNumber: string | null;
}

export default function EditInventoryPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    deviceModel: '',
    quantity: '0',
    reorderLevel: '5',
    cost: '',
    sellPrice: '',
    location: '',
    binNumber: ''
  });

  const deviceCategories = [
    'Screens',
    'Charging Ports',
    'Batteries',
    'Cameras',
    'Speakers',
    'Microphones',
    'Tools',
    'Adhesives',
    'Screws',
    'Other'
  ];

  const deviceModels = [
    'iPhone 13',
    'iPhone 14',
    'iPhone 15',
    'Samsung Galaxy S21',
    'Samsung Galaxy S22',
    'Samsung Galaxy S23',
    'iPad Air',
    'iPad Pro',
    'Google Pixel 7',
    'Google Pixel 8',
    'Universal',
    'Other'
  ];

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/inventory/${params.id}`);
        if (response.ok) {
          const item: InventoryItem = await response.json();
          setFormData({
            sku: item.sku,
            name: item.name,
            description: item.description || '',
            category: item.category || '',
            deviceModel: item.deviceModel || '',
            quantity: item.quantity.toString(),
            reorderLevel: item.reorderLevel.toString(),
            cost: item.cost.toString(),
            sellPrice: item.sellPrice?.toString() || '',
            location: item.location || '',
            binNumber: item.binNumber || ''
          });
        } else {
          alert('Failed to load inventory item');
          router.push('/inventory');
        }
      } catch (error) {
        console.error('Error fetching inventory item:', error);
        alert('Failed to load inventory item');
        router.push('/inventory');
      } finally {
        setLoadingData(false);
      }
    };

    fetchItem();
  }, [params.id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateSKU = () => {
    const device = formData.deviceModel.replace(' ', '').substring(0, 6).toUpperCase();
    const category = formData.category.replace(' ', '').substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const sku = `${device}-${category}-${random}`;
    setFormData(prev => ({ ...prev, sku }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/inventory/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/inventory');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating inventory item:', error);
      alert('Failed to update inventory item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this inventory item? This action cannot be undone.')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/inventory/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/inventory');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      alert('Failed to delete inventory item');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">Loading inventory item...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 text-blue-600 hover:text-blue-800"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold">Edit Inventory Item</h1>
        </div>
        
        <button
          onClick={handleDelete}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete Item
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="e.g., IPH13-SCR-001"
              />
              <button
                type="button"
                onClick={generateSKU}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                disabled={!formData.deviceModel || !formData.category}
              >
                Generate
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select device model and category first, then click Generate
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="e.g., iPhone 13 OLED Screen Assembly"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional detailed description of the item"
          />
        </div>

        {/* Category and Device */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {deviceCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Device Model
            </label>
            <select
              name="deviceModel"
              value={formData.deviceModel}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Device Model</option>
              {deviceModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stock and Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reorder Level *
            </label>
            <input
              type="number"
              name="reorderLevel"
              value={formData.reorderLevel}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost per Unit *
            </label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sell Price
            </label>
            <input
              type="number"
              name="sellPrice"
              value={formData.sellPrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Storage Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Shelf A1, Storage Room B"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bin Number
            </label>
            <input
              type="text"
              name="binNumber"
              value={formData.binNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., A1-001, B2-003"
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Inventory Item'}
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
