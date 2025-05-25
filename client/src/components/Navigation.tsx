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
              <Link href="/pricing" className="text-sm text-gray-600 hover:text-blue-600 font-medium">{t('navigation.pricing')}</Link>
              <Link href="/documents" className="text-sm text-gray-600 hover:text-blue-600 font-medium">{t('navigation.documents')}</Link>
              <div className="flex items-center space-x-3">
                {/* Simple English/Spanish Toggle */}
                <button
                  onClick={() => {
                    const newLang = language === 'en' ? 'es' : 'en';
                    console.log('Toggling language to:', newLang);
                    setLanguage(newLang);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 border border-gray-200 rounded-lg hover:border-blue-300 transition-all"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {language === 'en' ? 'EN' : 'ES'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {language === 'en' ? '→ ES' : '→ EN'}
                  </span>
                </button>
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

      {/* Main Navigation */}
      <nav className="bg-white border-b border-purple-100" ref={navRef}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8 h-12">
            <Link 
              href="/overview" 
              className="text-sm text-gray-500 hover:text-gray-700 px-1 pt-3 pb-2"
            >
              Overview
            </Link>
            
            {/* Tools Dropdown */}
            <div className="relative">
              <button 
                onClick={() => handleDropdownToggle('tools')}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 px-1 pt-3 pb-2"
              >
                Tools
                <ChevronDown className="ml-1 h-3 w-3" />
              </button>
              {openDropdown === 'tools' && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-2">
                    <Link href="/cost-breakdown" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setOpenDropdown(null)}>Cost Breakdown</Link>
                    <Link href="/route-analysis" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setOpenDropdown(null)}>Alternative Routes</Link>
                    <Link href="/tariff-analysis" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setOpenDropdown(null)}>Tariff Lookup</Link>
                    <Link href="/visualizations" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setOpenDropdown(null)}>Visualizations</Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Regulations Dropdown */}
            <div className="relative">
              <button 
                onClick={() => handleDropdownToggle('regulations')}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 px-1 pt-3 pb-2"
              >
                Regulations
                <ChevronDown className="ml-1 h-3 w-3" />
              </button>
              {openDropdown === 'regulations' && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-2">
                    <Link href="/compliance-requirements" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setOpenDropdown(null)}>Compliance Requirements</Link>
                    <Link href="/trade-regulations" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setOpenDropdown(null)}>Trade Regulations</Link>
                    <Link href="/legal-frameworks" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setOpenDropdown(null)}>Legal Frameworks</Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Markets Dropdown */}
            <div className="relative">
              <button 
                onClick={() => handleDropdownToggle('markets')}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 px-1 pt-3 pb-2"
              >
                Markets
                <ChevronDown className="ml-1 h-3 w-3" />
              </button>
              {openDropdown === 'markets' && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-2">
                    <Link href="/markets-analysis" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setOpenDropdown(null)}>Market Analysis</Link>
                    <Link href="/pricing-data" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setOpenDropdown(null)}>Pricing Data</Link>
                    <Link href="/regional-trade" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setOpenDropdown(null)}>Regional Trade</Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* AI Dropdown */}
            <div className="relative">
              <button 
                onClick={() => handleDropdownToggle('ai')}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 px-1 pt-3 pb-2"
              >
                AI
                <ChevronDown className="ml-1 h-3 w-3" />
              </button>
              {openDropdown === 'ai' && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-2">
                    <div onClick={() => handleNavigate('/ai-guidance')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">AI Guidance</div>
                    <div onClick={() => handleNavigate('/ai-predictions')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Predictions</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Programs Dropdown */}
            <div className="relative">
              <button 
                onClick={() => handleDropdownToggle('programs')}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 px-1 pt-3 pb-2"
              >
                Programs
                <ChevronDown className="ml-1 h-3 w-3" />
              </button>
              {openDropdown === 'programs' && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-2">
                    <div onClick={() => handleNavigate('/special-programs')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Trade Preferences</div>
                    <div onClick={() => handleNavigate('/trade-zones')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Foreign Trade Zones</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
