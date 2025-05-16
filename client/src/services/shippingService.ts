import axios from 'axios';
import { logger } from '../utils/logger';

interface ShippingDetails {
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

interface ShippingRateResponse {
  carrier: string;
  service: string;
  deliveryTime: string;
  cost: number;
  totalCost: number;
}

/**
 * Service for shipping rate calculations and carrier integrations
 */
export class ShippingService {
  /**
   * Get shipping rates from carriers (UPS, FedEx, DHL, etc.)
   */
  async getCarrierRates(
    originCountry: string,
    destinationCountry: string,
    shippingDetails: ShippingDetails
  ): Promise<ShippingRateResponse> {
    try {
      // In a real implementation, this would integrate with carrier APIs
      // For now, we'll simulate carrier API responses
      
      const response = await axios.get('/api/shipping/carrier-rates', {
        params: {
          origin: originCountry,
          destination: destinationCountry,
          weight: shippingDetails.weight,
          length: shippingDetails.dimensions.length,
          width: shippingDetails.dimensions.width,
          height: shippingDetails.dimensions.height,
          transportMode: shippingDetails.transportMode,
          shipmentType: shippingDetails.shipmentType
        }
      });
      
      return {
        carrier: response.data.carrier,
        service: response.data.service,
        deliveryTime: response.data.deliveryTime,
        cost: response.data.cost,
        totalCost: response.data.totalCost
      };
    } catch (error) {
      logger.error('Error getting carrier rates', error);
      throw new Error('Failed to retrieve carrier shipping rates');
    }
  }

  /**
   * Get rates from third-party shipping API
   */
  async getThirdPartyRates(
    originCountry: string,
    destinationCountry: string,
    shippingDetails: ShippingDetails
  ): Promise<ShippingRateResponse> {
    try {
      // In a real implementation, this would call a third-party API like Shippo
      // For now, we'll estimate shipping based on weight, distance, and mode
      const rateType = this.determineRateType(shippingDetails.transportMode, shippingDetails.shipmentType);
      const baseRate = this.getBaseRateByType(rateType);
      const weightFactor = this.calculateWeightFactor(shippingDetails.weight, rateType);
      const distanceFactor = this.calculateDistanceFactor(originCountry, destinationCountry);
      
      const cost = baseRate * weightFactor * distanceFactor;
      
      return {
        carrier: this.selectCarrierByMode(shippingDetails.transportMode),
        service: this.getServiceLevelByType(rateType),
        deliveryTime: this.estimateDeliveryTime(originCountry, destinationCountry, rateType),
        cost,
        totalCost: cost
      };
    } catch (error) {
      logger.error('Error getting third-party shipping rates', error);
      throw new Error('Failed to retrieve shipping rates from third-party API');
    }
  }

  /**
   * Calculate shipping based on distance between countries
   */
  calculateDistanceBasedShipping(
    originCountry: string,
    destinationCountry: string,
    shippingDetails: ShippingDetails
  ): number {
    try {
      // This is our final fallback for shipping cost estimation
      // Based on simplified weight, distance, and transport mode
      
      // Get distance between countries (simplified)
      const distance = this.getCountryDistance(originCountry, destinationCountry);
      
      // Get base rate per kg-km for the transport mode
      const baseRatePerKgKm = this.getBaseRatePerKgKm(shippingDetails.transportMode);
      
      // Calculate volumetric weight
      const volumetricWeight = this.calculateVolumetricWeight(
        shippingDetails.dimensions.length,
        shippingDetails.dimensions.width,
        shippingDetails.dimensions.height,
        shippingDetails.transportMode
      );
      
      // Use higher of actual and volumetric weight
      const chargableWeight = Math.max(shippingDetails.weight, volumetricWeight);
      
      // Base calculation
      let cost = chargableWeight * distance * baseRatePerKgKm;
      
      // Apply fuel surcharge (varies by transport mode)
      cost *= this.getFuelSurcharge(shippingDetails.transportMode);
      
      // Apply package type factor
      cost *= this.getPackageTypeFactor(shippingDetails.packageType);
      
      // Apply shipper type discount/markup
      cost *= this.getShipmentTypeFactor(shippingDetails.shipmentType);
      
      return Math.round(cost * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      logger.error('Error calculating distance-based shipping', error);
      // Even in case of error, provide a reasonable estimate
      return this.getFallbackShippingCost(shippingDetails.weight, originCountry, destinationCountry);
    }
  }

  /**
   * Determine rate type based on transport mode and shipment type
   */
  private determineRateType(transportMode: string, shipmentType: string): string {
    const modeMap = {
      'Air Freight': {
        'Express': 'air-express',
        'LCL': 'air-consolidated',
        'FCL': 'air-charter',
        'default': 'air-standard'
      },
      'Sea Freight': {
        'LCL': 'sea-lcl',
        'FCL': 'sea-fcl',
        'Bulk': 'sea-bulk',
        'default': 'sea-standard'
      },
      'Rail Freight': {
        'FCL': 'rail-container',
        'Bulk': 'rail-bulk',
        'default': 'rail-standard'
      },
      'Road Transport': {
        'Express': 'road-express',
        'LCL': 'road-ltl',
        'FCL': 'road-ftl',
        'default': 'road-standard'
      }
    };
    
    const modeRates = modeMap[transportMode] || modeMap['Road Transport'];
    return modeRates[shipmentType] || modeRates['default'];
  }

  /**
   * Get base shipping rate by rate type
   */
  private getBaseRateByType(rateType: string): number {
    const baseRates = {
      'air-express': 15.5,
      'air-consolidated': 9.8,
      'air-charter': 22.5,
      'air-standard': 12.0,
      
      'sea-lcl': 5.2,
      'sea-fcl': 3.8,
      'sea-bulk': 3.0,
      'sea-standard': 4.5,
      
      'rail-container': 4.2,
      'rail-bulk': 3.5,
      'rail-standard': 3.8,
      
      'road-express': 6.5,
      'road-ltl': 4.8,
      'road-ftl': 3.2,
      'road-standard': 4.0
    };
    
    return baseRates[rateType] || 5.0; // Default to $5.00 if rate type not found
  }

  /**
   * Calculate weight factor - higher weights get volume discounts
   */
  private calculateWeightFactor(weight: number, rateType: string): number {
    // Weight discounts vary by transport mode
    const isAir = rateType.startsWith('air');
    const isSea = rateType.startsWith('sea');
    const isRail = rateType.startsWith('rail');
    
    if (isAir) {
      // Air freight has more aggressive weight breaks
      if (weight <= 10) return 1.0;
      if (weight <= 50) return 0.85;
      if (weight <= 100) return 0.75;
      if (weight <= 300) return 0.65;
      if (weight <= 500) return 0.55;
      return 0.5; // 500kg+
    } else if (isSea) {
      // Sea freight has larger weight breaks
      if (weight <= 100) return 1.0;
      if (weight <= 500) return 0.9;
      if (weight <= 1000) return 0.8;
      if (weight <= 5000) return 0.7;
      return 0.6; // 5000kg+
    } else if (isRail) {
      // Rail freight
      if (weight <= 100) return 1.0;
      if (weight <= 500) return 0.9;
      if (weight <= 1000) return 0.82;
      if (weight <= 5000) return 0.75;
      return 0.65; // 5000kg+
    } else {
      // Road freight
      if (weight <= 50) return 1.0;
      if (weight <= 200) return 0.9;
      if (weight <= 500) return 0.8;
      if (weight <= 1000) return 0.75;
      return 0.7; // 1000kg+
    }
  }

  /**
   * Calculate distance factor based on origin and destination
   */
  private calculateDistanceFactor(originCountry: string, destinationCountry: string): number {
    // Distance factor is based on region-to-region shipping
    const regions = this.getCountryRegion(originCountry, destinationCountry);
    const originRegion = regions.origin;
    const destRegion = regions.destination;
    
    if (originRegion === destRegion) {
      // Same region
      return 1.0;
    }
    
    // Inter-regional distances (factors)
    const distanceMatrix = {
      'NA': { 'NA': 1.0, 'EU': 2.5, 'APAC': 3.2, 'SA': 1.8, 'AF': 3.0, 'ME': 2.8 },
      'EU': { 'NA': 2.5, 'EU': 1.0, 'APAC': 3.0, 'SA': 2.6, 'AF': 1.8, 'ME': 1.6 },
      'APAC': { 'NA': 3.2, 'EU': 3.0, 'APAC': 1.0, 'SA': 3.5, 'AF': 3.0, 'ME': 2.5 },
      'SA': { 'NA': 1.8, 'EU': 2.6, 'APAC': 3.5, 'SA': 1.0, 'AF': 3.0, 'ME': 3.2 },
      'AF': { 'NA': 3.0, 'EU': 1.8, 'APAC': 3.0, 'SA': 3.0, 'AF': 1.0, 'ME': 1.8 },
      'ME': { 'NA': 2.8, 'EU': 1.6, 'APAC': 2.5, 'SA': 3.2, 'AF': 1.8, 'ME': 1.0 }
    };
    
    return distanceMatrix[originRegion]?.[destRegion] || 2.0; // Default to 2.0x if regions not found
  }

  /**
   * Map countries to regions
   */
  private getCountryRegion(originCountry: string, destinationCountry: string): { origin: string, destination: string } {
    const regionMap = {
      // North America
      'US': 'NA', 'CA': 'NA', 'MX': 'NA',
      
      // Europe
      'UK': 'EU', 'DE': 'EU', 'FR': 'EU', 'IT': 'EU', 'ES': 'EU',
      'NL': 'EU', 'BE': 'EU', 'CH': 'EU', 'AT': 'EU', 'SE': 'EU',
      
      // Asia-Pacific
      'CN': 'APAC', 'JP': 'APAC', 'KR': 'APAC', 'AU': 'APAC', 'NZ': 'APAC',
      'SG': 'APAC', 'MY': 'APAC', 'TH': 'APAC', 'VN': 'APAC', 'ID': 'APAC',
      
      // South America
      'BR': 'SA', 'AR': 'SA', 'CO': 'SA', 'CL': 'SA', 'PE': 'SA',
      
      // Africa
      'ZA': 'AF', 'NG': 'AF', 'EG': 'AF', 'KE': 'AF', 'MA': 'AF',
      
      // Middle East
      'AE': 'ME', 'SA': 'ME', 'TR': 'ME', 'IL': 'ME', 'QA': 'ME'
    };
    
    return {
      origin: regionMap[originCountry] || 'OTHER',
      destination: regionMap[destinationCountry] || 'OTHER'
    };
  }

  /**
   * Get approximate distance between two countries in KM
   */
  private getCountryDistance(originCountry: string, destinationCountry: string): number {
    // If same country, use a minimum distance
    if (originCountry === destinationCountry) {
      return 500; // 500 km minimum distance within same country
    }
    
    // Use a pre-calculated distance matrix between major countries
    const distanceMatrix = {
      'US-CA': 2000,
      'US-MX': 3000,
      'US-UK': 6800,
      'US-DE': 7600,
      'US-JP': 10000,
      'US-CN': 11000,
      'US-AU': 15000,
      
      'CA-MX': 4000,
      'CA-UK': 5500,
      'CA-JP': 8500,
      
      'UK-DE': 1000,
      'UK-FR': 800,
      'UK-IT': 1500,
      'UK-ES': 1700,
      
      'DE-FR': 900,
      'DE-IT': 1000,
      'DE-ES': 1800,
      
      'CN-JP': 2100,
      'CN-KR': 950,
      'CN-SG': 4500,
      'CN-AU': 9000,
      
      'JP-KR': 1200,
      'JP-AU': 8000,
      
      'AU-NZ': 2200,
      'AU-SG': 6000
    };
    
    // Check both directions
    const key1 = `${originCountry}-${destinationCountry}`;
    const key2 = `${destinationCountry}-${originCountry}`;
    
    if (distanceMatrix[key1]) {
      return distanceMatrix[key1];
    } else if (distanceMatrix[key2]) {
      return distanceMatrix[key2];
    }
    
    // If not found, estimate based on regions
    const regions = this.getCountryRegion(originCountry, destinationCountry);
    if (regions.origin === regions.destination) {
      return 1500; // Default intra-region distance
    }
    
    const interRegionalDistances = {
      'NA-EU': 7000,
      'NA-APAC': 10000,
      'NA-SA': 5000,
      'NA-AF': 11000,
      'NA-ME': 10000,
      
      'EU-APAC': 9000,
      'EU-SA': 9500,
      'EU-AF': 6000,
      'EU-ME': 4000,
      
      'APAC-SA': 15000,
      'APAC-AF': 11000,
      'APAC-ME': 8000,
      
      'SA-AF': 10000,
      'SA-ME': 12000,
      
      'AF-ME': 4000
    };
    
    const regionKey1 = `${regions.origin}-${regions.destination}`;
    const regionKey2 = `${regions.destination}-${regions.origin}`;
    
    if (interRegionalDistances[regionKey1]) {
      return interRegionalDistances[regionKey1];
    } else if (interRegionalDistances[regionKey2]) {
      return interRegionalDistances[regionKey2];
    }
    
    return a8000; // Default fallback distance
  }

  /**
   * Get base rate per kg-km for different transport modes
   */
  private getBaseRatePerKgKm(transportMode: string): number {
    const rates = {
      'Air Freight': 0.00050,     // $0.50 per kg per 1000 km
      'Sea Freight': 0.00012,     // $0.12 per kg per 1000 km
      'Rail Freight': 0.00020,    // $0.20 per kg per 1000 km
      'Road Transport': 0.00035   // $0.35 per kg per 1000 km
    };
    
    return rates[transportMode] || 0.00025; // Default rate
  }

  /**
   * Calculate volumetric weight
   */
  private calculateVolumetricWeight(length: number, width: number, height: number, transportMode: string): number {
    // Different modes use different volumetric divisors
    const volumetricDivisors = {
      'Air Freight': 6000,       // 1 cubic meter = 166.67 kg
      'Sea Freight': 1000,       // 1 cubic meter = 1000 kg 
      'Rail Freight': 4000,      // 1 cubic meter = 250 kg
      'Road Transport': 5000     // 1 cubic meter = 200 kg
    };
    
    const divisor = volumetricDivisors[transportMode] || 5000;
    return (length * width * height) / divisor;
  }

  /**
   * Get current fuel surcharge by transport mode
   */
  private getFuelSurcharge(transportMode: string): number {
    const surcharges = {
      'Air Freight': 1.18,      // 18% fuel surcharge
      'Sea Freight': 1.15,      // 15% fuel surcharge
      'Rail Freight': 1.12,     // 12% fuel surcharge
      'Road Transport': 1.14    // 14% fuel surcharge
    };
    
    return surcharges[transportMode] || 1.15; // Default 15% surcharge
  }

  /**
   * Get package type factor
   */
  private getPackageTypeFactor(packageType: string): number {
    const factors = {
      'Cardboard Box': 1.0,
      'Wooden Crate': 1.15,
      'Pallet': 1.1,
      'Drum': 1.2,
      'Bag': 0.95
    };
    
    return factors[packageType] || 1.0;
  }

  /**
   * Get shipment type factor
   */
  private getShipmentTypeFactor(shipmentType: string): number {
    const factors = {
      'LCL': 1.2,   // Less than Container Load - higher per unit
      'FCL': 0.85,  // Full Container Load - volume discount
      'Express': 1.6, // Express shipment - premium
      'Bulk': 0.75  // Bulk cargo - volume discount
    };
    
    return factors[shipmentType] || 1.0;
  }

  /**
   * Select appropriate carrier based on transport mode
   */
  private selectCarrierByMode(transportMode: string): string {
    const carriers = {
      'Air Freight': ['DHL Air', 'FedEx Air', 'UPS Air', 'Lufthansa Cargo'],
      'Sea Freight': ['Maersk', 'MSC', 'CMA CGM', 'COSCO'],
      'Rail Freight': ['DB Cargo', 'BNSF', 'CN Rail', 'Union Pacific'],
      'Road Transport': ['DHL Ground', 'UPS Ground', 'FedEx Ground', 'XPO Logistics']
    };
    
    const options = carriers[transportMode] || carriers['Road Transport'];
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  }

  /**
   * Get service level description based on rate type
   */
  private getServiceLevelByType(rateType: string): string {
    const services = {
      'air-express': 'Priority Express (1-2 days)',
      'air-consolidated': 'Standard Air (3-5 days)',
      'air-charter': 'Air Charter (Custom)',
      'air-standard': 'Economy Air (5-7 days)',
      
      'sea-lcl': 'LCL Ocean (25-30 days)',
      'sea-fcl': 'FCL Ocean (18-25 days)',
      'sea-bulk': 'Bulk Ocean (20-30 days)',
      'sea-standard': 'Standard Ocean (20-28 days)',
      
      'rail-container': 'Container Rail (10-18 days)',
      'rail-bulk': 'Bulk Rail (12-20 days)',
      'rail-standard': 'Standard Rail (15-20 days)',
      
      'road-express': 'Express Road (1-3 days)',
      'road-ltl': 'LTL Road (3-5 days)',
      'road-ftl': 'FTL Road (2-4 days)',
      'road-standard': 'Standard Road (3-7 days)'
    };
    
    return services[rateType] || 'Standard Service';
  }

  /**
   * Estimate delivery time based on origin, destination and rate type
   */
  private estimateDeliveryTime(originCountry: string, destinationCountry: string, rateType: string): string {
    // Get base transit time from rate type
    const serviceInfo = this.getServiceLevelByType(rateType);
    const transitDays = this.extractDaysFromServiceLevel(serviceInfo);
    
    // Adjust for cross-border factor
    let adjustedDays = transitDays;
    
    // If different countries, add customs clearance time
    if (originCountry !== destinationCountry) {
      adjustedDays += 2; // Add 2 days for customs clearance
    }
    
    // Adjust for special country pairs
    const adjustment = this.getCountryPairAdjustment(originCountry, destinationCountry);
    adjustedDays += adjustment;
    
    // Format the delivery estimate
    const lowEstimate = Math.max(1, adjustedDays - 1);
    const highEstimate = adjustedDays + 1;
    
    return `${lowEstimate}-${highEstimate} business days`;
  }

  /**
   * Extract transit days from service level string
   */
  private extractDaysFromServiceLevel(serviceLevel: string): number {
    // Parse the days from strings like "Priority Express (1-2 days)"
    const match = serviceLevel.match(/\((\d+)-(\d+) days\)/);
    if (match) {
      const lowDays = parseInt(match[1], 10);
      const highDays = parseInt(match[2], 10);
      return Math.floor((lowDays + highDays) / 2); // Average of range
    }
    return 5; // Default to 5 days if parsing fails
  }

  /**
   * Get delivery time adjustment based on country pair
   */
  private getCountryPairAdjustment(originCountry: string, destinationCountry: string): number {
    // Some specific country pairs have known longer or shorter transit times
    const adjustments = {
      'US-CN': 1,  // US to China typically takes a bit longer
      'CN-US': 1,  // China to US typically takes a bit longer
      'US-UK': -1, // US to UK typically has good connections
      'UK-US': -1, // UK to US typically has good connections
      'US-CA': -1, // US to Canada is typically faster
      'CA-US': -1, // Canada to US is typically faster
      'UK-EU': -1, // UK to EU is fast despite Brexit
      'EU-UK': -1, // EU to UK is fast despite Brexit
    };
    
    const key = `${originCountry}-${destinationCountry}`;
    return adjustments[key] || 0;
  }

  /**
   * Get fallback shipping cost when calculation fails
   */
  private getFallbackShippingCost(weight: number, originCountry: string, destinationCountry: string): number {
    // Very simple fallback calculation based on weight and region
    const regions = this.getCountryRegion(originCountry, destinationCountry);
    
    let baseCost = 50; // Minimum base cost of $50
    
    // Add weight cost
    baseCost += weight * 2; // $2 per kg
    
    // Add distance factor
    if (regions.origin === regions.destination) {
      baseCost *= 1.0; // Same region
    } else {
      baseCost *= 1.5; // Different regions
    }
    
    return Math.round(baseCost * 100) / 100; // Round to 2 decimal places
  }
}