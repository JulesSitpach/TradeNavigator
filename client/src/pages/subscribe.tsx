import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, Globe, Truck, BarChart3 } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome to TradeNavigator Pro!",
        description: "Your subscription is now active. Enjoy premium features!",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button type="submit" disabled={!stripe} className="w-full bg-primary hover:bg-secondary">
        Subscribe to TradeNavigator Pro
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create subscription as soon as the page loads
    apiRequest("POST", "/api/create-subscription")
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error creating subscription:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade to TradeNavigator Pro
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock enterprise-grade trade intelligence with real-time data and AI-powered insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Features */}
          <Card className="bg-white">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Zap className="text-accent mr-3 h-8 w-8" />
                <h2 className="text-2xl font-bold text-gray-900">Premium Features</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 h-5 w-5 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Real-Time Shipping Rates</h3>
                    <p className="text-sm text-gray-600">Live quotes from UPS, FedEx, DHL, and more carriers</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 h-5 w-5 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Official Tariff Data</h3>
                    <p className="text-sm text-gray-600">Direct access to UN Comtrade database for accurate duties</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 h-5 w-5 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Trade Insights</h3>
                    <p className="text-sm text-gray-600">Market analysis and regulation updates for your products</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 h-5 w-5 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Advanced HS Code AI</h3>
                    <p className="text-sm text-gray-600">Professional-grade product classification</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 h-5 w-5 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Unlimited Calculations</h3>
                    <p className="text-sm text-gray-600">No limits on cost analysis and reporting</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">$49</div>
                  <div className="text-sm text-gray-600">per month</div>
                  <div className="text-xs text-gray-500 mt-1">Cancel anytime</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="bg-white">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Globe className="text-primary mr-3 h-8 w-8" />
                <h2 className="text-2xl font-bold text-gray-900">Complete Your Subscription</h2>
              </div>
              
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscribeForm />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Setting up your subscription...</p>
                </div>
              )}
              
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Secure payment powered by Stripe. Your subscription includes all premium features 
                  and can be cancelled at any time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Value Proposition */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Why Trade Professionals Choose TradeNavigator Pro
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Save Time & Money</h4>
              <p className="text-sm text-gray-600">
                Real data eliminates guesswork and prevents costly mistakes
              </p>
            </div>
            
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Professional Reports</h4>
              <p className="text-sm text-gray-600">
                Generate accurate cost breakdowns for clients and stakeholders
              </p>
            </div>
            
            <div className="text-center">
              <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Stay Compliant</h4>
              <p className="text-sm text-gray-600">
                Always up-to-date with latest trade regulations and tariffs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}