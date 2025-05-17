import React, { useState, useEffect } from 'react';
import { Bot, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import hsCodeAIService from '@/services/hsCodeAIService';
import './HSCodeAssistant.css';

interface HSCodeAssistantProps {
  productDescription: string;
  category: string;
  onSelectHSCode: (code: string) => void;
}

const HSCodeAssistant: React.FC<HSCodeAssistantProps> = ({
  productDescription,
  category,
  onSelectHSCode
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hsCodeSuggestion, setHSCodeSuggestion] = useState<{
    hsCode: string;
    confidence: number;
    description?: string;
    alternativeCodes?: string[];
    explanations?: string[];
    source: 'AI' | 'Mapping' | 'Fallback';
  } | null>(null);

  // Generate HS code suggestions when product description or category changes
  useEffect(() => {
    if (productDescription && category) {
      generateHSCodeSuggestion();
    }
  }, [productDescription, category]);

  const generateHSCodeSuggestion = async () => {
    if (!productDescription || !category) return;
    
    setIsLoading(true);
    try {
      const result = await hsCodeAIService.classifyProduct(productDescription, category);
      setHSCodeSuggestion(result);
    } catch (error) {
      console.error('Error generating HS code suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHSCode = (code: string) => {
    onSelectHSCode(code);
  };

  // If no product description or category, show empty state
  if (!productDescription || !category) {
    return (
      <Card className="hs-code-assistant mt-2">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm font-medium flex items-center">
            <Bot size={16} className="mr-2 text-primary" />
            HS Code Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-xs text-muted-foreground">
            Enter a product description and select a category to get HS code suggestions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hs-code-assistant mt-2">
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center">
            <Bot size={16} className="mr-2 text-primary" />
            HS Code Assistant
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 h-auto"
            onClick={generateHSCodeSuggestion}
            disabled={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center p-2">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        ) : hsCodeSuggestion ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-medium">
                  Suggested HS Code: {hsCodeSuggestion.hsCode}
                </div>
                <div className="text-xs text-muted-foreground">
                  {hsCodeSuggestion.explanations?.[0] || 
                   `Based on your ${hsCodeSuggestion.source === 'AI' ? 'product details' : 
                    hsCodeSuggestion.source === 'Mapping' ? 'product description' : 'product category'}`}
                </div>
              </div>
              <Badge variant={
                hsCodeSuggestion.confidence > 0.9 ? "default" :
                hsCodeSuggestion.confidence > 0.7 ? "default" :
                "secondary"
              } className={`text-xs ${hsCodeSuggestion.confidence > 0.9 ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                          hsCodeSuggestion.confidence > 0.7 ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}`}>
                {Math.round(hsCodeSuggestion.confidence * 100)}% match
              </Badge>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs py-1"
                onClick={() => handleSelectHSCode(hsCodeSuggestion.hsCode)}
              >
                Use this code
              </Button>
              <div className="flex ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto text-green-600 hover:text-green-800"
                  title="This suggestion is accurate"
                  onClick={() => {
                    // Log positive feedback without interrupting workflow
                    console.log('Positive feedback for HS code:', hsCodeSuggestion.hsCode);
                    // In a real app, this would send feedback to the backend
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto text-red-600 hover:text-red-800"
                  title="This suggestion is not accurate"
                  onClick={() => {
                    // Log negative feedback without interrupting workflow
                    console.log('Negative feedback for HS code:', hsCodeSuggestion.hsCode);
                    // In a real app, this would send feedback to the backend
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                  </svg>
                </Button>
              </div>
            </div>
            
            {hsCodeSuggestion.alternativeCodes && hsCodeSuggestion.alternativeCodes.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium mb-1">Alternatives:</div>
                <div className="flex flex-wrap gap-1">
                  {hsCodeSuggestion.alternativeCodes.map((code, index) => (
                    <div key={index} className="flex-1 min-w-0">
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs justify-start h-auto py-1"
                        onClick={() => handleSelectHSCode(code)}
                      >
                        <div className="truncate text-left">
                          <span className="font-medium">{code}</span>
                          {hsCodeSuggestion.explanations?.[index + 1] && (
                            <div className="text-xs text-muted-foreground truncate">{hsCodeSuggestion.explanations[index + 1]}</div>
                          )}
                        </div>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No HS code suggestions available for this product. Try updating your description or category.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default HSCodeAssistant;