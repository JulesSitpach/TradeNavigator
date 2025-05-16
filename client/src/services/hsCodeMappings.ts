/**
 * Common product keyword to HS code mappings
 * For quick lookups without requiring API calls
 * 
 * Format: 
 * 'keyword': { 
 *    code: 'primary HS code', 
 *    alternatives: ['alternative codes'] 
 * }
 */

interface HSCodeMapping {
  code: string;
  alternatives?: string[];
  description?: string;
}

const hsCodeMappings: Record<string, HSCodeMapping> = {
  // Electronics
  'laptop': { 
    code: '8471.30', 
    alternatives: ['8471.41', '8471.49'],
    description: 'Portable automatic data processing machines, weighing not more than 10 kg'
  },
  'computer': { 
    code: '8471.41', 
    alternatives: ['8471.49', '8471.50'],
    description: 'Other automatic data processing machines'
  },
  'smartphone': { 
    code: '8517.13', 
    alternatives: ['8517.14'],
    description: 'Smartphones'
  },
  'mobile phone': { 
    code: '8517.14', 
    alternatives: ['8517.13'],
    description: 'Other telephones for cellular networks or for other wireless networks'
  },
  'tablet': { 
    code: '8471.30', 
    alternatives: ['8471.41'],
    description: 'Portable automatic data processing machines, weighing not more than 10 kg'
  },
  'monitor': { 
    code: '8528.52', 
    alternatives: ['8528.59'],
    description: 'Monitors capable of directly connecting to and designed for use with an automatic data processing machine'
  },
  'television': { 
    code: '8528.72', 
    alternatives: ['8528.71'],
    description: 'Other color television reception apparatus'
  },
  'headphone': { 
    code: '8518.30', 
    alternatives: ['8518.29'],
    description: 'Headphones and earphones, whether or not combined with a microphone'
  },
  'speaker': { 
    code: '8518.22', 
    alternatives: ['8518.21', '8518.29'],
    description: 'Multiple loudspeakers, mounted in the same enclosure'
  },
  'camera': { 
    code: '8525.83', 
    alternatives: ['8525.89'],
    description: 'Television cameras, digital cameras and video camera recorders'
  },
  'printer': { 
    code: '8443.31', 
    alternatives: ['8443.32'],
    description: 'Machines which perform two or more functions of printing, copying or facsimile transmission'
  },

  // Textiles & Apparel
  't-shirt': { 
    code: '6109.10', 
    alternatives: ['6109.90'],
    description: 'T-shirts, singlets and other vests, knitted or crocheted, of cotton'
  },
  'cotton': { 
    code: '5201.00', 
    alternatives: ['5205.11'],
    description: 'Cotton, not carded or combed'
  },
  'shirt': { 
    code: '6205.20', 
    alternatives: ['6205.30', '6105.10'],
    description: 'Men\'s or boys\' shirts, of cotton'
  },
  'jeans': { 
    code: '6203.42', 
    alternatives: ['6204.62'],
    description: 'Men\'s or boys\' trousers, bib and brace overalls, breeches and shorts, of cotton'
  },
  'dress': { 
    code: '6204.42', 
    alternatives: ['6204.43', '6104.42'],
    description: 'Women\'s or girls\' dresses, of cotton'
  },
  'sweater': { 
    code: '6110.20', 
    alternatives: ['6110.30'],
    description: 'Sweaters, pullovers, sweatshirts, waistcoats (vests) and similar articles, knitted or crocheted, of cotton'
  },
  'jacket': { 
    code: '6201.92', 
    alternatives: ['6202.92'],
    description: 'Men\'s or boys\' anoraks, wind-cheaters, wind-jackets and similar articles, of cotton'
  },
  'hat': { 
    code: '6505.00', 
    alternatives: ['6504.00'],
    description: 'Hats and other headgear, knitted or crocheted, or made up from lace, felt or other textile fabric'
  },
  'gloves': { 
    code: '6116.92', 
    alternatives: ['6216.00'],
    description: 'Gloves, mittens and mitts, knitted or crocheted, of cotton'
  },
  'socks': { 
    code: '6115.95', 
    alternatives: ['6115.96'],
    description: 'Pantyhose, tights, stockings, socks and other hosiery, of cotton'
  },

  // Automotive Parts
  'car parts': { 
    code: '8708.99', 
    alternatives: ['8708.29', '8708.30'],
    description: 'Other parts and accessories of motor vehicles'
  },
  'engine': { 
    code: '8407.34', 
    alternatives: ['8408.20'],
    description: 'Spark-ignition reciprocating or rotary internal combustion piston engines, of a cylinder capacity exceeding 1,000 cc'
  },
  'transmission': { 
    code: '8708.40', 
    alternatives: ['8483.40'],
    description: 'Gear boxes and parts thereof, for motor vehicles'
  },
  'brake': { 
    code: '8708.30', 
    alternatives: ['8708.31', '8708.39'],
    description: 'Brakes and servo-brakes; parts thereof, for motor vehicles'
  },
  'wheel': { 
    code: '8708.70', 
    alternatives: ['8716.90'],
    description: 'Road wheels and parts and accessories thereof, for motor vehicles'
  },
  'tire': { 
    code: '4011.10', 
    alternatives: ['4011.20'],
    description: 'New pneumatic tires, of rubber, of a kind used on motor cars'
  },
  'battery': { 
    code: '8507.60', 
    alternatives: ['8507.20'],
    description: 'Lithium-ion accumulators'
  },
  'spark plug': { 
    code: '8511.10', 
    alternatives: ['8511.90'],
    description: 'Spark plugs, for internal combustion engines'
  },
  'car seat': { 
    code: '9401.20', 
    alternatives: ['9401.90'],
    description: 'Seats of a kind used for motor vehicles'
  },
  'windshield': { 
    code: '7007.21', 
    alternatives: ['7007.11'],
    description: 'Laminated safety glass, of size and shape suitable for incorporation in vehicles'
  }
};

export default hsCodeMappings;