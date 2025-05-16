import axios from 'axios';
import hsCodeMappings from './hsCodeMappings';

interface HSCodeSuggestion {
  hsCode: string;
  confidence: number;
  description?: string;
  alternativeCodes?: string[];
  source: 'AI' | 'Mapping' | 'Fallback';
}

/**
 * Service for AI-powered HS code classification and suggestions
 */
class HSCodeAIService {
  /**
   * Classify a product description to get HS code suggestions
   */
  async classifyProduct(productDescription: string, category: string): Promise<HSCodeSuggestion> {
    try {
      if (!productDescription) {
        return this.getHSCodeFromCategory(category);
      }

      // Try using the AI classification endpoint
      const response = await axios.post('/api/ai/classify-product', {
        productDescription,
        category
      });

      const result = response.data;

      // If we got AI results, return them with source marked as 'AI'
      if (result && result.hsCode) {
        return {
          hsCode: result.hsCode,
          confidence: result.confidence || 0.8,
          description: result.description,
          alternativeCodes: result.alternativeCodes || [],
          source: 'AI'
        };
      }
      
      // If AI fails, try to look up by category
      return this.getHSCodeFromCategory(category);
    } catch (error) {
      console.error('Error classifying product:', error);
      
      // If API call fails, fall back to mapping lookup
      return this.getHSCodeFromCategory(category);
    }
  }

  /**
   * Get HS code suggestion based on product category
   */
  private getHSCodeFromCategory(category: string): HSCodeSuggestion {
    if (!category || !hsCodeMappings[category]) {
      return this.getFallbackHSCode();
    }

    const categoryMappings = hsCodeMappings[category];
    
    // Pick the most appropriate code (first one for now)
    const primarySuggestion = categoryMappings[0];
    
    // Get 2-3 alternatives from the same category
    const alternativeCodes = categoryMappings
      .slice(1, 4)
      .map(item => item.code);

    return {
      hsCode: primarySuggestion.code,
      confidence: 0.85, // High confidence since it's from our official mappings
      description: primarySuggestion.description,
      alternativeCodes,
      source: 'Mapping'
    };
  }

  /**
   * Get fallback HS code if no other method works
   */
  private getFallbackHSCode(): HSCodeSuggestion {
    // Fallback to a generic Electronics HS code when everything else fails
    return {
      hsCode: "8471.30.00",
      confidence: 0.6, // Lower confidence for fallback
      description: "Portable automatic data processing machines, weighing not more than 10 kg",
      alternativeCodes: ["8471.41.00", "8471.50.00", "8471.60.00"],
      source: 'Fallback'
    };
  }
}

export default new HSCodeAIService();