import axios from 'axios';

// Interface for classification results
interface ClassificationResult {
  hsCode: string;
  confidence: number;
  alternativeCodes?: string[];
  source: 'AI' | 'Mapping' | 'Fallback';
}

// Sample HS code mappings by category and keywords
export const hsCodeMappings: Record<string, Record<string, string>> = {
  'Electronics': {
    'smartphone': '8517.12',
    'mobile phone': '8517.12',
    'laptop': '8471.30',
    'computer': '8471.30',
    'tablet': '8471.30',
    'headphones': '8518.30',
    'earbuds': '8518.30',
    'tv': '8528.72',
    'television': '8528.72',
    'camera': '8525.80',
    'digital camera': '8525.80',
    'speaker': '8518.22',
    'microphone': '8518.10',
    'monitor': '8528.52',
    'printer': '8443.31',
    'router': '8517.62',
    'keyboard': '8471.60',
    'mouse': '8471.60',
    'hard drive': '8471.70',
    'ssd': '8471.70',
    'battery': '8507.60',
  },
  'Clothing': {
    't-shirt': '6109.10',
    'cotton shirt': '6105.10',
    'sweater': '6110.20',
    'jeans': '6203.42',
    'dress': '6204.43',
    'jacket': '6201.93',
    'coat': '6201.93',
    'wool coat': '6201.11',
    'pants': '6203.42',
    'trousers': '6203.42',
    'socks': '6115.95',
    'underwear': '6107.11',
    'bra': '6212.10',
    'hat': '6505.00',
    'gloves': '6116.10',
    'scarf': '6117.10',
    'shoes': '6404.19',
    'leather shoes': '6403.59',
    'boots': '6403.91',
    'sneakers': '6404.11',
  },
  'Food Products': {
    'chocolate': '1806.90',
    'coffee': '0901.21',
    'tea': '0902.30',
    'olive oil': '1509.10',
    'wine': '2204.21',
    'cheese': '0406.90',
    'butter': '0405.10',
    'rice': '1006.30',
    'pasta': '1902.19',
    'sugar': '1701.99',
    'honey': '0409.00',
    'fruit juice': '2009.90',
    'spices': '0910.99',
    'nuts': '0802.90',
    'dried fruit': '0813.50',
    'canned vegetables': '2005.99',
    'frozen vegetables': '0710.90',
    'meat': '0201.30',
    'fish': '0302.99',
  },
  'Cosmetics': {
    'perfume': '3303.00',
    'makeup': '3304.99',
    'lipstick': '3304.10',
    'mascara': '3304.20',
    'skin care': '3304.99',
    'facial cream': '3304.99',
    'shampoo': '3305.10',
    'conditioner': '3305.90',
    'soap': '3401.11',
    'toothpaste': '3306.10',
    'deodorant': '3307.20',
    'nail polish': '3304.30',
    'hair dye': '3305.90',
    'sunscreen': '3304.99',
  },
  'Furniture': {
    'chair': '9401.71',
    'sofa': '9401.61',
    'table': '9403.60',
    'desk': '9403.30',
    'bed': '9403.50',
    'mattress': '9404.21',
    'bookshelf': '9403.30',
    'lamp': '9405.20',
    'cabinet': '9403.60',
    'wardrobe': '9403.50',
    'mirror': '7009.92',
    'dining table': '9403.60',
    'coffee table': '9403.60',
  },
  'Toys': {
    'doll': '9503.00',
    'action figure': '9503.00',
    'puzzle': '9503.00',
    'board game': '9504.90',
    'card game': '9504.40',
    'video game': '9504.50',
    'toy car': '9503.00',
    'stuffed animal': '9503.00',
    'building blocks': '9503.00',
    'plush toy': '9503.00',
  }
};

/**
 * Service for classifying products and determining HS codes
 */
class HSCodeAIService {
  /**
   * Classify a product to determine its HS code
   * 
   * @param description Product description
   * @param category Product category (optional)
   * @returns Classification result with HS code and confidence
   */
  async classifyProduct(
    description: string, 
    category?: string
  ): Promise<ClassificationResult> {
    try {
      // First check if we can find a match in our static mappings
      const mappedCode = this.checkMappings(description, category || '');
      if (mappedCode) {
        return {
          hsCode: mappedCode,
          confidence: 0.95,
          source: 'Mapping'
        };
      }
      
      // For a real implementation, make an API call to the backend
      // which would then use OpenAI or a similar service
      try {
        const response = await axios.post('/api/hsCode/classify', {
          description,
          category
        });
        
        return {
          hsCode: response.data.hsCode,
          confidence: response.data.confidence,
          alternativeCodes: response.data.alternatives,
          source: 'AI'
        };
      } catch (apiError) {
        console.error('API classification failed:', apiError);
        
        // Fallback with a basic prediction based on category
        const fallbackCode = this.getFallbackHSCode(category || '');
        return {
          hsCode: fallbackCode,
          confidence: 0.6,
          source: 'Fallback'
        };
      }
    } catch (error) {
      console.error('HS code classification error:', error);
      return {
        hsCode: '0000.00', // Invalid/unknown code
        confidence: 0,
        source: 'Fallback'
      };
    }
  }
  
  /**
   * Check static mappings for a matching HS code
   */
  private checkMappings(description: string, category: string): string | null {
    const lowerDescription = description.toLowerCase();
    
    // If category is provided, check that category's mappings first
    if (category && hsCodeMappings[category]) {
      for (const [keyword, code] of Object.entries(hsCodeMappings[category])) {
        if (lowerDescription.includes(keyword.toLowerCase())) {
          return code;
        }
      }
    }
    
    // If no match in the specified category, check all categories
    for (const categoryMappings of Object.values(hsCodeMappings)) {
      for (const [keyword, code] of Object.entries(categoryMappings)) {
        if (lowerDescription.includes(keyword.toLowerCase())) {
          return code;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Get contextual information for a specific category
   */
  private getContextForCategory(category: string): string {
    const contextMap: Record<string, string> = {
      'Electronics': 'Electronics are typically classified under Chapter 85 (electrical machinery, equipment, and parts) or Chapter 84 (machinery and mechanical appliances).',
      'Clothing': 'Clothing items are typically classified under Chapters 61 (knitted or crocheted apparel) or 62 (non-knitted/crocheted apparel).',
      'Food Products': 'Food products span multiple chapters, including Chapters 2-4 (animal products), 7-11 (vegetables and grains), and 15-22 (prepared foods and beverages).',
      'Cosmetics': 'Cosmetics and personal care products are primarily classified under Chapter 33 (essential oils and resinoids; perfumery, cosmetic, or toilet preparations).',
      'Furniture': 'Furniture and furnishings are classified under Chapter 94 (furniture; bedding, mattresses, etc.).',
      'Toys': 'Toys, games, and sports equipment are classified under Chapter 95.'
    };
    
    return contextMap[category] || 'HS codes are 6-digit codes used globally for classifying traded products. The first 2 digits represent the chapter, the next 2 digits identify the heading, and the final 2 digits provide more specific classification.';
  }
  
  /**
   * Get a fallback HS code based on category
   */
  private getFallbackHSCode(category: string): string {
    const fallbackMap: Record<string, string> = {
      'Electronics': '8543.70', // Other electrical machines and apparatus
      'Clothing': '6217.10', // Other made-up clothing accessories
      'Food Products': '2106.90', // Other food preparations
      'Cosmetics': '3307.90', // Other cosmetic or toilet preparations
      'Furniture': '9403.70', // Furniture of plastics
      'Toys': '9503.00', // Toys, n.e.s.
      'Jewelry': '7117.90', // Other imitation jewelry
      'Books': '4901.99', // Other printed books, brochures, etc.
      'Medical Supplies': '9018.90', // Other medical instruments and appliances
      'Sporting Goods': '9506.91', // Other articles and equipment for sports
    };
    
    return fallbackMap[category] || '9901.00'; // General fallback for miscellaneous goods
  }
}

export default new HSCodeAIService();