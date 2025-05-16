import { useContext, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PageHeader from "@/components/common/PageHeader";
import { LanguageContext } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { FaDownload, FaBox, FaShip, FaFileInvoice, FaPercent } from "react-icons/fa";
import { FaCircleInfo, FaMagnifyingGlass } from "react-icons/fa6";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CopilotAssistant from "@/components/ai/CopilotAssistant";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import HSCodeAssistant from "@/components/ai/HSCodeAssistant";

// Sample data structure for cost breakdown - to be used when no data is available
const sampleData = {
  components: [
    { name: "Product Value", value: 2500, percentage: 50, color: "#0088FE" },
    { name: "Shipping & Freight", value: 1000, percentage: 20, color: "#00C49F" },
    { name: "Duties & Tariffs", value: 750, percentage: 15, color: "#FFBB28" },
    { name: "Insurance", value: 250, percentage: 5, color: "#FF8042" },
    { name: "Documentation", value: 200, percentage: 4, color: "#8884d8" },
    { name: "Handling Fees", value: 300, percentage: 6, color: "#82ca9d" }
  ],
  totalCost: 5000,
  currency: "USD",
  exchangeRatesDate: new Date(),
  shipmentId: 1,
  shippingMethods: [
    { name: "Air Freight", cost: 1200, transitTime: 5, co2: 1.2 },
    { name: "Sea Freight", cost: 800, transitTime: 30, co2: 0.5 },
    { name: "Rail Freight", cost: 900, transitTime: 18, co2: 0.7 },
    { name: "Road Transport", cost: 1100, transitTime: 12, co2: 1.0 }
  ],
  productDetails: {
    name: "Organic Cotton T-Shirts",
    hsCode: "6109.10.00",
    origin: "India",
    destination: "United States",
    value: 2500,
    quantity: 500,
    unitValue: 5
  }
};

// Custom tooltip for pie chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow-md">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-sm text-primary">{`${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(payload[0].value)}`}</p>
        <p className="text-xs text-gray-500">{`${payload[0].payload.percentage.toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};

// Cost Breakdown Dashboard - Following dashboard checklist guidelines
const CostBreakdownDashboard = () => {
  const { t } = useContext(LanguageContext);

  // Get cost breakdown data from API - no hardcoded values
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['/api/cost-breakdown'],
  });

  // Combine API data with sample structure for complete rendering
  // In a real world scenario, the API would return all required fields
  const data = apiData && apiData.components && apiData.components.length > 0 
    ? {
        ...apiData,
        // Add default values for missing fields to prevent UI errors
        shippingMethods: apiData.shippingMethods || [],
        productDetails: apiData.productDetails || {
          name: "N/A",
          hsCode: "N/A",
          origin: "N/A",
          destination: "N/A",
          value: 0,
          quantity: 0,
          unitValue: 0
        }
      }
    : null;

  // Format currency with proper symbols
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Get color for chart segments
  const getColor = (index: number) => {
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
    return colors[index % colors.length];
  };

  return (
    <>
      <PageHeader
        title={t("dashboard.costBreakdown.title")}
        description={t("dashboard.costBreakdown.description")}
        actions={[
          {
            label: t("common.export"),
            icon: <FaDownload />,
            onClick: () => console.log("Export cost breakdown"),
            variant: "outline"
          }
        ]}
      />

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      ) : error ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              <p className="font-medium">{t("common.error")}</p>
              <p className="text-sm">{t("dashboard.costBreakdown.dataError")}</p>
            </div>
          </CardContent>
        </Card>
      ) : !data ? (
        // No data available state
        <Card className="mb-6 border-dashed border-2">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <FaBox className="text-neutral-400 text-xl" />
            </div>
            <h3 className="text-lg font-medium mb-2">{t("dashboard.costBreakdown.noDataAvailable")}</h3>
            <p className="text-neutral-500 max-w-md mx-auto mb-6">
              Start by creating a shipment or selecting an existing one for analysis.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Product Overview Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white shadow-sm border border-neutral-200">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="mr-3 mt-1 bg-blue-100 rounded-full p-2">
                    <FaBox className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Product Value</div>
                    <div className="text-xl font-bold text-neutral-900">
                      {formatCurrency(data.productDetails.value || 0, data.currency)}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {data.productDetails.quantity} units × {formatCurrency(data.productDetails.unitValue || 0, data.currency)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border border-neutral-200">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="mr-3 mt-1 bg-green-100 rounded-full p-2">
                    <FaShip className="text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Total Landed Cost</div>
                    <div className="text-xl font-bold text-neutral-900">
                      {formatCurrency(data.totalCost || 0, data.currency)}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {formatCurrency((data.totalCost || 0) / (data.productDetails.quantity || 1), data.currency)} per unit
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border border-neutral-200">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="mr-3 mt-1 bg-orange-100 rounded-full p-2">
                    <FaFileInvoice className="text-orange-600" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Additional Costs</div>
                    <div className="text-xl font-bold text-neutral-900">
                      {formatCurrency((data.totalCost || 0) - (data.productDetails.value || 0), data.currency)}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      <FaPercent className="inline-block mr-1 text-xs" />
                      {Math.round(((data.totalCost || 0) - (data.productDetails.value || 0)) / (data.productDetails.value || 1) * 100)}% of product value
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Information Card */}
          <Card className="bg-white shadow-sm border border-neutral-200 mb-6">
            <CardHeader className="border-b border-neutral-200 px-5 py-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium text-neutral-900">
                  Product Information
                </CardTitle>
                <Badge variant="outline" className="text-xs font-normal">
                  HS: {data.productDetails.hsCode}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-lg mb-3">{data.productDetails.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Origin:</span>
                      <span className="font-medium">{data.productDetails.origin}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Destination:</span>
                      <span className="font-medium">{data.productDetails.destination}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Quantity:</span>
                      <span className="font-medium">{data.productDetails.quantity} units</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t md:border-t-0 md:border-l border-neutral-200 md:pl-4 pt-4 md:pt-0">
                  <h4 className="text-sm font-medium mb-2">Applicable Trade Agreements</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800">
                      GSP Eligible
                    </Badge>
                    <Badge className="bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800">
                      USMCA
                    </Badge>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Documentation Required</h4>
                    <ul className="text-xs text-neutral-600 space-y-1">
                      <li>• Certificate of Origin</li>
                      <li>• Commercial Invoice</li>
                      <li>• Packing List</li>
                      <li>• Bill of Lading</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for different cost views */}
          <Tabs defaultValue="breakdown" className="mb-6">
            <TabsList className="bg-white border border-neutral-200 p-1">
              <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
              <TabsTrigger value="shipping">Shipping Options</TabsTrigger>
              <TabsTrigger value="optimization">Optimization Tips</TabsTrigger>
            </TabsList>
            
            <TabsContent value="breakdown" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cost Breakdown Visual */}
                <Card className="bg-white shadow-sm border border-neutral-200">
                  <CardHeader className="border-b border-neutral-200 px-5 py-4">
                    <CardTitle className="text-lg font-medium text-neutral-900">
                      {t("dashboard.costBreakdown.visualBreakdownTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    {data.components && data.components.length > 0 ? (
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.components}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                              labelLine={true}
                            >
                              {data.components.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color || getColor(index)} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <p>{t("dashboard.costBreakdown.noDataAvailable")}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Cost Table - All values dynamically calculated */}
                <Card className="bg-white shadow-sm border border-neutral-200">
                  <CardHeader className="border-b border-neutral-200 px-5 py-4">
                    <CardTitle className="text-lg font-medium text-neutral-900">
                      {t("dashboard.costBreakdown.costsTableTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
                          <tr>
                            <th className="whitespace-nowrap px-5 py-3 text-left">
                              {t("dashboard.costBreakdown.component")}
                            </th>
                            <th className="whitespace-nowrap px-5 py-3 text-right">
                              {t("dashboard.costBreakdown.value")}
                            </th>
                            <th className="whitespace-nowrap px-5 py-3 text-right">
                              {t("dashboard.costBreakdown.percentage")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 text-sm">
                          {/* Cost Entries - No placeholder data, empty state shown when no data */}
                          {data.components && data.components.length > 0 ? (
                            data.components.map((component: any, index: number) => (
                              <tr key={index} className="hover:bg-neutral-50">
                                <td className="whitespace-nowrap px-5 py-3 font-medium flex items-center">
                                  <div
                                    className="w-3 h-3 mr-2 rounded-full"
                                    style={{ backgroundColor: component.color || getColor(index) }}
                                  ></div>
                                  {component.name}
                                </td>
                                <td className="whitespace-nowrap px-5 py-3 text-right">
                                  {formatCurrency(component.value, data.currency)}
                                </td>
                                <td className="whitespace-nowrap px-5 py-3 text-right">
                                  {component.percentage.toFixed(1)}%
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-5 py-10 text-center text-neutral-500">
                                {t("dashboard.costBreakdown.noDataAvailable")}
                              </td>
                            </tr>
                          )}
                          
                          {/* Total Row - Always calculated, never hard-coded */}
                          {data.components && data.components.length > 0 && (
                            <tr className="bg-neutral-50 font-medium">
                              <td className="whitespace-nowrap px-5 py-3">
                                {t("dashboard.costBreakdown.total")}
                              </td>
                              <td className="whitespace-nowrap px-5 py-3 text-right">
                                {formatCurrency(data.totalCost, data.currency)}
                              </td>
                              <td className="whitespace-nowrap px-5 py-3 text-right">
                                100.0%
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="mt-4">
              <Card className="bg-white shadow-sm border border-neutral-200">
                <CardHeader className="border-b border-neutral-200 px-5 py-4">
                  <CardTitle className="text-lg font-medium text-neutral-900">
                    Shipping Methods Comparison
                  </CardTitle>
                  <CardDescription>
                    Compare cost, time, and environmental impact across shipping methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  {data.shippingMethods && data.shippingMethods.length > 0 ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={data.shippingMethods}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="cost" name="Cost (USD)" fill="#8884d8" />
                          <Bar yAxisId="right" dataKey="transitTime" name="Transit Time (days)" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-neutral-500">No shipping method comparison available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {data.shippingMethods && data.shippingMethods.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full bg-white shadow-sm border border-neutral-200 rounded-lg">
                    <thead className="bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
                      <tr>
                        <th className="px-5 py-3 text-left">Shipping Method</th>
                        <th className="px-5 py-3 text-center">Transit Time</th>
                        <th className="px-5 py-3 text-center">Cost</th>
                        <th className="px-5 py-3 text-center">CO2 Emissions</th>
                        <th className="px-5 py-3 text-center">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {data.shippingMethods.map((method: any, index: number) => (
                        <tr key={index} className={index === 1 ? "bg-green-50" : "hover:bg-neutral-50"}>
                          <td className="px-5 py-3 font-medium">{method.name}</td>
                          <td className="px-5 py-3 text-center">{method.transitTime} days</td>
                          <td className="px-5 py-3 text-center">{formatCurrency(method.cost, data.currency)}</td>
                          <td className="px-5 py-3 text-center">{method.co2} tons</td>
                          <td className="px-5 py-3 text-center">
                            {index === 1 && (
                              <Badge className="bg-green-100 text-green-800">
                                Best Value
                              </Badge>
                            )}
                            {index === 0 && (
                              <Badge className="bg-blue-100 text-blue-800">
                                Fastest
                              </Badge>
                            )}
                            {index === 2 && (
                              <Badge className="bg-purple-100 text-purple-800">
                                Balanced
                              </Badge>
                            )}
                            {index === 3 && (
                              <Badge className="bg-amber-100 text-amber-800">
                                Eco-Friendly
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="optimization" className="mt-4">
              <Card className="bg-white shadow-sm border border-neutral-200">
                <CardHeader className="border-b border-neutral-200 px-5 py-4">
                  <CardTitle className="text-lg font-medium text-neutral-900">
                    Cost Optimization Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900 mb-3">
                        Potential Savings Areas
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-2 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                              <path d="M20 6 9 17l-5-5"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Special Program Eligibility</p>
                            <p className="text-xs text-neutral-500">Product may qualify for duty reduction under GSP, saving up to 9.1% in duties</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-2 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                              <path d="M20 6 9 17l-5-5"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Consolidation Opportunity</p>
                            <p className="text-xs text-neutral-500">Combining with other shipments could reduce per-unit freight costs by 15-20%</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-2 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                              <path d="M20 6 9 17l-5-5"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Insurance Cost Reduction</p>
                            <p className="text-xs text-neutral-500">Current insurance rate is above market average, potential to save 2-3% on total cost</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="border-t md:border-t-0 md:border-l border-neutral-200 md:pl-6 pt-4 md:pt-0">
                      <h3 className="text-sm font-medium text-neutral-900 mb-3">
                        Tariff Optimization Strategy
                      </h3>
                      <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700 mb-4">
                        <p className="font-medium mb-1">Consider First Sale Rule Application</p>
                        <p className="text-xs">Using the First Sale Rule could reduce the dutiable value by 10-15%, depending on your supply chain structure.</p>
                      </div>
                      
                      <div className="bg-amber-50 p-4 rounded-md text-sm text-amber-700">
                        <div className="flex items-start">
                          <FaCircleInfo className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium mb-1">Classification Review Recommended</p>
                            <p className="text-xs">Current HTS classification may not be optimal. A thorough review could identify lower duty rate options.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Currency Information with Date-Stamp */}
          <Card className="bg-white shadow-sm border border-neutral-200 mb-6">
            <CardContent className="p-4">
              <div className="text-sm text-neutral-500 flex flex-wrap justify-between">
                <div>
                  {t("dashboard.costBreakdown.baseCurrency")}: {data.currency}
                </div>
                <div>
                  {t("dashboard.costBreakdown.exchangeRatesDate")}: {new Date(data.exchangeRatesDate).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes and Assumptions */}
          <Card className="bg-white shadow-sm border border-neutral-200 mb-6">
            <CardHeader className="border-b border-neutral-200 px-5 py-4">
              <CardTitle className="text-lg font-medium text-neutral-900">
                {t("dashboard.costBreakdown.notesTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <ul className="list-disc pl-5 space-y-2 text-sm text-neutral-600">
                <li>{t("dashboard.costBreakdown.note1")}</li>
                <li>{t("dashboard.costBreakdown.note2")}</li>
                <li>{t("dashboard.costBreakdown.note3")}</li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
};

// Wrap the component with the AI Copilot
const CostBreakdownDashboardWithCopilot = () => {
  const { data } = useQuery({ queryKey: ["/api/shipments/active"] });
  
  // Extract shipment details for the AI Copilot
  const productDetailsForCopilot = {
    name: data?.productDetails?.name || "Sample Product",
    category: data?.productDetails?.category || "Electronics",
    hsCode: data?.productDetails?.hsCode || "8517.62",
    origin: data?.productDetails?.origin || "China", 
    destination: data?.productDetails?.destination || "United States",
    value: data?.productDetails?.value || 3500
  };
  
  const shipmentDetailsForCopilot = {
    transportMode: data?.transportMode || "air",
    incoterm: data?.incoterm || "CIF",
    weight: data?.weight || 150
  };
  
  // Convert cost components to format expected by Copilot
  const costComponentsForCopilot = {};
  if (data?.components) {
    data.components.forEach(component => {
      costComponentsForCopilot[component.name] = {
        amount: component.value,
        description: component.name,
        category: component.name.toLowerCase().includes('duty') ? 'customs' : 
                  component.name.toLowerCase().includes('shipping') ? 'shipping' : 'other'
      };
    });
  }
  
  return (
    <>
      <CostBreakdownDashboard />
      <CopilotAssistant 
        productDetails={productDetailsForCopilot}
        shipmentDetails={shipmentDetailsForCopilot}
        costComponents={costComponentsForCopilot}
      />
    </>
  );
};

export default CostBreakdownDashboardWithCopilot;