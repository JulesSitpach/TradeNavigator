import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, AuthContext } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";
import { useContext } from "react";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import ProductAnalysis from "@/pages/product-analysis";
import Products from "@/pages/products";
import Shipments from "@/pages/shipments";
import TariffLookup from "@/pages/tariff-lookup";
import MarketAnalysis from "@/pages/market-analysis";
import Reports from "@/pages/reports";
import Profile from "@/pages/profile";
import Subscription from "@/pages/subscription";
import SpecialPrograms from "@/pages/special-programs";

// Dashboard pages
import CostBreakdownDashboard from "@/pages/dashboard/cost-breakdown-complete";
import AlternativeRoutesDashboard from "@/pages/dashboard/alternative-routes";
import NewAnalysis from "@/pages/dashboard/new-analysis";

function PrivateRoute({ component: Component, ...rest }: { component: React.ComponentType<any>; path: string; exact?: boolean }) {
  // For development, we'll allow access to routes without authentication
  const isDevelopment = import.meta.env.DEV;
  const { user, loading } = useContext(AuthContext);
  
  return (
    <Route
      {...rest}
      component={(props: any) => {
        // During development, show the component regardless of auth state
        if (isDevelopment || user) {
          return (
            <Layout>
              <Component {...props} />
            </Layout>
          );
        }
        
        // In production, redirect to login if not authenticated
        return <Redirect to="/login" />;
      }}
    />
  );
}

function PublicOnlyRoute({ component: Component, ...rest }: { component: React.ComponentType<any>; path: string; exact?: boolean }) {
  return (
    <Route
      {...rest}
      component={(props: any) => <Component {...props} />}
    />
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <PublicOnlyRoute exact path="/login" component={Login} />
      <PublicOnlyRoute exact path="/register" component={Register} />
      
      {/* Private routes */}
      <PrivateRoute exact path="/" component={Dashboard} />
      <PrivateRoute exact path="/dashboard" component={Dashboard} />
      <PrivateRoute exact path="/products" component={Products} />
      <PrivateRoute exact path="/shipments" component={Shipments} />
      <PrivateRoute exact path="/product-analysis" component={ProductAnalysis} />
      <PrivateRoute exact path="/tariff-lookup" component={TariffLookup} />
      <PrivateRoute exact path="/market-analysis" component={MarketAnalysis} />
      <PrivateRoute exact path="/reports" component={Reports} />
      <PrivateRoute exact path="/profile" component={Profile} />
      <PrivateRoute exact path="/subscription" component={Subscription} />
      <PrivateRoute exact path="/special-programs" component={SpecialPrograms} />
      
      {/* Dashboard Flexible Tabs Routes */}
      <PrivateRoute exact path="/dashboard/overview" component={Dashboard} />
      <PrivateRoute exact path="/dashboard/cost-breakdown" component={CostBreakdownDashboard} />
      <PrivateRoute exact path="/dashboard/alternative-routes" component={AlternativeRoutesDashboard} />
      <PrivateRoute exact path="/dashboard/tariff-analysis" component={Dashboard} />
      <PrivateRoute exact path="/dashboard/regulations" component={Dashboard} />
      <PrivateRoute exact path="/dashboard/visualizations" component={Dashboard} />
      <PrivateRoute exact path="/dashboard/exemptions" component={Dashboard} />
      <PrivateRoute exact path="/dashboard/duty-drawback" component={Dashboard} />
      <PrivateRoute exact path="/dashboard/special-programs" component={SpecialPrograms} />
      <PrivateRoute exact path="/dashboard/market-analysis" component={MarketAnalysis} />
      <PrivateRoute exact path="/dashboard/trade-partners" component={Dashboard} />
      <PrivateRoute exact path="/dashboard/ai-predictions" component={Dashboard} />
      <PrivateRoute exact path="/dashboard/new-analysis" component={NewAnalysis} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
