import { useState, useContext } from 'react';
import { Link, useLocation } from 'wouter';
import { FaBell, FaChevronDown, FaLanguage, FaChevronUp } from 'react-icons/fa6';
import { LanguageContext } from '@/contexts/LanguageContext';
import { AuthContext } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon } from 'lucide-react';

const Header = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const { user, logout } = useContext(AuthContext);
  const [location] = useLocation();
  
  const languageLabels = {
    en: 'English',
    es: 'Español',
    fr: 'Français'
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Main Nav */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-primary text-xl font-bold">TradeNavigator</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-8 md:flex md:space-x-6">
              <Link href="/">
                <a className={`px-3 py-2 text-sm font-medium rounded-md ${location === "/" ? "text-primary" : "text-gray-500 hover:text-gray-900"}`}>
                  Home
                </a>
              </Link>
              <Link href="/dashboard">
                <a className={`px-3 py-2 text-sm font-medium rounded-md ${location === "/dashboard" ? "text-primary" : "text-gray-500 hover:text-gray-900"}`}>
                  Dashboard
                </a>
              </Link>
              <Link href="/features">
                <a className={`px-3 py-2 text-sm font-medium rounded-md ${location === "/features" ? "text-primary" : "text-gray-500 hover:text-gray-900"}`}>
                  Features
                </a>
              </Link>
              <Link href="/pricing">
                <a className={`px-3 py-2 text-sm font-medium rounded-md ${location === "/pricing" ? "text-primary" : "text-gray-500 hover:text-gray-900"}`}>
                  Pricing
                </a>
              </Link>
            </nav>
          </div>

          {/* Right side options */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                  <span className="mr-1">English</span> <FaChevronDown className="h-3 w-3" />
                </Button>
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
            <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900">
              <FaBell />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary"></span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(user?.username || 'User')}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex items-center ml-2">
                    <span className="text-sm font-medium text-gray-700">{user?.username || 'Julie MacArthur'}</span>
                    <FaChevronDown className="ml-1 h-3 w-3 text-gray-500" />
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href="/profile">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                </Link>
                <Link href="/subscription">
                  <DropdownMenuItem>Subscription</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
                    <MenuIcon className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <nav className="flex flex-col mt-6 space-y-2">
                    <Link href="/">
                      <a className={`p-2 text-base font-medium rounded-md ${location === "/" ? "text-primary bg-primary/10" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}>
                        Home
                      </a>
                    </Link>
                    <Link href="/dashboard">
                      <a className={`p-2 text-base font-medium rounded-md ${location === "/dashboard" ? "text-primary bg-primary/10" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}>
                        Dashboard
                      </a>
                    </Link>
                    <Link href="/features">
                      <a className={`p-2 text-base font-medium rounded-md ${location === "/features" ? "text-primary bg-primary/10" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}>
                        Features
                      </a>
                    </Link>
                    <Link href="/pricing">
                      <a className={`p-2 text-base font-medium rounded-md ${location === "/pricing" ? "text-primary bg-primary/10" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}>
                        Pricing
                      </a>
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
