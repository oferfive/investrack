'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AssetType, Currency, RiskLevel, RecurringFrequency } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { X } from 'lucide-react';

// Add helper functions for number formatting
const formatNumber = (value: string): string => {
  // Remove any existing commas and handle empty/invalid input
  if (!value) return '';
  const number = value.replace(/,/g, '');
  if (isNaN(Number(number))) return value;
  
  // Split into integer and decimal parts
  const [integer, decimal] = number.split('.');
  
  // Add commas to integer part
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Return with decimal if it exists
  return decimal !== undefined ? `${formattedInteger}.${decimal}` : formattedInteger;
};

const parseNumber = (value: string): string => {
  return value.replace(/,/g, '');
};

// Add predefined locations
const LOCATIONS = ['US', 'EU', 'IL', 'Other'] as const;

interface AddAssetFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function AddAssetForm({ onSuccess, onClose }: AddAssetFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'stock' as AssetType,
    ticker: '',
    value: '',
    currency: 'USD' as Currency,
    location: '',
    riskLevel: 'medium' as RiskLevel,
    annualYield: '',
    hasRecurringContribution: false,
    recurringAmount: '',
    recurringFrequency: 'monthly' as RecurringFrequency,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[AddAssetForm] Form submitted');
    
    if (!user) {
      console.error('[AddAssetForm] No user found');
      setError('You must be logged in to add assets');
      return;
    }
    console.log('[AddAssetForm] User found:', user.id);

    const assetData = {
      user_id: user.id,
      name: formData.name,
      type: formData.type,
      ticker: formData.ticker,
      value: parseFloat(formData.value.replace(/,/g, '')),
      currency: formData.currency,
      location: formData.location,
      risk_level: formData.riskLevel,
      annual_yield: parseFloat(formData.annualYield.replace(/,/g, '')) || 0,
      has_recurring_contribution: formData.hasRecurringContribution,
      recurring_amount: formData.hasRecurringContribution ? parseFloat(formData.recurringAmount.replace(/,/g, '')) : 0,
      recurring_frequency: formData.recurringFrequency,
      notes: formData.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    console.log('[AddAssetForm] Asset data to be submitted:', assetData);

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('assets')
        .insert([assetData])
        .select();
      
      console.log('[AddAssetForm] Supabase response:', { data, error });
      
      if (error) {
        console.error('[AddAssetForm] Error adding asset:', error);
        setError(`Error adding asset: ${error.message}`);
        setIsLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.error('[AddAssetForm] No data returned after insert');
        setError('Asset was not created properly');
        setIsLoading(false);
        return;
      }
      
      console.log('[AddAssetForm] Asset created successfully:', data[0]);
      setSuccess(true);

      // Reset form after successful submission
      setFormData({
        name: '',
        type: 'stock' as AssetType,
        ticker: '',
        value: '',
        currency: 'USD' as Currency,
        location: '',
        riskLevel: 'medium' as RiskLevel,
        annualYield: '',
        hasRecurringContribution: false,
        recurringAmount: '',
        recurringFrequency: 'monthly' as RecurringFrequency,
        notes: '',
      });

      if (onSuccess) {
        // Slight delay to ensure the UI updates before calling onSuccess
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    } catch (err) {
      console.error('[AddAssetForm] Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Format numbers for specific fields
    const numericFields = ['value', 'annualYield', 'recurringAmount'];
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else if (numericFields.includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: formatNumber(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div 
      className="fixed right-0 top-0 h-full w-[450px] bg-black text-white border-l border-zinc-800 p-6 overflow-y-auto z-50 shadow-[0_0_50px_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out"
      style={{ 
        transform: 'translateX(0)',
        boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.25)'
      }}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Add New Asset</h2>
          <p className="text-sm text-gray-400">Add a new investment to your portfolio</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full text-gray-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-900/20 border border-red-500/20 text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900/20 border border-green-500/20 text-green-400 px-4 py-3 rounded">
            Asset added successfully!
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm text-gray-300 h-5 flex items-center">
              Asset Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Apple Inc. or Downtown Apartment"
              className="mt-1 block w-full h-9 px-2 rounded-md bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm text-gray-300 h-5 flex items-center">
              Asset Type
            </label>
            <select
              name="type"
              id="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full h-9 pl-2 pr-8 rounded-md bg-zinc-900 border-zinc-800 text-white focus:border-blue-500 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M8%2012L2%206h12z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat"
            >
              <option value="stock">Stock</option>
              <option value="etf">ETF</option>
              <option value="realEstate">Real Estate</option>
              <option value="cash">Cash</option>
              <option value="crypto">Cryptocurrency</option>
              <option value="bond">Bond</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="ticker" className="block text-sm text-gray-300 h-5 flex items-center">
              Ticker Symbol (if applicable)
            </label>
            <input
              type="text"
              name="ticker"
              id="ticker"
              value={formData.ticker}
              onChange={handleChange}
              placeholder="e.g. AAPL"
              className="mt-1 block w-full h-9 px-2 rounded-md bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="value" className="block text-sm text-gray-300 h-5 flex items-center">
                Value
              </label>
              <input
                type="text"
                name="value"
                id="value"
                required
                value={formData.value}
                onChange={handleChange}
                className="mt-1 block w-full h-9 px-2 rounded-md bg-zinc-900 border-zinc-800 text-white focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="currency" className="block text-sm text-gray-300 h-5 flex items-center">
                Currency
              </label>
              <select
                name="currency"
                id="currency"
                required
                value={formData.currency}
                onChange={handleChange}
                className="mt-1 block w-full h-9 pl-2 pr-8 rounded-md bg-zinc-900 border-zinc-800 text-white focus:border-blue-500 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M8%2012L2%206h12z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="ILS">ILS</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm text-gray-300 h-5 flex items-center">
                Location
              </label>
              <select
                name="location"
                id="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="mt-1 block w-full h-9 pl-2 pr-8 rounded-md bg-zinc-900 border-zinc-800 text-white focus:border-blue-500 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M8%2012L2%206h12z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat"
              >
                {LOCATIONS.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="riskLevel" className="block text-sm text-gray-300 h-5 flex items-center">
                Risk Level
              </label>
              <select
                name="riskLevel"
                id="riskLevel"
                required
                value={formData.riskLevel}
                onChange={handleChange}
                className="mt-1 block w-full h-9 pl-2 pr-8 rounded-md bg-zinc-900 border-zinc-800 text-white focus:border-blue-500 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M8%2012L2%206h12z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="annualYield" className="block text-sm text-gray-300 h-5 flex items-center">
                Annual Yield % (optional)
              </label>
              <input
                type="text"
                name="annualYield"
                id="annualYield"
                value={formData.annualYield}
                onChange={handleChange}
                className="mt-1 block w-full h-9 px-2 rounded-md bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800">
            <div className="flex items-center justify-between p-4">
              <div>
                <label htmlFor="hasRecurringContribution" className="text-sm text-gray-300 h-5 flex items-center">
                  Recurring Contribution
                </label>
                <p className="text-sm text-gray-500">Do you regularly add to this investment?</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="hasRecurringContribution"
                  id="hasRecurringContribution"
                  checked={formData.hasRecurringContribution}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out flex items-center ${formData.hasRecurringContribution ? 'bg-blue-600' : 'bg-zinc-700'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${formData.hasRecurringContribution ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </label>
            </div>

            {formData.hasRecurringContribution && (
              <div className="px-4 pb-4 pt-2 border-t border-zinc-800">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="recurringAmount" className="block text-sm text-gray-300 h-5 flex items-center">
                      Recurring Amount
                    </label>
                    <input
                      type="text"
                      name="recurringAmount"
                      id="recurringAmount"
                      required
                      value={formData.recurringAmount}
                      onChange={handleChange}
                      className="mt-1 block w-full h-9 px-2 rounded-md bg-zinc-900 border-zinc-800 text-white focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="recurringFrequency" className="block text-sm text-gray-300 h-5 flex items-center">
                      Frequency
                    </label>
                    <select
                      name="recurringFrequency"
                      id="recurringFrequency"
                      required
                      value={formData.recurringFrequency}
                      onChange={handleChange}
                      className="mt-1 block w-full h-9 pl-2 pr-8 rounded-md bg-zinc-900 border-zinc-800 text-white focus:border-blue-500 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M8%2012L2%206h12z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm text-gray-300 h-5 flex items-center">
              Notes (optional)
            </label>
            <input
              type="text"
              name="notes"
              id="notes"
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 block w-full h-9 px-2 rounded-md bg-zinc-900 border-zinc-800 text-white focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-9 px-2 bg-transparent border border-zinc-800 hover:bg-zinc-800 text-gray-400 hover:text-white flex items-center justify-center rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-9 px-2 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center rounded-md transition-colors"
          >
            {isLoading ? 'Adding...' : 'Add Asset'}
          </button>
        </div>
      </form>
    </div>
  );
} 