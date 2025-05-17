import { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/common/PageHeader";
import { LanguageContext } from "@/contexts/LanguageContext";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { FaDownload } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

// Mock data for alternative routes
const mockData = {
  currentRoute: {
    origin: "Shanghai, China",
    destination: "Los Angeles, USA",
    transportMode: "Sea Freight",
    transitTime: 35,
    totalCost: 8500,
    emissions: {
      co2: 4200,
      fuel: 3800
    }
  },
  alternatives: [
    {
      name: "Fast Air Route",
      transportMode: "Air",
      description: "Premium air freight service with priority handling and customs clearance",
      transitTime: 5,
      transitTimeDiff: -30,
      totalCost: 12800,
      costDiff: 4300,
      emissionsDiff: 85,
      riskLevel: "Low",
      riskDescription: "Low risk of delays with 98% on-time arrival rate",
      isRecommended: false,
      cashFlowImpact: "Negative",
      paymentTerms: "Prepaid",
      milestones: [
        { day: 1, name: "Pickup" },
        { day: 2, name: "Customs" },
        { day: 4, name: "Delivery" }
      ]
    },
    {
      name: "Standard Sea Route",
      transportMode: "Sea",
      description: "Reliable ocean freight with competitive rates and regular schedules",
      transitTime: 35,
      transitTimeDiff: 0,
      totalCost: 8500,
      costDiff: 0,
      emissionsDiff: 0,
      riskLevel: "Medium",
      riskDescription: "Medium congestion risk at LA port, potential 3-5 day delays",
      isRecommended: true,
      cashFlowImpact: "Positive",
      paymentTerms: "Net 30",
      milestones: [
        { day: 5, name: "Port Departure" },
        { day: 25, name: "Pacific Transit" },
        { day: 32, name: "Port Arrival" }
      ]
    },
    {
      name: "Rail-Sea Combination",
      transportMode: "Rail",
      description: "Eco-friendly option combining rail and ocean freight for reduced emissions",
      transitTime: 32,
      transitTimeDiff: -3,
      totalCost: 9100,
      costDiff: 600,
      emissionsDiff: -25,
      riskLevel: "Medium",
      riskDescription: "Medium risk due to rail scheduling and connection dependencies",
      isRecommended: false,
      cashFlowImpact: "Neutral",
      paymentTerms: "Net 15",
      milestones: [
        { day: 6, name: "Rail Departure" },
        { day: 12, name: "Port Transfer" },
        { day: 29, name: "Port Arrival" }
      ]
    }
  ],
  currency: "USD",
  productValue: 25000,
  weight: 750
};

// Alternative Routes Dashboard - Following dashboard checklist guidelines
const AlternativeRoutesDashboard = () => {
  const { t } = useContext(LanguageContext);
  const [localData, setLocalData] = useState<any>(null);
  const { currentAnalysis, isLoading: analysisLoading, lastUpdated } = useAnalysis();

  // Get alternative routes data from API if needed
  const { isLoading: apiLoading, error } = useQuery({
    queryKey: ['/api/alternative-routes'],
    enabled: false, // Disable automatic fetching since we're using central analysis data
  });

  // When current analysis changes, update our data
  useEffect(() => {
    if (currentAnalysis) {
      console.log("Analysis data updated in Alternative Routes Dashboard");
      
      // In a real implementation, we would transform the currentAnalysis data
      // to generate route-specific insights instead of using mock data.
      // For demonstration purposes, we're adapting our mock data with values from currentAnalysis.
      
      const adaptedData = {
        ...mockData,
        currentRoute: {
          ...mockData.currentRoute,
          origin: `${currentAnalysis.productDetails?.originCountry || 'Unknown'} Port`,
          destination: `${currentAnalysis.productDetails?.destinationCountry || 'Unknown'} Port`,
          transportMode: currentAnalysis.productDetails?.transportMode || mockData.currentRoute.transportMode,
        },
        productValue: currentAnalysis.productDetails?.productValue || mockData.productValue,
        weight: currentAnalysis.productDetails?.weight || mockData.weight
      };
      
      setLocalData(adaptedData);
    } else if (!localData) {
      // Fallback to mock data if no analysis is available yet
      setLocalData(mockData);
    }
  }, [currentAnalysis, lastUpdated]);
  
  // Combined loading state
  const isLoading = apiLoading || analysisLoading || !localData;

  // Risk level badge colors
  const getRiskBadgeClass = (risk: string) => {
    if (risk === "Low") return "bg-green-100 text-green-800";
    if (risk === "Medium") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Cash flow impact rendering
  const renderCashFlowImpact = (impact: string) => {
    if (impact === "Positive") return { text: "✓ Improved working capital", color: "text-green-600" };
    if (impact === "Negative") return { text: "✗ Reduced working capital", color: "text-red-600" };
    return { text: "⚠ Neutral impact", color: "text-yellow-600" };
  };

  return (
    <>
      <PageHeader
        title={t("dashboard.alternativeRoutes.title")}
        description={t("dashboard.alternativeRoutes.description")}
        actions={[
          {
            label: t("common.export"),
            icon: <FaDownload />,
            onClick: () => console.log("Export alternative routes"),
            variant: "outline"
          }
        ]}
      />

      {isLoading || !localData ? (
        <div className="space-y-6 mb-6">
          <Skeleton className="h-80 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        </div>
      ) : error ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              <p className="font-medium">{t("common.error")}</p>
              <p className="text-sm">{t("dashboard.alternativeRoutes.dataError")}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current Route Summary */}
          <Card className="bg-white shadow-sm border border-neutral-200 mb-6">
            <CardHeader className="border-b border-neutral-200 px-5 py-4">
              <CardTitle className="text-lg font-medium text-neutral-900">
                {t("dashboard.alternativeRoutes.currentRoute")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="col-span-1 lg:col-span-2">
                  <div className="space-y-4">
                    {/* Origin to Destination */}
                    <div className="flex items-center">
                      <div className="bg-primary/10 rounded-full p-3 mr-3">
                        <span className="text-primary text-lg">A</span>
                      </div>
                      <div className="text-neutral-700 text-sm flex-1 mr-2">
                        {localData.currentRoute?.origin || t("dashboard.alternativeRoutes.noOrigin")}
                      </div>
                      <span className="border-t border-dashed border-neutral-300 flex-grow mx-2"></span>
                      <div className="bg-green-100 rounded-full p-3 ml-3">
                        <span className="text-green-700 text-lg">B</span>
                      </div>
                      <div className="text-neutral-700 text-sm flex-1 ml-2">
                        {localData.currentRoute?.destination || t("dashboard.alternativeRoutes.noDestination")}
                      </div>
                    </div>
                    
                    {/* Route Details */}
                    <div className="bg-neutral-50 p-4 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-neutral-500">{t("dashboard.alternativeRoutes.transportMode")}</div>
                          <div className="font-medium">{localData.currentRoute?.transportMode || "-"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-neutral-500">{t("dashboard.alternativeRoutes.transitTime")}</div>
                          <div className="font-medium">
                            {localData.currentRoute?.transitTime
                              ? `${localData.currentRoute.transitTime} ${t("dashboard.alternativeRoutes.days")}`
                              : "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-neutral-500">{t("dashboard.alternativeRoutes.totalCost")}</div>
                          <div className="font-medium">
                            {localData.currentRoute?.totalCost
                              ? new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: localData.currency || 'USD'
                                }).format(localData.currentRoute.totalCost)
                              : "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  {/* Environmental Impact */}
                  <div className="bg-neutral-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium mb-2">{t("dashboard.alternativeRoutes.environmentalImpact")}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs">{t("dashboard.alternativeRoutes.co2Emissions")}</span>
                        <span className="text-xs font-medium">
                          {localData.currentRoute?.emissions?.co2
                            ? `${localData.currentRoute.emissions.co2} kg`
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs">{t("dashboard.alternativeRoutes.fuelConsumption")}</span>
                        <span className="text-xs font-medium">
                          {localData.currentRoute?.emissions?.fuel
                            ? `${localData.currentRoute.emissions.fuel} L`
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Based on Cost Breakdown Data Banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-blue-900">Based on your Cost Breakdown data</p>
                <p className="text-sm text-blue-700">
                  Using product value of ${localData?.productValue || "0"} and weight of {localData?.weight || "0"} kg
                </p>
              </div>
            </div>
            <div className="text-sm text-blue-600">
              {lastUpdated ? 
                `Updated ${lastUpdated.toLocaleDateString()} at ${lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` :
                `${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
              }
              {currentAnalysis && 
                <div className="text-xs text-green-600 mt-1">All data is synchronized across dashboards</div>
              }
            </div>
          </div>

          {/* Alternative Routes Comparison - Side by Side Cards */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-neutral-900 mb-4">
              {t("dashboard.alternativeRoutes.alternativeOptions")}
            </h2>
            
            {localData?.alternatives && localData.alternatives.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localData.alternatives.map((route: any, index: number) => (
                  <Card 
                    key={index} 
                    className={`overflow-hidden ${route.isRecommended ? 'border-green-300 shadow-md' : 'border-neutral-200'}`}
                  >
                    {route.isRecommended && (
                      <div className="bg-green-600 text-white text-xs font-medium py-1 px-3 text-center">
                        RECOMMENDED OPTION
                      </div>
                    )}
                    <CardHeader className={`border-b ${route.isRecommended ? 'bg-green-50 border-green-100' : 'border-neutral-200'} px-5 py-4`}>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-md font-medium flex items-center">
                          {route.transportMode === 'Sea' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mr-2">
                              <path d="M18 16.5c1.2 0 2.25.5 3 1.35a3.38 3.38 0 0 1 .75 2.15v2M3 11.5l9-9 9 9M5 19.5v-2a3.38 3.38 0 0 1 .75-2.15A4.5 4.5 0 0 1 9 14M21 11.5v8M3 19.5h18M12 2.5v14" />
                            </svg>
                          )}
                          {route.transportMode === 'Air' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500 mr-2">
                              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                            </svg>
                          )}
                          {route.transportMode === 'Rail' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600 mr-2">
                              <path d="M2 8h20M3 17h18a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1ZM8 20l-2 2M16 20l2 2M8.5 12.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM16.5 12.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
                            </svg>
                          )}
                          {route.transportMode === 'Road' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 mr-2">
                              <rect width="6" height="14" x="3" y="3" rx="2" />
                              <rect width="6" height="14" x="15" y="3" rx="2" />
                              <path d="M9 12h6" />
                              <path d="M9 8h6" />
                              <path d="M15 17h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
                              <path d="M9 17H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
                            </svg>
                          )}
                          {route.name}
                        </CardTitle>
                        
                        {/* Risk indicator */}
                        <div 
                          className={`text-xs font-semibold py-1 px-2 rounded ${getRiskBadgeClass(route.riskLevel)}`}
                          title={route.riskDescription || 'Risk level indicator'}
                        >
                          {route.riskLevel || 'Medium'} Risk
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      {/* Route description */}
                      <div className="text-sm text-neutral-600">
                        {route.description}
                      </div>
                      
                      {/* Transit timeline visualization */}
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-2">Transit Timeline</div>
                        <div className="relative h-8 bg-neutral-100 rounded-lg">
                          {/* Timeline markers */}
                          <div className="absolute top-0 left-0 h-full w-full flex items-center">
                            {/* Progress bar */}
                            <div 
                              className="absolute top-0 left-0 h-full bg-blue-100 rounded-lg"
                              style={{ width: '100%' }}
                            ></div>
                            
                            {/* Start marker */}
                            <div className="absolute left-0 flex flex-col items-center z-10">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <div className="text-xs mt-1 whitespace-nowrap">Day 0</div>
                            </div>
                            
                            {/* Transit milestones */}
                            {route.milestones && route.milestones.map((milestone: any, i: number) => (
                              <div 
                                key={i} 
                                className="absolute flex flex-col items-center z-10"
                                style={{ left: `${(milestone.day / route.transitTime) * 100}%` }}
                              >
                                <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
                                <div className="text-xs mt-1 whitespace-nowrap text-neutral-500">
                                  {milestone.name}
                                </div>
                              </div>
                            ))}
                            
                            {/* End marker */}
                            <div className="absolute right-0 flex flex-col items-center z-10">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <div className="text-xs mt-1 whitespace-nowrap">
                                Day {route.transitTime}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Key metrics */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <div className="text-sm text-neutral-500">Transit Time</div>
                          <div className="text-lg font-bold">
                            {route.transitTime} {t("dashboard.alternativeRoutes.days")}
                          </div>
                          {route.transitTimeDiff !== 0 && (
                            <div className={`text-xs ${route.transitTimeDiff < 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {route.transitTimeDiff > 0 ? '+' : ''}{route.transitTimeDiff} days
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="text-sm text-neutral-500">Total Cost</div>
                          <div className="text-lg font-bold">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: localData.currency || 'USD',
                              maximumFractionDigits: 0
                            }).format(route.totalCost)}
                          </div>
                          {route.costDiff !== 0 && (
                            <div className={`text-xs ${route.costDiff < 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {route.costDiff > 0 ? '+' : ''}
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: localData.currency || 'USD',
                                maximumFractionDigits: 0
                              }).format(route.costDiff)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cash Flow Impact */}
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-2">Cash Flow Impact</div>
                        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                          <div className="flex items-center">
                            <div className={`flex-1 text-sm ${renderCashFlowImpact(route.cashFlowImpact).color}`}>
                              {renderCashFlowImpact(route.cashFlowImpact).text}
                            </div>
                            <div className="text-sm font-medium">
                              {route.paymentTerms || 'Net 30'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-neutral-200 flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => console.log(`View details for route: ${route.name}`)}
                        >
                          Full Details
                        </Button>
                        
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => console.log(`Select route: ${route.name}`)}
                        >
                          Select This Route
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="empty-state p-6 text-center">
                <div className="mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-1">
                  {t("dashboard.alternativeRoutes.noAlternatives")}
                </h3>
                <p className="text-sm text-neutral-600 max-w-md mx-auto mb-6">
                  {t("dashboard.alternativeRoutes.noAlternativesDescription")}
                </p>
                <Button 
                  onClick={() => console.log("Request alternatives")}
                >
                  {t("dashboard.alternativeRoutes.requestAlternatives")}
                </Button>
              </div>
            )}
          </div>

          {/* Settings/Preferences */}
          <Card className="mb-6">
            <CardHeader className="border-b border-neutral-200 px-5 py-4">
              <CardTitle className="text-lg font-medium text-neutral-900">
                {t("dashboard.alternativeRoutes.preferences")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">{t("dashboard.alternativeRoutes.optimizeFor")}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="optimize-cost" 
                        name="optimize" 
                        className="h-4 w-4 text-primary border-neutral-300 focus:ring-primary" 
                        defaultChecked 
                      />
                      <label htmlFor="optimize-cost" className="text-sm text-neutral-700">
                        {t("dashboard.alternativeRoutes.cost")}
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="optimize-speed" 
                        name="optimize" 
                        className="h-4 w-4 text-primary border-neutral-300 focus:ring-primary" 
                      />
                      <label htmlFor="optimize-speed" className="text-sm text-neutral-700">
                        {t("dashboard.alternativeRoutes.speed")}
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="optimize-balanced" 
                        name="optimize" 
                        className="h-4 w-4 text-primary border-neutral-300 focus:ring-primary" 
                      />
                      <label htmlFor="optimize-balanced" className="text-sm text-neutral-700">
                        {t("dashboard.alternativeRoutes.balanced")}
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">{t("dashboard.alternativeRoutes.priorityFactors")}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-700">{t("dashboard.alternativeRoutes.cost")}</span>
                      <div className="w-20 h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-700">{t("dashboard.alternativeRoutes.speed")}</span>
                      <div className="w-20 h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-700">{t("dashboard.alternativeRoutes.reliability")}</span>
                      <div className="w-20 h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">{t("dashboard.alternativeRoutes.additionalFilters")}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="filter-eco" 
                        className="h-4 w-4 text-primary border-neutral-300 focus:ring-primary rounded" 
                      />
                      <label htmlFor="filter-eco" className="text-sm text-neutral-700">
                        {t("dashboard.alternativeRoutes.ecoFriendly")}
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="filter-direct" 
                        className="h-4 w-4 text-primary border-neutral-300 focus:ring-primary rounded" 
                      />
                      <label htmlFor="filter-direct" className="text-sm text-neutral-700">
                        {t("dashboard.alternativeRoutes.directRoutes")}
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="filter-special" 
                        className="h-4 w-4 text-primary border-neutral-300 focus:ring-primary rounded" 
                      />
                      <label htmlFor="filter-special" className="text-sm text-neutral-700">
                        {t("dashboard.alternativeRoutes.specialPrograms")}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button onClick={() => console.log("Apply preferences")} className="bg-primary hover:bg-primary/90">
                  {t("dashboard.alternativeRoutes.applyPreferences")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
};

export default AlternativeRoutesDashboard;