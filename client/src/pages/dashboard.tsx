import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { useMasterTranslation } from "@/utils/masterTranslation";
import { BarChart, LineChart, Ship, Globe, BookOpen, Calculator } from "lucide-react";

// Dashboard home page - serves as the main entry point to all dashboard features
export default function Dashboard() {
  const { t } = useMasterTranslation();
  const [, setLocation] = useLocation();

  // Define dashboard categories with their routes and icons
  const dashboardCategories = [
    {
      title: t('tools.title', 'Trade Tools'),
      description: t('tools.description', 'Calculate costs, analyze routes, and understand tariffs'),
      icon: <Calculator className="h-8 w-8 text-blue-500" />,
      items: [
        { name: t('tools.costBreakdown', 'Cost Breakdown'), route: '/cost-breakdown' },
        { name: t('tools.routeAnalysis', 'Route Analysis'), route: '/route-analysis' },
        { name: t('tools.tariffAnalysis', 'Tariff Analysis'), route: '/tariff-analysis' }
      ]
    },
    {
      title: t('regulations.title', 'Regulations'),
      description: t('regulations.description', 'Stay compliant with trade regulations and legal frameworks'),
      icon: <BookOpen className="h-8 w-8 text-green-500" />,
      items: [
        { name: t('regulations.complianceRequirements', 'Compliance Requirements'), route: '/compliance-requirements' },
        { name: t('regulations.tradeRegulations', 'Trade Regulations'), route: '/trade-regulations' },
        { name: t('regulations.legalFrameworks', 'Legal Frameworks'), route: '/legal-frameworks' }
      ]
    },
    {
      title: t('markets.title', 'Markets'),
      description: t('markets.description', 'Analyze markets, pricing data and regional trade patterns'),
      icon: <Globe className="h-8 w-8 text-purple-500" />,
      items: [
        { name: t('markets.marketsAnalysis', 'Markets Analysis'), route: '/markets-analysis' },
        { name: t('markets.pricingData', 'Pricing Data'), route: '/pricing-data' },
        { name: t('markets.regionalTrade', 'Regional Trade'), route: '/regional-trade' }
      ]
    },
    {
      title: t('ai.title', 'AI Features'),
      description: t('ai.description', 'Get AI guidance, predictions and visualizations'),
      icon: <BarChart className="h-8 w-8 text-orange-500" />,
      items: [
        { name: t('ai.aiGuidance', 'AI Guidance'), route: '/ai-guidance' },
        { name: t('ai.aiPredictions', 'AI Predictions'), route: '/ai-predictions' },
        { name: t('ai.visualizations', 'Visualizations'), route: '/visualizations' }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center">
        <Ship className="h-8 w-8 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title', 'TradeNavigator Dashboard')}</h1>
      </div>
      
      <p className="text-lg text-gray-600 mb-8">
        {t('dashboard.welcome', 'Welcome to your trade command center. Access all tools and features from this dashboard.')}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dashboardCategories.map((category, index) => (
          <Card key={index} className="p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start mb-4">
              {category.icon}
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                <p className="text-gray-600">{category.description}</p>
              </div>
            </div>
            
            <ul className="space-y-2 mt-4">
              {category.items.map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => setLocation(item.route)}
                    className="w-full text-left px-3 py-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
