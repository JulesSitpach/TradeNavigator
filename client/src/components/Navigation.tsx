import { useAuth } from "@/hooks/useAuth";
import { useMasterTranslation } from "@/utils/masterTranslation";
import { Button } from "@/components/ui/button";
import { Ship, ChevronDown, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";

export function Navigation() {
  const { user } = useAuth();
  const { language, setLanguage, t } = useMasterTranslation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const navRef = useRef<HTMLDivElement>(null);

  const handleDropdownToggle = (menu: string) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const handleNavigate = (path: string) => {
    setOpenDropdown(null);
    // Use immediate navigation to prevent page reloads
    setLocation(path);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-clean-blue rounded-lg flex items-center justify-center mr-3">
                <Ship className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">TradeNavigator</h1>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/overview" className="text-sm text-gray-600 hover:text-blue-600 font-medium">{t('navigation.overview')}</Link>
              <Link href="/features" className="text-sm text-gray-600 hover:text-blue-600 font-medium">{t('navigation.features')}</Link>
              <Link href="/cost-breakdown" className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors">Dashboard</Link>
              <Link href="/pricing" className="text-sm text-gray-600 hover:text-blue-600 font-medium">{t('navigation.pricing')}</Link>
              <div className="flex items-center space-x-3">
                {/* Language Switcher Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => handleDropdownToggle('language')}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 border border-gray-200 rounded-lg hover:border-blue-300 transition-all"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {language === 'en' ? 'EN' : language === 'es' ? 'ES' : 'FR'}
                    </span>
                    <ChevronDown className="h-3 w-3 text-gray-400" />
                  </button>
                  
                  {openDropdown === 'language' && (
                    <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <div className="py-1">
                        <button 
                          onClick={() => {
                            setLanguage('en');
                            setOpenDropdown(null);
                          }} 
                          className={`block w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          English
                        </button>
                        <button 
                          onClick={() => {
                            setLanguage('es');
                            setOpenDropdown(null);
                          }} 
                          className={`block w-full text-left px-4 py-2 text-sm ${language === 'es' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          Español
                        </button>
                        <button 
                          onClick={() => {
                            setLanguage('fr');
                            setOpenDropdown(null);
                          }} 
                          className={`block w-full text-left px-4 py-2 text-sm ${language === 'fr' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          Français
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Navigation - Removed submenu */}
      {/* <nav className="bg-white border-b border-purple-100" ref={navRef}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8 h-12">
            <Link 
              href="/overview" 
              className="text-sm text-gray-500 hover:text-gray-700 px-1 pt-3 pb-2"
            >
              Overview
            </Link>
            
            
          </div>
        </div>
      </nav> */}
    </>
  );
}
