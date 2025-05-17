import { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/common/PageHeader";
import { LanguageContext } from "@/contexts/LanguageContext";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { FaDownload } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// Mock data for tariff analysis
const mockData = {
  currentTariff: {
    hsCode: "8471.30.00",
    description: "Portable digital automatic data processing machines, weighing not more than 10 kg, consisting of a central processing unit, a keyboard and a display",
    dutyRate: 0.0,
    specialPrograms: [
      {
        name: "US-China Section 301",
        rate: 0.25,
        applied: true,
        description: "Additional duties on products of Chinese origin"
      },
      {
        name: "GSP",
        rate: -0.0,
        applied: false,
        description: "Generalized System of Preferences - duty-free treatment for eligible products"
      }
    ],
    effectiveDutyRate: 0.25,
    productValue: 25000,
    dutyAmount: 6250,
    totalLandedCost: 35750,
    dutyPercentage: 17.5 // of total landed cost
  },
  alternativeClassifications: [
    {
      hsCode: "8471.30.01",
      description: "Portable automatic data processing machines, not exceeding 10 kg, with specially designed components",
      dutyRate: 0.0,
      effectiveDutyRate: 0.25,
      confidence: 0.85,
      savings: 0,
      requirements: "Must contain specially designed components for portable operation"
    },
    {
      hsCode: "8517.12.00",
      description: "Telephones for cellular networks or for other wireless networks",
      dutyRate: 0.0,
      effectiveDutyRate: 0.0,
      confidence: 0.65,
      savings: 6250,
      requirements: "Primary function must be cellular communication. Must be able to connect to cellular network."
    },
    {
      hsCode: "8471.41.01",
      description: "Other automated data processing machines, processing unit with storage/input/output in same housing",
      dutyRate: 0.0,
      effectiveDutyRate: 0.25,
      confidence: 0.80,
      savings: 0,
      requirements: "Must have storage, input, and output in the same housing"
    }
  ],
  marketComparison: [
    { 
      country: "United States", 
      dutyRate: 0.25, 
      requirements: "No special requirements",
      totalTax: 0.25
    },
    { 
      country: "European Union", 
      dutyRate: 0.0, 
      requirements: "Must have CE certification",
      totalTax: 0.20 // Includes 20% VAT
    },
    { 
      country: "Canada", 
      dutyRate: 0.0, 
      requirements: "No special requirements",
      totalTax: 0.05 // 5% GST
    },
    { 
      country: "Mexico", 
      dutyRate: 0.0, 
      requirements: "Must have NOM certification",
      totalTax: 0.16 // 16% VAT
    },
    { 
      country: "Japan", 
      dutyRate: 0.0, 
      requirements: "Must have Japan PSE certification",
      totalTax: 0.10 // 10% Consumption tax
    }
  ],
  historicalRates: [
    { 
      period: "Jan 2023", 
      rate: 0.25,
      notes: "Section 301 duties at 25%"
    },
    { 
      period: "Jul 2022", 
      rate: 0.25,
      notes: "Section 301 duties at 25%"
    },
    { 
      period: "Jan 2022", 
      rate: 0.25,
      notes: "Section 301 duties at 25%"
    },
    { 
      period: "Jul 2021", 
      rate: 0.25,
      notes: "Section 301 duties at 25%"
    },
    { 
      period: "Jan 2021", 
      rate: 0.25,
      notes: "Section 301 duties at 25%"
    },
    { 
      period: "Jul 2020", 
      rate: 0.25,
      notes: "Section 301 duties implemented at 25%"
    },
    { 
      period: "Jan 2020", 
      rate: 0.075,
      notes: "Initial Section 301 duties at 7.5%"
    },
    { 
      period: "Jul 2019", 
      rate: 0.0,
      notes: "No additional duties"
    }
  ],
  optimizationStrategies: [
    {
      name: "Reclassification",
      hsCode: "8517.12.00",
      description: "Reclassify product as telephone for cellular networks",
      savingsAmount: 6250,
      savingsPercentage: 100,
      riskLevel: "Medium",
      riskDescription: "Requires product to primarily function as a cellular device",
      implementation: "Submit binding ruling request to confirm classification"
    },
    {
      name: "Country of Origin Change",
      hsCode: "8471.30.00",
      description: "Shift assembly to Vietnam",
      savingsAmount: 6250,
      savingsPercentage: 100,
      riskLevel: "High",
      riskDescription: "Requires supply chain restructuring and substantial transformation",
      implementation: "Develop Vietnam assembly operation with local partners"
    },
    {
      name: "Product Modification",
      hsCode: "8471.30.00",
      description: "Remove certain components prior to import",
      savingsAmount: 3125,
      savingsPercentage: 50,
      riskLevel: "Low",
      riskDescription: "Requires minor process changes, lowers dutiable value",
      implementation: "Ship certain components separately for post-import assembly"
    }
  ]
};

// Tariff Analysis Dashboard
const TariffAnalysisDashboard = () => {
  const { t } = useContext(LanguageContext);
  const [localData, setLocalData] = useState<any>(null);
  const { currentAnalysis, isLoading: analysisLoading, lastUpdated } = useAnalysis();

  // Get tariff analysis data from API if needed
  const { isLoading: apiLoading, error } = useQuery({
    queryKey: ['/api/tariff-analysis'],
    enabled: false, // Disable automatic fetching since we're using central analysis data
  });

  // When current analysis changes, update our data
  useEffect(() => {
    if (currentAnalysis) {
      console.log("Analysis data updated in Tariff Analysis Dashboard");
      
      // In a real implementation, we would transform the currentAnalysis data
      // to generate tariff-specific insights instead of using mock data.
      // For demonstration purposes, we're adapting our mock data with values from currentAnalysis.
      
      const adaptedData = {
        ...mockData,
        currentTariff: {
          ...mockData.currentTariff,
          hsCode: currentAnalysis.productDetails?.hsCode || mockData.currentTariff.hsCode,
          productValue: currentAnalysis.productDetails?.productValue || mockData.currentTariff.productValue,
          // Calculate duty amount based on product value and effective duty rate
          dutyAmount: (currentAnalysis.productDetails?.productValue || mockData.currentTariff.productValue) * 
                      mockData.currentTariff.effectiveDutyRate,
        }
      };
      
      setLocalData(adaptedData);
    } else if (!localData) {
      // Fallback to mock data if no analysis is available yet
      setLocalData(mockData);
    }
  }, [currentAnalysis, lastUpdated]);
  
  // Combined loading state
  const isLoading = apiLoading || analysisLoading || !localData;

  // Format percentage for display
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Risk level badge colors
  const getRiskBadgeClass = (risk: string) => {
    if (risk === "Low") return "bg-green-100 text-green-800";
    if (risk === "Medium") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <>
      <PageHeader
        title={t("dashboard.tariffAnalysis.title")}
        description={t("dashboard.tariffAnalysis.description")}
        actions={[
          {
            label: t("common.export"),
            icon: <FaDownload />,
            onClick: () => console.log("Export tariff analysis"),
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
              <p className="text-sm">{t("dashboard.tariffAnalysis.dataError")}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Based on Cost Breakdown Data Banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-blue-900">Based on your Cost Breakdown data</p>
                <p className="text-sm text-blue-700">
                  Using HS Code {localData.currentTariff.hsCode} and product value of {formatCurrency(localData.currentTariff.productValue)}
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

          {/* Current Tariff Summary - Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="text-sm text-neutral-500 mb-1">HS Code</div>
                <div className="text-2xl font-semibold">{localData.currentTariff.hsCode}</div>
                <div className="text-xs text-neutral-500 mt-2 line-clamp-2" title={localData.currentTariff.description}>
                  {localData.currentTariff.description}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="text-sm text-neutral-500 mb-1">Effective Duty Rate</div>
                <div className="text-2xl font-semibold">{formatPercentage(localData.currentTariff.effectiveDutyRate)}</div>
                <div className="text-xs text-neutral-500 mt-2">
                  Base: {formatPercentage(localData.currentTariff.dutyRate)} + Section 301: 25%
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="text-sm text-neutral-500 mb-1">Duty Amount</div>
                <div className="text-2xl font-semibold">{formatCurrency(localData.currentTariff.dutyAmount)}</div>
                <div className="text-xs text-neutral-500 mt-2">
                  {formatPercentage(localData.currentTariff.dutyPercentage)} of total landed cost
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="text-sm text-neutral-500 mb-1">Duty Savings Potential</div>
                <div className="text-2xl font-semibold text-green-600">{formatCurrency(localData.optimizationStrategies[0].savingsAmount)}</div>
                <div className="text-xs text-green-600 mt-2">
                  Up to {formatPercentage(localData.optimizationStrategies[0].savingsPercentage / 100)} savings possible
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabbed Analysis Content */}
          <Tabs defaultValue="classifications" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="classifications">Alternative Classifications</TabsTrigger>
              <TabsTrigger value="market">Market Comparison</TabsTrigger>
              <TabsTrigger value="historical">Historical Rates</TabsTrigger>
              <TabsTrigger value="optimization">Optimization Strategies</TabsTrigger>
            </TabsList>
            
            {/* Alternative Classifications Tab */}
            <TabsContent value="classifications">
              <Card className="bg-white shadow-sm">
                <CardHeader className="border-b border-neutral-200 px-5 py-4">
                  <CardTitle className="text-lg font-medium text-neutral-900">
                    Alternative Classification Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                        <tr>
                          <th className="px-5 py-3 text-left">HS Code</th>
                          <th className="px-5 py-3 text-left">Description</th>
                          <th className="px-5 py-3 text-center">Confidence</th>
                          <th className="px-5 py-3 text-center">Effective Rate</th>
                          <th className="px-5 py-3 text-center">Potential Savings</th>
                          <th className="px-5 py-3 text-left">Requirements</th>
                          <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 text-sm">
                        {localData.alternativeClassifications.map((classification: any, index: number) => (
                          <tr key={index} className={classification.savings > 0 ? "bg-green-50" : "hover:bg-neutral-50"}>
                            <td className="px-5 py-4">
                              <div className="font-medium">{classification.hsCode}</div>
                            </td>
                            <td className="px-5 py-4 max-w-xs">
                              <div className="text-neutral-600 line-clamp-2" title={classification.description}>
                                {classification.description}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <div className="font-medium">{(classification.confidence * 100).toFixed(0)}%</div>
                              <div className="w-16 h-2 bg-neutral-200 rounded-full mx-auto mt-1">
                                <div 
                                  className="h-full rounded-full bg-blue-500"
                                  style={{ width: `${classification.confidence * 100}%` }}
                                ></div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <div className="font-medium">{formatPercentage(classification.effectiveDutyRate)}</div>
                            </td>
                            <td className="px-5 py-4 text-center">
                              {classification.savings > 0 ? (
                                <div className="text-green-600 font-medium">{formatCurrency(classification.savings)}</div>
                              ) : (
                                <div className="text-neutral-500">No Savings</div>
                              )}
                            </td>
                            <td className="px-5 py-4 max-w-xs">
                              <div className="text-neutral-600 line-clamp-2" title={classification.requirements}>
                                {classification.requirements}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => console.log(`Details for ${classification.hsCode}`)}
                              >
                                Explore
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Classification Advisory</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Alternative classifications may require product modifications or substantiation. Consider requesting a binding ruling from customs authorities before implementing changes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Market Comparison Tab */}
            <TabsContent value="market">
              <Card className="bg-white shadow-sm">
                <CardHeader className="border-b border-neutral-200 px-5 py-4">
                  <CardTitle className="text-lg font-medium text-neutral-900">
                    Market Duty Rate Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={localData.marketComparison}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="country" />
                        <YAxis tickFormatter={(value) => `${(value * 100)}%`} />
                        <Tooltip 
                          formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Rate']}
                          labelFormatter={(label) => `Country: ${label}`}
                        />
                        <Legend />
                        <Bar dataKey="dutyRate" name="Duty Rate" fill="#8884d8" />
                        <Bar dataKey="totalTax" name="Total Tax Rate" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Card className="bg-white shadow-sm">
                  <CardHeader className="border-b border-neutral-200 px-5 py-4">
                    <CardTitle className="text-lg font-medium text-neutral-900">
                      Market Entry Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                          <tr>
                            <th className="px-5 py-3 text-left">Market</th>
                            <th className="px-5 py-3 text-left">Requirements</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 text-sm">
                          {localData.marketComparison.map((market: any, index: number) => (
                            <tr key={index} className="hover:bg-neutral-50">
                              <td className="px-5 py-4">
                                <div className="font-medium">{market.country}</div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="text-neutral-600">
                                  {market.requirements}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                  <CardHeader className="border-b border-neutral-200 px-5 py-4">
                    <CardTitle className="text-lg font-medium text-neutral-900">
                      Market Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      <div className="rounded-lg bg-green-50 p-4 border-l-4 border-green-500">
                        <h4 className="font-medium text-green-800">Favorable Markets</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Canada and Mexico offer 0% duty rates under USMCA with minimal certification requirements.
                        </p>
                      </div>
                      
                      <div className="rounded-lg bg-yellow-50 p-4 border-l-4 border-yellow-500">
                        <h4 className="font-medium text-yellow-800">Consideration Markets</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          EU offers 0% duty rate but requires CE certification and has 20% VAT.
                        </p>
                      </div>
                      
                      <div className="rounded-lg bg-red-50 p-4 border-l-4 border-red-500">
                        <h4 className="font-medium text-red-800">Challenging Markets</h4>
                        <p className="text-sm text-red-700 mt-1">
                          US market faces 25% Section 301 tariffs when importing from China.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Historical Rates Tab */}
            <TabsContent value="historical">
              <Card className="bg-white shadow-sm">
                <CardHeader className="border-b border-neutral-200 px-5 py-4">
                  <CardTitle className="text-lg font-medium text-neutral-900">
                    Historical Duty Rate Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[...localData.historicalRates].reverse()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis tickFormatter={(value) => `${(value * 100)}%`} />
                        <Tooltip 
                          formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Duty Rate']}
                          labelFormatter={(label) => `Period: ${label}`}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="rate" name="Effective Duty Rate" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm mt-4">
                <CardHeader className="border-b border-neutral-200 px-5 py-4">
                  <CardTitle className="text-lg font-medium text-neutral-900">
                    Rate Change History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                        <tr>
                          <th className="px-5 py-3 text-left">Period</th>
                          <th className="px-5 py-3 text-center">Rate</th>
                          <th className="px-5 py-3 text-left">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 text-sm">
                        {localData.historicalRates.map((period: any, index: number) => (
                          <tr key={index} className="hover:bg-neutral-50">
                            <td className="px-5 py-4">
                              <div className="font-medium">{period.period}</div>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <div className="font-medium">{formatPercentage(period.rate)}</div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="text-neutral-600">
                                {period.notes}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Optimization Strategies Tab */}
            <TabsContent value="optimization">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {localData.optimizationStrategies.map((strategy: any, index: number) => (
                  <Card key={index} className="bg-white shadow-sm">
                    <CardHeader className="border-b border-neutral-200 px-5 py-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-medium text-neutral-900">
                          {strategy.name}
                        </CardTitle>
                        <div 
                          className={`text-xs font-semibold py-1 px-2 rounded ${getRiskBadgeClass(strategy.riskLevel)}`}
                          title={strategy.riskDescription}
                        >
                          {strategy.riskLevel} Risk
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium mb-1">Strategy</div>
                          <div className="text-sm text-neutral-600">{strategy.description}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-1">Potential Savings</div>
                            <div className="text-xl font-bold text-green-600">{formatCurrency(strategy.savingsAmount)}</div>
                            <div className="text-xs text-green-600">{formatPercentage(strategy.savingsPercentage / 100)} of current duties</div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium mb-1">HS Code</div>
                            <div className="text-xl font-bold">{strategy.hsCode}</div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-1">Implementation</div>
                          <div className="text-sm text-neutral-600">{strategy.implementation}</div>
                        </div>
                        
                        <div className="text-xs text-neutral-500 italic">
                          <strong>Risk:</strong> {strategy.riskDescription}
                        </div>
                        
                        <div className="pt-3 mt-4 border-t border-neutral-200 flex justify-end">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => console.log(`Explore ${strategy.name} strategy`)}
                          >
                            Explore Strategy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Card className="bg-white shadow-sm">
                <CardHeader className="border-b border-neutral-200 px-5 py-4">
                  <CardTitle className="text-lg font-medium text-neutral-900">
                    Guidance for Implementation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium mb-2">Classification Optimization</h3>
                      <ol className="list-decimal pl-5 space-y-2 text-sm text-neutral-600">
                        <li>Review product specifications against alternative HS code requirements</li>
                        <li>Prepare technical documentation supporting the classification</li>
                        <li>Consider requesting a binding ruling from Customs and Border Protection</li>
                        <li>Work with a customs broker to implement the new classification</li>
                        <li>Maintain detailed records to support the classification if questioned</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium mb-2">Country of Origin Strategies</h3>
                      <ol className="list-decimal pl-5 space-y-2 text-sm text-neutral-600">
                        <li>Identify potential manufacturing locations outside of China</li>
                        <li>Ensure "substantial transformation" requirements will be met</li>
                        <li>Document manufacturing processes for customs verification</li>
                        <li>Obtain certificates of origin from suppliers</li>
                        <li>Account for potential increase in production or shipping costs</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium mb-2">Product Modification Approaches</h3>
                      <ol className="list-decimal pl-5 space-y-2 text-sm text-neutral-600">
                        <li>Identify components that could be shipped separately</li>
                        <li>Analyze post-importation assembly requirements</li>
                        <li>Document the modification strategy for customs clearance</li>
                        <li>Verify the approach with customs counsel</li>
                        <li>Consider logistics costs for the separate shipments</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </>
  );
};

export default TariffAnalysisDashboard;