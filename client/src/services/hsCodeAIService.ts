import axios from 'axios';

interface ClassificationResult {
  hsCode: string;
  confidence: number;
  alternativeCodes?: string[];
  source: 'AI' | 'Mapping' | 'Fallback';
}

// HS Code mapping corrections for common product categories
export const hsCodeMappings: Record<string, Record<string, string>> = {
  electronics: {
    'laptop': '8471.30',
    'smartphone': '8517.12',
    'tablet': '8471.30',
    'headphones': '8518.30',
    'monitor': '8528.52',
    'smart watch': '8528.52',
    'fitness tracker': '8528.52'
  },
  textiles: {
    'cotton t-shirt': '6109.10',
    'jeans': '6203.42',
    'jacket': '6201.93',
    'woolen sweater': '6110.11',
    'silk dress': '6204.49'
  },
  furniture: {
    'wooden chair': '9401.61',
    'metal table': '9403.20',
    'sofa': '9401.61',
    'bed': '9403.50'
  }
};

class HSCodeAIService {
  async classifyProduct(
    productDescription: string, 
    category: string
  ): Promise<ClassificationResult> {
    try {
      // First check our local mappings for exact matches
      const mappingResult = this.checkMappings(productDescription, category);
      if (mappingResult) {
        return {
          hsCode: mappingResult,
          confidence: 0.95,
          source: 'Mapping'
        };
      }
      
      // If no mapping match, call the server API endpoint (which securely uses your API keys)
      const response = await axios.post('/api/ai/classify', {
        productDescription,
        category,
        context: this.getContextForCategory(category)
      });
      
      return {
        hsCode: response.data.hsCode,
        confidence: response.data.confidence || 0.85,
        alternativeCodes: response.data.alternatives || [],
        source: 'AI'
      };
    } catch (error) {
      console.error('HS Code classification error:', error);
      
      // Fallback to best-guess based on category
      return {
        hsCode: this.getFallbackHSCode(category),
        confidence: 0.5,
        source: 'Fallback'
      };
    }
  }
  
  private checkMappings(description: string, category: string): string | null {
    // Check against the hsCodeMappings
    const normalizedDesc = description.toLowerCase();
    
    // Get category-specific mappings
    const categoryMappings = hsCodeMappings[category] || {};
    
    // Check if any key in the mapping is included in the description
    for (const [key, hsCode] of Object.entries(categoryMappings)) {
      if (normalizedDesc.includes(key)) {
        return hsCode;
      }
    }
    
    // No match found
    return null;
  }
  
  private getContextForCategory(category: string): string {
    // Provide category-specific prompting context to improve AI results
    const contextMap: {[key: string]: string} = {
      'electronics': 'Focus on distinguishing between consumer electronics, components, and specialized equipment.',
      'textiles': 'Consider material composition, gender, and garment type.',
      'automotive': 'Consider vehicle type, part function, and material composition.',
      'food': 'Consider processing level, preservation method, and ingredients.',
      'chemicals': 'Consider chemical composition, application, and regulatory classification.',
      'machinery': 'Consider function, industry application, and operational mechanism.',
      'furniture': 'Consider material, function, and construction method.',
      'toys': 'Consider target age group, material, and function.'
    };
    
    return contextMap[category] || '';
  }
  
  private getFallbackHSCode(category: string): string {
    // Provide general fallback codes by category when AI fails
    const fallbacks: {[key: string]: string} = {
      'electronics': '8543.70', // Electrical machines and apparatus
      'textiles': '6211.43', // General garments
      'automotive': '8708.99', // Other parts and accessories
      'food': '2106.90', // Food preparations not elsewhere specified
      'chemicals': '3824.99', // Chemical products not elsewhere specified
      'machinery': '8479.89', // Machines having individual functions
      'furniture': '9403.60', // Other wooden furniture
      'toys': '9503.00', // Toys not elsewhere specified
    };
    
    return fallbacks[category] || '9999.99'; // Generic fallback
  }
}

export default new HSCodeAIService();