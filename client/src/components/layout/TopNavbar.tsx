import { useState, useContext } from 'react';
import { Link, useLocation } from 'wouter';
import { FaBars, FaBell, FaChevronDown, FaLanguage } from 'react-icons/fa6';
import { LanguageContext } from '@/contexts/LanguageContext';
import { AuthContext } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const TopNavbar = () => {
  const [location] = useLocation();
  const { language, setLanguage, t } = useContext(LanguageContext);
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languageLabels = {
    en: 'English',
    es: 'Español',
    fr: 'Français'
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Navigation items
  const mainNavItems = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/pricing', label: 'Pricing' }
  ];

  const userNavItems = [
    { href: '/profile', label: 'Profile' },
    { href: '/subscription', label: 'Subscription' }
  ];

  return (
    <header className="bg-white shadow-sm">
      {/* Main navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            {/* Logo */}
            <div className="flex flex-shrink-0 items-center">
              <Link href="/">
                <span className="text-xl font-bold text-primary">TradeNavigator</span>
              </Link>
            </div>
            
            {/* Desktop main nav */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {mainNavItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      location === item.href
                        ? 'border-b-2 border-primary text-gray-900'
                        : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Right side menus */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {/* Language selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <FaLanguage className="h-4 w-4" />
                  <span>{language.toUpperCase()}</span>
                  <FaChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  🇺🇸 {languageLabels.en}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('es')}>
                  🇪🇸 {languageLabels.es}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('fr')}>
                  🇫🇷 {languageLabels.fr}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <FaBell className="h-5 w-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
            
            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback>{getInitials(user?.username || 'User')}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="text-sm font-medium">{user?.username || 'Guest'}</div>
                    <div className="text-xs text-gray-500">{user?.companyName || ''}</div>
                  </div>
                  <FaChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {userNavItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <DropdownMenuItem>{item.label}</DropdownMenuItem>
                  </Link>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <FaBars className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col px-2 pt-4 pb-3 space-y-1">
                  {mainNavItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <a
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                          location === item.href
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    </Link>
                  ))}
                  
                  <div className="border-t border-gray-200 my-3"></div>
                  
                  {userNavItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <a
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    </Link>
                  ))}
                  
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Log out
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      {/* Secondary navigation (Sub menu) */}
      {user && (
        <div className="border-t border-gray-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-12 overflow-x-auto no-scrollbar">
              <Link href="/dashboard">
                <a className={`inline-flex items-center border-b-2 px-4 pt-1 text-sm font-medium ${
                  location === '/dashboard' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}>
                  Overview
                </a>
              </Link>
              <Link href="/product-analysis">
                <a className={`inline-flex items-center border-b-2 px-4 pt-1 text-sm font-medium ${
                  location === '/product-analysis' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}>
                  Cost Breakdown
                </a>
              </Link>
              <Link href="/shipments">
                <a className={`inline-flex items-center border-b-2 px-4 pt-1 text-sm font-medium ${
                  location === '/shipments' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}>
                  Alternative Routes
                </a>
              </Link>
              <Link href="/tariff-lookup">
                <a className={`inline-flex items-center border-b-2 px-4 pt-1 text-sm font-medium ${
                  location === '/tariff-lookup' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}>
                  Tariff Analysis
                </a>
              </Link>
              <Link href="/market-analysis">
                <a className={`inline-flex items-center border-b-2 px-4 pt-1 text-sm font-medium ${
                  location === '/market-analysis' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}>
                  Market Analysis
                </a>
              </Link>
              <Link href="/reports">
                <a className={`inline-flex items-center border-b-2 px-4 pt-1 text-sm font-medium ${
                  location === '/reports' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}>
                  Trade Partners
                </a>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopNavbar;