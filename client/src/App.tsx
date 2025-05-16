import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";
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

function PrivateRoute({ component: Component, ...rest }) {
  // For development, we'll allow access to routes without authentication
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return (
    <Route
      {...rest}
      component={(props) => (
        <Layout>
          <Component {...props} />
        </Layout>
      )}
    />
  );
}

function PublicOnlyRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      component={(props) => <Component {...props} />}
    />
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <PublicOnlyRoute path="/login" component={Login} />
      <PublicOnlyRoute path="/register" component={Register} />
      
      {/* Private routes */}
      <PrivateRoute path="/" component={Dashboard} />
      <PrivateRoute path="/products" component={Products} />
      <PrivateRoute path="/shipments" component={Shipments} />
      <PrivateRoute path="/product-analysis" component={ProductAnalysis} />
      <PrivateRoute path="/tariff-lookup" component={TariffLookup} />
      <PrivateRoute path="/market-analysis" component={MarketAnalysis} />
      <PrivateRoute path="/reports" component={Reports} />
      <PrivateRoute path="/profile" component={Profile} />
      <PrivateRoute path="/subscription" component={Subscription} />
      <PrivateRoute path="/special-programs" component={SpecialPrograms} />
      
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
