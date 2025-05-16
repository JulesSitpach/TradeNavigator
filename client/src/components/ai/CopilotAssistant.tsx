import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Lightbulb, ArrowRight } from 'lucide-react';

interface CopilotAssistantProps {
  suggestions?: string[];
  hsCodeConfidence?: number;
  relatedHsCode?: string;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
}

const CopilotAssistant: React.FC<CopilotAssistantProps> = ({
  suggestions = [],
  hsCodeConfidence = 0,
  relatedHsCode = '',
  position = 'bottom-right'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const getPositionClasses = () => {
    switch(position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-50 transition-all duration-300 ease-in-out`}>
      <Card className={`shadow-lg border-primary/10 overflow-hidden transition-all duration-300 ${isExpanded ? 'w-80' : 'w-12'}`}>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-12 w-12 flex-shrink-0 text-primary"
          >
            {isExpanded ? <ChevronDown size={20} /> : <Lightbulb size={20} />}
          </Button>

          {isExpanded && (
            <CardHeader className="p-2 pb-0">
              <CardTitle className="text-sm font-medium">AI Copilot Assistant</CardTitle>
            </CardHeader>
          )}

          {isExpanded && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsVisible(false)}
              className="h-8 w-8 absolute top-2 right-2 text-muted-foreground"
            >
              <ChevronUp size={16} />
            </Button>
          )}
        </div>

        {isExpanded && (
          <CardContent className="p-3 pt-0">
            {hsCodeConfidence > 0 && (
              <div className="mb-3 bg-muted/40 p-2 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">HS Code Confidence</p>
                <div className="w-full bg-muted rounded-full h-2 mb-1">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${hsCodeConfidence}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">{relatedHsCode}</span>
                  <span className="text-xs">{hsCodeConfidence}% match</span>
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium">Optimization suggestions:</p>
                <ul className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="text-xs flex items-start">
                      <ArrowRight size={12} className="mr-1 mt-1 text-primary flex-shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default CopilotAssistant;