import axios from 'axios';
import type { Asset } from '@/lib/types';

// Define the supported currencies
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'ILS', 'GBP'] as const;
export type Currency = typeof SUPPORTED_CURRENCIES[number];

// Cache for exchange rates with timestamp
interface RateCache {
  rates: Record<string, number>;
  timestamp: number;
}

const RATE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
let rateCache: RateCache | null = null;

// Function to fetch exchange rates from HexaRate API
export async function fetchExchangeRates(baseCurrency: Currency = 'USD'): Promise<void> {
  try {
    // Check if we have valid cached rates
    if (rateCache && Date.now() - rateCache.timestamp < RATE_CACHE_DURATION) {
      return;
    }

    console.log('[CurrencyService] Fetching exchange rates...');
    // Fetch rates for each supported currency
    const ratesPromises = SUPPORTED_CURRENCIES
      .filter(currency => currency !== baseCurrency)
      .map(async (targetCurrency) => {
        const url = `https://hexarate.paikama.co/api/rates/latest/${baseCurrency}?target=${targetCurrency}`;
        const response = await axios.get(url);
        const rate = response.data.data.mid;
        return {
          currency: targetCurrency,
          rate
        };
      });

    const rates = await Promise.all(ratesPromises);
    
    // Initialize rates object with base currency
    const newRates = {
      [baseCurrency]: 1
    };

    // Add all other rates
    rates.forEach(({ currency, rate }) => {
      newRates[currency] = rate;
    });

    // Update cache
    rateCache = {
      rates: newRates,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('[CurrencyService] Error fetching exchange rates:', error);
    throw new Error('Failed to fetch exchange rates');
  }
}

// Function to convert amount from one currency to another
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency = 'USD'
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  if (!rateCache) {
    throw new Error('Exchange rates not available. Please fetch rates first.');
  }

  const rates = rateCache.rates;
  if (!rates[fromCurrency] || !rates[toCurrency]) {
    throw new Error('Exchange rates not available for conversion');
  }

  // Convert to USD first (if not already USD)
  const amountInUSD = fromCurrency === 'USD' 
    ? amount 
    : amount / rates[fromCurrency];

  // Convert from USD to target currency
  return toCurrency === 'USD' 
    ? amountInUSD 
    : amountInUSD * rates[toCurrency];
}

// Function to get all assets converted to a specific currency
export function convertAllToCurrency(
  assets: Array<{ amount: number; currency: Currency }>,
  targetCurrency: Currency = 'USD'
): number {
  return assets.reduce((total, asset) => {
    return total + convertCurrency(asset.amount, asset.currency, targetCurrency);
  }, 0);
}

export const currencyService = {
  async getExchangeRate(baseCurrency: string, targetCurrency: string): Promise<number> {
    try {
      const url = `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;
      const response = await axios.get(url);
      const rate = response.data.rates[targetCurrency];
      
      if (!rate) {
        throw new Error(`Exchange rate not found for ${targetCurrency}`);
      }
      
      return rate;
    } catch (error) {
      console.error('[CurrencyService] Error fetching exchange rates:', error);
      throw error;
    }
  },

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    const result = amount * rate;
    
    return result;
  },

  async convertAllToCurrency(assets: Asset[], targetCurrency: string): Promise<number> {
    let total = 0;
    
    for (const asset of assets) {
      const converted = await this.convertCurrency(asset.value, asset.currency, targetCurrency);
      total += converted;
    }
    
    return total;
  }
}; 