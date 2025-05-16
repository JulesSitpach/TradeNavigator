import axios from 'axios';
import { logger } from '../utils/logger';

interface DutyRateResponse {
  rate: number;
  source: string;
}

interface TaxRateResponse {
  rate: number;
  description: string;
}

/**
 * Service for retrieving tariff and tax information
 */
export class TariffService {
  /**
   * Get duty rate from external API
   */
  async getDutyRateFromAPI(
    hsCode: string,
    originCountry: string,
    destinationCountry: string
  ): Promise<DutyRateResponse> {
    try {
      // In a real implementation, this would make an API call to a tariff database
      // For now, we'll simulate an API response
      const response = await axios.get(`/api/tariffs/${hsCode}`, {
        params: {
          origin: originCountry,
          destination: destinationCountry
        }
      });
      
      return { rate: response.data.dutyRate, source: 'API' };
    } catch (error) {
      logger.error('API duty rate lookup failed', error);
      throw new Error('Failed to retrieve duty rate from API');
    }
  }

  /**
   * Get duty rate from database
   */
  async getDutyRateFromDatabase(
    hsCode: string,
    originCountry: string,
    destinationCountry: string
  ): Promise<DutyRateResponse> {
    try {
      // In a real implementation, this would query a local database
      // For now, we'll use a fallback approach
      
      // Simulate database result
      const mockDbRates = this.getMockDutyRates();
      const key = `${destinationCountry}_${hsCode.substring(0, 4)}`;
      
      if (mockDbRates[key]) {
        return { 
          rate: mockDbRates[key], 
          source: 'Database' 
        };
      }
      
      // If no specific rate found, try the general rate for the country
      const generalKey = `${destinationCountry}_general`;
      if (mockDbRates[generalKey]) {
        return { 
          rate: mockDbRates[generalKey], 
          source: 'Database (General Rate)' 
        };
      }
      
      throw new Error('No duty rate found in database');
    } catch (error) {
      logger.error('Database duty rate lookup failed', error);
      throw new Error('Failed to retrieve duty rate from database');
    }
  }

  /**
   * Estimate duty rate based on available data
   */
  estimateDutyRate(
    hsCode: string,
    category: string,
    originCountry: string,
    destinationCountry: string
  ): number {
    // For model-based estimation, use simple rules based on HS code chapters
    // and country relationships

    // Get the chapter (first 2 digits of HS code)
    const chapter = hsCode.substring(0, 2);
    
    // Check for possible trade agreements
    const hasFTA = this.checkForTradeAgreement(originCountry, destinationCountry);
    
    // Get base rate by product category
    let baseRate = this.getBaseDutyRateByCategory(category);
    
    // Apply special rules for certain countries
    baseRate = this.applyCountrySpecificRules(destinationCountry, baseRate);
    
    // Free trade agreement can significantly reduce duties
    if (hasFTA) {
      baseRate = Math.max(0, baseRate * 0.2); // Reduce to 20% of original
    }
    
    return Math.round(baseRate * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Get tax rate information for a given country and HS code
   */
  async getTaxRate(
    hsCode: string,
    countryCode: string
  ): Promise<TaxRateResponse> {
    try {
      // In a real implementation, this would call a tax API
      // For now, we'll use predefined tax rates
      const taxRates = this.getMockTaxRates();
      
      if (taxRates[countryCode]) {
        return {
          rate: taxRates[countryCode],
          description: `${this.getTaxNameByCountry(countryCode)} (${taxRates[countryCode]}%)`
        };
      }
      
      // Default tax rate
      return {
        rate: 10, // Default 10% tax rate
        description: 'Standard Tax (10%)'
      };
    } catch (error) {
      logger.error('Error getting tax rate', error);
      throw new Error('Failed to retrieve tax information');
    }
  }

  /**
   * Check if there's a free trade agreement between two countries
   */
  private checkForTradeAgreement(originCountry: string, destinationCountry: string): boolean {
    // Simplified trade agreement checks
    const tradeBlocs = {
      // USMCA
      'USMCA': ['US', 'CA', 'MX'],
      // European Union
      'EU': ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'GR', 'PT', 'IE', 'FI', 'DK', 'SE', 'PL'],
      // CPTPP
      'CPTPP': ['CA', 'JP', 'AU', 'NZ', 'SG', 'MX', 'VN', 'MY'],
    };
    
    // Check if both countries are in the same trade bloc
    for (const bloc in tradeBlocs) {
      const countries = tradeBlocs[bloc];
      if (countries.includes(originCountry) && countries.includes(destinationCountry)) {
        return true;
      }
    }
    
    // Check specific bilateral agreements
    const bilateralFTAs = [
      ['US', 'KR'], // US-Korea
      ['US', 'AU'], // US-Australia
      ['JP', 'UK'], // Japan-UK
      ['UK', 'CA'], // UK-Canada
    ];
    
    return bilateralFTAs.some(pair => 
      (pair[0] === originCountry && pair[1] === destinationCountry) ||
      (pair[0] === destinationCountry && pair[1] === originCountry)
    );
  }

  /**
   * Get base duty rate by product category
   */
  private getBaseDutyRateByCategory(category: string): number {
    const categoryRates = {
      'Electronics': 5,
      'Textiles & Apparel': 12,
      'Chemicals': 6.5,
      'Machinery': 4.5,
      'Food & Beverages': 15,
      'Pharmaceuticals': 2,
      'Automotive': 8,
      'Furniture': 3.5,
      'Toys & Games': 6
    };
    
    return categoryRates[category] || 7.5; // Default to 7.5%
  }

  /**
   * Apply country-specific duty rate adjustments
   */
  private applyCountrySpecificRules(countryCode: string, baseRate: number): number {
    // Some countries have generally higher or lower duty rates
    const countryFactors = {
      'US': 1.0,   // Standard
      'CA': 0.85,  // 15% lower than standard
      'UK': 0.9,   // 10% lower than standard
      'JP': 0.8,   // 20% lower than standard
      'AU': 0.95,  // 5% lower than standard
      'BR': 1.5,   // 50% higher than standard
      'IN': 1.3,   // 30% higher than standard
      'RU': 1.2,   // 20% higher than standard
      'CN': 1.1    // 10% higher than standard
    };
    
    const factor = countryFactors[countryCode] || 1.0;
    return baseRate * factor;
  }

  /**
   * Mock duty rates for database fallback
   */
  private getMockDutyRates(): Record<string, number> {
    return {
      // Format: destinationCountry_HSCodePrefix or destinationCountry_general
      'US_8471': 0, // US duty rate for computers (8471)
      'US_8517': 0, // US duty rate for phones (8517)
      'US_6109': 16.5, // US duty rate for t-shirts (6109)
      'US_general': 3.5, // US general duty rate
      
      'CA_8471': 0, // Canada duty rate for computers
      'CA_general': 3, // Canada general duty rate
      
      'UK_general': 4, // UK general duty rate
      'JP_general': 4.5, // Japan general duty rate
      
      'EU_8471': 0, // EU duty rate for computers
      'EU_general': 5, // EU general duty rate
      
      'CN_general': 7.5, // China general duty rate
      'IN_general': 10, // India general duty rate
    };
  }

  /**
   * Mock tax rates for different countries
   */
  private getMockTaxRates(): Record<string, number> {
    return {
      'US': 0, // No federal VAT/GST in US
      'CA': 5, // 5% GST in Canada
      'UK': 20, // 20% VAT in UK
      'AU': 10, // 10% GST in Australia
      'NZ': 15, // 15% GST in New Zealand
      'JP': 10, // 10% Consumption Tax in Japan
      'DE': 19, // 19% VAT in Germany (and much of EU)
      'FR': 20, // 20% VAT in France
      'IT': 22, // 22% VAT in Italy
      'CN': 13, // 13% VAT in China
      'IN': 18, // 18% GST in India
      'SG': 7, // 7% GST in Singapore
    };
  }

  /**
   * Get tax system name by country code
   */
  private getTaxNameByCountry(countryCode: string): string {
    const taxNames = {
      'US': 'Sales Tax',
      'CA': 'GST/HST',
      'UK': 'VAT',
      'AU': 'GST',
      'NZ': 'GST',
      'JP': 'Consumption Tax',
      'DE': 'VAT',
      'FR': 'VAT',
      'IT': 'VAT',
      'CN': 'VAT',
      'IN': 'GST',
      'SG': 'GST',
    };
    
    return taxNames[countryCode] || 'Tax';
  }
}