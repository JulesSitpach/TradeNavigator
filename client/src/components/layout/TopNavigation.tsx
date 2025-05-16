import { useContext, useState } from 'react';
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
import { FaBell, FaChevronDown, FaChevronUp, FaLanguage, FaEllipsisH } from 'react-icons/fa6';

const TopNavigation = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const { user, logout } = useContext(AuthContext);
  const [location] = useLocation();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const languageLabels = {
    en: 'English',
    es: 'Español',
    fr: 'Français'
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const primaryNavItems = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/special-programs", label: "Special Programs" },
    { href: "/subscription", label: "Pricing" }
  ];

  // Define main feature navigation items
  const featureNavItems = [
    { href: "/overview", label: "Overview" },
    { href: "/cost-breakdown", label: "Cost Breakdown" },
    { href: "/alternative-routes", label: "Alternative Routes" },
    { href: "/tariff-analysis", label: "Tariff Analysis" },
    { href: "/regulations", label: "Regulations" },
    { href: "/visualizations", label: "Visualizations" },
    { href: "/exemptions", label: "Exemptions" },
    { href: "/duty-drawback", label: "Duty Drawback" }
  ];

  // More dropdown items
  const moreNavItems = [
    { href: "/special-programs", label: "Special Programs" },
    { href: "/market-analysis", label: "Market Analysis" },
    { href: "/trade-partners", label: "Trade Partners" },
    { href: "/ai-predictions", label: "AI Predictions" }
  ];

  const NavLink = ({ href, label, active }: { href: string; label: string; active?: boolean }) => (
    <Link href={href}>
      <span className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
        active ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
      } cursor-pointer`}>
        {label}
      </span>
    </Link>
  );

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-white border-b border-gray-200">
      {/* Main navigation */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and primary nav */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="flex items-center cursor-pointer">
                  <span className="text-xl font-bold text-blue-600">Trade<span className="text-gray-900">Navigator</span></span>
                </span>
              </Link>
            </div>
            <nav className="hidden md:ml-8 md:flex md:space-x-4">
              {primaryNavItems.map(item => (
                <NavLink 
                  key={item.href}
                  href={item.href} 
                  label={item.label} 
                  active={isActive(item.href)} 
                />
              ))}
            </nav>
          </div>

          {/* Right side navigation items */}
          <div className="flex items-center space-x-4">
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

      {/* Global features navigation - always visible on all pages */}
      <div className="px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="flex overflow-x-auto py-2 space-x-4">
          {featureNavItems.map(item => (
            <Link key={item.href} href={item.href}>
              <span className={`whitespace-nowrap text-sm font-medium pb-3 cursor-pointer ${
                isActive(item.href) ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}>
                {item.label}
              </span>
            </Link>
          ))}
          
          {/* More dropdown */}
          <DropdownMenu open={showMoreMenu} onOpenChange={setShowMoreMenu}>
            <DropdownMenuTrigger asChild>
              <span className="whitespace-nowrap text-sm font-medium pb-3 cursor-pointer text-gray-500 hover:text-gray-700 flex items-center">
                More
                <FaChevronDown className="ml-1 text-xs" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {moreNavItems.map(item => (
                <Link key={item.href} href={item.href}>
                  <DropdownMenuItem className={isActive(item.href) ? "text-blue-600 font-medium" : ""}>
                    {item.label}
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;