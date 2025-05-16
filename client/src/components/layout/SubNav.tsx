import { useLocation, Link } from 'wouter';

interface SubNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SubNav = ({ activeTab, setActiveTab }: SubNavProps) => {
  const [location] = useLocation();
  
  // Primary tabs
  const primaryTabs = [
    { id: 'overview', label: 'Overview', href: '/dashboard' },
    { id: 'cost-breakdown', label: 'Cost Breakdown', href: '/product-analysis' },
    { id: 'alternative-routes', label: 'Alternative Routes', href: '/shipments' },
    { id: 'tariff-analysis', label: 'Tariff Analysis', href: '/tariff-lookup' },
    { id: 'regulations', label: 'Regulations', href: '/market-analysis' },
    { id: 'visualizations', label: 'Visualizations', href: '/reports' }
  ];
  
  // Secondary tabs
  const secondaryTabs = [
    { id: 'exemptions', label: 'Exemptions', href: '/exemptions' },
    { id: 'duty-drawback', label: 'Duty Drawback', href: '/duty-drawback' },
    { id: 'special-programs', label: 'Special Programs', href: '/special-programs' },
    { id: 'market-analysis', label: 'Market Analysis', href: '/market-analysis' },
    { id: 'trade-partners', label: 'Trade Partners', href: '/trade-partners' },
    { id: 'ai-predictions', label: 'AI Predictions', href: '/ai-predictions' }
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Primary Navigation Tabs */}
        <div className="flex space-x-8 overflow-x-auto no-scrollbar">
          {primaryTabs.map((tab) => (
            <Link 
              key={tab.id} 
              href={tab.href}
              onClick={() => setActiveTab(tab.id)}
            >
              <a className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                location === tab.href
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
                {tab.label}
              </a>
            </Link>
          ))}
        </div>
        
        {/* Secondary Navigation Tabs */}
        <div className="flex space-x-8 overflow-x-auto no-scrollbar mt-0.5">
          {secondaryTabs.map((tab) => (
            <Link 
              key={tab.id} 
              href={tab.href}
              onClick={() => setActiveTab(tab.id)}
            >
              <a className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                location === tab.href
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
                {tab.label}
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubNav;