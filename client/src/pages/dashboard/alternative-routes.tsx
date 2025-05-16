import { useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/common/PageHeader";
import { LanguageContext } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { FaDownload } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Alternative Routes Dashboard - Following dashboard checklist guidelines
const AlternativeRoutesDashboard = () => {
  const { t } = useContext(LanguageContext);

  // Get alternative routes data from API - no hardcoded values
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/alternative-routes'],
  });

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

      {isLoading ? (
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
                        {data?.currentRoute?.origin || t("dashboard.alternativeRoutes.noOrigin")}
                      </div>
                      <span className="border-t border-dashed border-neutral-300 flex-grow mx-2"></span>
                      <div className="bg-green-100 rounded-full p-3 ml-3">
                        <span className="text-green-700 text-lg">B</span>
                      </div>
                      <div className="text-neutral-700 text-sm flex-1 ml-2">
                        {data?.currentRoute?.destination || t("dashboard.alternativeRoutes.noDestination")}
                      </div>
                    </div>
                    
                    {/* Route Details */}
                    <div className="bg-neutral-50 p-4 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-neutral-500">{t("dashboard.alternativeRoutes.transportMode")}</div>
                          <div className="font-medium">{data?.currentRoute?.transportMode || "-"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-neutral-500">{t("dashboard.alternativeRoutes.transitTime")}</div>
                          <div className="font-medium">
                            {data?.currentRoute?.transitTime
                              ? `${data.currentRoute.transitTime} ${t("dashboard.alternativeRoutes.days")}`
                              : "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-neutral-500">{t("dashboard.alternativeRoutes.totalCost")}</div>
                          <div className="font-medium">
                            {data?.currentRoute?.totalCost
                              ? new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: data.currency || 'USD'
                                }).format(data.currentRoute.totalCost)
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
                          {data?.currentRoute?.emissions?.co2
                            ? `${data.currentRoute.emissions.co2} kg`
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs">{t("dashboard.alternativeRoutes.fuelConsumption")}</span>
                        <span className="text-xs font-medium">
                          {data?.currentRoute?.emissions?.fuel
                            ? `${data.currentRoute.emissions.fuel} L`
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Routes Comparison */}
          <Card className="bg-white shadow-sm border border-neutral-200 mb-6">
            <CardHeader className="border-b border-neutral-200 px-5 py-4">
              <CardTitle className="text-lg font-medium text-neutral-900">
                {t("dashboard.alternativeRoutes.alternativeOptions")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data?.alternatives && data.alternatives.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                      <tr>
                        <th className="px-5 py-3 text-left">{t("dashboard.alternativeRoutes.route")}</th>
                        <th className="px-5 py-3 text-left">{t("dashboard.alternativeRoutes.mode")}</th>
                        <th className="px-5 py-3 text-center">{t("dashboard.alternativeRoutes.time")}</th>
                        <th className="px-5 py-3 text-center">{t("dashboard.alternativeRoutes.cost")}</th>
                        <th className="px-5 py-3 text-center">{t("dashboard.alternativeRoutes.emissions")}</th>
                        <th className="px-5 py-3 text-center">{t("dashboard.alternativeRoutes.reliability")}</th>
                        <th className="px-5 py-3 text-right">{t("common.actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 text-sm">
                      {data.alternatives.map((route: any, index: number) => (
                        <tr key={index} className={route.isRecommended ? "bg-green-50" : "hover:bg-neutral-50"}>
                          <td className="px-5 py-4">
                            <div className="font-medium">
                              {route.name}
                              {route.isRecommended && (
                                <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                                  {t("dashboard.alternativeRoutes.recommended")}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {route.description}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center">
                              {route.transportMode === 'Sea' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mr-1">
                                  <path d="M18 16.5c1.2 0 2.25.5 3 1.35a3.38 3.38 0 0 1 .75 2.15v2M3 11.5l9-9 9 9M5 19.5v-2a3.38 3.38 0 0 1 .75-2.15A4.5 4.5 0 0 1 9 14M21 11.5v8M3 19.5h18M12 2.5v14" />
                                </svg>
                              )}
                              {route.transportMode === 'Air' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500 mr-1">
                                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                                </svg>
                              )}
                              {route.transportMode === 'Rail' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600 mr-1">
                                  <path d="M2 8h20M3 17h18a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1ZM8 20l-2 2M16 20l2 2M8.5 12.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM16.5 12.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
                                </svg>
                              )}
                              {route.transportMode === 'Road' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 mr-1">
                                  <rect width="6" height="14" x="3" y="3" rx="2" />
                                  <rect width="6" height="14" x="15" y="3" rx="2" />
                                  <path d="M9 12h6" />
                                  <path d="M9 8h6" />
                                  <path d="M15 17h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
                                  <path d="M9 17H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
                                </svg>
                              )}
                              {route.transportMode}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="font-medium">
                              {route.transitTime} {t("dashboard.alternativeRoutes.days")}
                            </div>
                            
                            {route.transitTimeDiff > 0 ? (
                              <div className="text-xs text-red-600">
                                +{route.transitTimeDiff} {t("dashboard.alternativeRoutes.days")}
                              </div>
                            ) : route.transitTimeDiff < 0 ? (
                              <div className="text-xs text-green-600">
                                {route.transitTimeDiff} {t("dashboard.alternativeRoutes.days")}
                              </div>
                            ) : (
                              <div className="text-xs text-neutral-500">
                                {t("dashboard.alternativeRoutes.same")}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="font-medium">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: data.currency || 'USD',
                                maximumFractionDigits: 0
                              }).format(route.totalCost)}
                            </div>
                            
                            {route.costDiff > 0 ? (
                              <div className="text-xs text-red-600">
                                +{new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: data.currency || 'USD',
                                  maximumFractionDigits: 0
                                }).format(route.costDiff)}
                              </div>
                            ) : route.costDiff < 0 ? (
                              <div className="text-xs text-green-600">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: data.currency || 'USD',
                                  maximumFractionDigits: 0
                                }).format(route.costDiff)}
                              </div>
                            ) : (
                              <div className="text-xs text-neutral-500">
                                {t("dashboard.alternativeRoutes.same")}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="font-medium">
                              {route.emissions?.co2 || 0} kg
                            </div>
                            
                            {route.emissionsDiff > 0 ? (
                              <div className="text-xs text-red-600">
                                +{route.emissionsDiff}%
                              </div>
                            ) : route.emissionsDiff < 0 ? (
                              <div className="text-xs text-green-600">
                                {route.emissionsDiff}%
                              </div>
                            ) : (
                              <div className="text-xs text-neutral-500">
                                {t("dashboard.alternativeRoutes.same")}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="relative h-2 w-24 bg-neutral-200 rounded-full mx-auto">
                              <div 
                                className="absolute top-0 left-0 h-2 rounded-full bg-primary"
                                style={{ width: `${route.reliability}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-neutral-500 mt-1">
                              {route.reliability}%
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Button size="sm" variant="outline">
                              {t("dashboard.alternativeRoutes.selectRoute")}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-neutral-500 mb-4">{t("dashboard.alternativeRoutes.noAlternatives")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trade-offs and Considerations */}
          <Card className="bg-white shadow-sm border border-neutral-200 mb-6">
            <CardHeader className="border-b border-neutral-200 px-5 py-4">
              <CardTitle className="text-lg font-medium text-neutral-900">
                {t("dashboard.alternativeRoutes.tradeoffs")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium text-sm">{t("dashboard.alternativeRoutes.costFactors")}</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-600">
                    <li>{t("dashboard.alternativeRoutes.fuelSurcharges")}</li>
                    <li>{t("dashboard.alternativeRoutes.seasonalRates")}</li>
                    <li>{t("dashboard.alternativeRoutes.handlingFees")}</li>
                    <li>{t("dashboard.alternativeRoutes.insuranceCosts")}</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-sm">{t("dashboard.alternativeRoutes.timeFactors")}</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-600">
                    <li>{t("dashboard.alternativeRoutes.portCongestion")}</li>
                    <li>{t("dashboard.alternativeRoutes.weatherDelays")}</li>
                    <li>{t("dashboard.alternativeRoutes.customsClearance")}</li>
                    <li>{t("dashboard.alternativeRoutes.transferTimes")}</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-sm">{t("dashboard.alternativeRoutes.reliabilityFactors")}</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-600">
                    <li>{t("dashboard.alternativeRoutes.carrierPerformance")}</li>
                    <li>{t("dashboard.alternativeRoutes.routeFrequency")}</li>
                    <li>{t("dashboard.alternativeRoutes.geopoliticalRisks")}</li>
                    <li>{t("dashboard.alternativeRoutes.infrastructureQuality")}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
};

export default AlternativeRoutesDashboard;