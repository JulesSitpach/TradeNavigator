import axios from 'axios';
import hsCodeMappings from './hsCodeMappings';

interface HSCodeSuggestion {
  hsCode: string;
  confidence: number;
  description?: string;
  alternativeCodes?: string[];
  explanations?: string[];
  source: 'AI' | 'Mapping' | 'Fallback';
}

// Category to HS Chapter range mapping as specified in the document
const CATEGORY_CHAPTER_MAPPING: Record<string, number[][]> = {
  'Food & Beverages': [[1, 24]],
  'Electronics': [[84, 85]],
  'Textiles & Apparel': [[50, 63]],
  'Chemicals': [[28, 38]],
  'Machinery': [[84, 85]],
  'Pharmaceuticals': [[30, 30]],
  'Automotive': [[87, 87]],
  'Furniture': [[94, 94]],
  'Toys & Games': [[95, 95]],
  'Metals & Metal Products': [[72, 83]],
  'Plastics & Rubber': [[39, 40]],
  'Stone & Glass': [[68, 70]],
  'Paper & Pulp': [[47, 49]],
};

// Dictionary of common terminology for specific product categories
const CATEGORY_TERMINOLOGY: Record<string, string[]> = {
  'Metals & Metal Products': ['alloy', 'steel', 'iron', 'copper', 'aluminum', 'cast', 'forged', 'drawn', 'rolled'],
  'Electronics': ['processor', 'motherboard', 'circuit', 'display', 'battery', 'wireless', 'sensor'],
  'Textiles & Apparel': ['cotton', 'wool', 'silk', 'polyester', 'woven', 'knitted', 'yarn'],
  'Chemicals': ['compound', 'acid', 'solution', 'organic', 'inorganic', 'mixture']
};

/**
 * Service for AI-powered HS code classification and suggestions
 */
class HSCodeAIService {
  /**
   * Check if HS code belongs to the expected chapter range for a category
   */
  private validateHSCodeForCategory(hsCode: string, category: string): number {
    if (!hsCode || !category || !CATEGORY_CHAPTER_MAPPING[category]) {
      return 0.6; // Default confidence if we can't validate
    }

    // Extract chapter from HS code (first 2 digits)
    const chapter = parseInt(hsCode.substring(0, 2), 10);
    if (isNaN(chapter)) return 0.6;

    // Check if chapter falls within expected ranges for this category
    const chapterRanges = CATEGORY_CHAPTER_MAPPING[category];
    for (const [start, end] of chapterRanges) {
      if (chapter >= start && chapter <= end) {
        return 1.0; // Full confidence if within expected range
      }
    }

    // If not in expected range, reduce confidence
    return 0.7;
  }

  /**
   * Check for category-specific terminology in product description
   */
  private detectCategoryTerminology(productDescription: string, category: string): string[] {
    if (!productDescription || !category || !CATEGORY_TERMINOLOGY[category]) {
      return [];
    }

    const terms = CATEGORY_TERMINOLOGY[category];
    const lowerDesc = productDescription.toLowerCase();
    const foundTerms = terms.filter(term => lowerDesc.includes(term.toLowerCase()));
    
    return foundTerms;
  }

  /**
   * Generate explanation based on detected terminology
   */
  private generateExplanation(hsCode: string, category: string, foundTerms: string[]): string {
    // Generate chapter-based explanation
    const chapter = parseInt(hsCode.substring(0, 2), 10);
    let explanation = "";
    
    if (foundTerms.length > 0) {
      explanation = `Matched based on ${foundTerms.slice(0, 2).join(', ')} mentioned in description`;
    } else if (category && CATEGORY_CHAPTER_MAPPING[category]) {
      explanation = `Selected based on ${category} category classification`;
    } else {
      explanation = `General classification for this type of product`;
    }
    
    return explanation;
  }

  /**
   * Classify a product description to get HS code suggestions
   */
  async classifyProduct(productDescription: string, category: string): Promise<HSCodeSuggestion> {
    try {
      if (!productDescription) {
        return this.getHSCodeFromCategory(category);
      }

      // Detect category-specific terminology in the description
      const foundTerms = this.detectCategoryTerminology(productDescription, category);
      
      // Try using the AI classification endpoint with enhanced information
      const response = await axios.post('/api/ai/classify-product', {
        productDescription,
        category,
        detectedTerms: foundTerms
      });

      const result = response.data;

      // If we got AI results, validate them against expected chapter ranges
      if (result && result.hsCode) {
        // Adjust confidence based on whether the suggested HS code falls within expected chapter ranges
        const validationConfidence = this.validateHSCodeForCategory(result.hsCode, category);
        const adjustedConfidence = (result.confidence || 0.8) * validationConfidence;
        
        // Generate explanations
        const explanations = [
          this.generateExplanation(result.hsCode, category, foundTerms)
        ];
        
        if (result.alternativeCodes) {
          // Add explanations for alternative codes as well
          result.alternativeCodes.forEach((code: string, index: number) => {
            if (index < 2) { // Limit to top 2 alternatives
              explanations.push(this.generateExplanation(code, category, []));
            }
          });
        }
        
        return {
          hsCode: result.hsCode,
          confidence: adjustedConfidence,
          description: result.description,
          alternativeCodes: result.alternativeCodes?.slice(0, 2) || [], // Limit to top 2 alternatives
          explanations,
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