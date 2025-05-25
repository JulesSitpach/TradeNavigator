import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Globe, BarChart3, Zap, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PremiumFeaturesProps {
  formData?: {
    productName?: string;
    hsCode?: string;
    originCountry?: string;
    destinationCountry?: string;
    weight?: string;
  };
}

export function PremiumFeatures({ formData }: PremiumFeaturesProps) {
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [loadingTariff, setLoadingTariff] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const { toast } = useToast();

  const testShippingRates = async () => {
    if (!formData?.originCountry || !formData?.destinationCountry) {
      toast({
        title: "Missing Information",
        description: "Please fill in origin and destination countries first",
        variant: "destructive",
      });
      return;
    }

    setLoadingShipping(true);
    try {
      const response = await apiRequest("POST", "/api/shipping-rates", {
        originCountry: formData.originCountry,
        destinationCountry: formData.destinationCountry,
        weight: formData.weight || "1",
        dimensions: { length: "10", width: "10", height: "10" }
      });
      
      const rates = await response.json();
      toast({
        title: "Live Shipping Rates Retrieved!",
        description: `Found ${rates.length || 'multiple'} carrier options with real-time pricing`,
      });
    } catch (error) {
      toast({
        title: "Premium Feature",
        description: "Real-time shipping rates available with Pro subscription",
        variant: "destructive",
      });
    } finally {
      setLoadingShipping(false);
    }
  };

  const testTariffData = async () => {
    if (!formData?.hsCode || !formData?.originCountry || !formData?.destinationCountry) {
      toast({
        title: "Missing Information", 
        description: "Please fill in HS code and country information first",
        variant: "destructive",
      });
      return;
    }

    setLoadingTariff(true);
    try {
      const response = await apiRequest("POST", "/api/tariff-data", {
        hsCode: formData.hsCode,
        originCountry: formData.originCountry,
        destinationCountry: formData.destinationCountry
      });
      
      const tariffData = await response.json();
      toast({
        title: "Official Tariff Data Retrieved!",
        description: "UN Comtrade database provides the most accurate duty rates",
      });
    } catch (error) {
      toast({
        title: "Premium Feature",
        description: "Official UN Comtrade tariff data available with Pro subscription",
        variant: "destructive",
      });
    } finally {
      setLoadingTariff(false);
    }
  };

  const testTradeInsights = async () => {
    if (!formData?.productName || !formData?.originCountry || !formData?.destinationCountry) {
      toast({
        title: "Missing Information",
        description: "Please fill in product and country information first", 
        variant: "destructive",
      });
      return;
    }

    setLoadingInsights(true);
    try {
      const response = await apiRequest("POST", "/api/trade-insights", {
        productName: formData.productName,
        hsCode: formData.hsCode || "",
        originCountry: formData.originCountry,
        destinationCountry: formData.destinationCountry
      });
      
      const insights = await response.json();
      toast({
        title: "AI Trade Insights Generated!",
        description: "Current market analysis and regulatory updates retrieved",
      });
    } catch (error) {
      toast({
        title: "Premium Feature",
        description: "AI-powered trade insights available with Pro subscription",
        variant: "destructive",
      });
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Zap className="text-accent mr-3 h-6 w-6" />
            <h3 className="text-lg font-semibold text-gray-900">Premium Features</h3>
          </div>
          <Badge variant="secondary" className="bg-accent text-white">
            Pro Only
          </Badge>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Unlock enterprise-grade trade intelligence with real-time data and AI-powered insights
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <div className="flex items-center mb-2">
              <Truck className="text-blue-500 mr-2 h-5 w-5" />
              <h4 className="font-medium text-gray-900">Live Shipping</h4>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Real quotes from UPS, FedEx, DHL
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={testShippingRates}
              disabled={loadingShipping}
              className="w-full text-xs"
            >
              {loadingShipping ? "Loading..." : "Test Feature"}
            </Button>
          </div>

          <div className="bg-white p-4 rounded-lg border border-green-100">
            <div className="flex items-center mb-2">
              <Globe className="text-green-500 mr-2 h-5 w-5" />
              <h4 className="font-medium text-gray-900">Official Data</h4>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              UN Comtrade tariff database
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={testTariffData}
              disabled={loadingTariff}
              className="w-full text-xs"
            >
              {loadingTariff ? "Loading..." : "Test Feature"}
            </Button>
          </div>

          <div className="bg-white p-4 rounded-lg border border-purple-100">
            <div className="flex items-center mb-2">
              <BarChart3 className="text-purple-500 mr-2 h-5 w-5" />
              <h4 className="font-medium text-gray-900">AI Insights</h4>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Market analysis & regulations
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={testTradeInsights}
              disabled={loadingInsights}
              className="w-full text-xs"
            >
              {loadingInsights ? "Loading..." : "Test Feature"}
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button
            onClick={() => window.location.href = '/subscribe'}
            className="bg-accent hover:bg-green-600 text-white"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Upgrade to Pro - $49/month
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}