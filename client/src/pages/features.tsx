import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { Check, ArrowRight, Zap, Shield, Globe, Calculator, Brain, TrendingUp } from "lucide-react";

export default function Features() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              {t('hero.title', { ns: 'features' })}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {t('hero.subtitle', { ns: 'features' })}
            </p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              {t('buttons.startTrial')} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* Core Features */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features for Growing Businesses</h2>
            <p className="text-xl text-gray-600">Save time, reduce costs, and eliminate import surprises</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Instant Cost Analysis</CardTitle>
                <CardDescription>
                  Get accurate import cost breakdowns in seconds, not hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    All-in landed cost calculation
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Real-time shipping rates
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Duty & tax optimization
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>AI-Powered HS Codes</CardTitle>
                <CardDescription>
                  Never worry about misclassification again
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    95%+ accuracy rate
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Confidence scoring
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Alternative suggestions
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Market Intelligence</CardTitle>
                <CardDescription>
                  Stay ahead with real-time trade insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Trade agreement updates
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Regulatory changes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Market opportunities
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ROI Section */}
        <section className="bg-blue-50 rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Save $10,000+ Per Year on Import Costs
              </h3>
              <p className="text-gray-600 mb-6">
                SMBs using TradeNavigator typically reduce their total import costs by 15-25% through better route planning, duty optimization, and avoiding costly mistakes.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Eliminate classification errors that cost $2,000+ per shipment</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Find the cheapest shipping routes automatically</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Maximize trade agreement savings</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">$49/month</div>
              <div className="text-lg text-gray-600 mb-4">Pays for itself with your first shipment</div>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Free Trial
              </Button>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section>
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Stop Wasting Time on Manual Research
            </h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Without TradeNavigator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">❌ 4+ hours researching each new product</div>
                <div className="text-sm text-gray-600">❌ Guessing at HS codes and getting penalized</div>
                <div className="text-sm text-gray-600">❌ Overpaying for shipping by 20-30%</div>
                <div className="text-sm text-gray-600">❌ Missing trade agreement opportunities</div>
                <div className="text-sm text-gray-600">❌ Compliance surprises and delays</div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-600">With TradeNavigator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-700">✅ Complete analysis in under 2 minutes</div>
                <div className="text-sm text-gray-700">✅ AI-verified HS codes with 95%+ accuracy</div>
                <div className="text-sm text-gray-700">✅ Automatically find cheapest shipping routes</div>
                <div className="text-sm text-gray-700">✅ Maximize duty savings opportunities</div>
                <div className="text-sm text-gray-700">✅ Stay ahead of regulatory changes</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Enterprise Features */}
        <section>
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Features for Growing Teams
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Bank-Level Security</h4>
              <p className="text-sm text-gray-600">SOC 2 compliant with end-to-end encryption</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">99.9% Uptime</h4>
              <p className="text-sm text-gray-600">Reliable access when you need it most</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Real-Time Data</h4>
              <p className="text-sm text-gray-600">Live rates and regulations updates</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Global Coverage</h4>
              <p className="text-sm text-gray-600">200+ countries and territories</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-8 lg:p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Import Business?</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of SMBs saving thousands on every shipment with AI-powered trade intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Start 14-Day Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Book a Demo
            </Button>
          </div>
          <p className="text-sm text-blue-200 mt-4">No credit card required • Cancel anytime • 14-day money-back guarantee</p>
        </section>
      </div>
    </div>
  );
}