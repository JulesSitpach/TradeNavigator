import { useState } from "react";
import { FaDownload, FaPlus, FaFilter, FaFileLines } from "react-icons/fa6";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { FaChartBar, FaChartLine, FaChartPie } from "react-icons/fa";

const Reports = () => {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("analysis");
  const [dateRange, setDateRange] = useState("30days");
  const [searchQuery, setSearchQuery] = useState("");

  // Get analysis results
  const { data: analyses, isLoading: isAnalysesLoading } = useQuery({
    queryKey: ['/api/analysis'],
  });

  // Example data for charts
  const costBreakdownData = [
    { name: 'Product Cost', value: 42500, percentage: 71 },
    { name: 'Shipping', value: 8250, percentage: 14 },
    { name: 'Duties', value: 6375, percentage: 11 },
    { name: 'Insurance', value: 2750, percentage: 4 },
  ];
  
  const costTrendData = [
    { month: 'Jan', product: 8400, shipping: 1640, duties: 1420, insurance: 540 },
    { month: 'Feb', product: 8800, shipping: 1720, duties: 1460, insurance: 560 },
    { month: 'Mar', product: 9100, shipping: 1770, duties: 1525, insurance: 580 },
    { month: 'Apr', product: 9400, shipping: 1840, duties: 1590, insurance: 600 },
    { month: 'May', product: 9600, shipping: 1880, duties: 1635, insurance: 620 },
    { month: 'Jun', product: 9800, shipping: 1920, duties: 1680, insurance: 640 },
  ];
  
  const marketComparisonData = [
    { market: 'US', value: 15000 },
    { market: 'EU', value: 12000 },
    { market: 'China', value: 9500 },
    { market: 'Japan', value: 7000 },
    { market: 'Canada', value: 5500 },
    { market: 'Mexico', value: 4000 },
  ];

  const COLORS = ['#1a73e8', '#599af2', '#7eaef5', '#a5c8f8'];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Filter analyses by search query
  const filteredAnalyses = analyses ? analyses.filter((analysis: any) => {
    return (
      analysis.id.toString().includes(searchQuery) ||
      (analysis.shipmentId && analysis.shipmentId.toString().includes(searchQuery))
    );
  }) : [];

  // Export report
  const handleExportReport = () => {
    console.log("Exporting report...");
    // This would be implemented with a real export functionality
  };

  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        description="View and export detailed reports of your trade activities"
        actions={[
          {
            label: "Export Report",
            icon: <FaDownload />,
            onClick: handleExportReport,
            variant: "outline"
          },
          {
            label: "New Analysis",
            icon: <FaPlus />,
            onClick: () => setLocation("/product-analysis"),
          }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white shadow-sm border border-neutral-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Trade Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-neutral-900">{formatCurrency(156750)}</span>
              <span className="flex items-center text-sm text-secondary mt-1">
                <span className="rounded-full bg-secondary-light text-secondary px-1.5 py-0.5 text-xs font-medium">+12.5%</span>
                <span className="ml-2">vs previous period</span>
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border border-neutral-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-neutral-900">28</span>
              <span className="flex items-center text-sm text-secondary mt-1">
                <span className="rounded-full bg-secondary-light text-secondary px-1.5 py-0.5 text-xs font-medium">+8.3%</span>
                <span className="ml-2">vs previous period</span>
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border border-neutral-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Estimated Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-neutral-900">{formatCurrency(23512)}</span>
              <span className="flex items-center text-sm text-secondary mt-1">
                <span className="rounded-full bg-secondary-light text-secondary px-1.5 py-0.5 text-xs font-medium">+15.2%</span>
                <span className="ml-2">vs standard rates</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="border-b border-neutral-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <CardTitle>Report Data</CardTitle>
            <div className="flex items-center space-x-2 mt-2 md:mt-0">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleExportReport}>
                <FaDownload className="mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <TabsTrigger value="analysis" className="flex items-center">
                  <FaFileLines className="mr-2" />
                  Analysis History
                </TabsTrigger>
                <TabsTrigger value="cost" className="flex items-center">
                  <FaChartPie className="mr-2" />
                  Cost Breakdown
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center">
                  <FaChartLine className="mr-2" />
                  Trends
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="analysis" className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Analysis History</h3>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <FaFilter className="mr-2" />
                    Filter
                  </Button>
                  <div className="w-60">
                    <Input 
                      placeholder="Search by ID or shipment..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {isAnalysesLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : !analyses || analyses.length === 0 ? (
                  <div className="text-center p-8">
                    <div className="text-neutral-400 mb-4">
                      <FaFileLines className="mx-auto h-12 w-12" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">No analysis records found</h3>
                    <p className="text-neutral-500 mb-4">Start by creating your first cost analysis</p>
                    <Button onClick={() => setLocation("/product-analysis")}>
                      <FaPlus className="mr-2" />
                      Create Analysis
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Shipment</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead className="text-right">Total Cost</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAnalyses.map((analysis: any) => (
                        <TableRow key={analysis.id}>
                          <TableCell className="font-medium">#{analysis.id}</TableCell>
                          <TableCell>
                            {new Date(analysis.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>#{analysis.shipmentId}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {analysis.destinationCountry || "Unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(analysis.totalLandedCost)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setLocation(`/product-analysis?analysisId=${analysis.id}`)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="cost" className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Average Cost Distribution</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={costBreakdownData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          innerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {costBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Cost Analysis by Category</h3>
                  <div className="space-y-4">
                    {costBreakdownData.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-neutral-700">{item.name}</span>
                          <span className="text-sm font-medium text-neutral-900">{formatCurrency(item.value)}</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ width: `${item.percentage}%`, backgroundColor: COLORS[index] }}
                          ></div>
                        </div>
                        <div className="text-xs text-neutral-500 mt-1">{item.percentage}% of total cost</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-medium text-neutral-800">Total Landed Cost:</span>
                      <span className="text-xl font-bold text-neutral-900">
                        {formatCurrency(costBreakdownData.reduce((sum, item) => sum + item.value, 0))}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-500">
                      Average across all shipments in selected time period
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="trends" className="p-4">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Cost Trend Analysis</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={costTrendData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Line type="monotone" dataKey="product" name="Product Cost" stroke="#1a73e8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="shipping" name="Shipping" stroke="#599af2" />
                        <Line type="monotone" dataKey="duties" name="Duties & Tariffs" stroke="#7eaef5" />
                        <Line type="monotone" dataKey="insurance" name="Insurance" stroke="#a5c8f8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Market Comparison</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={marketComparisonData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="market" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Bar dataKey="value" name="Trade Volume" fill="#1a73e8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2 text-primary">Cost Saving Opportunities</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="bg-secondary-light text-secondary p-1 rounded-full mr-2 mt-0.5">
                    <FaCheck size={10} />
                  </span>
                  <span>Consider consolidating shipments to reduce per-unit freight costs by up to 15%</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-secondary-light text-secondary p-1 rounded-full mr-2 mt-0.5">
                    <FaCheck size={10} />
                  </span>
                  <span>Utilizing USMCA benefits could save approximately $3,240 in duties</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-secondary-light text-secondary p-1 rounded-full mr-2 mt-0.5">
                    <FaCheck size={10} />
                  </span>
                  <span>Shifting to sea freight for non-urgent shipments could reduce transportation costs by 35%</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2 text-primary">Market Expansion Insights</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="bg-secondary-light text-secondary p-1 rounded-full mr-2 mt-0.5">
                    <FaCheck size={10} />
                  </span>
                  <span>Canadian market shows 8% growth potential with minimal regulatory barriers</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-secondary-light text-secondary p-1 rounded-full mr-2 mt-0.5">
                    <FaCheck size={10} />
                  </span>
                  <span>Product category enjoys preferential treatment under EU trade agreement</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-secondary-light text-secondary p-1 rounded-full mr-2 mt-0.5">
                    <FaCheck size={10} />
                  </span>
                  <span>Mexico represents underserved market with 10% annual growth in your category</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const FaCheck = ({ size }: { size: number }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17L4 12" />
    </svg>
  );
};

export default Reports;
