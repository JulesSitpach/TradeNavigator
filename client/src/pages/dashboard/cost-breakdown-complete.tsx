import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Printer, Download, Share2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import ScrollTabs from '@/components/ui/scroll-tabs';
import PageHeader from '@/components/common/PageHeader';

// Dummy data to match the provided example
const costBreakdownData = {
  tradeFlow: {
    productName: "High-performance laptops, 13-inch display, Intel Core i7",
    hsCode: "8471.30",
    quantity: 50,
    value: 20000,
    duty: 672.80,
    vat: 4075.86,
    totalLandedCost: 26927.21
  },
  currency: {
    base: "USD",
    rates: {
      "EUR": 0.92,
      "CAD": 1.33
    },
    exchangeRatesDate: "2025-05-15"
  },
  costComponents: [
    { name: "Product Cost", value: 20000, percentage: 74.3 },
    { name: "Shipping", value: 1450, percentage: 5.4 },
    { name: "Customs Duty", value: 672.80, percentage: 2.5 },
    { name: "VAT/GST", value: 4075.86, percentage: 15.1 },
    { name: "Insurance", value: 320, percentage: 1.2 },
    { name: "Documentation", value: 150, percentage: 0.6 },
    { name: "Handling Fees", value: 258.55, percentage: 1.0 }
  ],
  detailedBreakdown: [
    { name: "Product Cost (FOB)", value: 20000, percentage: 74.3 },
    { name: "Ocean Freight", value: 850, percentage: 3.2 },
    { name: "Insurance", value: 320, percentage: 1.2 },
    { name: "Import Duty (3.4%)", value: 672.80, percentage: 2.5 },
    { name: "Customs Clearance", value: 180, percentage: 0.7 },
    { name: "Inland Transportation", value: 420, percentage: 1.6 },
    { name: "Documentation Fees", value: 150, percentage: 0.6 },
    { name: "Handling Fees", value: 258.55, percentage: 1.0 },
    { name: "VAT/GST (19%)", value: 4075.86, percentage: 15.1 }
  ],
  optimizationInsights: {
    currentStatus: "Current route is using FOB Incoterms from Shenzhen to Hamburg using ocean freight.",
    recommendations: [
      "Consider using CIF terms for better cost efficiency with this supplier",
      "Shipment consolidation could save up to 12% on shipping costs",
      "Applying for Germany's IT product tariff exemption could eliminate duty costs completely",
      "Explore special economic zone storage options in Hamburg to defer VAT payments"
    ],
    potentialSavings: 3150.24
  }
};

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF', '#FF6B6B', '#4ECDC4'];

const CostBreakdownComplete = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <PageHeader
        title="Cost Breakdown Analysis"
        description="Detailed breakdown of all costs associated with your trade"
        actions={[
          {
            label: "Print",
            icon: <Printer size={16} />,
            onClick: () => window.print(),
            variant: "outline"
          },
          {
            label: "Export",
            icon: <Download size={16} />,
            onClick: () => console.log("Export data"),
            variant: "outline"
          },
          {
            label: "Share",
            icon: <Share2 size={16} />,
            onClick: () => console.log("Share analysis"),
            variant: "outline"
          }
        ]}
      />

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Trade Flow Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <div className="text-sm font-medium">Product Name</div>
              <div className="text-sm">{costBreakdownData.tradeFlow.productName}</div>
              
              <div className="text-sm font-medium mt-3">HS Code</div>
              <div className="text-sm">{costBreakdownData.tradeFlow.hsCode}</div>
            </div>
            
            <div className="space-y-1.5">
              <div className="text-sm font-medium">Quantity</div>
              <div className="text-sm">{costBreakdownData.tradeFlow.quantity} units</div>
              
              <div className="text-sm font-medium mt-3">Product Value</div>
              <div className="text-sm">${costBreakdownData.tradeFlow.value.toLocaleString()}</div>
            </div>
            
            <div className="space-y-1.5">
              <div className="text-sm font-medium">Customs Duty</div>
              <div className="text-sm">${costBreakdownData.tradeFlow.duty.toLocaleString()}</div>
              
              <div className="text-sm font-medium mt-3">VAT</div>
              <div className="text-sm">${costBreakdownData.tradeFlow.vat.toLocaleString()}</div>
              
              <div className="text-sm font-medium mt-3">Total Landed Cost</div>
              <div className="text-sm font-bold">${costBreakdownData.tradeFlow.totalLandedCost.toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <ScrollTabs>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-12 p-0 bg-transparent">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 max-w-[200px]"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="detailed-breakdown" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 max-w-[200px]"
                >
                  Detailed Breakdown
                </TabsTrigger>
                <TabsTrigger 
                  value="optimization" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 max-w-[200px]"
                >
                  Optimization Insights
                </TabsTrigger>
                <TabsTrigger 
                  value="duty-analysis" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 max-w-[200px]"
                >
                  Duty Analysis
                </TabsTrigger>
                <TabsTrigger 
                  value="currency-exchange" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 max-w-[200px]"
                >
                  Currency Exchange
                </TabsTrigger>
                <TabsTrigger 
                  value="tax-considerations" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 max-w-[200px]"
                >
                  Tax Considerations
                </TabsTrigger>
                <TabsTrigger 
                  value="exemption-analysis" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 max-w-[200px]"
                >
                  Exemption Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Cost Distribution</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={costBreakdownData.costComponents}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          >
                            {costBreakdownData.costComponents.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Cost Components</h3>
                    <div className="space-y-3">
                      {costBreakdownData.costComponents.map((component, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span>{component.name}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-medium">
                              ${component.value.toLocaleString()}
                            </span>
                            <div className="text-sm text-gray-500 w-12 text-right">
                              {component.percentage}%
                            </div>
                          </div>
                        </div>
                      ))}
                      <Separator className="my-4" />
                      <div className="flex justify-between items-center font-bold">
                        <span>Total Landed Cost</span>
                        <span>${costBreakdownData.tradeFlow.totalLandedCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="detailed-breakdown" className="p-6">
                <h3 className="text-lg font-medium mb-4">Detailed Cost Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left p-3 font-medium">Cost Component</th>
                        <th className="text-right p-3 font-medium">Value</th>
                        <th className="text-right p-3 font-medium">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costBreakdownData.detailedBreakdown.map((item, index) => (
                        <tr key={index} className="border-b border-muted-foreground/20">
                          <td className="p-3">{item.name}</td>
                          <td className="p-3 text-right">${item.value.toLocaleString()}</td>
                          <td className="p-3 text-right">{item.percentage}%</td>
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td className="p-3">Total Landed Cost</td>
                        <td className="p-3 text-right">${costBreakdownData.tradeFlow.totalLandedCost.toLocaleString()}</td>
                        <td className="p-3 text-right">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="optimization" className="p-6">
                <h3 className="text-lg font-medium mb-4">Cost Optimization Insights</h3>
                <Card className="bg-muted/30 border-none mb-6">
                  <CardContent className="p-4">
                    <p className="text-sm">{costBreakdownData.optimizationInsights.currentStatus}</p>
                  </CardContent>
                </Card>
                
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="list-disc pl-5 space-y-2 mb-6">
                  {costBreakdownData.optimizationInsights.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm">{rec}</li>
                  ))}
                </ul>
                
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-700">Potential Savings</span>
                    <span className="font-bold text-green-700">
                      ${costBreakdownData.optimizationInsights.potentialSavings.toLocaleString()}
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="duty-analysis" className="p-6">
                <h3 className="text-lg font-medium mb-4">Duty Analysis</h3>
                <p className="text-muted-foreground mb-2">More content would be added here...</p>
              </TabsContent>

              <TabsContent value="currency-exchange" className="p-6">
                <h3 className="text-lg font-medium mb-4">Currency Exchange</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base font-medium">USD/EUR</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">€{costBreakdownData.currency.rates.EUR}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Exchange rate as of {costBreakdownData.currency.exchangeRatesDate}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base font-medium">USD/CAD</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">C${costBreakdownData.currency.rates.CAD}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Exchange rate as of {costBreakdownData.currency.exchangeRatesDate}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base font-medium">USD Equivalent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${costBreakdownData.tradeFlow.totalLandedCost.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total landed cost
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tax-considerations" className="p-6">
                <h3 className="text-lg font-medium mb-4">Tax Considerations</h3>
                <p className="text-muted-foreground mb-2">More content would be added here...</p>
              </TabsContent>

              <TabsContent value="exemption-analysis" className="p-6">
                <h3 className="text-lg font-medium mb-4">Exemption Analysis</h3>
                <p className="text-muted-foreground mb-2">More content would be added here...</p>
              </TabsContent>
            </Tabs>
          </ScrollTabs>
        </CardContent>
      </Card>
      
      <div className="mt-6 flex justify-end space-x-4">
        <Button variant="outline">Back to Form</Button>
        <Button>Share Analysis</Button>
      </div>
    </>
  );
};

export default CostBreakdownComplete;