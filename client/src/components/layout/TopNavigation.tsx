import { useContext, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { LanguageContext } from '@/contexts/LanguageContext';
import { AuthContext } from '@/contexts/AuthContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FaBell, FaChevronDown, FaChevronUp, FaLanguage, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

const TopNavigation = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const { user, logout } = useContext(AuthContext);
  const [location] = useLocation();
  const tabsContainerRef = useRef<HTMLUListElement>(null);
  const tabNavigationRef = useRef<HTMLDivElement>(null);

  const languageLabels = {
    en: 'English',
    es: 'Español',
    fr: 'Français'
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Define items exactly as in the provided HTML structure
  const primaryMenuItems = [
    { href: "/home", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/special-programs", label: "Special Programs" },
    { href: "/pricing", label: "Pricing" }
  ];

  const tabNavigationItems = [
    { href: "/dashboard/overview", label: "Overview" },
    { href: "/dashboard/cost-breakdown", label: "Cost Breakdown" },
    { href: "/dashboard/alternative-routes", label: "Alternative Routes" },
    { href: "/dashboard/tariff-analysis", label: "Tariff Analysis" },
    { href: "/dashboard/regulations", label: "Regulations" },
    { href: "/dashboard/visualizations", label: "Visualizations" },
    { href: "/dashboard/exemptions", label: "Exemptions" },
    { href: "/dashboard/duty-drawback", label: "Duty Drawback" },
    { href: "/dashboard/special-programs", label: "Special Programs" },
    { href: "/dashboard/market-analysis", label: "Market Analysis" },
    { href: "/dashboard/trade-partners", label: "Trade Partners" },
    { href: "/dashboard/ai-predictions", label: "AI Predictions" }
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  // Check if tabs are overflowing
  const checkTabOverflow = () => {
    const tabsContainer = tabsContainerRef.current;
    const tabNavigation = tabNavigationRef.current;
    
    if (tabsContainer && tabNavigation) {
      const isOverflowing = tabsContainer.scrollWidth > tabsContainer.clientWidth;
      
      if (isOverflowing) {
        tabNavigation.classList.add('has-overflow');
      } else {
        tabNavigation.classList.remove('has-overflow');
      }
    }
  };

  // Scroll tabs left
  const scrollTabsLeft = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  // Scroll tabs right
  const scrollTabsRight = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Check for overflow when component mounts or window resizes
    checkTabOverflow();
    
    const handleResize = () => {
      checkTabOverflow();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <nav className="main-navigation bg-white border-b border-gray-200">
      {/* Primary Navigation */}
      <div className="primary-nav px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="logo flex-shrink-0">
              <Link href="/">
                <span className="flex items-center cursor-pointer">
                  <span className="text-xl font-bold text-blue-600">Trade<span className="text-gray-900">Navigator</span></span>
                </span>
              </Link>
            </div>
            
            {/* Primary Menu */}
            <ul className="primary-menu hidden md:ml-8 md:flex md:space-x-4">
              {primaryMenuItems.map(item => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <span className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                      isActive(item.href) ? 'text-blue-600 active' : 'text-gray-700 hover:text-blue-600'
                    } cursor-pointer block`}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* User Controls */}
          <div className="user-controls flex items-center space-x-4">
            {/* Language selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="hidden md:flex items-center text-gray-700 cursor-pointer">
                  <Button variant="ghost" size="sm" className="p-2 rounded-md hover:bg-gray-100">
                    <FaLanguage className="mr-1" />
                    <span className="text-sm font-medium">{language.toUpperCase()}</span>
                    <FaChevronDown className="ml-1 text-xs" />
                  </Button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  🇺🇸 {languageLabels.en}
                  {language === 'en' && <FaChevronUp className="ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('es')}>
                  🇪🇸 {languageLabels.es}
                  {language === 'es' && <FaChevronUp className="ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('fr')}>
                  🇫🇷 {languageLabels.fr}
                  {language === 'fr' && <FaChevronUp className="ml-2" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative text-gray-700 hover:text-gray-900 hover:bg-gray-100">
              <FaBell />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center text-sm focus:outline-none p-1">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src="" alt="User avatar" />
                    <AvatarFallback>{user?.username ? getInitials(user.username) : 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className="font-medium text-gray-900">{user?.username || 'Guest'}</div>
                    <div className="text-xs text-gray-500">{user?.companyName || 'MacArthur Productions'}</div>
                  </div>
                  <FaChevronDown className="ml-2 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href="/profile">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                </Link>
                <Link href="/subscription">
                  <DropdownMenuItem>Subscription</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div ref={tabNavigationRef} className="tab-navigation px-4 sm:px-6 lg:px-8 border-t border-gray-200 relative">
        <button 
          className="tab-scroll-left" 
          onClick={scrollTabsLeft} 
          aria-label="Scroll tabs left">
          <FaChevronLeft />
        </button>
        
        <ul ref={tabsContainerRef} className="tabs-container flex overflow-x-auto py-2 space-x-4 list-none m-0 p-0">
          {tabNavigationItems.map(item => (
            <li key={item.href} className="flex-0-0-auto">
              <Link href={item.href}>
                <span className={`whitespace-nowrap text-sm font-medium pb-3 cursor-pointer block px-3 py-2 ${
                  isActive(item.href) ? 'text-blue-600 border-b-2 border-blue-600 active' : 'text-gray-500 hover:text-gray-700'
                }`}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        
        <button 
          className="tab-scroll-right" 
          onClick={scrollTabsRight} 
          aria-label="Scroll tabs right">
          <FaChevronRight />
        </button>
      </div>
    </nav>
  );
};

export default TopNavigation;