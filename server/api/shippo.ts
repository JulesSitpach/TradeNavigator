import axios from 'axios';

// Shippo API wrapper
export class ShippoApi {
  private apiKey: string;
  private baseUrl: string = 'https://api.goshippo.com/';

  constructor() {
    this.apiKey = process.env.SHIPPO_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('No Shippo API key provided. API calls will fail.');
    }
  }

  /**
   * Generic method to make API requests to Shippo
   */
  private async makeRequest(endpoint: string, method: string = 'GET', data: any = null): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Shippo API key is required');
    }

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        'Authorization': `ShippoToken ${this.apiKey}`,
        'Content-Type': 'application/json'
      };

      const config = {
        method,
        url,
        headers,
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' ? data : undefined
      };

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('Shippo API error:', error.response?.data || error.message);
      throw new Error(`Shippo API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create an address object in Shippo
   */
  async createAddress(addressData: any): Promise<any> {
    return this.makeRequest('addresses/', 'POST', addressData);
  }

  /**
   * Create a parcel object in Shippo
   */
  async createParcel(parcelData: any): Promise<any> {
    return this.makeRequest('parcels/', 'POST', parcelData);
  }

  /**
   * Get shipping rates for a shipment
   */
  async getShippingRates(fromAddress: any, toAddress: any, parcel: any): Promise<any> {
    const shipmentData = {
      address_from: fromAddress,
      address_to: toAddress,
      parcels: [parcel],
      async: false
    };

    const shipment = await this.makeRequest('shipments/', 'POST', shipmentData);
    return this.makeRequest(`shipments/${shipment.object_id}/rates/`);
  }

  /**
   * Get international shipping rates
   */
  async getInternationalRates(
    originCountry: string,
    originCity: string,
    destinationCountry: string,
    destinationCity: string,
    weight: number,
    length: number,
    width: number,
    height: number
  ): Promise<any> {
    // Create origin address
    const fromAddress = await this.createAddress({
      country: originCountry,
      city: originCity,
      validate: false
    });

    // Create destination address
    const toAddress = await this.createAddress({
      country: destinationCountry,
      city: destinationCity,
      validate: false
    });

    // Create parcel
    const parcel = await this.createParcel({
      length: length.toString(),
      width: width.toString(),
      height: height.toString(),
      distance_unit: 'cm',
      weight: weight.toString(),
      mass_unit: 'kg'
    });

    // Get rates
    return this.getShippingRates(fromAddress, toAddress, parcel);
  }

  /**
   * Calculate shipping time estimates
   */
  async getTransitTimes(
    originCountry: string,
    destinationCountry: string,
    transportMode: string
  ): Promise<any> {
    // In a real implementation, this would use actual Shippo API endpoints
    // As a placeholder, we're returning estimated transit times based on transport mode
    const transitTimes = {
      sea: { min: 30, max: 45 },
      air: { min: 3, max: 7 },
      road: { min: 5, max: 14 },
      rail: { min: 10, max: 21 }
    };

    return transitTimes[transportMode] || { min: 14, max: 30 };
  }
}

// Create and export singleton instance
export const shippoApi = new ShippoApi();
