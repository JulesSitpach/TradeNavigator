import axios from 'axios';

/**
 * Perplexity API Service for TradeNavigator
 * Handles HS code classification and other AI-powered features
 */
export class PerplexityService {
  private apiKey: string | undefined;
  private baseUrl: string = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!this.apiKey) {
      console.warn("PERPLEXITY_API_KEY not provided. Perplexity AI services will not be available.");
    }
  }

  /**
   * Classify a product to determine its HS code
   */
  async classifyProduct(
    productDescription: string, 
    category: string,
    detectedTerms: string[] = []
  ): Promise<{
    hsCode: string;
    confidence: number;
    description?: string;
    alternativeCodes?: string[];
    explanations?: string[];
    success: boolean;
  }> {
    try {
      if (!this.apiKey) {
        throw new Error("PERPLEXITY_API_KEY not provided");
      }

      // Create a detailed prompt with product information and context
      const detectedTermsText = detectedTerms.length 
        ? `\nDetected industry terminology: ${detectedTerms.join(', ')}` 
        : '';
      
      const contextPrompt = `
Product Description: ${productDescription}
Product Category: ${category}${detectedTermsText}

For the product above, determine the most accurate HS (Harmonized System) code. 
Return a JSON object with these fields:
- hsCode: The most accurate HS code (use the full format with decimal, like "8471.30.00")
- confidence: A number between 0 and 1 indicating your confidence
- description: A short description of this HS code classification
- alternativeCodes: An array of 2-3 alternative HS codes that could also apply (full format)
- explanations: An array of short explanations for why this classification is appropriate

Important: For electronics usually check chapters 84-85, for textiles check chapters 50-63, for chemicals check chapters 28-38.`;

      // Make request to Perplexity API
      const response = await axios.post(this.baseUrl, {
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a customs classification expert specializing in HS codes."
          },
          {
            role: "user",
            content: contextPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        search_recency_filter: "month"
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // Parse and validate the response
      const data = response.data;
      const content = data?.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error("Invalid response from Perplexity API");
      }

      // Extract the JSON from the response (handle potential text wrapping)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      
      // Parse the JSON result
      const result = JSON.parse(jsonStr);
      
      // Validate and return the result
      return {
        hsCode: result.hsCode || "",
        confidence: Math.max(0, Math.min(1, result.confidence || 0.7)),
        description: result.description || "",
        alternativeCodes: Array.isArray(result.alternativeCodes) ? result.alternativeCodes : [],
        explanations: Array.isArray(result.explanations) ? result.explanations : [],
        success: true
      };
    } catch (error: any) {
      console.error("Perplexity API error:", error.message);
      
      // Return fallback response
      return {
        hsCode: "8471.30.00",
        confidence: 0.6,
        description: "Portable automatic data processing machines, weighing not more than 10 kg",
        alternativeCodes: ["8471.41.00", "8471.50.00", "8471.60.00"],
        explanations: ["Fallback classification when API is unavailable"],
        success: false
      };
    }
  }
}

// Create and export singleton instance
export const perplexityService = new PerplexityService();