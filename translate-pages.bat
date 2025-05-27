@echo off
REM TradeNavigator Translation Integration Script for Windows

echo TradeNavigator Translation Integration Helper
echo ============================================
echo.

REM Manual instructions since batch scripting is limited
echo MANUAL STEPS TO ADD TRANSLATIONS TO EACH PAGE:
echo.
echo 1. Add import at the top of each page file:
echo    import { useMasterTranslation } from "@/utils/masterTranslation";
echo.
echo 2. Add hook inside your component:
echo    const { t } = useMasterTranslation();
echo.
echo 3. Replace hardcoded text with translation keys:
echo    BEFORE: ^<h1^>Markets Analysis^</h1^>
echo    AFTER:  ^<h1^>{t('markets.marketsAnalysis')}^</h1^>
echo.
echo ============================================
echo TRANSLATION KEY REFERENCE:
echo.
echo Common translations:
echo   t('common.loading')         - Loading...
echo   t('common.error')          - Error
echo   t('common.success')        - Success
echo   t('common.save')           - Save
echo   t('common.cancel')         - Cancel
echo   t('common.submit')         - Submit
echo   t('common.getStarted')     - Get Started
echo   t('common.learnMore')      - Learn More
echo.
echo Navigation:
echo   t('navigation.overview')    - Overview
echo   t('navigation.dashboard')   - Dashboard
echo   t('navigation.tools')       - Tools
echo   t('navigation.markets')     - Markets
echo   t('navigation.regulations') - Regulations
echo   t('navigation.ai')          - AI
echo   t('navigation.programs')    - Programs
echo.
echo Tools:
echo   t('tools.costBreakdown')    - Cost Breakdown
echo   t('tools.routeAnalysis')    - Route Analysis
echo   t('tools.tariffAnalysis')   - Tariff Analysis
echo.
echo Markets:
echo   t('markets.marketsAnalysis')       - Markets Analysis
echo   t('markets.generateReport')        - Generate Market Report
echo   t('markets.growingMarkets')        - Growing Markets
echo   t('markets.activeMarkets')         - Active Markets
echo   t('markets.marketValue')           - Market Value
echo   t('markets.marketOpportunities')   - Market Opportunities
echo.
echo Regions:
echo   t('regions.northAmerica')   - North America
echo   t('regions.europe')         - Europe
echo   t('regions.asia')           - Asia
echo   t('regions.latinAmerica')   - Latin America
echo.
echo ============================================
echo.
echo Pages that need translation updates:
echo - client\src\pages\overview.tsx
echo - client\src\pages\dashboard.tsx
echo - client\src\pages\cost-breakdown.tsx
echo - client\src\pages\route-analysis.tsx
echo - client\src\pages\tariff-analysis.tsx
echo - client\src\pages\regulations.tsx
echo - client\src\pages\compliance-requirements.tsx
echo - client\src\pages\trade-regulations.tsx
echo - client\src\pages\legal-frameworks.tsx
echo - client\src\pages\special-programs.tsx
echo - client\src\pages\pricing-data.tsx
echo - client\src\pages\regional-trade.tsx
echo - client\src\pages\ai-guidance.tsx
echo - client\src\pages\ai-predictions.tsx
echo - client\src\pages\visualizations.tsx
echo - client\src\pages\trade-zones.tsx
echo - client\src\pages\features.tsx
echo - client\src\pages\pricing.tsx
echo - client\src\pages\documents.tsx
echo - client\src\pages\templates.tsx
echo - client\src\pages\calculation-history.tsx
echo - client\src\pages\subscribe.tsx
echo.
pause
