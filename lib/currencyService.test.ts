import { fetchExchangeRates, convertCurrency, convertAllToCurrency, Currency } from './currencyService';

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('Currency Service', () => {
  beforeEach(() => {
    // Reset the mock before each test
    jest.clearAllMocks();
  });

  it('should fetch exchange rates successfully', async () => {
    // Mock the API responses for each currency
    axios.get.mockImplementation((url: string) => {
      if (url.includes('target=EUR')) {
        return Promise.resolve({ data: { rate: 0.92 } });
      }
      if (url.includes('target=ILS')) {
        return Promise.resolve({ data: { rate: 3.7 } });
      }
      if (url.includes('target=GBP')) {
        return Promise.resolve({ data: { rate: 0.79 } });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    await fetchExchangeRates();
    
    // Verify that we made requests for each currency
    expect(axios.get).toHaveBeenCalledTimes(3);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('https://hexarate.paikama.co/api/rates/latest/USD?target=EUR')
    );
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('https://hexarate.paikama.co/api/rates/latest/USD?target=ILS')
    );
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('https://hexarate.paikama.co/api/rates/latest/USD?target=GBP')
    );
  });

  it('should convert currency correctly', async () => {
    // Mock the API responses for each currency
    axios.get.mockImplementation((url: string) => {
      if (url.includes('target=EUR')) {
        return Promise.resolve({ data: { rate: 0.92 } });
      }
      if (url.includes('target=ILS')) {
        return Promise.resolve({ data: { rate: 3.7 } });
      }
      if (url.includes('target=GBP')) {
        return Promise.resolve({ data: { rate: 0.79 } });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    await fetchExchangeRates();

    // Test conversion from EUR to USD
    const result = convertCurrency(100, 'EUR', 'USD');
    expect(result).toBeCloseTo(108.7, 1); // 100 EUR ≈ 108.7 USD
  });

  it('should convert multiple assets to a target currency', async () => {
    // Mock the API responses for each currency
    axios.get.mockImplementation((url: string) => {
      if (url.includes('target=EUR')) {
        return Promise.resolve({ data: { rate: 0.92 } });
      }
      if (url.includes('target=ILS')) {
        return Promise.resolve({ data: { rate: 3.7 } });
      }
      if (url.includes('target=GBP')) {
        return Promise.resolve({ data: { rate: 0.79 } });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    await fetchExchangeRates();

    const assets: Array<{ amount: number; currency: Currency }> = [
      { amount: 100, currency: 'USD' },
      { amount: 100, currency: 'EUR' },
      { amount: 100, currency: 'ILS' },
      { amount: 100, currency: 'GBP' }
    ];

    const totalInUSD = convertAllToCurrency(assets);
    expect(totalInUSD).toBeGreaterThan(0);
  });
}); 