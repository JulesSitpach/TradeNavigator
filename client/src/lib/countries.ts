// Countries data structure with ISO codes and names
export const countries = [
  // North America
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  
  // EU Countries
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'SE', name: 'Sweden' },
  { code: 'PL', name: 'Poland' },
  { code: 'AT', name: 'Austria' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GR', name: 'Greece' },
  
  // Central/South America
  { code: 'MX', name: 'Mexico' },
  { code: 'BR', name: 'Brazil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'PA', name: 'Panama' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'GT', name: 'Guatemala' },
  
  // Asia
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'IN', name: 'India' },
  { code: 'SG', name: 'Singapore' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'TH', name: 'Thailand' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TW', name: 'Taiwan' },
  
  // Oceania
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  
  // Africa
  { code: 'ZA', name: 'South Africa' },
  { code: 'EG', name: 'Egypt' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'MA', name: 'Morocco' }
];

// Organize countries by region for better UX
export const countriesByRegion = {
  'northAmerica': ['US', 'CA'],
  'europeanUnion': ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'SE', 'PL', 'AT', 'DK', 'FI', 'IE', 'PT', 'GR'],
  'centralSouthAmerica': ['MX', 'BR', 'AR', 'CL', 'CO', 'PE', 'EC', 'VE', 'PA', 'CR', 'GT'],
  'asia': ['CN', 'JP', 'KR', 'IN', 'SG', 'VN', 'TH', 'MY', 'TW'],
  'oceania': ['AU', 'NZ'],
  'africa': ['ZA', 'EG', 'NG', 'KE', 'MA']
};