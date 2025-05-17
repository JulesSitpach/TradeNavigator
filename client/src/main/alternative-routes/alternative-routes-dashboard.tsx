/**
 * @component Alternative Routes Dashboard
 * @status PRODUCTION
 * @version 1.0
 * @lastModified 2025-05-17
 * @description Dashboard for comparing and analyzing different shipping routes and transport modes.
 *              Helps users identify optimal shipping pathways and modes by comparing costs,
 *              transit times, and risks across different options.
 */

import { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisContext } from "@/contexts/AnalysisContext";
import { useToast } from "@/hooks/use-toast";
import { BarChart, PieChart, LineChart, Bar, Pie, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Plane, Ship, Truck, Clock, DollarSign, AlertTriangle, MapPin, Calendar, BarChart3 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";

// Define route option types
interface RouteOption {
  id: string;
  name: string;
  mode: 'air' | 'sea' | 'rail' | 'road';
  carrier: string;
  transitTime: {
    min: number;
    max: number;
    unit: 'days' | 'hours';
  };
  costs: {
    freightCost: number;
    insuranceCost: number;
    handlingCost: number;
    customsCost: number;
    otherCosts: number;
    total: number;
  };
  risks: {
    delay: 'low' | 'medium' | 'high';
    damage: 'low' | 'medium' | 'high';
    compliance: 'low' | 'medium' | 'high';
    overall: number; // 1-10 scale
  };
  cashFlow: {
    upfrontPayment: number;
    paymentOnDelivery: number;
    financingCost: number;
  };
  emissions: number; // CO2 equivalent in kg
  routeSteps: {
    name: string;
    duration: number;
    type: 'documentation' | 'freight' | 'customs' | 'handling' | 'delivery';
  }[];
}

const AlternativeRoutesDashboard = () => {
  const { toast } = useToast();
  const analysisContext = useContext(AnalysisContext);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);
  
  useEffect(() => {
    // Import enhanced utility functions for reliable data access
    import('@/utils/analysisDataHelper').then(({ getAnalysisData, isValidAnalysisData, getAnalysisDataErrorMessage }) => {
      // Get analysis data with fallback to localStorage if needed
      const analysisData = getAnalysisData(analysisContext);
      
      // Check if we have valid data
      if (analysisData && isValidAnalysisData(analysisData)) {
        console.log('Alternative Routes Dashboard: Analysis data loaded successfully');
        setCurrentAnalysis(analysisData);
        
        // Generate route options based on the valid analysis data
        generateRouteOptions(analysisData);
      } else {
        console.warn('Alternative Routes Dashboard: No valid analysis data available');
        toast(getAnalysisDataErrorMessage());
      }
    });
  }, [analysisContext?.currentAnalysis]);
  
  // Generate alternative route options based on the current analysis
  const generateRouteOptions = (analysis: any) => {
    if (!analysis) {
      return;
    }
    
    setIsLoading(true);
    
    // Extract relevant data from the analysis
    const { 
      originCountry, 
      destinationCountry, 
      productValue, 
      weight, 
      length, 
      width, 
      height,
      transportMode: currentMode
    } = analysis.formValues;
    
    const currentFreightCost = analysis.results.components.find((c: any) => 
      c.name === "Freight" || c.name === "Transportation"
    )?.value || 0;
    
    const totalCost = analysis.results.totalCost || 0;
    
    // Calculate volume in cubic meters
    const volume = (parseFloat(length) * parseFloat(width) * parseFloat(height)) / 1000000;
    const weightInKg = parseFloat(weight);
    const valueInUSD = parseFloat(productValue);
    
    // Generate alternative route options
    const generatedOptions: RouteOption[] = [];
    
    // Current option (based on the analysis)
    const currentOption: RouteOption = {
      id: "current",
      name: `Current ${currentMode} Route`,
      mode: currentMode.toLowerCase() as any,
      carrier: `Standard ${currentMode} Carrier`,
      transitTime: {
        min: currentMode === "Air" ? 3 : currentMode === "Sea" ? 25 : 12,
        max: currentMode === "Air" ? 5 : currentMode === "Sea" ? 35 : 18,
        unit: "days"
      },
      costs: {
        freightCost: currentFreightCost,
        insuranceCost: analysis.results.components.find((c: any) => c.name === "Insurance")?.value || (totalCost * 0.02),
        handlingCost: totalCost * 0.05,
        customsCost: analysis.results.components.find((c: any) => c.name === "Customs Clearance")?.value || (totalCost * 0.03),
        otherCosts: totalCost * 0.02,
        total: totalCost
      },
      risks: {
        delay: currentMode === "Air" ? "low" : currentMode === "Sea" ? "medium" : "medium",
        damage: currentMode === "Air" ? "low" : currentMode === "Sea" ? "medium" : "medium",
        compliance: "low",
        overall: currentMode === "Air" ? 3 : currentMode === "Sea" ? 5 : 4
      },
      cashFlow: {
        upfrontPayment: totalCost * 0.4,
        paymentOnDelivery: totalCost * 0.6,
        financingCost: totalCost * 0.03
      },
      emissions: currentMode === "Air" ? weightInKg * 2.1 : currentMode === "Sea" ? weightInKg * 0.04 : weightInKg * 0.3,
      routeSteps: [
        { name: "Documentation", duration: 2, type: "documentation" },
        { name: `${currentMode} Transit`, duration: currentMode === "Air" ? 4 : currentMode === "Sea" ? 30 : 15, type: "freight" },
        { name: "Customs Clearance", duration: 1, type: "customs" },
        { name: "Last Mile Delivery", duration: 1, type: "delivery" }
      ]
    };
    
    generatedOptions.push(currentOption);
    
    // Generate alternative options
    if (currentMode !== "Air") {
      // Air option
      generatedOptions.push({
        id: "air",
        name: "Express Air Freight",
        mode: "air",
        carrier: "Premium Air Carrier",
        transitTime: {
          min: 2,
          max: 4,
          unit: "days"
        },
        costs: {
          freightCost: currentFreightCost * 2.8,
          insuranceCost: totalCost * 0.025,
          handlingCost: totalCost * 0.05,
          customsCost: totalCost * 0.03,
          otherCosts: totalCost * 0.02,
          total: totalCost * 1.6
        },
        risks: {
          delay: "low",
          damage: "low",
          compliance: "low",
          overall: 2
        },
        cashFlow: {
          upfrontPayment: totalCost * 1.6 * 0.6,
          paymentOnDelivery: totalCost * 1.6 * 0.4,
          financingCost: totalCost * 1.6 * 0.02
        },
        emissions: weightInKg * 2.1,
        routeSteps: [
          { name: "Documentation", duration: 1, type: "documentation" },
          { name: "Air Transit", duration: 3, type: "freight" },
          { name: "Customs Clearance", duration: 0.5, type: "customs" },
          { name: "Last Mile Delivery", duration: 0.5, type: "delivery" }
        ]
      });
    }
    
    if (currentMode !== "Sea" && weightInKg > 500) {
      // Sea option
      generatedOptions.push({
        id: "sea",
        name: "Economy Sea Freight",
        mode: "sea",
        carrier: "Standard Sea Line",
        transitTime: {
          min: 25,
          max: 35,
          unit: "days"
        },
        costs: {
          freightCost: currentFreightCost * 0.6,
          insuranceCost: totalCost * 0.02,
          handlingCost: totalCost * 0.04,
          customsCost: totalCost * 0.03,
          otherCosts: totalCost * 0.01,
          total: totalCost * 0.7
        },
        risks: {
          delay: "high",
          damage: "medium",
          compliance: "low",
          overall: 6
        },
        cashFlow: {
          upfrontPayment: totalCost * 0.7 * 0.3,
          paymentOnDelivery: totalCost * 0.7 * 0.7,
          financingCost: totalCost * 0.7 * 0.04
        },
        emissions: weightInKg * 0.04,
        routeSteps: [
          { name: "Documentation", duration: 3, type: "documentation" },
          { name: "Sea Transit", duration: 30, type: "freight" },
          { name: "Port Handling", duration: 2, type: "handling" },
          { name: "Customs Clearance", duration: 2, type: "customs" },
          { name: "Inland Transit", duration: 1, type: "freight" },
          { name: "Last Mile Delivery", duration: 1, type: "delivery" }
        ]
      });
    }
    
    if (currentMode !== "Rail" && originCountry && destinationCountry) {
      // Check if rail is feasible between these countries
      const railFeasible = checkRailFeasibility(originCountry, destinationCountry);
      
      if (railFeasible) {
        generatedOptions.push({
          id: "rail",
          name: "Rail Freight",
          mode: "rail",
          carrier: "International Rail Service",
          transitTime: {
            min: 12,
            max: 18,
            unit: "days"
          },
          costs: {
            freightCost: currentFreightCost * 0.8,
            insuranceCost: totalCost * 0.02,
            handlingCost: totalCost * 0.04,
            customsCost: totalCost * 0.03,
            otherCosts: totalCost * 0.02,
            total: totalCost * 0.85
          },
          risks: {
            delay: "medium",
            damage: "low",
            compliance: "medium",
            overall: 4
          },
          cashFlow: {
            upfrontPayment: totalCost * 0.85 * 0.4,
            paymentOnDelivery: totalCost * 0.85 * 0.6,
            financingCost: totalCost * 0.85 * 0.03
          },
          emissions: weightInKg * 0.06,
          routeSteps: [
            { name: "Documentation", duration: 2, type: "documentation" },
            { name: "Rail Transit", duration: 14, type: "freight" },
            { name: "Terminal Handling", duration: 1, type: "handling" },
            { name: "Customs Clearance", duration: 1, type: "customs" },
            { name: "Last Mile Delivery", duration: 1, type: "delivery" }
          ]
        });
      }
    }
    
    // Add a road option for regional transport
    if (currentMode !== "Road" && weightInKg < 2000) {
      const isRegional = checkRegionalProximity(originCountry, destinationCountry);
      
      if (isRegional) {
        generatedOptions.push({
          id: "road",
          name: "Road Freight",
          mode: "road",
          carrier: "International Trucking",
          transitTime: {
            min: 5,
            max: 10,
            unit: "days"
          },
          costs: {
            freightCost: currentFreightCost * 0.9,
            insuranceCost: totalCost * 0.015,
            handlingCost: totalCost * 0.02,
            customsCost: totalCost * 0.03,
            otherCosts: totalCost * 0.01,
            total: totalCost * 0.9
          },
          risks: {
            delay: "medium",
            damage: "medium",
            compliance: "medium",
            overall: 5
          },
          cashFlow: {
            upfrontPayment: totalCost * 0.9 * 0.3,
            paymentOnDelivery: totalCost * 0.9 * 0.7,
            financingCost: totalCost * 0.9 * 0.02
          },
          emissions: weightInKg * 0.2,
          routeSteps: [
            { name: "Documentation", duration: 1, type: "documentation" },
            { name: "Road Transit", duration: 7, type: "freight" },
            { name: "Border Crossing", duration: 1, type: "customs" },
            { name: "Last Mile Delivery", duration: 0.5, type: "delivery" }
          ]
        });
      }
    }
    
    setRouteOptions(generatedOptions);
    
    // Initialize with the first two options selected for comparison
    if (generatedOptions.length >= 2) {
      setSelectedRouteIds([generatedOptions[0].id, generatedOptions[1].id]);
    } else if (generatedOptions.length === 1) {
      setSelectedRouteIds([generatedOptions[0].id]);
    }
    
    setIsLoading(false);
  };
  
  // Check if rail is feasible between countries
  const checkRailFeasibility = (origin: string, destination: string): boolean => {
    // This is a simplified version - in a real app, this would check actual rail connectivity
    const railConnectedRegions = [
      ["China", "Russia", "Kazakhstan", "Mongolia", "Europe"],
      ["Europe", "UK", "France", "Germany", "Poland", "Italy", "Spain"],
      ["US", "Canada", "Mexico"]
    ];
    
    for (const region of railConnectedRegions) {
      if (region.includes(origin) && region.includes(destination)) {
        return true;
      }
    }
    
    return false;
  };
  
  // Check if countries are in regional proximity
  const checkRegionalProximity = (origin: string, destination: string): boolean => {
    // This is a simplified version - in a real app, this would check actual geography
    const regions = [
      ["US", "Canada", "Mexico"],
      ["Germany", "France", "Italy", "Spain", "UK", "Netherlands", "Belgium", "Luxembourg", "Switzerland", "Austria"],
      ["China", "Japan", "South Korea", "Vietnam", "Thailand", "Malaysia", "Singapore"],
      ["Brazil", "Argentina", "Chile", "Uruguay", "Paraguay"]
    ];
    
    for (const region of regions) {
      if (region.includes(origin) && region.includes(destination)) {
        return true;
      }
    }
    
    return false;
  };
  
  // Toggle route selection for comparison
  const toggleRouteSelection = (routeId: string) => {
    if (selectedRouteIds.includes(routeId)) {
      // Remove from selection if already selected
      setSelectedRouteIds(selectedRouteIds.filter(id => id !== routeId));
    } else {
      // Add to selection if not already selected
      // Limit to comparing at most 3 routes
      if (selectedRouteIds.length < 3) {
        setSelectedRouteIds([...selectedRouteIds, routeId]);
      } else {
        toast({
          title: "Selection Limit",
          description: "You can compare up to 3 routes at a time.",
          variant: "warning"
        });
      }
    }
  };
  
  // Get selected routes for comparison
  const getSelectedRoutes = (): RouteOption[] => {
    return routeOptions.filter(route => selectedRouteIds.includes(route.id));
  };
  
  // Format data for cost comparison chart
  const getCostComparisonData = () => {
    const selectedRoutes = getSelectedRoutes();
    
    return [
      {
        name: "Freight",
        ...selectedRoutes.reduce((acc, route) => ({
          ...acc,
          [route.name]: route.costs.freightCost
        }), {})
      },
      {
        name: "Insurance",
        ...selectedRoutes.reduce((acc, route) => ({
          ...acc,
          [route.name]: route.costs.insuranceCost
        }), {})
      },
      {
        name: "Handling",
        ...selectedRoutes.reduce((acc, route) => ({
          ...acc,
          [route.name]: route.costs.handlingCost
        }), {})
      },
      {
        name: "Customs",
        ...selectedRoutes.reduce((acc, route) => ({
          ...acc,
          [route.name]: route.costs.customsCost
        }), {})
      },
      {
        name: "Other",
        ...selectedRoutes.reduce((acc, route) => ({
          ...acc,
          [route.name]: route.costs.otherCosts
        }), {})
      }
    ];
  };
  
  // Format data for transit time comparison
  const getTransitTimeComparisonData = () => {
    const selectedRoutes = getSelectedRoutes();
    
    return selectedRoutes.map(route => ({
      name: route.name,
      min: route.transitTime.min,
      max: route.transitTime.max,
      average: (route.transitTime.min + route.transitTime.max) / 2
    }));
  };
  
  // Get risk rating text
  const getRiskText = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'Low Risk';
      case 'medium': return 'Medium Risk';
      case 'high': return 'High Risk';
      default: return 'Unknown';
    }
  };
  
  // Get risk rating color
  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };
  
  // Get transport mode icon
  const getTransportIcon = (mode: 'air' | 'sea' | 'rail' | 'road') => {
    switch (mode) {
      case 'air': return <Plane className="h-5 w-5" />;
      case 'sea': return <Ship className="h-5 w-5" />;
      case 'rail': return <div className="h-5 w-5 flex items-center justify-center">🚆</div>;
      case 'road': return <Truck className="h-5 w-5" />;
      default: return <Truck className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <PageHeader 
        title="Alternative Routes Analysis" 
        description="Compare different shipping routes and transport modes to optimize your logistics strategy."
        icon={<MapPin className="h-6 w-6 text-blue-600" />}
      />
      
      {isLoading ? (
        <Card className="w-full my-6">
          <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Analyzing possible routes...</p>
            </div>
          </CardContent>
        </Card>
      ) : !currentAnalysis ? (
        <Card className="w-full my-6">
          <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Analysis Data Available</h3>
              <p className="text-gray-500 mb-4">Please complete a cost analysis first to view alternative routes.</p>
              <Button onClick={() => window.location.href = '/dashboard/cost-breakdown'}>
                Go to Cost Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Route Selection Cards */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Available Route Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {routeOptions.map((route) => (
                <Card 
                  key={route.id} 
                  className={`cursor-pointer transition ${
                    selectedRouteIds.includes(route.id) 
                      ? 'border-2 border-blue-500 shadow-md' 
                      : 'border border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => toggleRouteSelection(route.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${
                          route.mode === 'air' 
                            ? 'bg-blue-100 text-blue-700' 
                            : route.mode === 'sea' 
                              ? 'bg-teal-100 text-teal-700'
                              : route.mode === 'rail'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}>
                          {getTransportIcon(route.mode)}
                        </div>
                        <div>
                          <h3 className="font-medium">{route.name}</h3>
                          <p className="text-sm text-gray-500">{route.carrier}</p>
                        </div>
                      </div>
                      {selectedRouteIds.includes(route.id) && (
                        <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Transit Time:</p>
                        <p className="font-medium flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                          {route.transitTime.min}-{route.transitTime.max} {route.transitTime.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Cost:</p>
                        <p className="font-medium flex items-center">
                          <DollarSign className="h-3.5 w-3.5 mr-1 text-gray-400" />
                          ${route.costs.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Risk Level:</p>
                        <p className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center ${getRiskColor(route.risks.delay)}`}>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {getRiskText(route.risks.delay)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">CO₂ Emissions:</p>
                        <p className="font-medium">
                          {route.emissions < 100 
                            ? route.emissions.toFixed(1) 
                            : Math.round(route.emissions)} kg
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Detailed Comparison of Selected Routes */}
          {selectedRouteIds.length > 0 && (
            <div className="space-y-6">
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full max-w-lg grid-cols-5">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="costs">Costs</TabsTrigger>
                  <TabsTrigger value="time">Transit Time</TabsTrigger>
                  <TabsTrigger value="risks">Risks</TabsTrigger>
                  <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
                </TabsList>
                
                {/* Summary Tab */}
                <TabsContent value="summary">
                  <Card>
                    <CardHeader>
                      <CardTitle>Route Comparison Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {getSelectedRoutes().map(route => (
                            <Card key={route.id} className="shadow-sm">
                              <CardHeader className={`py-4 px-6 ${
                                route.mode === 'air' 
                                  ? 'bg-blue-50 border-b border-blue-100' 
                                  : route.mode === 'sea' 
                                    ? 'bg-teal-50 border-b border-teal-100'
                                    : route.mode === 'rail'
                                      ? 'bg-amber-50 border-b border-amber-100'
                                      : 'bg-gray-50 border-b border-gray-100'
                              }`}>
                                <div className="flex items-center">
                                  <div className={`p-2 rounded-full mr-3 ${
                                    route.mode === 'air' 
                                      ? 'bg-blue-100 text-blue-700' 
                                      : route.mode === 'sea' 
                                        ? 'bg-teal-100 text-teal-700'
                                        : route.mode === 'rail'
                                          ? 'bg-amber-100 text-amber-700'
                                          : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {getTransportIcon(route.mode)}
                                  </div>
                                  <div>
                                    <CardTitle className="text-lg">{route.name}</CardTitle>
                                    <p className="text-sm text-gray-500">{route.carrier}</p>
                                  </div>
                                </div>
                              </CardHeader>
                              
                              <CardContent className="p-6">
                                <div className="space-y-4">
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Total Cost:</span>
                                    <span className="font-bold">${route.costs.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                  </div>
                                  
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Transit Time:</span>
                                    <span>{route.transitTime.min}-{route.transitTime.max} {route.transitTime.unit}</span>
                                  </div>
                                  
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Risk Level:</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskColor(route.risks.delay)}`}>
                                      {getRiskText(route.risks.delay)}
                                    </span>
                                  </div>
                                  
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">CO₂ Emissions:</span>
                                    <span>{route.emissions < 100 ? route.emissions.toFixed(1) : Math.round(route.emissions)} kg</span>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Route Timeline:</h4>
                                    <div className="space-y-2">
                                      {route.routeSteps.map((step, index) => (
                                        <div key={index} className="flex items-center">
                                          <div className={`h-3 w-3 rounded-full mr-2 ${
                                            step.type === 'documentation' ? 'bg-purple-500' :
                                            step.type === 'freight' ? 'bg-blue-500' :
                                            step.type === 'customs' ? 'bg-amber-500' :
                                            step.type === 'handling' ? 'bg-teal-500' : 'bg-gray-500'
                                          }`}></div>
                                          <span className="flex-1 text-sm">{step.name}</span>
                                          <span className="text-sm text-gray-500">{step.duration} {step.duration === 1 ? 'day' : 'days'}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        
                        {/* Recommendation Section */}
                        <Card className="border-blue-100 bg-blue-50">
                          <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-3 text-blue-800">Recommendations</h3>
                            <div className="space-y-3">
                              {getSelectedRoutes().length > 0 && (
                                <>
                                  {/* Cost Recommendation */}
                                  <div className="flex items-start">
                                    <DollarSign className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                                    <div>
                                      <p className="font-medium text-blue-800">Cost Optimization:</p>
                                      <p className="text-blue-700">
                                        {(() => {
                                          const routes = getSelectedRoutes();
                                          const lowestCostRoute = routes.reduce((prev, current) => 
                                            prev.costs.total < current.costs.total ? prev : current
                                          );
                                          const highestCostRoute = routes.reduce((prev, current) => 
                                            prev.costs.total > current.costs.total ? prev : current
                                          );
                                          const savings = highestCostRoute.costs.total - lowestCostRoute.costs.total;
                                          
                                          return `${lowestCostRoute.name} offers the lowest total cost at $${lowestCostRoute.costs.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}, saving up to $${savings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} compared to ${highestCostRoute.name}.`;
                                        })()}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Time Recommendation */}
                                  <div className="flex items-start">
                                    <Clock className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                                    <div>
                                      <p className="font-medium text-blue-800">Time Optimization:</p>
                                      <p className="text-blue-700">
                                        {(() => {
                                          const routes = getSelectedRoutes();
                                          const fastestRoute = routes.reduce((prev, current) => 
                                            prev.transitTime.min < current.transitTime.min ? prev : current
                                          );
                                          const slowestRoute = routes.reduce((prev, current) => 
                                            prev.transitTime.max > current.transitTime.max ? prev : current
                                          );
                                          const timeDiff = slowestRoute.transitTime.min - fastestRoute.transitTime.max;
                                          
                                          return `${fastestRoute.name} offers the fastest transit time at ${fastestRoute.transitTime.min}-${fastestRoute.transitTime.max} ${fastestRoute.transitTime.unit}, which is up to ${timeDiff > 0 ? timeDiff : slowestRoute.transitTime.max - fastestRoute.transitTime.min} days faster than ${slowestRoute.name}.`;
                                        })()}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Risk Recommendation */}
                                  <div className="flex items-start">
                                    <AlertTriangle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                                    <div>
                                      <p className="font-medium text-blue-800">Risk Management:</p>
                                      <p className="text-blue-700">
                                        {(() => {
                                          const routes = getSelectedRoutes();
                                          const lowestRiskRoute = routes.reduce((prev, current) => 
                                            prev.risks.overall < current.risks.overall ? prev : current
                                          );
                                          
                                          return `${lowestRiskRoute.name} offers the lowest overall risk profile with a rating of ${lowestRiskRoute.risks.overall}/10, minimizing chances of delay, damage, and compliance issues.`;
                                        })()}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Environmental Recommendation */}
                                  <div className="flex items-start">
                                    <div className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex items-center justify-center">🌱</div>
                                    <div>
                                      <p className="font-medium text-blue-800">Environmental Impact:</p>
                                      <p className="text-blue-700">
                                        {(() => {
                                          const routes = getSelectedRoutes();
                                          const lowestEmissionRoute = routes.reduce((prev, current) => 
                                            prev.emissions < current.emissions ? prev : current
                                          );
                                          const highestEmissionRoute = routes.reduce((prev, current) => 
                                            prev.emissions > current.emissions ? prev : current
                                          );
                                          const emissionDiff = highestEmissionRoute.emissions - lowestEmissionRoute.emissions;
                                          
                                          return `${lowestEmissionRoute.name} has the lowest carbon footprint at ${lowestEmissionRoute.emissions < 100 ? lowestEmissionRoute.emissions.toFixed(1) : Math.round(lowestEmissionRoute.emissions)} kg CO₂, which is ${Math.round(emissionDiff)} kg less than ${highestEmissionRoute.name}.`;
                                        })()}
                                      </p>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Costs Tab */}
                <TabsContent value="costs">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Breakdown Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Cost Breakdown Chart */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                          <h3 className="text-lg font-medium mb-4">Cost Component Comparison</h3>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={getCostComparisonData()}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                {getSelectedRoutes().map((route, index) => (
                                  <Bar 
                                    key={route.id} 
                                    dataKey={route.name} 
                                    fill={index === 0 ? "#3b82f6" : index === 1 ? "#14b8a6" : "#f59e0b"} 
                                  />
                                ))}
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        
                        {/* Total Cost Comparison */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                          <h3 className="text-lg font-medium mb-4">Total Cost Comparison</h3>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getSelectedRoutes().map(route => ({
                                    name: route.name,
                                    value: route.costs.total
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={true}
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {getSelectedRoutes().map((route, index) => (
                                    <Cell 
                                      key={route.id} 
                                      fill={index === 0 ? "#3b82f6" : index === 1 ? "#14b8a6" : "#f59e0b"} 
                                    />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        
                        {/* Detailed Cost Table */}
                        <div className="xl:col-span-2">
                          <h3 className="text-lg font-medium mb-4">Detailed Cost Analysis</h3>
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="py-3 px-4 text-left font-medium text-gray-500 uppercase tracking-wider border-b">Cost Component</th>
                                  {getSelectedRoutes().map(route => (
                                    <th key={route.id} className="py-3 px-4 text-left font-medium text-gray-500 uppercase tracking-wider border-b">
                                      {route.name}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                <tr>
                                  <td className="py-3 px-4 font-medium">Freight Cost</td>
                                  {getSelectedRoutes().map(route => (
                                    <td key={route.id} className="py-3 px-4">
                                      ${route.costs.freightCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td className="py-3 px-4 font-medium">Insurance</td>
                                  {getSelectedRoutes().map(route => (
                                    <td key={route.id} className="py-3 px-4">
                                      ${route.costs.insuranceCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td className="py-3 px-4 font-medium">Handling</td>
                                  {getSelectedRoutes().map(route => (
                                    <td key={route.id} className="py-3 px-4">
                                      ${route.costs.handlingCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td className="py-3 px-4 font-medium">Customs</td>
                                  {getSelectedRoutes().map(route => (
                                    <td key={route.id} className="py-3 px-4">
                                      ${route.costs.customsCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td className="py-3 px-4 font-medium">Other Costs</td>
                                  {getSelectedRoutes().map(route => (
                                    <td key={route.id} className="py-3 px-4">
                                      ${route.costs.otherCosts.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </td>
                                  ))}
                                </tr>
                                <tr className="bg-blue-50">
                                  <td className="py-3 px-4 font-bold">Total Cost</td>
                                  {getSelectedRoutes().map(route => (
                                    <td key={route.id} className="py-3 px-4 font-bold">
                                      ${route.costs.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </td>
                                  ))}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Transit Time Tab */}
                <TabsContent value="time">
                  <Card>
                    <CardHeader>
                      <CardTitle>Transit Time Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Transit Time Chart */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                          <h3 className="text-lg font-medium mb-4">Transit Time Comparison</h3>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={getTransitTimeComparisonData()}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                layout="vertical"
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="min" name="Minimum Days" fill="#3b82f6" />
                                <Bar dataKey="max" name="Maximum Days" fill="#93c5fd" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        
                        {/* Transit Timeline Breakdown */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                          <h3 className="text-lg font-medium mb-4">Transit Timeline Breakdown</h3>
                          {getSelectedRoutes().map(route => (
                            <div key={route.id} className="mb-6">
                              <div className="flex items-center mb-3">
                                <div className={`p-1.5 rounded-full mr-2 ${
                                  route.mode === 'air' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : route.mode === 'sea' 
                                      ? 'bg-teal-100 text-teal-700'
                                      : route.mode === 'rail'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {getTransportIcon(route.mode)}
                                </div>
                                <h4 className="font-medium">{route.name}</h4>
                              </div>
                              
                              <div className="relative">
                                <div className="absolute left-3 top-0 h-full w-0.5 bg-gray-200"></div>
                                {route.routeSteps.map((step, index) => {
                                  const totalTime = route.routeSteps.reduce((sum, step) => sum + step.duration, 0);
                                  const percentWidth = (step.duration / totalTime) * 100;
                                  
                                  return (
                                    <div key={index} className="ml-6 mb-4 relative">
                                      <div className="absolute -left-6 mt-1 h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                                      <div>
                                        <p className="font-medium">{step.name}</p>
                                        <p className="text-sm text-gray-500">{step.duration} {step.duration === 1 ? 'day' : 'days'}</p>
                                        <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                          <div 
                                            className={`h-full ${
                                              step.type === 'documentation' ? 'bg-purple-500' :
                                              step.type === 'freight' ? 'bg-blue-500' :
                                              step.type === 'customs' ? 'bg-amber-500' :
                                              step.type === 'handling' ? 'bg-teal-500' : 'bg-gray-500'
                                            }`}
                                            style={{ width: `${percentWidth}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Business Impact Analysis */}
                        <div className="xl:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                          <h3 className="text-lg font-medium mb-4">Business Impact Analysis</h3>
                          
                          <div className="space-y-4">
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                              <h4 className="text-blue-800 font-medium mb-2">Inventory Implications</h4>
                              <p className="text-blue-700">
                                {(() => {
                                  const routes = getSelectedRoutes();
                                  if (routes.length === 0) return "No routes selected for comparison.";
                                  
                                  const fastestRoute = routes.reduce((prev, current) => 
                                    prev.transitTime.min < current.transitTime.min ? prev : current
                                  );
                                  
                                  const slowestRoute = routes.reduce((prev, current) => 
                                    prev.transitTime.max > current.transitTime.max ? prev : current
                                  );
                                  
                                  const timeDiff = slowestRoute.transitTime.max - fastestRoute.transitTime.min;
                                  const productValue = currentAnalysis?.formValues?.productValue || 1000;
                                  const inventoryCarryCostPerDay = parseFloat(productValue) * 0.0001; // 1% per month inventory carrying cost
                                  const inventorySavings = inventoryCarryCostPerDay * timeDiff;
                                  
                                  return `Choosing ${fastestRoute.name} over ${slowestRoute.name} reduces transit time by up to ${timeDiff} days, allowing for reduced inventory carrying costs of approximately $${inventorySavings.toFixed(2)} per shipment and enabling more responsive inventory management.`;
                                })()}
                              </p>
                            </div>
                            
                            <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                              <h4 className="text-green-800 font-medium mb-2">Cash Flow Impact</h4>
                              <p className="text-green-700">
                                {(() => {
                                  const routes = getSelectedRoutes();
                                  if (routes.length === 0) return "No routes selected for comparison.";
                                  
                                  const lowestUpfrontRoute = routes.reduce((prev, current) => 
                                    prev.cashFlow.upfrontPayment < current.cashFlow.upfrontPayment ? prev : current
                                  );
                                  
                                  const highestUpfrontRoute = routes.reduce((prev, current) => 
                                    prev.cashFlow.upfrontPayment > current.cashFlow.upfrontPayment ? prev : current
                                  );
                                  
                                  const upfrontDiff = highestUpfrontRoute.cashFlow.upfrontPayment - lowestUpfrontRoute.cashFlow.upfrontPayment;
                                  
                                  return `${lowestUpfrontRoute.name} requires $${lowestUpfrontRoute.cashFlow.upfrontPayment.toFixed(2)} in upfront payment, which is $${upfrontDiff.toFixed(2)} less than ${highestUpfrontRoute.name}, improving cash flow management and reducing initial capital requirements.`;
                                })()}
                              </p>
                            </div>
                            
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                              <h4 className="text-amber-800 font-medium mb-2">Market Responsiveness</h4>
                              <p className="text-amber-700">
                                {(() => {
                                  const routes = getSelectedRoutes();
                                  if (routes.length === 0) return "No routes selected for comparison.";
                                  
                                  const fastestRoute = routes.reduce((prev, current) => 
                                    prev.transitTime.min < current.transitTime.min ? prev : current
                                  );
                                  
                                  return `${fastestRoute.name}'s faster transit time enables greater market responsiveness, allowing your business to adapt quickly to changing demand, reduce stockouts, and potentially capture additional sales opportunities that slower shipping options might miss.`;
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Risks Tab */}
                <TabsContent value="risks">
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Risk Matrix */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm xl:col-span-2">
                          <h3 className="text-lg font-medium mb-4">Risk Comparison Matrix</h3>
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="py-3 px-4 text-left font-medium text-gray-500 uppercase tracking-wider border-b">Risk Factor</th>
                                  {getSelectedRoutes().map(route => (
                                    <th key={route.id} className="py-3 px-4 text-left font-medium text-gray-500 uppercase tracking-wider border-b">
                                      {route.name}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                <tr>
                                  <td className="py-3 px-4 font-medium">Delay Risk</td>
                                  {getSelectedRoutes().map(route => (
                                    <td key={route.id} className="py-3 px-4">
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskColor(route.risks.delay)}`}>
                                        {getRiskText(route.risks.delay)}
                                      </span>
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td className="py-3 px-4 font-medium">Damage Risk</td>
                                  {getSelectedRoutes().map(route => (
                                    <td key={route.id} className="py-3 px-4">
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskColor(route.risks.damage)}`}>
                                        {getRiskText(route.risks.damage)}
                                      </span>
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td className="py-3 px-4 font-medium">Compliance Risk</td>
                                  {getSelectedRoutes().map(route => (
                                    <td key={route.id} className="py-3 px-4">
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskColor(route.risks.compliance)}`}>
                                        {getRiskText(route.risks.compliance)}
                                      </span>
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td className="py-3 px-4 font-medium">Overall Risk Rating</td>
                                  {getSelectedRoutes().map(route => (
                                    <td key={route.id} className="py-3 px-4 font-medium">
                                      {route.risks.overall}/10
                                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                        <div 
                                          className={`h-2.5 rounded-full ${
                                            route.risks.overall <= 3 ? 'bg-green-500' :
                                            route.risks.overall <= 6 ? 'bg-amber-500' : 'bg-red-500'
                                          }`}
                                          style={{ width: `${route.risks.overall * 10}%` }}
                                        ></div>
                                      </div>
                                    </td>
                                  ))}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        {/* Risk Details for Each Route */}
                        {getSelectedRoutes().map(route => (
                          <div key={route.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center mb-4">
                              <div className={`p-1.5 rounded-full mr-2 ${
                                route.mode === 'air' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : route.mode === 'sea' 
                                    ? 'bg-teal-100 text-teal-700'
                                    : route.mode === 'rail'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-gray-100 text-gray-700'
                              }`}>
                                {getTransportIcon(route.mode)}
                              </div>
                              <h3 className="text-lg font-medium">{route.name} Risk Profile</h3>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="p-4 rounded-lg border border-gray-200">
                                <h4 className="font-medium mb-2">Delay Risk Assessment</h4>
                                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm mb-2 ${getRiskColor(route.risks.delay)}`}>
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  {getRiskText(route.risks.delay)}
                                </div>
                                <p className="text-gray-600 text-sm">
                                  {route.risks.delay === 'low' 
                                    ? `${route.name} has highly predictable transit times with minimal variation. Schedule reliability is excellent with established carriers and routes.`
                                    : route.risks.delay === 'medium'
                                      ? `${route.name} has moderate scheduling reliability with some potential for delays due to weather, congestion, or other factors.`
                                      : `${route.name} has significant potential for delays due to longer transit times, multiple handling points, and external factors like port congestion or weather.`
                                  }
                                </p>
                              </div>
                              
                              <div className="p-4 rounded-lg border border-gray-200">
                                <h4 className="font-medium mb-2">Damage Risk Assessment</h4>
                                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm mb-2 ${getRiskColor(route.risks.damage)}`}>
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  {getRiskText(route.risks.damage)}
                                </div>
                                <p className="text-gray-600 text-sm">
                                  {route.risks.damage === 'low' 
                                    ? `${route.name} involves minimal handling and transfers, reducing the chance of physical damage to your products during transit.`
                                    : route.risks.damage === 'medium'
                                      ? `${route.name} involves several handling points and potential exposure to varying conditions that could affect product integrity.`
                                      : `${route.name} involves multiple transfer points and longer exposure to potential damage factors during the extended transit period.`
                                  }
                                </p>
                              </div>
                              
                              <div className="p-4 rounded-lg border border-gray-200">
                                <h4 className="font-medium mb-2">Compliance Risk Assessment</h4>
                                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm mb-2 ${getRiskColor(route.risks.compliance)}`}>
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  {getRiskText(route.risks.compliance)}
                                </div>
                                <p className="text-gray-600 text-sm">
                                  {route.risks.compliance === 'low' 
                                    ? `${route.name} follows well-established trade lanes with clear documentation requirements and standardized processes.`
                                    : route.risks.compliance === 'medium'
                                      ? `${route.name} may involve multiple customs jurisdictions or transit countries, requiring additional documentation and compliance checks.`
                                      : `${route.name} crosses multiple regulatory zones with complex documentation requirements and potential for delays at various customs checkpoints.`
                                  }
                                </p>
                              </div>
                              
                              <div className="p-4 rounded-lg border border-gray-200">
                                <h4 className="font-medium mb-2">Risk Mitigation Recommendations</h4>
                                <ul className="list-disc list-inside text-gray-600 text-sm space-y-2">
                                  {route.risks.delay !== 'low' && (
                                    <li>
                                      Consider buffer time of {route.risks.delay === 'medium' ? '3-5' : '7-10'} days in your supply chain planning for this route.
                                    </li>
                                  )}
                                  {route.risks.damage !== 'low' && (
                                    <li>
                                      Enhance product packaging with {route.risks.damage === 'medium' ? 'additional cushioning' : 'heavy-duty protection'} suitable for {route.mode} transportation.
                                    </li>
                                  )}
                                  {route.risks.compliance !== 'low' && (
                                    <li>
                                      Work with a specialized customs broker familiar with {route.mode} shipments between {currentAnalysis?.formValues?.originCountry} and {currentAnalysis?.formValues?.destinationCountry}.
                                    </li>
                                  )}
                                  <li>
                                    {route.risks.overall <= 3 
                                      ? 'Standard cargo insurance should be sufficient for this low-risk route.'
                                      : route.risks.overall <= 6
                                        ? 'Consider enhanced cargo insurance to cover potential delays and moderate damage risk.'
                                        : 'Comprehensive all-risk insurance is strongly recommended for this high-risk transportation option.'
                                    }
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Cash Flow Tab */}
                <TabsContent value="cashflow">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cash Flow Impact Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Cash Flow Comparison Table */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm xl:col-span-2">
                          <h3 className="text-lg font-medium mb-4">Payment Structure Comparison</h3>
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="py-3 px-4 text-left font-medium text-gray-500 uppercase tracking-wider border-b">Payment Structure</th>
                                  {getSelectedRoutes().map(route => (
                                    <th key={route.id} className="py-3 px-4 text-left font-medium text-gray-500 uppercase tracking-wider border-b">
                                      {route.name}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                <tr>
                                  <td className="py-3 px-4 font-medium">Upfront Payment</td>
                                  {getSelectedRoutes().map(route => (
                                    <td key={route.id} className="py-3 px-4">
                                      ${route.cashFlow.upfrontPayment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td className="py-3 px-4 font-medium">Payment on Delivery</td>
                                  {getSelectedRoutes().map(route => (
                                    <td key={route.id} className="py-3 px-4">
                                      ${route.cashFlow.paymentOnDelivery.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td className="py-3 px-4 font-medium">Financing Cost</td>
                                  {getSelectedRoutes().map(route => (
                                    <td key={route.id} className="py-3 px-4">
                                      ${route.cashFlow.financingCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </td>
                                  ))}
                                </tr>
                                <tr className="bg-blue-50">
                                  <td className="py-3 px-4 font-bold">Total Cost</td>
                                  {getSelectedRoutes().map(route => (
                                    <td key={route.id} className="py-3 px-4 font-bold">
                                      ${route.costs.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </td>
                                  ))}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        {/* Cash Flow Charts */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                          <h3 className="text-lg font-medium mb-4">Cash Flow Distribution</h3>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={getSelectedRoutes().map(route => ({
                                  name: route.name,
                                  "Upfront Payment": route.cashFlow.upfrontPayment,
                                  "Payment on Delivery": route.cashFlow.paymentOnDelivery,
                                  "Financing Cost": route.cashFlow.financingCost
                                }))}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                                <Legend />
                                <Bar dataKey="Upfront Payment" fill="#3b82f6" />
                                <Bar dataKey="Payment on Delivery" fill="#93c5fd" />
                                <Bar dataKey="Financing Cost" fill="#dbeafe" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        
                        {/* Working Capital Impact */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                          <h3 className="text-lg font-medium mb-4">Working Capital Impact</h3>
                          <div className="space-y-4">
                            {getSelectedRoutes().map(route => {
                              const workingCapitalDuration = route.transitTime.max;
                              const workingCapitalImpact = route.costs.total * (workingCapitalDuration / 365) * 0.08; // 8% annual cost of capital
                              
                              return (
                                <div key={route.id} className="p-4 rounded-lg border border-gray-200">
                                  <div className="flex items-center mb-2">
                                    <div className={`p-1.5 rounded-full mr-2 ${
                                      route.mode === 'air' 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : route.mode === 'sea' 
                                          ? 'bg-teal-100 text-teal-700'
                                          : route.mode === 'rail'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {getTransportIcon(route.mode)}
                                    </div>
                                    <h4 className="font-medium">{route.name}</h4>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Working Capital Duration:</span>
                                      <span className="font-medium">{workingCapitalDuration} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Cost of Capital (8% annually):</span>
                                      <span className="font-medium">${workingCapitalImpact.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Total Cash Requirement:</span>
                                      <span className="font-medium">${(route.costs.total + workingCapitalImpact).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Cash Flow Recommendations */}
                        <div className="xl:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                          <h3 className="text-lg font-medium mb-4">Cash Flow Optimization Recommendations</h3>
                          
                          <div className="space-y-4">
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                              <h4 className="text-blue-800 font-medium mb-2">Payment Term Optimization</h4>
                              <p className="text-blue-700">
                                {(() => {
                                  const routes = getSelectedRoutes();
                                  if (routes.length === 0) return "No routes selected for comparison.";
                                  
                                  const lowestUpfrontRoute = routes.reduce((prev, current) => 
                                    prev.cashFlow.upfrontPayment < current.cashFlow.upfrontPayment ? prev : current
                                  );
                                  
                                  return `${lowestUpfrontRoute.name} requires the lowest initial cash outlay, preserving working capital. Consider negotiating payment terms with your logistics provider to further improve cash flow by requesting 30-60 day payment terms after delivery, particularly for ${lowestUpfrontRoute.mode} shipments.`;
                                })()}
                              </p>
                            </div>
                            
                            <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                              <h4 className="text-green-800 font-medium mb-2">Financing and Credit Options</h4>
                              <p className="text-green-700">
                                {(() => {
                                  const routes = getSelectedRoutes();
                                  if (routes.length === 0) return "No routes selected for comparison.";
                                  
                                  const fastestRoute = routes.reduce((prev, current) => 
                                    prev.transitTime.min < current.transitTime.min ? prev : current
                                  );
                                  
                                  const highestTotalCostRoute = routes.reduce((prev, current) => 
                                    prev.costs.total > current.costs.total ? prev : current
                                  );
                                  
                                  return `For high-value shipments using ${highestTotalCostRoute.name}, consider trade finance options like letters of credit or working capital loans that align with the ${fastestRoute.transitTime.max}-day transit time. This can help balance the higher upfront costs against improved cash flow management.`;
                                })()}
                              </p>
                            </div>
                            
                            <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
                              <h4 className="text-purple-800 font-medium mb-2">Inventory Financing Strategy</h4>
                              <p className="text-purple-700">
                                {(() => {
                                  const routes = getSelectedRoutes();
                                  if (routes.length === 0) return "No routes selected for comparison.";
                                  
                                  const slowestRoute = routes.reduce((prev, current) => 
                                    prev.transitTime.max > current.transitTime.max ? prev : current
                                  );
                                  
                                  const inventoryValue = currentAnalysis?.formValues?.productValue || 5000;
                                  
                                  return `When using ${slowestRoute.name} with longer transit times of up to ${slowestRoute.transitTime.max} days, consider inventory financing options that allow you to reduce upfront capital requirements for the $${parseFloat(inventoryValue).toLocaleString()} merchandise value while it's in transit, improving overall liquidity.`;
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AlternativeRoutesDashboard;