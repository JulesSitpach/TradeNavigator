import { useContext, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/common/PageHeader";
import { LanguageContext } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FaDownload, FaPlus, FaBox, FaShip, FaMoneyBill, FaChartPie, FaFileInvoice, FaGlobe, FaInfoCircle } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { ScrollableTabs } from "@/components/ui/scroll-tabs";

// Section 1: Product Information Form Component
const ProductInfoForm = () => {
  return (
    <Card className="bg-white shadow-sm mb-6">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-medium">Product Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input id="product-name" placeholder="Enter product name" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product-description">Product Description</Label>
              <Textarea id="product-description" placeholder="Describe your product" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin-country">Origin Country</Label>
                <Select>
                  <SelectTrigger id="origin-country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cn">China</SelectItem>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                    <SelectItem value="mx">Mexico</SelectItem>
                    <SelectItem value="jp">Japan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination-country">Destination Country</Label>
                <Select>
                  <SelectTrigger id="destination-country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cn">China</SelectItem>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="jp">Japan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-category">Product Category</Label>
                <Select>
                  <SelectTrigger id="product-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="textiles">Textiles & Apparel</SelectItem>
                    <SelectItem value="food">Food & Beverages</SelectItem>
                    <SelectItem value="chemicals">Chemicals</SelectItem>
                    <SelectItem value="machinery">Machinery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hs-code">HS Code</Label>
                <Input id="hs-code" placeholder="e.g. 8471.30.0100" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit-value">Unit Value (USD)</Label>
                <Input id="unit-value" type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit-weight">Unit Weight (kg)</Label>
                <Input id="unit-weight" type="number" placeholder="0.00" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping-method">Shipping Method</Label>
                <Select>
                  <SelectTrigger id="shipping-method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="air">Air Freight</SelectItem>
                    <SelectItem value="sea">Sea Freight</SelectItem>
                    <SelectItem value="rail">Rail Freight</SelectItem>
                    <SelectItem value="road">Road Freight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="incoterm">Incoterm</Label>
              <Select>
                <SelectTrigger id="incoterm">
                  <SelectValue placeholder="Select incoterm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exw">EXW (Ex Works)</SelectItem>
                  <SelectItem value="fob">FOB (Free on Board)</SelectItem>
                  <SelectItem value="cif">CIF (Cost, Insurance & Freight)</SelectItem>
                  <SelectItem value="dap">DAP (Delivered at Place)</SelectItem>
                  <SelectItem value="ddp">DDP (Delivered Duty Paid)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Does this product have any special requirements?
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <FaInfoCircle className="text-gray-400 text-sm" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">Special requirements may include refrigeration, hazardous material handling, or other specialized logistics needs that affect shipping costs and procedures.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="refrigeration" />
                  <label htmlFor="refrigeration" className="text-sm">Refrigeration</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="hazardous" />
                  <label htmlFor="hazardous" className="text-sm">Hazardous Materials</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="fragile" />
                  <label htmlFor="fragile" className="text-sm">Fragile/Special Handling</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button>Save Product Information</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Section 2: Cost Calculator Component
const CostCalculator = () => {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-medium">Cost Calculator</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Transportation Costs</Label>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Freight Cost</span>
                  <Input className="w-32" type="number" placeholder="0.00" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Insurance</span>
                  <Input className="w-32" type="number" placeholder="0.00" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Handling Fees</span>
                  <Input className="w-32" type="number" placeholder="0.00" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Customs & Duties</Label>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Import Duty (%)</span>
                  <Input className="w-32" type="number" placeholder="0.00" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">VAT/Sales Tax (%)</span>
                  <Input className="w-32" type="number" placeholder="0.00" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Customs Processing Fee</span>
                  <Input className="w-32" type="number" placeholder="0.00" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Other Costs</Label>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Documentation</span>
                  <Input className="w-32" type="number" placeholder="0.00" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Terminal Handling</span>
                  <Input className="w-32" type="number" placeholder="0.00" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Warehousing</span>
                  <Input className="w-32" type="number" placeholder="0.00" />
                </div>
              </div>
            </div>
            
            <div className="rounded-lg bg-gray-50 p-4 mt-4">
              <div className="text-sm font-medium mb-2">Total Landed Cost</div>
              <div className="text-2xl font-bold text-blue-600">$12,453.00</div>
              <div className="text-xs text-gray-500 mt-1">Per unit: $24.91</div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span>Product Cost</span>
                  <span>62%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping & Logistics</span>
                  <span>23%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Duties & Taxes</span>
                  <span>15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button variant="outline" className="mr-2">Reset</Button>
          <Button>Calculate Total Cost</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Section 3: Detailed Cost Breakdown Component
const DetailedCostBreakdown = () => {
  const mockCostComponents = [
    { name: 'Product Cost', value: 7500, percentage: 62 },
    { name: 'Ocean Freight', value: 1800, percentage: 15 },
    { name: 'Insurance', value: 375, percentage: 3 },
    { name: 'Import Duties', value: 1125, percentage: 9 },
    { name: 'VAT', value: 625, percentage: 5 },
    { name: 'Customs Processing', value: 250, percentage: 2 },
    { name: 'Terminal Handling', value: 350, percentage: 3 },
    { name: 'Documentation', value: 180, percentage: 1 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];
  
  return (
    <div className="space-y-8">
      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-medium">Cost Component Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockCostComponents}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <RechartTooltip formatter={(value) => ['$' + value, 'Cost']} />
                    <Legend />
                    <Bar dataKey="value" fill="#0088FE" name="Cost (USD)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockCostComponents}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockCostComponents.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartTooltip formatter={(value) => ['$' + value, 'Cost']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Total Landed Cost</div>
                <div className="text-2xl font-bold text-blue-600">$12,453.00</div>
                <div className="text-xs text-gray-500 mt-1">Per unit: $24.91</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-medium">Cost Drivers</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Product Value</span>
                  <span className="text-sm text-blue-600">High Impact</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-blue-600 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Weight/Volume</span>
                  <span className="text-sm text-blue-600">High Impact</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Distance</span>
                  <span className="text-sm text-blue-600">Medium Impact</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-blue-600 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Shipping Method</span>
                  <span className="text-sm text-blue-600">High Impact</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-blue-600 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Incoterm</span>
                  <span className="text-sm text-blue-600">Medium Impact</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-blue-600 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-medium">Cost Reduction Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">High</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Leverage Trade Agreements</h4>
                  <p className="text-xs text-gray-600">Potential savings: $1,125 (9%)</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">High</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Optimize Shipping Container Usage</h4>
                  <p className="text-xs text-gray-600">Potential savings: $720 (6%)</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Change Incoterm to FOB</h4>
                  <p className="text-xs text-gray-600">Potential savings: $350 (3%)</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Use Duty Drawback Program</h4>
                  <p className="text-xs text-gray-600">Potential savings: $375 (3%)</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Low</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Alternative Port of Entry</h4>
                  <p className="text-xs text-gray-600">Potential savings: $180 (1%)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-medium">Detailed Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Component</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (USD)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockCostComponents.map((component, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{component.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${component.value.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{component.percentage}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index === 0 ? 'Product Cost' : 
                       index >= 1 && index <= 3 ? 'Shipping & Logistics' : 
                       'Duties & Taxes'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index === 0 ? 'Based on invoice value' : 
                       index === 1 ? 'LCL ocean freight' : 
                       index === 2 ? '5% of product value' : 
                       index === 3 ? '15% tariff rate' : 
                       index === 4 ? 'Standard VAT rate' : 
                       'Standard processing fee'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 text-right">$12,205.00</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 text-right">100%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Section 4: Visualization Controls Component
const VisualizationControls = () => {
  return (
    <div className="space-y-8">
      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-medium">Cost Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: 'Jan', freight: 1800, duties: 1125, clearance: 450, vat: 625 },
                      { month: 'Feb', freight: 1850, duties: 1140, clearance: 460, vat: 640 },
                      { month: 'Mar', freight: 1900, duties: 1160, clearance: 470, vat: 650 },
                      { month: 'Apr', freight: 2100, duties: 1200, clearance: 490, vat: 680 },
                      { month: 'May', freight: 2050, duties: 1180, clearance: 480, vat: 670 },
                      { month: 'Jun', freight: 2000, duties: 1170, clearance: 475, vat: 660 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartTooltip formatter={(value) => ['$' + value, 'Cost']} />
                    <Legend />
                    <Line type="monotone" dataKey="freight" stroke="#8884d8" name="Freight Cost" />
                    <Line type="monotone" dataKey="duties" stroke="#82ca9d" name="Duties" />
                    <Line type="monotone" dataKey="clearance" stroke="#ffc658" name="Clearance Fees" />
                    <Line type="monotone" dataKey="vat" stroke="#ff8042" name="VAT/Taxes" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Visualization Type</Label>
                <Select defaultValue="line">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="scatter">Scatter Plot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Time Period</Label>
                <Select defaultValue="6m">
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">Last 3 Months</SelectItem>
                    <SelectItem value="6m">Last 6 Months</SelectItem>
                    <SelectItem value="1y">Last Year</SelectItem>
                    <SelectItem value="2y">Last 2 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Cost Components to Display</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="show-freight" defaultChecked />
                    <label htmlFor="show-freight" className="text-sm">Freight Cost</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="show-duties" defaultChecked />
                    <label htmlFor="show-duties" className="text-sm">Duties</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="show-clearance" defaultChecked />
                    <label htmlFor="show-clearance" className="text-sm">Clearance Fees</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="show-vat" defaultChecked />
                    <label htmlFor="show-vat" className="text-sm">VAT/Taxes</label>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-4">Update Visualization</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-medium">Cost Comparison by Origin</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { 
                    origin: 'China', 
                    product: 7500, 
                    freight: 1800, 
                    duties: 1125, 
                    clearance: 450, 
                    vat: 625 
                  },
                  { 
                    origin: 'Vietnam', 
                    product: 6800, 
                    freight: 1900, 
                    duties: 1020, 
                    clearance: 470, 
                    vat: 580 
                  },
                  { 
                    origin: 'Mexico', 
                    product: 7800, 
                    freight: 1200, 
                    duties: 390, 
                    clearance: 410, 
                    vat: 650 
                  },
                  { 
                    origin: 'Germany', 
                    product: 9500, 
                    freight: 1500, 
                    duties: 475, 
                    clearance: 430, 
                    vat: 790 
                  },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="origin" 
                  angle={0} 
                  textAnchor="middle" 
                  height={50}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <RechartTooltip formatter={(value) => ['$' + value, 'Cost']} />
                <Legend />
                <Bar dataKey="product" stackId="a" fill="#8884d8" name="Product Cost" />
                <Bar dataKey="freight" stackId="a" fill="#82ca9d" name="Freight" />
                <Bar dataKey="duties" stackId="a" fill="#ffc658" name="Duties" />
                <Bar dataKey="clearance" stackId="a" fill="#ff8042" name="Clearance" />
                <Bar dataKey="vat" stackId="a" fill="#8dd1e1" name="VAT/Taxes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Section 5: Cost Comparison Tool Component
const CostComparisonTool = () => {
  return (
    <div className="space-y-8">
      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-medium">Route Comparison</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-50 shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-200 bg-blue-50">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Current Route</Badge>
                <CardTitle className="text-md font-medium mt-2">China → USA (Sea)</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Transit Time:</span>
                    <span className="text-sm font-medium">28-32 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Freight Cost:</span>
                    <span className="text-sm font-medium">$1,800</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Duties & Taxes:</span>
                    <span className="text-sm font-medium">$1,750</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Other Costs:</span>
                    <span className="text-sm font-medium">$780</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between">
                    <span className="text-sm font-medium">Total Cost:</span>
                    <span className="text-sm font-bold">$12,330</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50 shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-200 bg-green-50">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Alternative 1</Badge>
                <CardTitle className="text-md font-medium mt-2">Vietnam → USA (Sea)</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Transit Time:</span>
                    <span className="text-sm font-medium">30-34 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Freight Cost:</span>
                    <span className="text-sm font-medium">$1,900</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Duties & Taxes:</span>
                    <span className="text-sm font-medium">$1,600</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Other Costs:</span>
                    <span className="text-sm font-medium">$750</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between">
                    <span className="text-sm font-medium">Total Cost:</span>
                    <span className="text-sm font-bold text-green-600">$11,050</span>
                  </div>
                  <div className="pt-1 text-green-600 text-xs font-medium text-right">
                    Save $1,280 (10.4%)
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50 shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-200 bg-purple-50">
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Alternative 2</Badge>
                <CardTitle className="text-md font-medium mt-2">Mexico → USA (Road)</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Transit Time:</span>
                    <span className="text-sm font-medium">5-7 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Freight Cost:</span>
                    <span className="text-sm font-medium">$1,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Duties & Taxes:</span>
                    <span className="text-sm font-medium">$390</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Other Costs:</span>
                    <span className="text-sm font-medium">$650</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between">
                    <span className="text-sm font-medium">Total Cost:</span>
                    <span className="text-sm font-bold text-green-600">$10,040</span>
                  </div>
                  <div className="pt-1 text-green-600 text-xs font-medium text-right">
                    Save $2,290 (18.6%)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-medium">Cost Impact Factors</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-sm font-medium">USMCA Benefits</span>
                  </div>
                  <span className="text-sm text-green-600">-$735</span>
                </div>
                <div className="text-xs text-gray-500">
                  Duty-free access for qualifying goods under USMCA trade agreement.
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-sm font-medium">Reduced Transit Time</span>
                  </div>
                  <span className="text-sm text-green-600">-$520</span>
                </div>
                <div className="text-xs text-gray-500">
                  Lower inventory carrying costs and faster market access.
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-sm font-medium">Lower Freight Costs</span>
                  </div>
                  <span className="text-sm text-green-600">-$600</span>
                </div>
                <div className="text-xs text-gray-500">
                  Ground transportation is more cost-effective than sea freight for this route.
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-sm font-medium">Labor Cost Difference</span>
                  </div>
                  <span className="text-sm text-red-600">+$300</span>
                </div>
                <div className="text-xs text-gray-500">
                  Higher production costs in Mexico compared to China.
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-sm font-medium">Quality Assurance</span>
                  </div>
                  <span className="text-sm text-red-600">+$425</span>
                </div>
                <div className="text-xs text-gray-500">
                  Additional quality control needed for new supplier.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-medium">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Supply Chain Disruption</h4>
                  <p className="text-xs text-gray-600">New supplier relationship may face initial challenges.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Border Crossing Delays</h4>
                  <p className="text-xs text-gray-600">Potential congestion at land border crossings.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Product Quality Consistency</h4>
                  <p className="text-xs text-gray-600">Ensuring consistent quality across different manufacturing locations.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Currency Fluctuation</h4>
                  <p className="text-xs text-gray-600">Mexican Peso has been relatively stable against USD.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Regulatory Compliance</h4>
                  <p className="text-xs text-gray-600">Simplified compliance under USMCA framework.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Section 6: Trade Agreement Calculator Component
const TradeAgreementCalculator = () => {
  return (
    <div className="space-y-8">
      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-medium">Applicable Trade Agreements</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-green-50 shadow-sm border border-green-100">
              <CardHeader className="pt-4 px-4 pb-0">
                <div className="flex justify-between items-center">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Recommended</Badge>
                  <div className="text-green-600 text-sm font-bold">Save $1,125</div>
                </div>
                <CardTitle className="text-md font-medium mt-3">USMCA</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Your product from Mexico qualifies for duty-free treatment under the United States-Mexico-Canada Agreement.
                </p>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Normal Duty Rate:</span>
                    <span className="text-xs font-medium">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Preferential Rate:</span>
                    <span className="text-xs font-medium">0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Required ROO:</span>
                    <span className="text-xs font-medium">Regional Value Content</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs">View Documentation Requirements</Button>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50 shadow-sm border border-gray-200">
              <CardHeader className="pt-4 px-4 pb-0">
                <div className="flex justify-between items-center">
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Alternative</Badge>
                  <div className="text-green-600 text-sm font-bold">Save $843</div>
                </div>
                <CardTitle className="text-md font-medium mt-3">GSP</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Products from Vietnam may qualify for reduced duties under the Generalized System of Preferences.
                </p>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Normal Duty Rate:</span>
                    <span className="text-xs font-medium">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Preferential Rate:</span>
                    <span className="text-xs font-medium">7.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Required ROO:</span>
                    <span className="text-xs font-medium">35% Value Added</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs">View Documentation Requirements</Button>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50 shadow-sm border border-gray-200">
              <CardHeader className="pt-4 px-4 pb-0">
                <div className="flex justify-between items-center">
                  <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Not Applicable</Badge>
                  <div className="text-gray-600 text-sm font-bold">No Savings</div>
                </div>
                <CardTitle className="text-md font-medium mt-3">Section 301 Exclusions</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Your product from China may be subject to additional 25% tariffs under Section 301. No current exclusions apply.
                </p>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Normal Duty Rate:</span>
                    <span className="text-xs font-medium">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Section 301 Rate:</span>
                    <span className="text-xs font-medium">+25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Total Rate:</span>
                    <span className="text-xs font-medium">40%</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs">Check for Updates</Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-medium">Rules of Origin Calculator</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Trade Agreement</Label>
                <Select defaultValue="usmca">
                  <SelectTrigger>
                    <SelectValue placeholder="Select agreement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usmca">USMCA</SelectItem>
                    <SelectItem value="gsp">GSP</SelectItem>
                    <SelectItem value="ukfta">UK-Japan FTA</SelectItem>
                    <SelectItem value="cptpp">CPTPP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Calculation Method</Label>
                <RadioGroup defaultValue="rvc">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rvc" id="rvc" />
                    <Label htmlFor="rvc" className="text-sm font-normal">Regional Value Content (RVC)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tariff" id="tariff" />
                    <Label htmlFor="tariff" className="text-sm font-normal">Tariff Shift</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="specific" id="specific" />
                    <Label htmlFor="specific" className="text-sm font-normal">Product Specific Rule</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Enter Cost Information (USD)</Label>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Value of Non-Originating Materials:</span>
                    <Input className="w-32" type="number" defaultValue="2800" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Value of Originating Materials:</span>
                    <Input className="w-32" type="number" defaultValue="4250" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Direct Labor Costs:</span>
                    <Input className="w-32" type="number" defaultValue="1850" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Direct Overhead Costs:</span>
                    <Input className="w-32" type="number" defaultValue="850" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Transportation Costs:</span>
                    <Input className="w-32" type="number" defaultValue="450" />
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-2">Calculate Qualification</Button>
            </div>
            
            <div>
              <Card className="bg-green-50 shadow-sm border border-green-100">
                <CardHeader className="py-4 px-4">
                  <CardTitle className="text-md font-medium">Qualification Result</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-green-100 p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  <h3 className="text-center text-lg font-medium text-green-800 mb-2">
                    Product Qualifies for USMCA
                  </h3>
                  
                  <p className="text-sm text-green-700 text-center mb-4">
                    Your product meets the Regional Value Content requirement
                  </p>
                  
                  <div className="bg-white rounded-lg p-3 mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">RVC Calculation</span>
                      <span className="text-sm font-medium text-green-600">73.2%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-green-600 rounded-full" style={{ width: '73%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>Minimum Required: 60%</span>
                      <span>Achieved: 73.2%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Transaction Value:</span>
                      <span className="text-xs font-medium">$10,200.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Value of Non-Originating Materials:</span>
                      <span className="text-xs font-medium">$2,800.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">RVC Formula:</span>
                      <span className="text-xs font-medium">(TV-VNM)/TV × 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Calculation:</span>
                      <span className="text-xs font-medium">(10200-2800)/10200 × 100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-700">
                <p className="font-medium mb-2">Required Documentation:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>USMCA Certificate of Origin</li>
                  <li>Commercial Invoice with origin declaration</li>
                  <li>Bill of Materials showing origin of components</li>
                  <li>Manufacturing records demonstrating production in Mexico</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Dashboard Component
const CostBreakdownDashboard = () => {
  const { t } = useContext(LanguageContext);
  
  return (
    <>
      <PageHeader
        title={t("Cost Breakdown Dashboard")}
        description={t("Analyze and optimize your global trade costs")}
      />
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="px-6 py-5 flex items-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <FaBox className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-400">Products</div>
                <div className="text-2xl font-semibold">8</div>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <Link href="/dashboard/product-info" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                <FaPlus className="mr-1 h-3 w-3" />
                Add New Product
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="px-6 py-5 flex items-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <FaShip className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-400">Shipments</div>
                <div className="text-2xl font-semibold">12</div>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <Link href="/dashboard/new-shipment" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                <FaPlus className="mr-1 h-3 w-3" />
                Create New Shipment
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="px-6 py-5 flex items-center">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                <FaFileInvoice className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-400">Analysis Reports</div>
                <div className="text-2xl font-semibold">5</div>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <Link href="/dashboard/reports" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                <FaDownload className="mr-1 h-3 w-3" />
                Export Reports
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="input" className="mb-6">
        <ScrollableTabs>
          <TabsList className="bg-white border border-gray-200 p-1">
            <TabsTrigger value="input">Input Data</TabsTrigger>
            <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="comparison">Cost Comparison</TabsTrigger>
            <TabsTrigger value="agreements">Trade Agreements</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="regulations">Regulations</TabsTrigger>
          </TabsList>
        </ScrollableTabs>
        
        <TabsContent value="input" className="mt-4 space-y-6">
          <ProductInfoForm />
          <CostCalculator />
        </TabsContent>
        
        <TabsContent value="breakdown" className="mt-4">
          <DetailedCostBreakdown />
        </TabsContent>
        
        <TabsContent value="visualization" className="mt-4">
          <VisualizationControls />
        </TabsContent>
        
        <TabsContent value="comparison" className="mt-4">
          <CostComparisonTool />
        </TabsContent>
        
        <TabsContent value="agreements" className="mt-4">
          <TradeAgreementCalculator />
        </TabsContent>
        
        <TabsContent value="documentation" className="mt-4">
          <Card className="bg-white shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-medium">Required Documentation</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-500 mb-4">Documentation will be displayed in this tab.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="regulations" className="mt-4">
          <Card className="bg-white shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-medium">Regulations & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-500 mb-4">Regulatory information will be displayed in this tab.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Educational Guidance */}
      <Card className="bg-white shadow-sm mb-6">
        <CardContent className="p-6">
          <div className="flex items-start">
            <div className="mr-4 mt-1">
              <FaGlobe className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">International Trade Tips</h3>
              <p className="text-sm text-gray-600 mb-4">
                Understanding your total landed costs is critical for international trade success. 
                Here are some tips to optimize your costs:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="flex items-center">
                    <span className="mr-2 text-green-600">✓</span>
                    Check if your products qualify for GSP or other preferential programs
                  </p>
                  <p className="flex items-center">
                    <span className="mr-2 text-green-600">✓</span>
                    Consider consolidating shipments to reduce per-unit freight costs
                  </p>
                  <p className="flex items-center">
                    <span className="mr-2 text-green-600">✓</span>
                    Ensure accurate HS code classification to avoid delays and penalties
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center">
                    <span className="mr-2 text-green-600">✓</span>
                    Maintain proper documentation to support preferential claims
                  </p>
                  <p className="flex items-center">
                    <span className="mr-2 text-green-600">✓</span>
                    Compare different shipping methods for optimal cost-time balance
                  </p>
                  <p className="flex items-center">
                    <span className="mr-2 text-green-600">✓</span>
                    Consider duty drawback if you re-export imported components
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm">
                  View Complete Import/Export Guide
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center gap-3 mb-8">
        <div>
          <Select defaultValue="basic">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="View mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic View</SelectItem>
              <SelectItem value="advanced">Advanced View</SelectItem>
              <SelectItem value="expert">Expert Mode</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            Save Analysis
          </Button>
          <Button asChild>
            <Link href="/dashboard/new-analysis">New Analysis</Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default CostBreakdownDashboard;