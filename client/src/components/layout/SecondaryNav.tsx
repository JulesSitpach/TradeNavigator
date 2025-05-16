import { useLocation, Link } from 'wouter';

interface SecondaryNavProps {
  section: 'trade-analysis' | 'special-programs' | 'none';
}

const SecondaryNav = ({ section }: SecondaryNavProps) => {
  const [location] = useLocation();
  
  if (section === 'none') return null;
  
  // Trade analysis tabs
  const tradeAnalysisTabs = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/product-analysis', label: 'Cost Breakdown' },
    { href: '/shipments', label: 'Alternative Routes' },
    { href: '/tariff-lookup', label: 'Tariff Analysis' },
    { href: '/regulations', label: 'Regulations' },
    { href: '/visualizations', label: 'Visualizations' }
  ];
  
  // Special programs tabs
  const specialProgramsTabs = [
    { href: '/exemptions', label: 'Exemptions' },
    { href: '/duty-drawback', label: 'Duty Drawback' },
    { href: '/special-programs', label: 'Special Programs' },
    { href: '/market-analysis', label: 'Market Analysis' },
    { href: '/trade-partners', label: 'Trade Partners' },
    { href: '/ai-predictions', label: 'AI Predictions' }
  ];
  
  const tabs = section === 'trade-analysis' ? tradeAnalysisTabs : specialProgramsTabs;
  
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-auto">
        <nav className="flex space-x-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <Link key={tab.href} href={tab.href}>
              <a className={`whitespace-nowrap inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium ${
                location === tab.href
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
                {tab.label}
              </a>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SecondaryNav;