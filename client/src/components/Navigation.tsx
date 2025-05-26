import { useAuth } from "@/hooks/useAuth";
import { useMasterTranslation } from "@/utils/masterTranslation";
import { Button } from "@/components/ui/button";
import { Ship, ChevronDown, Globe, Bell, User, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";

export function Navigation() {
  const { user } = useAuth();
  const { language, setLanguage, t } = useMasterTranslation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [location, setLocation] = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  
  // Check if current page is a dashboard page
  // Only show secondary nav on the main dashboard page
  const isDashboardPage = location === '/dashboard';

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
              <Link href="/dashboard" className="text-sm bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md font-medium">{t('navigation.dashboard')}</Link>
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
                
                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => handleDropdownToggle('profile')}
                    className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    <span className="text-white text-xs font-medium">
                      {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                    </span>
                  </button>
                  
                  {openDropdown === 'profile' && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <div className="py-1">
                        <Link 
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Link>
                        <Link 
                          href="/notification-settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <Bell className="w-4 h-4 mr-2" />
                          Notification Settings
                        </Link>
                        <Link 
                          href="/account-settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Account Settings
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation - Only shown on dashboard pages */}
      {isDashboardPage && (
        <nav className="bg-white border-b border-purple-100" ref={navRef}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex space-x-8 h-12">
              {/* Tools Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('tools')}
                  className="flex items-center space-x-1 px-1 text-sm text-gray-600 hover:text-blue-600 h-full border-b-2 border-transparent hover:border-blue-500 transition-all"
                >
                  <span>{t('navigation.tools')}</span>
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>
                
                {openDropdown === 'tools' && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <Link 
                        href="/cost-breakdown"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {t('tools.costBreakdown')}
                      </Link>
                      <Link 
                        href="/route-analysis"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {t('tools.routeAnalysis')}
                      </Link>
                      <Link 
                        href="/tariff-analysis"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {t('tools.tariffAnalysis')}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Regulations Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('regulations')}
                  className="flex items-center space-x-1 px-1 text-sm text-gray-600 hover:text-blue-600 h-full border-b-2 border-transparent hover:border-blue-500 transition-all"
                >
                  <span>{t('navigation.regulations')}</span>
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>
                
                {openDropdown === 'regulations' && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <Link 
                        href="/compliance-requirements"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {t('regulations.complianceRequirements')}
                      </Link>
                      <Link 
                        href="/trade-regulations"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {t('regulations.tradeRegulations')}
                      </Link>
                      <Link 
                        href="/legal-frameworks"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {t('regulations.legalFrameworks')}
                      </Link>
                      <Link 
                        href="/special-programs"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {t('regulations.specialPrograms')}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Markets Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('markets')}
                  className="flex items-center space-x-1 px-1 text-sm text-gray-600 hover:text-blue-600 h-full border-b-2 border-transparent hover:border-blue-500 transition-all"
                >
                  <span>{t('navigation.markets')}</span>
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>
                
                {openDropdown === 'markets' && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <Link 
                        href="/markets-analysis"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {t('markets.marketsAnalysis')}
                      </Link>
                      <Link 
                        href="/pricing-data"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {t('markets.pricingData')}
                      </Link>
                      <Link 
                        href="/regional-trade"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {t('markets.regionalTrade')}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {/* AI Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('ai')}
                  className="flex items-center space-x-1 px-1 text-sm text-gray-600 hover:text-blue-600 h-full border-b-2 border-transparent hover:border-blue-500 transition-all"
                >
                  <span>{t('navigation.ai')}</span>
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>
                
                {openDropdown === 'ai' && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <Link 
                        href="/ai-guidance"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {t('ai.aiGuidance')}
                      </Link>
                      <Link 
                        href="/ai-predictions"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {t('ai.aiPredictions')}
                      </Link>
                      <Link 
                        href="/visualizations"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {t('ai.visualizations')}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Programs Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('programs')}
                  className="flex items-center space-x-1 px-1 text-sm text-gray-600 hover:text-blue-600 h-full border-b-2 border-transparent hover:border-blue-500 transition-all"
                >
                  <span>{t('navigation.programs')}</span>
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>
                
                {openDropdown === 'programs' && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <Link 
                        href="/trade-zones"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {t('programs.tradeZones')}
                      </Link>
                      <Link 
                        href="/subscribe"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {t('programs.subscribe')}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Workspace Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('workspace')}
                  className="flex items-center space-x-1 px-1 text-sm text-gray-600 hover:text-blue-600 h-full border-b-2 border-transparent hover:border-blue-500 transition-all"
                >
                  <span>Workspace</span>
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>
                
                {openDropdown === 'workspace' && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <Link 
                        href="/calculation-history"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Calculation History
                      </Link>
                      <Link 
                        href="/templates"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Templates
                      </Link>
                      <Link 
                        href="/documents"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Documents
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
