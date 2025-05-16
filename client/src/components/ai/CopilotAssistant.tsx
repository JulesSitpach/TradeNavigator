import React, { useState, useEffect } from 'react';
import { Bot, X, Minimize, Maximize, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import './CopilotAssistant.css';

interface ProductDetails {
  name?: string;
  category?: string;
  hsCode?: string;
  origin?: string;
  destination?: string;
  value?: number;
}

interface ShipmentDetails {
  transportMode?: string;
  incoterm?: string;
  weight?: number;
}

interface CostComponent {
  amount: number;
  description: string;
  category: string;
}

interface CopilotAssistantProps {
  context?: string;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  initialOpen?: boolean;
  productDetails?: ProductDetails;
  shipmentDetails?: ShipmentDetails;
  costComponents?: Record<string, CostComponent>;
}

const CopilotAssistant: React.FC<CopilotAssistantProps> = ({
  context = 'default',
  position = 'bottom-right',
  initialOpen = true,
  productDetails,
  shipmentDetails,
  costComponents
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load different messages based on context
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      let contextMessage = '';
      
      switch (context) {
        case 'product-form':
          contextMessage = `I can help you fill out this product information form. 
            
Need help with HS codes? Enter a product description and select a category, and I'll suggest the appropriate HS codes for your product.

You can also ask me about:
• Required form fields
• Understanding incoterms
• Shipping recommendations`;
          break;
          
        case 'cost-breakdown':
          contextMessage = `I'm analyzing your cost breakdown to find optimization opportunities.
            
Based on your shipment details, you may qualify for:
• Duty reduction under trade agreements
• Consolidated shipping options
• Documentation fee waivers
            
Ask me about specific cost components for more details.`;
          break;
          
        case 'hs-code':
          contextMessage = `HS codes (Harmonized System) are used worldwide to classify traded products.
          
The first 6 digits are international, while additional digits are country-specific. Selecting the correct HS code is crucial as it determines:
• Applicable tariffs and duties
• Documentation requirements
• Trade restrictions
            
I'll help you identify the most appropriate HS code based on your product details.`;
          break;
          
        default:
          contextMessage = `I'm your TradeNavigator assistant. How can I help you today?
            
I can assist with:
• Explaining trade terms and processes
• Analyzing cost components
• Suggesting optimization strategies
• Understanding regulations
            
Ask me a question or select a specific topic for guidance.`;
      }
      
      setMessage(contextMessage);
      setIsLoading(false);
    }, 800);
  }, [context]);

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        size="icon"
        className={`copilot-bubble ${position}`}
        aria-label="Open AI assistant"
      >
        <Bot size={20} />
      </Button>
    );
  }

  return (
    <Card className={`copilot-assistant ${position} ${isMinimized ? 'minimized' : ''}`}>
      <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium flex items-center">
          <Bot size={16} className="mr-2 text-primary" />
          AI Assistant
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? <Maximize size={14} /> : <Minimize size={14} />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          >
            <X size={14} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className={`p-3 pt-3 ${isMinimized ? 'hidden' : ''}`}>
        <div className="copilot-message">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          ) : (
            <div className="text-sm whitespace-pre-line">
              {message}
            </div>
          )}
        </div>
        
        <div className="mt-3 border-t pt-3">
          <div className="flex items-center">
            <input 
              type="text" 
              placeholder="Ask a question..." 
              className="flex-1 text-sm bg-background border-0 focus-visible:ring-0 px-0 focus-visible:ring-offset-0"
            />
            <Button size="icon" variant="ghost" className="h-7 w-7">
              <MessageSquare size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CopilotAssistant;