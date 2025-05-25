import React from 'react';
import { Check } from 'lucide-react';
import { useMasterTranslation } from '@/utils/masterTranslation';

// Plan types
interface PlanFeature {
  title: string;
  included: boolean;
}

interface Plan {
  id: string;
  translationKey: string;
  emoji: string;
  price: number;
  features: PlanFeature[];
  highlight?: boolean;
  ctaKey: string;
}

// Individual plan component
const PricingCard: React.FC<{ plan: Plan }> = ({ plan }) => {
  const { t } = useMasterTranslation();
  
  return (
    <div 
      className={`flex flex-col h-full rounded-lg border p-6 ${
        plan.highlight 
          ? 'border-blue-500 shadow-lg shadow-blue-100' 
          : 'border-gray-200'
      }`}
    >
      {/* Plan header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold">{t(`pricing.tiers.${plan.translationKey}.name`)}</h3>
          <span className="text-2xl">{plan.emoji}</span>
        </div>
        <div className="mb-2">
          <span className="text-3xl font-bold">{t(`pricing.tiers.${plan.translationKey}.price`)}</span>
          <span className="text-gray-600 ml-1">{t('common.perMonth')}</span>
        </div>
        <p className="text-gray-600">{t(`pricing.tiers.${plan.translationKey}.description`)}</p>
      </div>
      
      {/* Feature list */}
      <div className="flex-grow mb-6">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className={`mr-2 mt-1 ${
                feature.included ? 'text-green-500' : 'text-gray-300'
              }`}>
                <Check size={16} />
              </span>
              <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                {feature.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* CTA button */}
      <button 
        className={`w-full py-2 px-4 rounded-md font-medium ${
          plan.highlight 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : plan.id === 'starter'
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              : 'bg-gray-800 hover:bg-gray-900 text-white'
        }`}
      >
        {t(`pricing.cta.${plan.ctaKey}`)}
      </button>
    </div>
  );
};

// Main pricing component
const PricingPlans: React.FC = () => {
  const { t } = useMasterTranslation();
  
  // Plan data with the updated subscription tiers
  const plans: Plan[] = [
    {
      id: 'starter',
      translationKey: 'starter',
      emoji: '🆓',
      price: 0,
      features: [
        { title: `${t('pricing.features.calculations')} (5)`, included: true },
        { title: `${t('pricing.features.basic')} ${t('pricing.features.hsCodeSuggestions')}`, included: true },
        { title: `${t('pricing.features.basic')} ${t('pricing.features.shippingRates')}`, included: true },
        { title: t('pricing.features.emailSupport'), included: false },
        { title: t('pricing.features.realTime') + ' ' + t('pricing.features.shippingRates'), included: false },
        { title: 'Trade route optimization', included: false },
        { title: 'Weekly market insights', included: false },
        { title: 'Export calculation reports', included: false }
      ],
      ctaKey: 'getStarted'
    },
    {
      id: 'professional',
      translationKey: 'professional',
      emoji: '💡',
      price: 29,
      features: [
        { title: `${t('pricing.features.calculations')} (250)`, included: true },
        { title: `${t('pricing.features.hsCodeSuggestions')}`, included: true },
        { title: `${t('pricing.features.shippingRates')} (50+ carriers)`, included: true },
        { title: t('pricing.features.emailSupport'), included: true },
        { title: t('pricing.features.realTime') + ' ' + t('pricing.features.shippingRates'), included: true },
        { title: 'Trade route optimization', included: true },
        { title: 'Weekly market insights', included: true },
        { title: 'Export calculation reports', included: true }
      ],
      highlight: true,
      ctaKey: 'subscribe'
    },
    {
      id: 'business',
      translationKey: 'business',
      emoji: '🚀',
      price: 59,
      features: [
        { title: `${t('pricing.features.unlimited')} ${t('pricing.features.calculations')}`, included: true },
        { title: `Premium ${t('pricing.features.hsCodeSuggestions')}`, included: true },
        { title: `${t('pricing.features.shippingRates')} (200+ carriers)`, included: true },
        { title: `Priority ${t('pricing.features.emailSupport')}`, included: true },
        { title: `${t('pricing.features.realTime')} market intelligence`, included: true },
        { title: 'Advanced trade agreement optimization', included: true },
        { title: 'Compliance & regulatory updates', included: true },
        { title: t('pricing.features.customReporting'), included: true },
        { title: 'Monthly strategic trade insights', included: true }
      ],
      ctaKey: 'upgrade'
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">{t('pricing.main.title')}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('pricing.main.subtitle')}
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map(plan => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
      
      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">{t('pricing.enterprise.subtitle')}</p>
        <button className="bg-white border border-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-50 font-medium">
          {t('pricing.enterprise.cta')}
        </button>
      </div>
    </div>
  );
};

export default PricingPlans;
