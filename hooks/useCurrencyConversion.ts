import { useState, useEffect } from 'react';
import { fetchExchangeRates, convertCurrency, convertAllToCurrency, Currency } from '@/lib/currencyService';

// Shared state for all hook instances
type ConversionState = {
  isLoading: boolean;
  error: string | null;
  ratesAvailable: boolean;
  ratesFetchPromise: Promise<void> | null;
};

const globalConversionState: ConversionState = {
  isLoading: true,
  error: null,
  ratesAvailable: false,
  ratesFetchPromise: null
};

// Initialize rates once and share across hook instances
function initializeRates(): Promise<void> {
  if (globalConversionState.ratesFetchPromise) {
    return globalConversionState.ratesFetchPromise;
  }

  globalConversionState.isLoading = true;
  
  const promise = fetchExchangeRates()
    .then(() => {
      globalConversionState.error = null;
      globalConversionState.ratesAvailable = true;
    })
    .catch((err) => {
      globalConversionState.error = 'Failed to load exchange rates';
      globalConversionState.ratesAvailable = false;
      console.error('Error loading exchange rates:', err);
    })
    .finally(() => {
      globalConversionState.isLoading = false;
    });
  
  globalConversionState.ratesFetchPromise = promise;
  return promise;
}

export function useCurrencyConversion() {
  const [isLoading, setIsLoading] = useState(globalConversionState.isLoading);
  const [error, setError] = useState<string | null>(globalConversionState.error);
  const [ratesAvailable, setRatesAvailable] = useState(globalConversionState.ratesAvailable);

  // Subscribe to global state changes
  useEffect(() => {
    // If rates are already available, just use them
    if (globalConversionState.ratesAvailable) {
      setIsLoading(false);
      setError(null);
      setRatesAvailable(true);
      return;
    }

    // Initialize rates if needed
    initializeRates().then(() => {
      setIsLoading(globalConversionState.isLoading);
      setError(globalConversionState.error);
      setRatesAvailable(globalConversionState.ratesAvailable);
    });
    
    // Refresh rates every 60 minutes (if component is still mounted)
    const refreshInterval = setInterval(() => {
      globalConversionState.ratesFetchPromise = null; // Clear promise to force refresh
      initializeRates().then(() => {
        setIsLoading(globalConversionState.isLoading);
        setError(globalConversionState.error);
        setRatesAvailable(globalConversionState.ratesAvailable);
      });
    }, 60 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Function to convert a single asset's value to USD
  const convertToUSD = (amount: number, currency: Currency): number => {
    if (isLoading || !ratesAvailable) return amount; // Return original value while loading or if rates not available
    try {
      return convertCurrency(amount, currency, 'USD');
    } catch {
      return amount;
    }
  };

  // Function to convert multiple assets to USD
  const convertAssetsToUSD = (assets: Array<{ amount: number; currency: Currency }>): number => {
    if (isLoading || !ratesAvailable) {
      // Return sum of original values while loading or if rates not available
      return assets.reduce((sum, asset) => sum + asset.amount, 0);
    }
    try {
      return convertAllToCurrency(assets, 'USD');
    } catch {
      return assets.reduce((sum, asset) => sum + asset.amount, 0);
    }
  };

  return {
    isLoading,
    error,
    ratesAvailable,
    convertToUSD,
    convertAssetsToUSD
  };
} 