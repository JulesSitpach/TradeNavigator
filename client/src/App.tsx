import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, AuthContext } from "@/contexts/AuthContext";
import { AnalysisProvider } from "@/contexts/AnalysisContext";
import { CostBreakdownProvider } from "@/contexts/shared/CostBreakdownContext";
import Layout from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";
import { useContext, lazy, Suspense } from "react";

// Lazy load page components to improve initial load time
const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const ProductAnalysis = lazy(() => import("@/pages/product-analysis"));
const Products = lazy(() => import("@/pages/products"));
const Shipments = lazy(() => import("@/pages/shipments"));
const TariffLookup = lazy(() => import("@/pages/tariff-lookup"));
const MarketAnalysis = lazy(() => import("@/pages/market-analysis"));
const Reports = lazy(() => import("@/pages/reports"));
const Profile = lazy(() => import("@/pages/profile"));
const Subscription = lazy(() => import("@/pages/subscription"));
const SpecialPrograms = lazy(() => import("@/pages/special-programs"));
const SpecialProgramsRedesigned = lazy(() => import("@/pages/dashboard/special-programs-redesigned"));
const SimpleTradeCostBreakdown = lazy(() => import("@/pages/dashboard/simple-trade-cost-breakdown"));

// Dashboard pages - lazy loaded
const CostBreakdownDashboard = lazy(() => import("@/pages/dashboard/cost-breakdown-fixed"));
const CostBreakdownOriginal = lazy(() => import("@/pages/dashboard/cost-breakdown"));
const CostBreakdownNew = lazy(() => import("@/pages/dashboard/cost-breakdown-new"));
const AlternativeRoutesDashboard = lazy(() => import("@/pages/dashboard/alternative-routes"));
const TariffAnalysisDashboard = lazy(() => import("@/pages/dashboard/tariff-analysis"));
const RegulationsDashboard = lazy(() => import("@/pages/dashboard/regulations"));
const NewAnalysis = lazy(() => import("@/pages/dashboard/new-analysis"));
const ProductInfoForm = lazy(() => import("@/pages/dashboard/product-info-form"));
const MainCostBreakdown = lazy(() => import("@/main/cost-breakdown"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
    <span className="ml-3 text-lg font-medium">Loading...</span>
  </div>
);

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
              <Suspense fallback={<LoadingFallback />}>
                <Component {...props} />
              </Suspense>
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
      component={(props: any) => (
        <Suspense fallback={<LoadingFallback />}>
          <Component {...props} />
        </Suspense>
      )}
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
      <PrivateRoute exact path="/dashboard/cost-breakdown" component={MainCostBreakdown} />
      <PrivateRoute exact path="/dashboard/alternative-routes" component={AlternativeRoutesDashboard} />
      <PrivateRoute exact path="/dashboard/tariff-analysis" component={TariffAnalysisDashboard} />
      <PrivateRoute exact path="/dashboard/regulations" component={RegulationsDashboard} />
      <PrivateRoute exact path="/dashboard/visualizations" component={Dashboard} />
      <PrivateRoute exact path="/dashboard/exemptions" component={Dashboard} />
      <PrivateRoute exact path="/dashboard/duty-drawback" component={Dashboard} />
      <PrivateRoute exact path="/dashboard/special-programs" component={SpecialPrograms} />
      <PrivateRoute exact path="/dashboard/special-programs-redesigned" component={SpecialProgramsRedesigned} />
      <PrivateRoute exact path="/dashboard/market-analysis" component={MarketAnalysis} />
      <PrivateRoute exact path="/dashboard/trade-partners" component={Dashboard} />
      <PrivateRoute exact path="/dashboard/ai-predictions" component={Dashboard} />
      <PrivateRoute exact path="/dashboard/new-analysis" component={NewAnalysis} />
      <PrivateRoute exact path="/dashboard/product-info" component={ProductInfoForm} />
      <PrivateRoute exact path="/dashboard/new-cost-form" component={MainCostBreakdown} />
      
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
          <AnalysisProvider>
            <CostBreakdownProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </CostBreakdownProvider>
          </AnalysisProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
