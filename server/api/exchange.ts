import axios from 'axios';

// Exchange Rate API wrapper
export class ExchangeRateApi {
  private apiKey: string;
  private baseUrl: string = 'https://api.exchangeratesapi.io/v1';
  private cache: Map<string, { rate: number, timestamp: number }> = new Map();
  private cacheTTL: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.apiKey = process.env.EXCHANGE_RATE_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('No Exchange Rate API key provided. API calls will fail.');
    }
  }

  private getCacheKey(fromCurrency: string, toCurrency: string): string {
    return `${fromCurrency}:${toCurrency}`;
  }

  private checkCache(key: string): number | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.rate;
  }

  private setCache(key: string, rate: number): void {
    this.cache.set(key, { rate, timestamp: Date.now() });
  }

  /**
   * Get latest exchange rate
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    const cacheKey = this.getCacheKey(fromCurrency, toCurrency);
    const cachedRate = this.checkCache(cacheKey);
    
    if (cachedRate !== null) {
      return cachedRate;
    }
    
    if (!this.apiKey) {
      throw new Error('Exchange Rate API key is required');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/latest`, {
        params: {
          access_key: this.apiKey,
          base: fromCurrency,
          symbols: toCurrency
        }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error.info || 'Failed to get exchange rate');
      }
      
      const rate = response.data.rates[toCurrency];
      
      // Cache the rate
      this.setCache(cacheKey, rate);
      
      return rate;
    } catch (error) {
      console.error('Exchange Rate API error:', error.response?.data || error.message);
      throw new Error(`Exchange Rate API Error: ${error.response?.data?.error?.info || error.message}`);
    }
  }

  /**
   * Convert amount from one currency to another
   */
  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }
    
    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  }

  /**
   * Get historical exchange rate
   */
  async getHistoricalRate(date: string, fromCurrency: string, toCurrency: string): Promise<number> {
    if (!this.apiKey) {
      throw new Error('Exchange Rate API key is required');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/${date}`, {
        params: {
          access_key: this.apiKey,
          base: fromCurrency,
          symbols: toCurrency
        }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error.info || 'Failed to get historical exchange rate');
      }
      
      return response.data.rates[toCurrency];
    } catch (error) {
      console.error('Exchange Rate API error:', error.response?.data || error.message);
      throw new Error(`Exchange Rate API Error: ${error.response?.data?.error?.info || error.message}`);
    }
  }
}

// Create and export singleton instance
export const exchangeRateApi = new ExchangeRateApi();
