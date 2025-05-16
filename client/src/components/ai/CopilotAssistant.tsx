import React, { useState, useEffect } from 'react';
import { Bot, X, ChevronUp, ChevronDown, Lightbulb, Info } from 'lucide-react';
import './CopilotAssistant.css';

// Interface for product details
interface ProductDetails {
  name?: string;
  category?: string;
  hsCode?: string;
  origin?: string;
  destination?: string;
  value?: number;
  quantity?: number;
}

// Interface for shipment details
interface ShipmentDetails {
  transportMode?: string;
  incoterm?: string;
  weight?: number;
  packageType?: string;
  shipmentType?: string;
}

// Interface for cost components
interface CostComponent {
  name: string;
  amount: number;
  percentage: number;
  description?: string;
  type: 'duty' | 'tax' | 'fee' | 'shipping' | 'other';
}

// Props for the CopilotAssistant component
interface CopilotAssistantProps {
  productDescription?: string;
  category?: string;
  hsCode?: string;
  originCountry?: string;
  destinationCountry?: string;
  transportMode?: string;
  incoterm?: string;
  costComponents?: CostComponent[];
  totalCost?: number;
  onHsCodeSuggestion?: (code: string) => void;
  onAnalysisComplete?: (result: any) => void;
}

const CopilotAssistant: React.FC<CopilotAssistantProps> = ({
  productDescription,
  category,
  hsCode,
  originCountry,
  destinationCountry,
  transportMode,
  incoterm,
  costComponents,
  totalCost,
  onHsCodeSuggestion,
  onAnalysisComplete
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Toggle collapse state
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Generate insights based on props
  useEffect(() => {
    if (productDescription || category || hsCode) {
      generateInsights();
    }
  }, [productDescription, category, hsCode, originCountry, destinationCountry, transportMode, incoterm, costComponents]);

  // Simulated API call to generate insights
  const generateInsights = async () => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const newInsights = [];
      const newRecommendations = [];
      
      // Product classification insights
      if (productDescription && category) {
        newInsights.push(`Product '${productDescription}' identified as ${category}.`);
        
        if (hsCode) {
          newInsights.push(`HS Code ${hsCode} assigned with high confidence.`);
          
          // Add HS code specific insights
          if (hsCode.startsWith('61') || hsCode.startsWith('62')) {
            newInsights.push('Product is classified as apparel/clothing, which typically has higher duties in many countries.');
            newRecommendations.push('Consider sourcing from countries with textile trade agreements to reduce duties.');
          } else if (hsCode.startsWith('85')) {
            newInsights.push('Product is classified as electronics, which may have specific certification requirements.');
            newRecommendations.push('Check for required electronics certifications like CE, UL, or FCC.');
          }
        } else {
          newRecommendations.push('Add an HS code to get more accurate duty calculations.');
        }
      }
      
      // Route-specific insights
      if (originCountry && destinationCountry) {
        newInsights.push(`Analyzing trade route from ${originCountry} to ${destinationCountry}.`);
        
        // Check for preferential trade agreements
        if ((originCountry === 'US' && destinationCountry === 'MX') || 
            (originCountry === 'MX' && destinationCountry === 'US')) {
          newInsights.push('USMCA preferential trade agreement may apply.');
          newRecommendations.push('Verify USMCA eligibility to potentially reduce or eliminate duties.');
        } else if ((originCountry === 'UK' && destinationCountry.startsWith('EU')) || 
                  (originCountry.startsWith('EU') && destinationCountry === 'UK')) {
          newInsights.push('UK-EU Trade and Cooperation Agreement may apply.');
          newRecommendations.push('Check for reduced duty rates under the UK-EU agreement.');
        }
      }
      
      // Transportation insights
      if (transportMode) {
        const formattedMode = transportMode.includes('ocean') ? 'Ocean freight' : 
                             transportMode === 'air' ? 'Air freight' : 
                             transportMode.charAt(0).toUpperCase() + transportMode.slice(1);
        
        newInsights.push(`${formattedMode} selected as transport method.`);
        
        if (transportMode === 'air' && totalCost && totalCost > 5000) {
          newRecommendations.push('Consider ocean freight for high-value, non-urgent shipments to reduce costs.');
        } else if (transportMode.includes('ocean') && category === 'Perishable Goods') {
          newRecommendations.push('Air freight recommended for perishable goods to ensure product quality.');
        }
      }
      
      // Incoterm insights
      if (incoterm) {
        const incotermUpper = incoterm.toUpperCase();
        newInsights.push(`Using ${incotermUpper} incoterm for this shipment.`);
        
        if (incotermUpper === 'EXW') {
          newRecommendations.push('EXW places maximum responsibility on the buyer. Consider FOB or CIF for better risk distribution.');
        } else if (incotermUpper === 'DDP') {
          newRecommendations.push('DDP places maximum responsibility on the seller, including customs clearance and duties.');
        }
      }
      
      // Cost breakdown insights
      if (costComponents && costComponents.length > 0 && totalCost) {
        // Find highest cost component
        const sortedComponents = [...costComponents].sort((a, b) => b.amount - a.amount);
        const highestCost = sortedComponents[0];
        
        newInsights.push(`${highestCost.name} is your highest cost at ${highestCost.percentage.toFixed(1)}% of total.`);
        
        // Check for optimization opportunities
        const dutyComponents = costComponents.filter(c => c.type === 'duty');
        if (dutyComponents.length > 0 && dutyComponents.reduce((sum, c) => sum + c.amount, 0) / totalCost > 0.15) {
          newRecommendations.push('High duty costs detected. Consider evaluating special trade programs or duty drawback opportunities.');
        }
        
        const shippingComponents = costComponents.filter(c => c.type === 'shipping');
        if (shippingComponents.length > 0 && shippingComponents.reduce((sum, c) => sum + c.amount, 0) / totalCost > 0.30) {
          newRecommendations.push('Shipping costs are significant. Consider consolidating shipments or negotiating better carrier rates.');
        }
      }
      
      // Default recommendations if none generated
      if (newRecommendations.length === 0) {
        newRecommendations.push('Complete more fields for customized recommendations.');
      }
      
      setInsights(newInsights);
      setRecommendations(newRecommendations);
      setIsLoading(false);
    }, 1200);
  };

  // Handle HS code suggestion click
  const handleHsCodeSuggestion = (code: string) => {
    if (onHsCodeSuggestion) {
      onHsCodeSuggestion(code);
    }
  };

  return (
    <div className={`copilot-assistant ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="copilot-assistant-header" onClick={toggleCollapse}>
        <div className="copilot-assistant-title">
          <Bot size={20} />
          <span>Trade Navigator Copilot</span>
        </div>
        <div>
          {isCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="copilot-assistant-content">
          {isLoading ? (
            <div className="loading-animation">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <>
              {insights.length > 0 && (
                <div className="copilot-assistant-message">
                  <h4 className="text-base font-medium mb-2">Insights</h4>
                  <ul className="text-sm space-y-1">
                    {insights.map((insight, index) => (
                      <li key={`insight-${index}`} className="flex items-start gap-2">
                        <Info size={14} className="text-primary mt-1" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {recommendations.length > 0 && (
                <div className="copilot-assistant-message">
                  <h4 className="text-base font-medium mb-2">Recommendations</h4>
                  <ul className="text-sm space-y-1">
                    {recommendations.map((rec, index) => (
                      <li key={`rec-${index}`} className="flex items-start gap-2">
                        <Lightbulb size={14} className="text-amber-500 mt-1" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {hsCode && (
                <div className="copilot-assistant-info">
                  <Info size={16} className="text-primary" />
                  <div className="text-sm">
                    <p>HS Code {hsCode} has been assigned to your product.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This code determines applicable duties and regulations.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CopilotAssistant;