'use client';

import { useState, useEffect } from 'react';
import { createAccountAction } from '@/app/ticket/new/actions';

interface Account {
  id: string;
  name: string;
  balance: number;
  createdAt: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      } else {
        setError('Failed to load accounts');
      }
    } catch (err) {
      setError('Error loading accounts');
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await createAccountAction({
        name,
        initialBalance,
      });

      if (result.success) {
        setSuccessMessage(`Account created: ${result.accountName}`);
        setName('');
        setInitialBalance(0);
        setShowCreateForm(false);
        fetchAccounts(); // Refresh the list
      } else {
        alert(result.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while creating the account');
    } finally {
      setLoading(false);
    }
  };

  if (loading && accounts.length === 0) {
    return <div className="text-center p-4">Loading accounts...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Accounts</h1>
            <p className="text-gray-600">Manage customer accounts for your repair shop</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {showCreateForm ? 'Cancel' : 'New Account'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white border rounded-lg p-6 mb-8 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Create New Account</h2>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Initial Balance</label>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(parseFloat(e.target.value) || 0)}
                  step="0.01"
                  className="w-full p-2 border rounded-md"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Existing Accounts ({accounts.length})</h2>
          </div>
          
          {accounts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No accounts found. Create your first account above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {account.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${account.balance.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(account.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {account.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/ticket/new" 
            className="text-blue-600 hover:text-blue-700 underline mr-4"
          >
            Create New Ticket
          </a>
          <a 
            href="/ticket" 
            className="text-blue-600 hover:text-blue-700 underline mr-4"
          >
            View All Tickets
          </a>
          <a 
            href="/dashboard" 
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
