import React, { useState, useEffect } from 'react';
import hsCodeAIService from '../../services/hsCodeAIService';
import './CopilotAssistant.scss';

interface ProductDetails {
  name: string;
  category: string;
  hsCode: string;
  origin: string;
  destination: string;
  value: number;
  quantity?: number;
}

interface ShipmentDetails {
  transportMode: string;
  incoterm: string;
  weight: number;
  packageType?: string;
  shipmentType?: string;
}

interface CostComponent {
  name: string;
  amount: number;
  percentage: number;
  description?: string;
  type: 'duty' | 'tax' | 'fee' | 'shipping' | 'other';
}

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
  productDescription = "",
  category = "",
  hsCode = "",
  originCountry = "",
  destinationCountry = "",
  transportMode = "",
  incoterm = "",
  costComponents = [],
  totalCost = 0,
  onHsCodeSuggestion,
  onAnalysisComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  
  useEffect(() => {
    // Generate context-aware recommendations based on available data
    generateRecommendations();
  }, [
    productDescription, 
    category, 
    hsCode, 
    originCountry, 
    destinationCountry, 
    transportMode, 
    incoterm, 
    totalCost
  ]);
  
  const generateRecommendations = () => {
    const newRecommendations: string[] = [];
    
    // Add recommendations based on data context
    if (hsCode && destinationCountry) {
      newRecommendations.push(`Check tariff rates for ${hsCode} in ${destinationCountry} for potential duty savings.`);
    }
    
    if (transportMode && originCountry && destinationCountry) {
      newRecommendations.push(`Consider alternative shipping routes from ${originCountry} to ${destinationCountry}.`);
    }
    
    if (incoterm === 'exw' || incoterm === 'fob') {
      newRecommendations.push(`Current terms (${incoterm.toUpperCase()}) make you responsible for most shipping costs and risks.`);
    }
    
    // Add CPTPP recommendation when relevant
    const cptppCountries = ['CA', 'JP', 'AU', 'VN', 'SG', 'MY', 'NZ'];
    if (cptppCountries.includes(originCountry) && cptppCountries.includes(destinationCountry)) {
      newRecommendations.push('You may qualify for CPTPP preferential duty rates. Contact trade specialist for details.');
    }
    
    // Add recommendations based on cost components
    if (costComponents && costComponents.length > 0) {
      const dutyComponents = costComponents.filter(c => c.type === 'duty');
      if (dutyComponents.length > 0 && dutyComponents.some(d => d.percentage > 5)) {
        newRecommendations.push('Consider tariff classification optimization to potentially reduce duty rates.');
      }
      
      const highestComponent = [...costComponents].sort((a, b) => b.percentage - a.percentage)[0];
      if (highestComponent) {
        newRecommendations.push(`${highestComponent.name} represents your highest cost component (${highestComponent.percentage.toFixed(1)}%). Focus on optimizing this area.`);
      }
    }
    
    setRecommendations(newRecommendations.length > 0 ? newRecommendations : [
      'Enter more shipment details to receive personalized recommendations.',
      'Choose product category and description for HS code suggestions.',
      'Compare different transport modes to optimize costs.'
    ]);
  };
  
  const analyzeProduct = async () => {
    if (!productDescription || !category) {
      setError("Please provide both product description and category");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const classificationResult = await hsCodeAIService.classifyProduct(
        productDescription,
        category
      );
      
      setResult(classificationResult);
      
      // Notify parent component if callback provided
      if (onHsCodeSuggestion) {
        onHsCodeSuggestion(classificationResult.hsCode);
      }
      
      if (onAnalysisComplete) {
        onAnalysisComplete(classificationResult);
      }
    } catch (err) {
      console.error('Classification failed:', err);
      setError('Failed to analyze product. Please try again or enter HS code manually.');
    } finally {
      setLoading(false);
    }
  };
  
  // Confidence level indicator for HS code suggestions
  const getConfidenceLabel = (confidence: number) => {
    if (confidence > 0.9) return 'High Confidence';
    if (confidence > 0.7) return 'Medium Confidence';
    return 'Low Confidence';
  };
  
  const getConfidenceClass = (confidence: number) => {
    if (confidence > 0.9) return 'high';
    if (confidence > 0.7) return 'medium';
    return 'low';
  };
  
  return (
    <div className={`copilot-assistant ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="copilot-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>AI Trade Copilot</h3>
        <button className="toggle-button">
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="copilot-content">
          {/* Recommendations Section */}
          <div className="recommendations-section">
            <h4>Smart Recommendations</h4>
            <ul className="recommendations-list">
              {recommendations.map((rec, index) => (
                <li key={index} className="recommendation-item">{rec}</li>
              ))}
            </ul>
          </div>
          
          {/* Analysis Actions (only show if we have product description and category) */}
          {productDescription && category && (
            <div className="analysis-actions">
              <button 
                onClick={analyzeProduct}
                disabled={loading}
                className="analyze-button"
              >
                {loading ? 'Analyzing...' : 'Analyze Product'}
              </button>
            </div>
          )}
          
          {/* Error Messages */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {/* HS Code Analysis Results */}
          {result && (
            <div className="result-container">
              <div className="hs-code-suggestion">
                <span className="label">Suggested HS Code:</span>
                <span className="code">{result.hsCode}</span>
                <span className={`confidence ${getConfidenceClass(result.confidence)}`}>
                  {getConfidenceLabel(result.confidence)}
                </span>
              </div>
              
              <div className="source-info">
                <span className="label">Source:</span>
                <span className="value">{result.source}</span>
              </div>
              
              {result.alternativeCodes && result.alternativeCodes.length > 0 && (
                <div className="alternatives">
                  <span className="label">Alternative codes:</span>
                  <div className="alternative-list">
                    {result.alternativeCodes.map((code: string, index: number) => (
                      <button 
                        key={index}
                        onClick={() => onHsCodeSuggestion && onHsCodeSuggestion(code)}
                        className="alternative-code"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CopilotAssistant;