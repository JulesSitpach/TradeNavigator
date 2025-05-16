import axios from 'axios';

// Comtrade API wrapper
export class ComtradeApi {
  private primaryApiKey: string;
  private secondaryApiKey: string;
  private baseUrl: string = 'https://comtradeapi.un.org/data/v1';
  private cache: Map<string, { data: any, timestamp: number }> = new Map();
  private cacheTTL: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.primaryApiKey = process.env.UN_COMTRADE_PRIMARY_KEY || '';
    this.secondaryApiKey = process.env.UN_COMTRADE_SECONDARY_KEY || '';
    
    if (!this.primaryApiKey && !this.secondaryApiKey) {
      console.warn('No Comtrade API keys provided. API calls will fail.');
    }
  }

  private getCurrentApiKey(): string {
    // Simple switching mechanism - could be enhanced with rate limit tracking
    return this.primaryApiKey || this.secondaryApiKey;
  }

  private getCacheKey(endpoint: string, params: Record<string, any>): string {
    return `${endpoint}:${JSON.stringify(params)}`;
  }

  private checkCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Makes an API request to the UN Comtrade API
   */
  async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const cacheKey = this.getCacheKey(endpoint, params);
    const cachedData = this.checkCache(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const apiKey = this.getCurrentApiKey();
    if (!apiKey) {
      throw new Error('No Comtrade API key available');
    }
    
    try {
      const response = await axios.get(`${this.baseUrl}/${endpoint}`, {
        params: {
          ...params,
          subscription_key: apiKey
        }
      });
      
      // Cache the response
      this.setCache(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      // If primary key fails, try secondary
      if (apiKey === this.primaryApiKey && this.secondaryApiKey) {
        try {
          const response = await axios.get(`${this.baseUrl}/${endpoint}`, {
            params: {
              ...params,
              subscription_key: this.secondaryApiKey
            }
          });
          
          // Cache the response
          this.setCache(cacheKey, response.data);
          
          return response.data;
        } catch (secondaryError) {
          throw new Error(`Failed to fetch data from Comtrade API: ${secondaryError.message}`);
        }
      }
      
      throw new Error(`Failed to fetch data from Comtrade API: ${error.message}`);
    }
  }

  /**
   * Get tariff information for a specific HS code and country
   */
  async getTariffData(hsCode: string, countryCode: string): Promise<any> {
    const formattedHsCode = hsCode.replace(/\./g, '');
    return this.makeRequest('tariff', {
      hsCode: formattedHsCode,
      reporterCode: countryCode
    });
  }

  /**
   * Get trade flow data for a product
   */
  async getTradeFlowData(hsCode: string, exporterCode: string, importerCode: string): Promise<any> {
    const formattedHsCode = hsCode.replace(/\./g, '');
    return this.makeRequest('get/trade/flow', {
      cmdCode: formattedHsCode,
      reporterCode: exporterCode,
      partnerCode: importerCode,
      period: 'now-1y' // Last year's data
    });
  }

  /**
   * Get HS code suggestions based on product description
   */
  async getHsCodeSuggestions(productDescription: string): Promise<any> {
    return this.makeRequest('hs/suggestion', {
      text: productDescription
    });
  }
}

// Create and export singleton instance
export const comtradeApi = new ComtradeApi();
