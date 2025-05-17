/**
 * Cost breakdown calculator API functions
 */

/**
 * Calculate duty rate based on HS code, origin and destination
 */
export function calculateDutyRate(hsCode: string, originCountry: string, destinationCountry: string): number {
  // Apply realistic duty rates based on HS code and country pairs
  const hsPrefix = hsCode.substring(0, 4);
  
  if (destinationCountry === 'US') {
    if (hsPrefix === '8471') return 0; // Computers
    else if (hsPrefix === '8517') return 0; // Phones
    else if (hsPrefix === '6109') return 16.5; // T-shirts
    else if (hsPrefix === '2208') return 14.0; // Spirits
    else if (hsPrefix === '9403') return 2.5; // Wooden furniture
    else return 3.5; // Default US rate
  } else if (destinationCountry === 'UK') {
    if (hsPrefix === '8471' || hsPrefix === '8517') return 0; // Electronics
    else if (hsPrefix === '6109') return 12.0; // Textiles
    else if (hsPrefix === '9403') return 3.7; // Wooden furniture
    else return 4.0; // Default UK rate
  } else if (destinationCountry === 'CN') {
    if (hsPrefix === '8471') return 9.0;
    else if (hsPrefix === '8517') return 11.0;
    else if (hsPrefix === '9403') return 10.0; // Wooden furniture
    else return 7.5; // Default China rate
  } else if (destinationCountry === 'EU' || destinationCountry === 'European Union') {
    if (hsPrefix === '8471' || hsPrefix === '8517') return 0; // Electronics
    else if (hsPrefix === '6109') return 12.0; // Textiles
    else if (hsPrefix === '9403') return 2.7; // Wooden furniture
    else return 3.8; // Default EU rate
  }
  
  // Check if this is a CPTPP trade agreement route
  const cptppOrigins = ['Japan', 'Australia', 'Canada', 'Mexico', 'Singapore', 'Vietnam', 'Peru', 'Chile', 'Malaysia', 'New Zealand'];
  const cptppDestinations = ['Japan', 'Australia', 'Canada', 'Mexico', 'Singapore', 'Vietnam', 'Peru', 'Chile', 'Malaysia', 'New Zealand', 'United Kingdom'];
  
  if (cptppOrigins.includes(originCountry) && cptppDestinations.includes(destinationCountry)) {
    if (hsPrefix === '9403') return 0; // Duty-free furniture within CPTPP
    return 0.5; // Preferential rate for CPTPP members
  }
  
  // Default international rate
  return 5.0;
}

/**
 * Get tax information for a country
 */
export function getTaxInfo(countryCode: string): { name: string, rate: number } {
  const taxInfo: Record<string, { name: string, rate: number }> = {
    'US': { name: 'Sales Tax', rate: 0 }, // No federal VAT/GST
    'CA': { name: 'GST/HST', rate: 5 }, // 5% GST
    'UK': { name: 'VAT', rate: 20 }, // 20% VAT
    'AU': { name: 'GST', rate: 10 }, // 10% GST
    'NZ': { name: 'GST', rate: 15 }, // 15% GST
    'JP': { name: 'Consumption Tax', rate: 10 }, // 10% Consumption Tax
    'DE': { name: 'VAT', rate: 19 }, // 19% VAT
    'FR': { name: 'VAT', rate: 20 }, // 20% VAT
    'IT': { name: 'VAT', rate: 22 }, // 22% VAT
    'CN': { name: 'VAT', rate: 13 }, // 13% VAT
    'IN': { name: 'GST', rate: 18 }, // 18% GST
    'SG': { name: 'GST', rate: 7 } // 7% GST
  };
  
  return taxInfo[countryCode] || { name: 'Tax', rate: 10 }; // Default 10% generic tax
}

/**
 * Calculate shipping cost
 */
export function calculateShippingCost(
  originCountry: string, 
  destinationCountry: string, 
  transportMode: string, 
  shipmentType: string, 
  weight: number, 
  dimensions: { length: number, width: number, height: number, unit: string }
): number {
  // Base rates by transport mode (USD per kg)
  const baseRates: Record<string, number> = {
    'Air Freight': 12,
    'Sea Freight': 4.5,
    'Rail Freight': 6,
    'Road Transport': 8
  };
  
  // Calculate volumetric weight
  let volumeInCubicMeters = 
    (dimensions.length * dimensions.width * dimensions.height) / 1000000;
  
  // Handle different units
  if (dimensions.unit === 'in') {
    // Convert from cubic inches to cubic meters
    volumeInCubicMeters = volumeInCubicMeters * 0.0000164;
  } else if (dimensions.unit === 'm') {
    // Already in meters, no conversion needed
    volumeInCubicMeters = dimensions.length * dimensions.width * dimensions.height;
  }
  
  // Different modes use different volumetric divisors
  const volumetricDivisors: Record<string, number> = {
    'Air Freight': 6000,  // 1 cubic meter = 166.67 kg
    'Sea Freight': 1000,  // 1 cubic meter = 1000 kg 
    'Rail Freight': 4000, // 1 cubic meter = 250 kg
    'Road Transport': 5000 // 1 cubic meter = 200 kg
  };
  
  const divisor = volumetricDivisors[transportMode] || 5000;
  const volumetricWeight = (volumeInCubicMeters * 1000000) / divisor;
  
  // Use greater of actual and volumetric weight
  const chargeableWeight = Math.max(weight, volumetricWeight);
  
  // Base shipping cost calculation
  const baseRate = baseRates[transportMode] || 8;
  let shippingCost = baseRate * chargeableWeight;
  
  // Apply distance factor based on origin/destination
  let distanceFactor = 1.0;
  
  if (originCountry === destinationCountry) {
    distanceFactor = 0.8; // Domestic shipping
  } else if (
    ['US', 'CA', 'MX'].includes(originCountry) && 
    ['US', 'CA', 'MX'].includes(destinationCountry)
  ) {
    distanceFactor = 1.0; // North America
  } else if (
    ['UK', 'DE', 'FR', 'IT', 'ES'].includes(originCountry) && 
    ['UK', 'DE', 'FR', 'IT', 'ES'].includes(destinationCountry)
  ) {
    distanceFactor = 1.0; // Europe
  } else if (
    ['CN', 'JP', 'KR', 'SG'].includes(originCountry) && 
    ['CN', 'JP', 'KR', 'SG'].includes(destinationCountry)
  ) {
    distanceFactor = 1.0; // Asia
  } else {
    // Cross-regional shipping
    distanceFactor = 1.8;
  }
  
  shippingCost *= distanceFactor;
  
  // Apply shipment type factors
  const shipmentTypeFactors: Record<string, number> = {
    'LCL': 1.2,   // Less than Container Load - higher per unit
    'FCL': 0.85,  // Full Container Load - volume discount
    'Express': 1.6, // Express shipment - premium
    'Bulk': 0.75  // Bulk cargo - volume discount
  };
  
  shippingCost *= shipmentTypeFactors[shipmentType] || 1.0;
  
  return Math.round(shippingCost * 100) / 100;
}

/**
 * Calculate insurance cost
 */
export function calculateInsurance(productValue: number, transportMode: string): number {
  // Insurance rates as percentage of product value
  const insuranceRates: Record<string, number> = {
    'Air Freight': 0.005, // 0.5%
    'Sea Freight': 0.01,  // 1.0%
    'Rail Freight': 0.008, // 0.8%
    'Road Transport': 0.015  // 1.5%
  };
  
  const insuranceRate = insuranceRates[transportMode] || 0.01;
  return Math.round((productValue * insuranceRate) * 100) / 100;
}

/**
 * Calculate customs fees
 */
export function calculateCustomsFees(countryCode: string, productValue: number): number {
  // Customs fees vary by country and sometimes by product value
  if (countryCode === 'US') {
    return Math.min(Math.max(productValue * 0.0021, 25), 500); // 0.21% with min $25, max $500
  } else if (countryCode === 'CA') {
    return Math.min(productValue * 0.0085, 295); // 0.85% with max $295 CAD
  } else if (countryCode === 'UK') {
    return 15; // Flat fee of £15
  } else if (countryCode === 'AU') {
    return 88; // Flat fee of AUD $88
  } else if (countryCode === 'DE' || countryCode === 'FR') {
    return 25; // ~€25 flat fee
  } 
  
  // Default to 0.5% for other countries
  return Math.round((productValue * 0.005) * 100) / 100;
}

/**
 * Calculate last mile delivery cost
 */
export function calculateLastMileDelivery(
  countryCode: string, 
  weight: number,
  volumeInCubicMeters: number
): number {
  // Base rates vary by country
  const baseLastMileRates: Record<string, number> = {
    'US': 15,
    'CA': 18,
    'UK': 12,
    'DE': 14,
    'FR': 16,
    'CN': 10,
    'JP': 22,
    'AU': 20
  };
  
  const baseLastMileRate = baseLastMileRates[countryCode] || 15;
  const weightAdjustment = Math.max(0, weight - 10) * 1; // $1 per kg over 10kg
  const volumeAdjustment = Math.max(0, volumeInCubicMeters - 0.1) * 500; // $0.5 per 0.001 m³ over 0.1 m³
  
  return Math.round((baseLastMileRate + weightAdjustment + volumeAdjustment) * 100) / 100;
}

/**
 * Calculate handling fees
 */
export function calculateHandlingFees(quantity: number, packageType: string): number {
  const baseHandlingFee = 25;
  const perUnitFee = 0.5;
  const quantityFee = quantity * perUnitFee;
  
  const packageTypeFees: Record<string, number> = {
    'Cardboard Box': 0,
    'Wooden Crate': 15,
    'Pallet': 30,
    'Drum': 20,
    'Bag': 5
  };
  
  const packageFee = packageTypeFees[packageType] || 0;
  return Math.round((baseHandlingFee + quantityFee + packageFee) * 100) / 100;
}