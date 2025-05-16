import React, { useState } from 'react';
import { 
  AlertCircle, 
  MessageSquare, 
  X, 
  MinusCircle,
  PlusCircle,
  Lightbulb,
  ArrowRight,
  BarChart3,
  BadgePercent,
  FileText,
  Clock,
  CheckCircle2,
  Ship
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface CopilotMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface OptimizationTip {
  id: string;
  title: string;
  description: string;
  potentialSavings?: number;
  category: 'shipping' | 'customs' | 'documentation' | 'timing' | 'compliance';
  icon: React.ReactNode;
}

interface CopilotAssistantProps {
  productDetails?: {
    name?: string;
    category?: string;
    hsCode?: string;
    origin?: string;
    destination?: string;
    value?: number;
  };
  shipmentDetails?: {
    transportMode?: string;
    incoterm?: string;
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
  };
  costComponents?: {
    [key: string]: {
      amount: number;
      description: string;
      category: string;
    };
  };
}

export const CopilotAssistant: React.FC<CopilotAssistantProps> = ({ 
  productDetails,
  shipmentDetails,
  costComponents
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI Copilot. I can help you understand your shipping costs and find optimization opportunities. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTips, setShowTips] = useState(true);

  // Generate tips based on the provided product and shipment details
  const generateOptimizationTips = (): OptimizationTip[] => {
    const tips: OptimizationTip[] = [];
    
    // If we have product and shipment details, generate relevant tips
    if (productDetails && shipmentDetails) {
      // Shipping mode optimization tip
      if (shipmentDetails.transportMode === 'air' && (productDetails.value || 0) < 1000) {
        tips.push({
          id: 'shipping-mode',
          title: 'Consider Sea Freight',
          description: 'Your product value is relatively low compared to the cost of air shipping. Consider sea freight to reduce transportation costs by up to 70%.',
          potentialSavings: 450,
          category: 'shipping',
          icon: <Ship className="h-5 w-5 text-blue-500" />
        });
      }
      
      // Documentation tip
      if (productDetails.hsCode) {
        tips.push({
          id: 'documentation',
          title: 'Verify HS Classification',
          description: `The HS code ${productDetails.hsCode} might qualify for preferential treatment under certain trade agreements. Ensure your documentation is accurate.`,
          category: 'documentation',
          icon: <FileText className="h-5 w-5 text-purple-500" />
        });
      }
      
      // Timing tip
      tips.push({
        id: 'timing',
        title: 'Avoid Peak Season Shipping',
        description: 'Current shipping falls in a high-rate period. Delaying by 3 weeks could reduce freight costs by approximately 15%.',
        potentialSavings: 200,
        category: 'timing',
        icon: <Clock className="h-5 w-5 text-amber-500" />
      });
      
      // Add more contextual tips based on available data
    }
    
    // Always include some general tips
    tips.push({
      id: 'trade-agreements',
      title: 'Check Trade Agreements',
      description: 'There may be applicable trade agreements between origin and destination countries that could reduce or eliminate duties.',
      category: 'customs',
      icon: <BadgePercent className="h-5 w-5 text-green-500" />
    });
    
    tips.push({
      id: 'data-verification',
      title: 'Verify Product Information',
      description: 'Ensuring accurate product details helps optimize duties and avoid customs delays.',
      category: 'compliance',
      icon: <CheckCircle2 className="h-5 w-5 text-blue-500" />
    });
    
    return tips;
  };
  
  // Handle user message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    // Add user message
    const userMessage: CopilotMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setUserInput('');
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const assistantResponse = generateResponse(userInput);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500);
  };
  
  // Generate AI response based on user query (simplified example)
  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('hs code') || lowerQuery.includes('classification')) {
      return `The HS code ${productDetails?.hsCode || "provided"} is used for customs classification. It determines applicable duties and regulations. Make sure it's accurate to avoid penalties or delays.`;
    }
    
    if (lowerQuery.includes('duty') || lowerQuery.includes('tariff') || lowerQuery.includes('tax')) {
      return `Duties are calculated based on the HS code and value of your product. For products like yours, typical duty rates range from 2-8%. Some countries may have additional taxes or fees.`;
    }
    
    if (lowerQuery.includes('save') || lowerQuery.includes('reduce') || lowerQuery.includes('lower') || lowerQuery.includes('cost')) {
      return `I've identified several cost-saving opportunities: 1) Consider consolidating shipments to reduce per-unit freight costs, 2) Check if your product qualifies for any trade agreement benefits, 3) Reevaluate your packaging to optimize dimensions.`;
    }
    
    if (lowerQuery.includes('document') || lowerQuery.includes('paperwork')) {
      return `For international shipping, you'll need: 1) Commercial Invoice, 2) Packing List, 3) Bill of Lading/Air Waybill, 4) Certificate of Origin if applicable, and 5) Any product-specific certifications.`;
    }
    
    // Default response
    return `I understand you're asking about "${query}". To give you the most accurate information, I'd need more details about your specific shipping scenario. Could you provide more information about your product, origin/destination, or the specific costs you're looking to understand?`;
  };
  
  // The optimization tips component
  const OptimizationTips = () => {
    const tips = generateOptimizationTips();
    
    return (
      <div className="mt-4 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Optimization Opportunities</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2"
            onClick={() => setShowTips(!showTips)}
          >
            {showTips ? <MinusCircle className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
          </Button>
        </div>
        
        {showTips && (
          <div className="space-y-2">
            {tips.map(tip => (
              <div key={tip.id} className="bg-neutral-50 rounded-lg p-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {tip.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-neutral-800">{tip.title}</h4>
                      {tip.potentialSavings && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Save ~${tip.potentialSavings}
                        </Badge>
                      )}
                    </div>
                    <p className="text-neutral-600 mt-1">{tip.description}</p>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                View All Optimization Opportunities <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card className={`fixed bottom-4 right-4 shadow-lg transition-all ${isMinimized ? 'w-auto' : 'w-80'} z-50`}>
      {!isMinimized ? (
        <>
          <CardHeader className="bg-blue-600 text-white p-3 rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                AI Copilot Assistant
              </CardTitle>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMinimized(true)}
                  className="h-6 w-6 text-white hover:bg-blue-700 hover:text-white"
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {/* Close logic */}}
                  className="h-6 w-6 text-white hover:bg-blue-700 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-3 max-h-[400px] overflow-y-auto">
            <div className="space-y-3">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-lg p-2 text-sm ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-2 text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <OptimizationTips />
          </CardContent>
          
          <CardFooter className="p-3 pt-0">
            <form onSubmit={handleSubmit} className="w-full flex gap-2">
              <Input
                placeholder="Ask me anything..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="text-sm"
              />
              <Button type="submit" size="icon" className="shrink-0">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </>
      ) : (
        <Button 
          variant="default" 
          className="p-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsMinimized(false)}
        >
          <AlertCircle className="h-5 w-5 mr-2" />
          AI Copilot
        </Button>
      )}
    </Card>
  );
};

export default CopilotAssistant;