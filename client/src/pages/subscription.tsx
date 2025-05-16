import { useContext, useState } from "react";
import { FaCheck, FaCreditCard, FaCrown, FaArrowRight, FaGlobe, FaRocket, FaStar } from "react-icons/fa";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/contexts/AuthContext";
import { LanguageContext } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Tier feature details
const tiers = {
  free: {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Basic cost breakdown calculation",
      "Simple product information management",
      "Limited tariff lookups (5/month)",
      "Basic reporting"
    ],
    icon: <FaStar className="h-5 w-5 text-primary" />
  },
  starter: {
    name: "Starter",
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: [
      "Complete cost breakdown analysis",
      "Shipping rate comparison",
      "Tariff analysis",
      "Basic regulatory information",
      "PDF export capability",
      "10 products"
    ],
    icon: <FaRocket className="h-5 w-5 text-primary" />
  },
  growth: {
    name: "Growth",
    monthlyPrice: 49,
    yearlyPrice: 490,
    features: [
      "Alternative route optimization",
      "Detailed regulatory requirements",
      "Visualization tools",
      "Market analysis reports",
      "AI-powered recommendations",
      "25 products"
    ],
    recommended: true,
    icon: <FaCrown className="h-5 w-5 text-primary" />
  },
  global: {
    name: "Global",
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      "Advanced optimization",
      "Complete regulatory guidance",
      "Special programs eligibility",
      "Document generation",
      "Custom analysis options",
      "Unlimited products"
    ],
    icon: <FaGlobe className="h-5 w-5 text-primary" />
  }
};

const Subscription = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const { toast } = useToast();
  
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Determine the current tier
  const currentTier = user?.subscriptionTier || "free";
  
  const handleUpgrade = (tier: string) => {
    if (tier === currentTier) {
      toast({
        title: "Current Plan",
        description: `You are already subscribed to the ${tiers[tier as keyof typeof tiers].name} plan.`,
      });
      return;
    }

    setIsUpgrading(true);
    
    // Simulate API call to upgrade plan
    setTimeout(() => {
      // In a real implementation, this would redirect to a Stripe checkout page
      // or handle the subscription upgrade logic
      
      toast({
        title: "Subscription Update",
        description: `Your subscription will be updated to ${tiers[tier as keyof typeof tiers].name} plan after payment.`,
      });
      
      setIsUpgrading(false);
    }, 1500);
  };

  return (
    <>
      <PageHeader
        title="Subscription Plans"
        description="Choose the right plan for your international trade needs"
      />
      
      <div className="flex justify-center mb-8">
        <div className="bg-neutral-100 p-1 rounded-full">
          <Tabs 
            defaultValue="monthly" 
            value={billingCycle}
            onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-[240px]">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" className="relative">
                Yearly
                <Badge 
                  variant="outline" 
                  className="absolute -top-2 -right-2 bg-secondary text-white border-0 text-[10px] px-1.5 py-0"
                >
                  -17%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Free Tier */}
        <SubscriptionCard
          tier="free"
          currentTier={currentTier}
          billingCycle={billingCycle}
          onUpgrade={handleUpgrade}
          isUpgrading={isUpgrading}
        />
        
        {/* Starter Tier */}
        <SubscriptionCard
          tier="starter"
          currentTier={currentTier}
          billingCycle={billingCycle}
          onUpgrade={handleUpgrade}
          isUpgrading={isUpgrading}
        />
        
        {/* Growth Tier */}
        <SubscriptionCard
          tier="growth"
          currentTier={currentTier}
          billingCycle={billingCycle}
          onUpgrade={handleUpgrade}
          isUpgrading={isUpgrading}
        />
        
        {/* Global Tier */}
        <SubscriptionCard
          tier="global"
          currentTier={currentTier}
          billingCycle={billingCycle}
          onUpgrade={handleUpgrade}
          isUpgrading={isUpgrading}
        />
      </div>
      
      {/* Current Subscription Details */}
      {currentTier !== "free" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Manage your current subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium capitalize">{tiers[currentTier as keyof typeof tiers].name} Plan</h3>
                  <p className="text-sm text-neutral-500">
                    {billingCycle === "monthly" ? "Monthly" : "Annual"} subscription
                  </p>
                </div>
                <Badge variant="outline" className="bg-primary-50 text-primary">Active</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="border border-neutral-200 rounded p-3">
                  <div className="text-sm text-neutral-500 mb-1">Next billing date</div>
                  <div className="font-medium">October 15, 2023</div>
                </div>
                
                <div className="border border-neutral-200 rounded p-3">
                  <div className="text-sm text-neutral-500 mb-1">Amount</div>
                  <div className="font-medium">
                    {billingCycle === "monthly" 
                      ? `$${tiers[currentTier as keyof typeof tiers].monthlyPrice}/month`
                      : `$${tiers[currentTier as keyof typeof tiers].yearlyPrice}/year`
                    }
                  </div>
                </div>
                
                <div className="border border-neutral-200 rounded p-3">
                  <div className="text-sm text-neutral-500 mb-1">Payment method</div>
                  <div className="font-medium flex items-center">
                    <FaCreditCard className="mr-2 text-neutral-400" />
                    Visa ending in 4242
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-3">
                <Button variant="outline" size="sm">Update Payment Method</Button>
                <Button variant="outline" size="sm" className="text-destructive">Cancel Subscription</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">What happens when I upgrade my plan?</h3>
            <p className="text-sm text-neutral-600 mb-4">
              When you upgrade, you'll immediately gain access to all the features included in your new plan. 
              You'll be charged a prorated amount for the remainder of your current billing cycle.
            </p>
            
            <h3 className="font-medium mb-2">Can I downgrade my subscription?</h3>
            <p className="text-sm text-neutral-600">
              Yes, you can downgrade your subscription at any time. The changes will take effect at the end of your 
              current billing cycle. You'll continue to have access to your current plan's features until then.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">How do I cancel my subscription?</h3>
            <p className="text-sm text-neutral-600 mb-4">
              You can cancel your subscription from your account settings. After cancellation, you'll continue 
              to have access until the end of your current billing period.
            </p>
            
            <h3 className="font-medium mb-2">Are there any long-term commitments?</h3>
            <p className="text-sm text-neutral-600">
              No, all our plans are subscription-based with no long-term commitment. You can upgrade, downgrade, 
              or cancel at any time.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

// Subscription Card Component
interface SubscriptionCardProps {
  tier: keyof typeof tiers;
  currentTier: string;
  billingCycle: "monthly" | "yearly";
  onUpgrade: (tier: string) => void;
  isUpgrading: boolean;
}

const SubscriptionCard = ({ tier, currentTier, billingCycle, onUpgrade, isUpgrading }: SubscriptionCardProps) => {
  const tierData = tiers[tier];
  const price = billingCycle === "monthly" ? tierData.monthlyPrice : tierData.yearlyPrice;
  const isCurrentTier = tier === currentTier;
  
  return (
    <Card className={`border ${tierData.recommended ? 'border-primary' : 'border-neutral-200'} ${isCurrentTier ? 'bg-primary-50' : ''} relative overflow-hidden`}>
      {tierData.recommended && (
        <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1">
          Recommended
        </div>
      )}
      
      <CardHeader className={`pb-4 ${isCurrentTier ? 'bg-primary-100' : ''}`}>
        <div className="flex items-center">
          {tierData.icon}
          <CardTitle className="ml-2">{tierData.name}</CardTitle>
        </div>
        <CardDescription>
          {tier === "free" ? "Basic features to get started" : tierData.name === "Starter" 
            ? "Essential tools for small businesses" 
            : tierData.name === "Growth" 
              ? "Advanced features for growing companies" 
              : "Complete solution for global enterprises"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="mb-4">
          <span className="text-3xl font-bold">${price}</span>
          <span className="text-neutral-500 ml-1">
            {billingCycle === "monthly" ? "/month" : "/year"}
          </span>
          
          {billingCycle === "yearly" && tier !== "free" && (
            <div className="text-sm text-secondary mt-1">Save ${tierData.monthlyPrice * 12 - tierData.yearlyPrice} with annual billing</div>
          )}
        </div>
        
        <ul className="space-y-2 mb-6">
          {tierData.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className="text-secondary mr-2 mt-1">
                <FaCheck size={12} />
              </span>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button 
          className={`w-full ${isCurrentTier ? 'bg-primary-600' : tier === 'free' ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300' : ''}`}
          variant={isCurrentTier ? "default" : tier === "free" ? "secondary" : "default"}
          onClick={() => onUpgrade(tier)}
          disabled={isUpgrading || (isCurrentTier && tier !== "free")}
        >
          {isUpgrading ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : isCurrentTier ? (
            <>Current Plan</>
          ) : (
            <>
              {tier === "free" ? "Current Plan" : <>Get Started <FaArrowRight className="ml-2" size={12} /></>}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Subscription;
