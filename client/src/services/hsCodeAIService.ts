import axios from 'axios';
import hsCodeMappings from './hsCodeMappings';

// Common product category to HS code mappings for quick lookups
// This helps provide results when the API can't be reached
const fallbackHsCodes: Record<string, string> = {
  electronics: '8471.30',
  textiles: '6109.10',
  automotive: '8708.99',
  food: '2106.90',
  chemicals: '3824.99',
  machinery: '8479.89',
  furniture: '9403.20',
  toys: '9503.00'
};

interface HSCodeResult {
  hsCode: string;
  confidence: number;
  alternativeCodes?: string[];
  source: 'AI' | 'Mapping' | 'Fallback';
}

/**
 * Service to help classify products into HS codes using OpenAI
 */
const hsCodeAIService = {
  /**
   * Classifies a product based on description and category
   */
  async classifyProduct(description: string, category: string): Promise<HSCodeResult> {
    // First check if we have a direct mapping
    const mappingResult = this.checkMappings(description);
    if (mappingResult) {
      return mappingResult;
    }
    
    try {
      // Try to use the AI service
      const response = await axios.post('/api/ai/classify-product', {
        description,
        category
      });
      
      return {
        hsCode: response.data.hsCode,
        confidence: response.data.confidence,
        alternativeCodes: response.data.alternativeCodes,
        source: 'AI'
      };
    } catch (error) {
      console.warn('AI classification failed, using fallback', error);
      // Use category-based fallback if AI classification fails
      return this.getFallbackResult(category);
    }
  },
  
  /**
   * Checks if we have a direct mapping for the product description
   */
  checkMappings(description: string): HSCodeResult | null {
    const lowerDesc = description.toLowerCase();
    
    // Check for keywords in the description
    const mapping = Object.entries(hsCodeMappings).find(([keyword]) => 
      lowerDesc.includes(keyword.toLowerCase())
    );
    
    if (mapping) {
      const [keyword, data] = mapping;
      return {
        hsCode: data.code,
        confidence: 0.85,
        alternativeCodes: data.alternatives || [],
        source: 'Mapping'
      };
    }
    
    return null;
  },
  
  /**
   * Provides a fallback HS code based on product category
   */
  getFallbackResult(category: string): HSCodeResult {
    const hsCode = fallbackHsCodes[category] || '0000.00';
    return {
      hsCode,
      confidence: 0.6,
      source: 'Fallback'
    };
  }
};

export default hsCodeAIService;