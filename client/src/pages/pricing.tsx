import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { useMasterTranslation } from "@/utils/masterTranslation";
import { Check, ArrowRight, Zap, Star } from "lucide-react";

export default function Pricing() {
  const { t } = useMasterTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              {t('pricing.main.title')}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {t('pricing.main.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-16">
          
          {/* Free Tier */}
          <Card className="border-gray-200">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl">{t('pricing.tiers.free.name')}</CardTitle>
              <div className="text-3xl font-bold text-gray-900 mb-2">{t('pricing.tiers.free.price')}</div>
              <div className="text-gray-600">{t('common.perMonth')}</div>
              <CardDescription>{t('pricing.tiers.free.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Up to 10 cost calculations</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">AI-powered HS code suggestions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Basic shipping rate comparisons</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Email support</span>
                </div>
              </div>
              <Button className="w-full mt-6" variant="outline">
                Start Free Trial
              </Button>
            </CardContent>
          </Card>

          {/* Basic Tier */}
          <Card className="border-gray-200">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl">{t('basicTier')}</CardTitle>
              <div className="text-3xl font-bold text-gray-900 mb-2">$19</div>
              <div className="text-gray-600">{t('common.perMonth')}</div>
              <CardDescription>{t('descriptions.basicDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">100 calculations/month</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">AI HS code suggestions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Basic shipping rates</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Email support</span>
                </div>
              </div>
              <Button className="w-full mt-6">
                Start Basic
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan - Most Popular */}
          <Card className="border-blue-500 bg-blue-50 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-600 text-white px-4 py-1">{t('mostPopular')}</Badge>
            </div>
            <CardHeader className="text-center pb-6 pt-6">
              <CardTitle className="text-xl text-blue-600">{t('proTier')}</CardTitle>
              <div className="text-3xl font-bold text-blue-600 mb-2">$39</div>
              <div className="text-gray-600">{t('perMonth')}</div>
              <CardDescription>{t('proDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Unlimited cost calculations</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">AI-powered HS code suggestions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Real-time shipping rates (200+ carriers)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Trade agreement optimization</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Market intelligence & insights</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Compliance & regulatory updates</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Priority email & chat support</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Export calculation reports</span>
                </div>
              </div>
              <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                Start Pro Plan <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Global Tier */}
          <Card className="border-gray-200">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl">Global</CardTitle>
              <div className="text-3xl font-bold text-gray-900 mb-2">$99</div>
              <div className="text-gray-600">per month</div>
              <CardDescription>For enterprise teams</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Everything in Pro</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">API access for integrations</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Custom reporting & analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Dedicated account manager</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">SLA guarantee</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Phone support</span>
                </div>
              </div>
              <Button className="w-full mt-6" variant="outline">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ROI Calculator */}
        <section className="bg-green-50 rounded-2xl p-8 lg:p-12 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Calculate Your Savings
            </h3>
            <p className="text-gray-600">See how TradeNavigator pays for itself</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">$2,000+</div>
              <div className="text-gray-600 mb-2">Average cost per HS code error</div>
              <div className="text-sm text-gray-500">Prevent just 1 misclassification and TradeNavigator pays for itself for 3+ years</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">15-25%</div>
              <div className="text-gray-600 mb-2">Average shipping cost reduction</div>
              <div className="text-sm text-gray-500">On a $10k shipment, save $1,500+ by finding optimal routes</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">40+ hrs</div>
              <div className="text-gray-600 mb-2">Time saved per month</div>
              <div className="text-sm text-gray-500">Stop manual research and focus on growing your business</div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How does the 14-day trial work?</h4>
              <p className="text-gray-600 text-sm mb-4">
                Start using TradeNavigator immediately with full access to all Pro features. No credit card required. Cancel anytime during the trial with no charges.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600 text-sm mb-4">
                We accept all major credit cards and ACH bank transfers for annual plans. All payments are processed securely through Stripe.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I upgrade or downgrade anytime?</h4>
              <p className="text-gray-600 text-sm mb-4">
                Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades apply at your next billing cycle.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Do you offer annual discounts?</h4>
              <p className="text-gray-600 text-sm mb-4">
                Yes! Save 20% with annual billing. That's just $470 per year for Pro instead of $588 monthly billing.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is my data secure?</h4>
              <p className="text-gray-600 text-sm mb-4">
                Absolutely. We use bank-level encryption and are SOC 2 Type II compliant. Your business data is never shared with third parties.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What if I need help getting started?</h4>
              <p className="text-gray-600 text-sm mb-4">
                Every Pro customer gets free onboarding support. We'll help you set up your first calculations and optimize your import processes.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-8 lg:p-12 text-center mt-16">
          <h3 className="text-3xl font-bold mb-4">Ready to Save Thousands on Your Next Shipment?</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of SMBs who've reduced their import costs by 15-25% with TradeNavigator.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Start Free 14-Day Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-blue-200 mt-4">No credit card required • Cancel anytime • Money-back guarantee</p>
        </section>
      </div>
    </div>
  );
}