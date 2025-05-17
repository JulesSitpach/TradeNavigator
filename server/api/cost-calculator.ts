/**
 * Cost breakdown calculator API functions
 */

/**
 * Calculate duty rate based on HS code, origin and destination
 */
export function calculateDutyRate(hsCode: string, originCountry: string, destinationCountry: string): number {
  // Get the first 4 digits of the HS code for category matching
  const hsPrefix = hsCode.substring(0, 4);
  
  // Trade agreement detection - these define preferential rates between countries
  const tradeAgreements = {
    'CPTPP': {
      'members': ['Japan', 'Australia', 'Canada', 'Mexico', 'Singapore', 'Vietnam', 'Peru', 'Chile', 'Malaysia', 'New Zealand', 'United Kingdom'],
      'preferentialRate': 0.5,
      'zeroRateCategories': ['8471', '8517', '9403'] // Categories with zero duty in this agreement
    },
    'USMCA': {
      'members': ['United States', 'Canada', 'Mexico'],
      'preferentialRate': 0,
      'zeroRateCategories': ['8471', '8517', '8708', '9403']
    },
    'ASEAN': {
      'members': ['Indonesia', 'Malaysia', 'Philippines', 'Singapore', 'Thailand', 'Brunei', 'Vietnam', 'Laos', 'Myanmar', 'Cambodia'],
      'preferentialRate': 0,
      'zeroRateCategories': ['9403', '8471', '6109', '8517'] // Free trade for furniture and electronics within ASEAN
    },
    'Indonesia-Australia': {
      'members': ['Indonesia', 'Australia'],
      'preferentialRate': 0,
      'zeroRateCategories': ['9403'] // Zero duty on furniture between Indonesia and Australia
    }
  };
  
  // Base rates by destination country and HS category
  const countryRates = {
    'US': {
      'defaultRate': 3.5,
      'categoryRates': {
        '8471': 0, // Computers
        '8517': 0, // Phones
        '6109': 16.5, // T-shirts
        '2208': 14.0, // Spirits
        '9403': 2.5, // Wooden furniture
        '8708': 2.5, // Auto parts
        '3004': 0, // Pharmaceuticals
        '8544': 5.0, // Cables
      }
    },
    'UK': {
      'defaultRate': 4.0,
      'categoryRates': {
        '8471': 0, // Electronics
        '8517': 0, // Electronics
        '6109': 12.0, // Textiles
        '9403': 3.7, // Wooden furniture
        '8708': 4.5, // Auto parts
        '3004': 0, // Pharmaceuticals
      }
    },
    'European Union': {
      'defaultRate': 3.8,
      'categoryRates': {
        '8471': 0, // Electronics
        '8517': 0, // Electronics
        '6109': 12.0, // Textiles
        '9403': 2.7, // Wooden furniture
        '8708': 3.9, // Auto parts
        '3004': 0, // Pharmaceuticals
      }
    },
    'China': {
      'defaultRate': 7.5,
      'categoryRates': {
        '8471': 9.0, // Electronics
        '8517': 11.0, // Electronics
        '9403': 10.0, // Wooden furniture
      }
    }
  };
  
  // Set EU as alias for European Union
  countryRates['EU'] = countryRates['European Union'];
  
  // Add Indonesia-specific rates
  countryRates['Indonesia'] = {
    'defaultRate': 5.0,
    'categoryRates': {
      '9403': 3.0, // Wooden furniture
      '6109': 15.0, // Textiles
      '8471': 2.5, // Electronics
    }
  };
  
  // Check for trade agreements first - they take precedence
  for (const [agreementName, agreement] of Object.entries(tradeAgreements)) {
    if (agreement.members.includes(originCountry) && agreement.members.includes(destinationCountry)) {
      // If this product category has zero duty under this agreement
      if (agreement.zeroRateCategories.includes(hsPrefix)) {
        console.log(`Zero duty applied: ${originCountry} to ${destinationCountry} for HS ${hsPrefix} under ${agreementName}`);
        return 0;
      }
      // Otherwise apply the preferential rate
      console.log(`Preferential rate applied: ${originCountry} to ${destinationCountry} under ${agreementName}`);
      return agreement.preferentialRate;
    }
  }
  
  // If no trade agreement applies, use the destination country's standard rates
  if (countryRates[destinationCountry]) {
    const countryRate = countryRates[destinationCountry];
    // Check if this specific category has a defined rate
    if (countryRate.categoryRates[hsPrefix] !== undefined) {
      return countryRate.categoryRates[hsPrefix];
    }
    // Otherwise use the default rate for that country
    return countryRate.defaultRate;
  }
  
  // Default international rate if no specific rules match
  return 5.0;
}

/**
 * Get tax information for a country and product category
 * Returns appropriate VAT/GST/Sales Tax information based on country and product type
 */
export function getTaxInfo(countryCode: string, productCategory?: string, productValue?: number): { name: string, rate: number, description?: string } {
  // Base tax rates by country
  const baseTaxRates: Record<string, { name: string, rate: number }> = {
    'US': { name: 'Sales Tax', rate: 0 }, // No federal VAT/GST
    'CA': { name: 'GST/HST', rate: 5 }, // 5% GST (Federal only)
    'UK': { name: 'VAT', rate: 20 }, // 20% VAT
    'AU': { name: 'GST', rate: 10 }, // 10% GST
    'NZ': { name: 'GST', rate: 15 }, // 15% GST
    'JP': { name: 'Consumption Tax', rate: 10 }, // 10% Consumption Tax
    'DE': { name: 'VAT', rate: 19 }, // 19% VAT
    'FR': { name: 'VAT', rate: 20 }, // 20% VAT
    'IT': { name: 'VAT', rate: 22 }, // 22% VAT
    'ES': { name: 'VAT', rate: 21 }, // 21% VAT Spain
    'NL': { name: 'VAT', rate: 21 }, // 21% VAT Netherlands
    'CN': { name: 'VAT', rate: 13 }, // 13% VAT
    'IN': { name: 'GST', rate: 18 }, // 18% GST
    'SG': { name: 'GST', rate: 9 }, // 9% GST (Updated for 2025)
    'ID': { name: 'VAT', rate: 11 }, // 11% VAT Indonesia
    'MY': { name: 'Sales & Service Tax', rate: 6 }, // 6% SST Malaysia
    'TH': { name: 'VAT', rate: 7 }, // 7% VAT Thailand
    'VN': { name: 'VAT', rate: 10 }, // 10% VAT Vietnam
    'PH': { name: 'VAT', rate: 12 }, // 12% VAT Philippines
  };
  
  // EU VAT rates (for European Union member states)
  const euVatRates: Record<string, number> = {
    'AT': 20, // Austria
    'BE': 21, // Belgium
    'BG': 20, // Bulgaria
    'HR': 25, // Croatia
    'CY': 19, // Cyprus
    'CZ': 21, // Czech Republic
    'DK': 25, // Denmark
    'EE': 20, // Estonia
    'FI': 24, // Finland
    'FR': 20, // France
    'DE': 19, // Germany
    'GR': 24, // Greece
    'HU': 27, // Hungary
    'IE': 23, // Ireland
    'IT': 22, // Italy
    'LV': 21, // Latvia
    'LT': 21, // Lithuania
    'LU': 17, // Luxembourg
    'MT': 18, // Malta
    'NL': 21, // Netherlands
    'PL': 23, // Poland
    'PT': 23, // Portugal
    'RO': 19, // Romania
    'SK': 20, // Slovakia
    'SI': 22, // Slovenia
    'ES': 21, // Spain
    'SE': 25  // Sweden
  };
  
  // Add all EU countries to the baseTaxRates
  Object.entries(euVatRates).forEach(([countryCode, rate]) => {
    if (!baseTaxRates[countryCode]) {
      baseTaxRates[countryCode] = { name: 'VAT', rate };
    }
  });
  
  // Category-specific tax adjustments
  // Some product categories may have reduced rates or exemptions
  const categoryAdjustments: Record<string, Record<string, number>> = {
    'UK': {
      'Food': -20, // 0% for most food (full exemption)
      'Books': -15, // 5% reduced rate
      'Medical': -20, // 0% for medical and pharmaceutical products
      'Children': -15, // 5% for children's car seats
    },
    'DE': {
      'Food': -12, // 7% reduced rate
      'Books': -12, // 7% reduced rate
      'Medical': -19, // Exempt (0%)
    },
    'FR': {
      'Food': -15, // 5.5% reduced rate
      'Books': -15.5, // 5.5% reduced rate
      'Medical': -15.5, // 5.5% for some medical products
    }
    // Add more country-specific category adjustments as needed
  };
  
  // Value thresholds (many countries have import VAT thresholds)
  const valueThresholds: Record<string, number> = {
    'UK': 135, // £135 VAT threshold
    'EU': 150, // €150 for most EU countries
    'AU': 1000, // AUD 1,000
    'NZ': 1000, // NZD 1,000
  };
  
  // Get base tax rate for country
  let taxInfo = baseTaxRates[countryCode] || { name: 'Tax', rate: 10 }; // Default 10% generic tax
  let description = `Standard ${taxInfo.name} rate for ${countryCode}`;
  
  // Apply category-specific adjustments if applicable
  if (productCategory && categoryAdjustments[countryCode]?.[productCategory]) {
    const adjustment = categoryAdjustments[countryCode][productCategory];
    taxInfo.rate += adjustment;
    description = `Adjusted ${taxInfo.name} rate for ${productCategory} products in ${countryCode}`;
  }
  
  // Apply value threshold adjustments if applicable
  if (productValue !== undefined) {
    const threshold = valueThresholds[countryCode] || valueThresholds['EU'];
    if (threshold && productValue < threshold) {
      // If below threshold, many jurisdictions have simplified or eliminated VAT
      if (['UK', 'DE', 'FR', 'IT', 'ES', 'NL'].includes(countryCode)) {
        // For below-threshold imports to these countries, seller can collect VAT at point of sale
        description = `${taxInfo.name} collected at point of sale (below ${threshold} threshold)`;
      } else if (['AU', 'NZ'].includes(countryCode)) {
        // No GST collected below threshold in AU/NZ
        taxInfo.rate = 0;
        description = `No ${taxInfo.name} applied (below ${threshold} threshold)`;
      }
    }
  }
  
  return { ...taxInfo, description };
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