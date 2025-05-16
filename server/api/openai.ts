import OpenAI from "openai";

// OpenAI API wrapper for trade navigator specific functions
export class OpenAIService {
  private client: OpenAI | null;

  constructor() {
    this.client = process.env.OPENAI_API_KEY 
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
      : null;
    
    if (!this.client) {
      console.warn("OPENAI_API_KEY not provided. Using mock responses for OpenAI services.");
    }
  }

  /**
   * Get HS code suggestions based on product description
   */
  async getHSCodeSuggestion(productDescription: string): Promise<{ 
    hsCode: string, 
    confidence: number,
    description: string
  }> {
    try {
      if (!this.client) {
        return this.getMockHSResponse(productDescription);
      }

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a customs and trade specialist. Based on the product description, provide the most likely HS code, confidence score, and description."
          },
          {
            role: "user",
            content: productDescription
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        hsCode: result.hsCode || "",
        confidence: Math.max(0, Math.min(1, result.confidence || 0)),
        description: result.description || ""
      };
    } catch (error: any) {
      console.error("OpenAI API error:", error.message);
      return this.getMockHSResponse(productDescription);
    }
  }

  /**
   * Get regulatory guidance for a product and country
   */
  async getRegulatoryGuidance(
    productDescription: string, 
    hsCode: string, 
    originCountry: string, 
    destinationCountry: string
  ): Promise<{ 
    requirements: string[], 
    specialPrograms: string[],
    warnings: string[]
  }> {
    try {
      if (!this.client) {
        return this.getMockRegulatoryResponse();
      }

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a trade compliance expert. Based on the product information, provide regulatory requirements, special programs, and warnings."
          },
          {
            role: "user",
            content: `Product: ${productDescription}\nHS Code: ${hsCode}\nOrigin Country: ${originCountry}\nDestination Country: ${destinationCountry}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        requirements: Array.isArray(result.requirements) ? result.requirements : [],
        specialPrograms: Array.isArray(result.specialPrograms) ? result.specialPrograms : [],
        warnings: Array.isArray(result.warnings) ? result.warnings : []
      };
    } catch (error: any) {
      console.error("OpenAI API error:", error.message);
      return this.getMockRegulatoryResponse();
    }
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizationRecommendations(
    productData: any,
    shipmentData: any,
    analysisResults: any
  ): Promise<{
    recommendations: string[],
    potentialSavings: {
      description: string,
      amountUsd: number
    }[]
  }> {
    try {
      if (!this.client) {
        return this.getMockOptimizationResponse();
      }

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a trade optimization specialist. Based on the data, provide recommendations and potential savings estimates."
          },
          {
            role: "user",
            content: `Product Data: ${JSON.stringify(productData)}\nShipment Data: ${JSON.stringify(shipmentData)}\nAnalysis Results: ${JSON.stringify(analysisResults)}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
        potentialSavings: Array.isArray(result.potentialSavings) ? result.potentialSavings : []
      };
    } catch (error: any) {
      console.error("OpenAI API error:", error.message);
      return this.getMockOptimizationResponse();
    }
  }

  // Mock response methods for development/fallback
  private getMockHSResponse(productDescription: string): { hsCode: string, confidence: number, description: string } {
    console.log("Using mock HS code response for:", productDescription);
    return {
      hsCode: "8471.30.00",
      confidence: 0.9,
      description: "Portable automatic data processing machines, weighing not more than 10 kg"
    };
  }

  private getMockRegulatoryResponse(): { requirements: string[], specialPrograms: string[], warnings: string[] } {
    console.log("Using mock regulatory response");
    return {
      requirements: [
        "Standard import documentation",
        "Electronic product certification",
        "RoHS compliance"
      ],
      specialPrograms: [
        "Information Technology Agreement (ITA)",
        "Free Trade Agreement eligible (check specific countries)"
      ],
      warnings: [
        "May be subject to additional security screening",
        "Ensure proper labeling of lithium batteries if included"
      ]
    };
  }

  private getMockOptimizationResponse(): { recommendations: string[], potentialSavings: { description: string, amountUsd: number }[] } {
    console.log("Using mock optimization response");
    return {
      recommendations: [
        "Consider using Free Trade Agreement benefits",
        "Consolidate shipments to reduce freight costs",
        "Review HS code classification for potential duty savings"
      ],
      potentialSavings: [
        {
          description: "FTA duty elimination",
          amountUsd: 1250.00
        },
        {
          description: "Shipment consolidation",
          amountUsd: 750.00
        }
      ]
    };
  }
}

// Create and export singleton instance
export const openaiService = new OpenAIService();