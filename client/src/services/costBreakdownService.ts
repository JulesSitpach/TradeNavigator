import { TariffService } from './tariffService';
import { ShippingService } from './shippingService';
import { CachingService } from '../utils/cachingService';
import { logger } from '../utils/logger';

export interface ProductDetails {
  description: string;
  category: string;
  hsCode: string;
  originCountry: string;
  destinationCountry: string;
  value: number;
}

export interface ShippingDetails {
  quantity: number;
  transportMode: string;
  shipmentType: string;
  packageType: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
}

export interface CostBreakdown {
  productCost: number;
  dutyAmount: number;
  dutyRate: number;
  taxAmount: number;
  taxRate: number;
  shippingCost: number;
  insuranceCost: number;
  customsFees: number;
  lastMileDelivery: number;
  handlingFees: number;
  totalLandedCost: number;
  dataSource: string;
}

export interface CostComponent {
  name: string;
  value: number;
  percentage: number;
  description?: string;
  category: 'product' | 'duty' | 'tax' | 'shipping' | 'other';
}

export class CostBreakdownService {
  private tariffService: TariffService;
  private shippingService: ShippingService;
  private cachingService: CachingService;

  constructor() {
    this.tariffService = new TariffService();
    this.shippingService = new ShippingService();
    this.cachingService = new CachingService();
  }

  /**
   * Calculate detailed cost breakdown for international shipments
   */
  async calculateCosts(
    productDetails: ProductDetails,
    shippingDetails: ShippingDetails
  ): Promise<{ 
    breakdown: CostBreakdown, 
    components: CostComponent[] 
  }> {
    try {
      logger.info(
        `Trade calculation for ${productDetails.hsCode} from ${productDetails.originCountry} to ${productDetails.destinationCountry}`
      );

      // Calculate base product cost
      const totalProductValue = productDetails.value * shippingDetails.quantity;

      // Get duty information using tiered approach
      const dutyInfo = await this.getDutyRate(productDetails);
      const dutyRate = dutyInfo.rate;
      const dutyAmount = (totalProductValue * dutyRate) / 100;

      logger.info(`Calculated duty rate for ${productDetails.hsCode}: ${dutyRate}%`);
      logger.info(`Duty amount: $${dutyAmount.toFixed(2)}`);
      logger.info(`Data source: ${dutyInfo.source}`);

      // Calculate shipping costs
      const shippingCost = await this.calculateShippingCost(
        productDetails,
        shippingDetails
      );

      // Calculate additional costs
      const insuranceCost = this.calculateInsurance(totalProductValue, shippingDetails.transportMode);
      const customsFees = this.calculateCustomsFees(productDetails.destinationCountry, totalProductValue);
      const taxInfo = await this.calculateTaxes(productDetails, totalProductValue + dutyAmount);
      const lastMileDelivery = this.calculateLastMileDelivery(
        productDetails.destinationCountry,
        shippingDetails
      );
      const handlingFees = this.calculateHandlingFees(shippingDetails);

      // Calculate total landed cost
      const totalLandedCost =
        totalProductValue +
        dutyAmount +
        taxInfo.amount +
        shippingCost +
        insuranceCost +
        customsFees +
        lastMileDelivery +
        handlingFees;

      const breakdown: CostBreakdown = {
        productCost: totalProductValue,
        dutyAmount,
        dutyRate,
        taxAmount: taxInfo.amount,
        taxRate: taxInfo.rate,
        shippingCost,
        insuranceCost,
        customsFees,
        lastMileDelivery,
        handlingFees,
        totalLandedCost,
        dataSource: dutyInfo.source
      };

      // Format cost components for UI display
      const components = this.formatCostComponents(breakdown, taxInfo.description);

      return { breakdown, components };
    } catch (error) {
      logger.error('Error calculating cost breakdown:', error);
      throw new Error('Failed to calculate cost breakdown');
    }
  }

  /**
   * Format cost components for UI display
   */
  private formatCostComponents(
    breakdown: CostBreakdown, 
    taxDescription: string = 'Tax'
  ): CostComponent[] {
    const total = breakdown.totalLandedCost;
    
    const components: CostComponent[] = [
      {
        name: 'Product Value',
        value: breakdown.productCost,
        percentage: (breakdown.productCost / total) * 100,
        description: 'Value of the goods being shipped',
        category: 'product'
      },
      {
        name: `Import Duty (${breakdown.dutyRate.toFixed(1)}%)`,
        value: breakdown.dutyAmount,
        percentage: (breakdown.dutyAmount / total) * 100,
        description: `Import duty calculated at ${breakdown.dutyRate.toFixed(1)}% of product value`,
        category: 'duty'
      },
      {
        name: `${taxDescription} (${breakdown.taxRate.toFixed(1)}%)`,
        value: breakdown.taxAmount,
        percentage: (breakdown.taxAmount / total) * 100,
        description: `${taxDescription} calculated at ${breakdown.taxRate.toFixed(1)}% of dutiable value`,
        category: 'tax'
      },
      {
        name: 'Freight Cost',
        value: breakdown.shippingCost,
        percentage: (breakdown.shippingCost / total) * 100,
        description: 'Cost of international transportation',
        category: 'shipping'
      },
      {
        name: 'Insurance',
        value: breakdown.insuranceCost,
        percentage: (breakdown.insuranceCost / total) * 100,
        description: 'Insurance coverage for goods in transit',
        category: 'shipping'
      },
      {
        name: 'Customs Clearance',
        value: breakdown.customsFees,
        percentage: (breakdown.customsFees / total) * 100,
        description: 'Fees for customs processing and declarations',
        category: 'other'
      },
      {
        name: 'Last Mile Delivery',
        value: breakdown.lastMileDelivery,
        percentage: (breakdown.lastMileDelivery / total) * 100,
        description: 'Cost of final delivery to destination',
        category: 'shipping'
      },
      {
        name: 'Handling Fees',
        value: breakdown.handlingFees,
        percentage: (breakdown.handlingFees / total) * 100,
        description: 'Fees for cargo handling and processing',
        category: 'other'
      }
    ];
    
    return components;
  }

  /**
   * Get duty rate using tiered approach
   */
  private async getDutyRate(productDetails: ProductDetails): Promise<{ rate: number; source: string; description?: string }> {
    const cacheKey = `duty_${productDetails.hsCode}_${productDetails.originCountry}_${productDetails.destinationCountry}`;
    
    try {
      // Try to get from cache first
      const cachedData = this.cachingService.get(cacheKey);
      if (cachedData) {
        logger.info(`Using cached tariff data for ${productDetails.hsCode} from ${productDetails.originCountry} to ${productDetails.destinationCountry}`);
        return { rate: cachedData.rate, source: 'Cached (API)' };
      }

      // Try to get from API
      logger.info('TIER 1: Attempting to use trade API for duty calculation');
      const apiData = await this.tariffService.getDutyRateFromAPI(
        productDetails.hsCode,
        productDetails.originCountry,
        productDetails.destinationCountry
      );

      // Cache the API result
      this.cachingService.set(cacheKey, { rate: apiData.rate }, 86400); // Cache for 24 hours
      return { rate: apiData.rate, source: 'API' };
    } catch (error) {
      logger.warn('API duty lookup failed, falling back to secondary source');
      
      try {
        // Try to get from database
        logger.info('TIER 2: Attempting to use database for duty calculation');
        const dbData = await this.tariffService.getDutyRateFromDatabase(
          productDetails.hsCode,
          productDetails.originCountry,
          productDetails.destinationCountry
        );
        return { rate: dbData.rate, source: 'Database' };
      } catch (dbError) {
        // Final fallback to model-based estimation
        logger.warn('Database duty lookup failed, falling back to model estimation');
        logger.info('TIER 3: Using model-based estimation for duty calculation');
        
        const modelEstimate = this.tariffService.estimateDutyRate(
          productDetails.hsCode,
          productDetails.category,
          productDetails.originCountry,
          productDetails.destinationCountry
        );
        
        return { 
          rate: modelEstimate, 
          source: 'Model-based estimate',
          description: 'Estimated based on product category and country relationship'
        };
      }
    }
  }

  /**
   * Calculate shipping costs
   */
  private async calculateShippingCost(
    productDetails: ProductDetails,
    shippingDetails: ShippingDetails
  ): Promise<number> {
    try {
      // Try to get real-time carrier rates
      logger.info('TIER 1: Attempting to use carrier API for shipping calculation');
      const carrierRates = await this.shippingService.getCarrierRates(
        productDetails.originCountry,
        productDetails.destinationCountry,
        shippingDetails
      );
      
      return carrierRates.totalCost;
    } catch (error) {
      logger.warn('Carrier API shipping calculation failed, falling back to secondary source');
      
      try {
        // Try to use third-party shipping API
        logger.info('TIER 2: Attempting to use Shipping API for shipping calculation');
        const apiRates = await this.shippingService.getThirdPartyRates(
          productDetails.originCountry,
          productDetails.destinationCountry,
          shippingDetails
        );
        
        return apiRates.totalCost;
      } catch (apiError) {
        // Final fallback to distance-based calculation
        logger.warn('Third-party shipping API failed, falling back to distance-based estimation');
        logger.info('TIER 3: Using distance-based calculation for shipping estimation');
        
        return this.shippingService.calculateDistanceBasedShipping(
          productDetails.originCountry,
          productDetails.destinationCountry,
          shippingDetails
        );
      }
    }
  }

  /**
   * Calculate insurance costs
   */
  private calculateInsurance(productValue: number, transportMode: string): number {
    // Insurance is typically 0.5-1.5% of product value, varying by transport mode
    const rates: Record<string, number> = {
      'Air Freight': 0.005, // 0.5%
      'Sea Freight': 0.01,  // 1.0%
      'Rail Freight': 0.008, // 0.8%
      'Road Transport': 0.015  // 1.5%
    };
    
    const rate = rates[transportMode] || 0.01;
    return Math.round((productValue * rate) * 100) / 100;
  }

  /**
   * Calculate customs processing fees
   */
  private calculateCustomsFees(destinationCountry: string, productValue: number): number {
    // Customs processing fees vary by country
    const feeRates: Record<string, number> = {
      'US': Math.min(Math.max(productValue * 0.0021, 25), 500), // 0.21% with min $25, max $500
      'CA': Math.min(productValue * 0.0085, 295), // 0.85% with max $295 CAD
      'UK': 15, // Flat fee of £15
      'AU': 88 // Flat fee of AUD $88
    };
    
    return Math.round((feeRates[destinationCountry] || productValue * 0.005) * 100) / 100; // Default to 0.5%
  }

  /**
   * Calculate applicable taxes
   */
  private async calculateTaxes(
    productDetails: ProductDetails,
    dutiableValue: number
  ): Promise<{ rate: number; amount: number; description: string }> {
    try {
      const taxInfo = await this.tariffService.getTaxRate(
        productDetails.hsCode,
        productDetails.destinationCountry
      );
      
      return {
        rate: taxInfo.rate,
        amount: Math.round((dutiableValue * taxInfo.rate / 100) * 100) / 100,
        description: taxInfo.description
      };
    } catch (error) {
      // Fallback to estimated tax rates
      const estimatedRates: Record<string, number> = {
        'US': 0, // No federal VAT/GST
        'CA': 5, // 5% GST
        'UK': 20, // 20% VAT
        'AU': 10, // 10% GST
        'DE': 19, // 19% VAT
        'FR': 20, // 20% VAT
        'IT': 22, // 22% VAT
        'CN': 13, // 13% VAT
        'IN': 18, // 18% GST
        'SG': 7, // 7% GST
      };
      
      const rate = estimatedRates[productDetails.destinationCountry] || 10; // Default to 10%
      const taxName = this.getTaxNameByCountry(productDetails.destinationCountry);
      
      return {
        rate,
        amount: Math.round((dutiableValue * rate / 100) * 100) / 100,
        description: `${taxName} (${rate}%)`
      };
    }
  }

  /**
   * Get tax name by country
   */
  private getTaxNameByCountry(countryCode: string): string {
    const taxNames: Record<string, string> = {
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
    
    return taxNames[countryCode] || 'Value Added Tax';
  }

  /**
   * Calculate last mile delivery costs
   */
  private calculateLastMileDelivery(destinationCountry: string, shippingDetails: ShippingDetails): number {
    // Last mile delivery costs vary by country, weight, and dimensions
    const baseRates: Record<string, number> = {
      'US': 15,
      'CA': 18,
      'UK': 12,
      'AU': 20
    };
    
    const baseRate = baseRates[destinationCountry] || 15;
    
    // Adjust for weight - add $1 per kg over 10kg
    const weightAdjustment = Math.max(0, shippingDetails.weight - 10) * 1;
    
    // Adjust for dimensions - add $0.5 per cubic meter over 0.1 cubic meters
    const volumeInCubicMeters = 
      (shippingDetails.dimensions.length * 
       shippingDetails.dimensions.width * 
       shippingDetails.dimensions.height) / 1000000;
    
    const volumeAdjustment = Math.max(0, volumeInCubicMeters - 0.1) * 500;
    
    return Math.round((baseRate + weightAdjustment + volumeAdjustment) * 100) / 100;
  }

  /**
   * Calculate handling fees
   */
  private calculateHandlingFees(shippingDetails: ShippingDetails): number {
    // Handling fees based on quantity and package type
    const baseHandlingFee = 25; // Base fee
    
    // Additional fee per unit
    const perUnitFee = 0.5;
    const quantityFee = shippingDetails.quantity * perUnitFee;
    
    // Additional fee based on package type
    const packageTypeFees: Record<string, number> = {
      'Cardboard Box': 0,
      'Wooden Crate': 15,
      'Pallet': 30,
      'Drum': 20,
      'Bag': 5,
      'Special Handling': 50
    };
    
    const packageFee = packageTypeFees[shippingDetails.packageType] || 0;
    
    return Math.round((baseHandlingFee + quantityFee + packageFee) * 100) / 100;
  }
}

// Export singleton instance
export const costBreakdownService = new CostBreakdownService();