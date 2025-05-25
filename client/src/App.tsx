import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";


import Home from "@/pages/home";
import Subscribe from "@/pages/subscribe";
import NotFound from "@/pages/not-found";
import Overview from "@/pages/overview";
import RouteAnalysis from "@/pages/route-analysis";
import TariffAnalysis from "@/pages/tariff-analysis";
import Regulations from "@/pages/regulations";
import SpecialPrograms from "@/pages/special-programs";
import MarketsAnalysis from "@/pages/markets-analysis";
import AiGuidance from "@/pages/ai-guidance";
import TradeZones from "@/pages/trade-zones";
import AiPredictions from "@/pages/ai-predictions";
import Visualizations from "@/pages/visualizations";
import CostBreakdown from "@/pages/cost-breakdown";
import PricingData from "@/pages/pricing-data";
import RegionalTrade from "@/pages/regional-trade";
import ComplianceRequirements from "@/pages/compliance-requirements";
import TradeRegulations from "@/pages/trade-regulations";
import LegalFrameworks from "@/pages/legal-frameworks";
import Features from "@/pages/features";
import Pricing from "@/pages/pricing";
import Documents from "@/pages/documents";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public pages - always accessible */}
      <Route path="/features" component={Features} />
      <Route path="/pricing" component={Pricing} />
      
      <>
        <Route path="/" component={Overview} />
        <Route path="/overview" component={Overview} />
          <Route path="/cost-breakdown" component={CostBreakdown} />
          <Route path="/route-analysis" component={RouteAnalysis} />
          <Route path="/tariff-analysis" component={TariffAnalysis} />
          <Route path="/regulations" component={Regulations} />
          <Route path="/compliance-requirements" component={ComplianceRequirements} />
          <Route path="/trade-regulations" component={TradeRegulations} />
          <Route path="/legal-frameworks" component={LegalFrameworks} />
          <Route path="/special-programs" component={SpecialPrograms} />
          <Route path="/markets-analysis" component={MarketsAnalysis} />
          <Route path="/pricing-data" component={PricingData} />
          <Route path="/regional-trade" component={RegionalTrade} />
          <Route path="/ai-guidance" component={AiGuidance} />
          <Route path="/ai-predictions" component={AiPredictions} />
          <Route path="/visualizations" component={Visualizations} />
          <Route path="/trade-zones" component={TradeZones} />
          <Route path="/subscribe" component={Subscribe} />
      </>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
