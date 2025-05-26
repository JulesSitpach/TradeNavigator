import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMasterTranslation } from "@/utils/masterTranslation";
import { Check, ArrowRight, Zap, Star } from "lucide-react";
import PricingPlans from "@/components/PricingPlans";

export default function Pricing() {
  const { t } = useMasterTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
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
        
        {/* Pricing Plans Component */}
        <PricingPlans />

        {/* ROI Calculator */}
        <section className="bg-green-50 rounded-2xl p-8 lg:p-12 mb-16 mt-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('pricing.roi.title')}
            </h3>
            <p className="text-gray-600">{t('pricing.roi.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">{t('pricing.roi.hsError.amount')}</div>
              <div className="text-gray-600 mb-2">{t('pricing.roi.hsError.label')}</div>
              <div className="text-sm text-gray-500">{t('pricing.roi.hsError.description')}</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{t('pricing.roi.shippingCost.amount')}</div>
              <div className="text-gray-600 mb-2">{t('pricing.roi.shippingCost.label')}</div>
              <div className="text-sm text-gray-500">{t('pricing.roi.shippingCost.description')}</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">{t('pricing.roi.timeSaved.amount')}</div>
              <div className="text-gray-600 mb-2">{t('pricing.roi.timeSaved.label')}</div>
              <div className="text-sm text-gray-500">{t('pricing.roi.timeSaved.description')}</div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('pricing.faq.title')}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('pricing.faq.trial.question')}</h4>
              <p className="text-gray-600 text-sm mb-4">
                {t('pricing.faq.trial.answer')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('pricing.faq.payment.question')}</h4>
              <p className="text-gray-600 text-sm mb-4">
                {t('pricing.faq.payment.answer')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('pricing.faq.planChanges.question')}</h4>
              <p className="text-gray-600 text-sm mb-4">
                {t('pricing.faq.planChanges.answer')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('pricing.faq.annualDiscount.question')}</h4>
              <p className="text-gray-600 text-sm mb-4">
                {t('pricing.faq.annualDiscount.answer')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('pricing.faq.dataSecurity.question')}</h4>
              <p className="text-gray-600 text-sm mb-4">
                {t('pricing.faq.dataSecurity.answer')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('pricing.faq.onboarding.question')}</h4>
              <p className="text-gray-600 text-sm mb-4">
                {t('pricing.faq.onboarding.answer')}
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-8 lg:p-12 text-center mt-16">
          <h3 className="text-3xl font-bold mb-4">{t('pricing.finalCta.title')}</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t('pricing.finalCta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              {t('pricing.finalCta.trial')}
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              {t('pricing.finalCta.demo')}
            </Button>
          </div>
          <p className="text-sm text-blue-200 mt-4">{t('pricing.finalCta.footer')}</p>
        </section>
      </div>
    </div>
  );
}