import React, { useState, useEffect } from 'react';
import { Bot, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import hsCodeAIService from '@/services/hsCodeAIService';

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
    alternativeCodes?: string[];
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
                  Based on your {hsCodeSuggestion.source === 'AI' ? 'product details' : 
                                hsCodeSuggestion.source === 'Mapping' ? 'product description' : 
                                'product category'}
                </div>
              </div>
              <Badge variant={
                hsCodeSuggestion.confidence > 0.9 ? "success" :
                hsCodeSuggestion.confidence > 0.7 ? "default" :
                "secondary"
              } className="text-xs">
                {Math.round(hsCodeSuggestion.confidence * 100)}% match
              </Badge>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-1 text-xs"
              onClick={() => handleSelectHSCode(hsCodeSuggestion.hsCode)}
            >
              Use this code
            </Button>
            
            {hsCodeSuggestion.alternativeCodes && hsCodeSuggestion.alternativeCodes.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium mb-1">Alternatives:</div>
                <div className="flex flex-wrap gap-1">
                  {hsCodeSuggestion.alternativeCodes.map((code, index) => (
                    <Badge 
                      key={index} 
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-muted"
                      onClick={() => handleSelectHSCode(code)}
                    >
                      {code}
                    </Badge>
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