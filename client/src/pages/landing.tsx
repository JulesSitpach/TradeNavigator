import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ship, Calculator, Globe, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Landing() {
  const { t } = useTranslation('landing');
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Ship className="text-primary text-2xl mr-3" />
                <h1 className="text-xl font-bold text-gray-900">TradeNavigator</h1>
              </div>
            </div>
            <div className="flex items-center">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary hover:bg-secondary text-white"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-dark relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              {t('hero.title')}
              <span className="block text-sky-400">{t('hero.subtitle')}</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {t('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                className="bg-clean-blue hover:bg-blue-600 text-white px-8 py-4 text-lg font-semibold"
              >
                {t('hero.tryCalculator')}
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-gray-400 text-gray-300 hover:bg-gray-700 px-8 py-4 text-lg"
              >
                {t('hero.viewPricing')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Import Planning
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Professional-grade tools for accurate import cost calculations and trade compliance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Calculator className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Cost Analysis</h3>
                <p className="text-gray-600 text-sm">
                  Comprehensive import cost breakdowns including duties, shipping, and fees.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI HS Codes</h3>
                <p className="text-gray-600 text-sm">
                  Get accurate HS code suggestions powered by advanced AI technology.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Ship className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Shipping Options</h3>
                <p className="text-gray-600 text-sm">
                  Compare ocean, air, and courier shipping methods with real-time rates.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Trade Agreements</h3>
                <p className="text-gray-600 text-sm">
                  Optimize costs with automatic trade agreement and tariff analysis.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Streamline Your Import Process?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of trade professionals who trust TradeNavigator for accurate cost analysis.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg"
          >
            Get Started Today
          </Button>
        </div>
      </div>
    </div>
  );
}
