import { Link, useLocation } from 'wouter';
import { useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AuthContext } from '@/contexts/AuthContext';
import { useContext } from 'react';

export function TopNavigation() {
  const [location] = useLocation();
  const { user } = useContext(AuthContext);
  const isMobile = useIsMobile();
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Highlight the active tab
    if (tabsRef.current) {
      const tabs = tabsRef.current.querySelectorAll('a');
      tabs.forEach(tab => {
        const href = tab.getAttribute('href');
        if (href && location.startsWith(href)) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
    }
  }, [location]);

  // If user is not logged in, show simplified navigation
  if (!user) {
    return (
      <nav className="main-navigation">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="font-bold text-xl text-primary">TradeNavigator</div>
          <div className="flex gap-4">
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
            <Link href="/register" className="bg-primary text-white px-3 py-1 rounded hover:bg-primary/90">
              Sign up
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="main-navigation">
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="font-bold text-xl text-primary">TradeNavigator</div>
        
        <div className="flex gap-4 items-center">
          {!isMobile && (
            <>
              <Link href="/dashboard" className={`hover:text-primary ${location === '/dashboard' ? 'text-primary' : 'text-gray-600'}`}>
                Dashboard
              </Link>
              <Link href="/products" className={`hover:text-primary ${location === '/products' ? 'text-primary' : 'text-gray-600'}`}>
                Products
              </Link>
              <Link href="/shipments" className={`hover:text-primary ${location === '/shipments' ? 'text-primary' : 'text-gray-600'}`}>
                Shipments
              </Link>
            </>
          )}
          
          <div className="relative group">
            <button className="flex items-center gap-2 hover:text-primary">
              <span>{user.username}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <div className="py-1">
                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                  Profile
                </Link>
                <Link href="/settings" className="block px-4 py-2 hover:bg-gray-100">
                  Settings
                </Link>
                <hr className="my-1" />
                <button onClick={() => {}} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Analysis Navigation - Simple flexible tabs that wrap naturally */}
      {(location === '/dashboard' || location.startsWith('/dashboard/')) && (
        <div className="flexible-tabs" ref={tabsRef}>
          <Link href="/dashboard/overview">Overview</Link>
          <Link href="/dashboard/cost-breakdown">Cost Breakdown</Link>
          <Link href="/dashboard/alternative-routes">Alternative Routes</Link>
          <Link href="/dashboard/tariff-analysis">Tariff Analysis</Link>
          <Link href="/dashboard/regulations">Regulations</Link>
          <Link href="/dashboard/visualizations">Visualizations</Link>
          <Link href="/dashboard/exemptions">Exemptions</Link>
          <Link href="/dashboard/duty-drawback">Duty Drawback</Link>
          <Link href="/dashboard/special-programs">Special Programs</Link>
          <Link href="/dashboard/market-analysis">Market Analysis</Link>
          <Link href="/dashboard/trade-partners">Trade Partners</Link>
          <Link href="/dashboard/ai-predictions">AI Predictions</Link>
        </div>
      )}
    </nav>
  );
}

export default TopNavigation;