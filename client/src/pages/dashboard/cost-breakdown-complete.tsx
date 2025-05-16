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
                    <SelectItem value="in">India</SelectItem>
                    <SelectItem value="vn">Vietnam</SelectItem>
                    <SelectItem value="th">Thailand</SelectItem>
                    <SelectItem value="id">Indonesia</SelectItem>
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
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="eu">European Union</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="jp">Japan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-value">Product Value</Label>
                <div className="flex">
                  <Select defaultValue="usd">
                    <SelectTrigger className="w-24 rounded-r-none">
                      <SelectValue placeholder="USD" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="gbp">GBP</SelectItem>
                      <SelectItem value="jpy">JPY</SelectItem>
                      <SelectItem value="cny">CNY</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    id="product-value" 
                    className="rounded-l-none" 
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="product-category">Product Category</Label>
                <Select>
                  <SelectTrigger id="product-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="textile">Textiles & Garments</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="food">Food & Beverages</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="cosmetics">Cosmetics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hs-code">HS Code</Label>
              <div className="flex">
                <Input id="hs-code" placeholder="Search HS code" />
                <Button variant="secondary" className="ml-2">
                  Lookup
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                E.g. 6109.10 (Cotton T-shirts), 8517.12 (Mobile phones)
              </p>
            </div>
            
            <div className="pt-4">
              <Button>Save Product Information</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Section 2: Interactive Cost Calculator
const CostCalculator = () => {
  return (
    <Card className="bg-white shadow-sm mb-6">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-medium">Cost Calculator</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                min="1"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Shipping Method</Label>
              <RadioGroup defaultValue="air">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="air" id="air" />
                  <Label htmlFor="air">Air Freight</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sea" id="sea" />
                  <Label htmlFor="sea">Sea Freight</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rail" id="rail" />
                  <Label htmlFor="rail">Rail Freight</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="road" id="road" />
                  <Label htmlFor="road">Road Transport</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Insurance Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="basic-insurance" />
                  <Label htmlFor="basic-insurance">Basic Insurance (0.5%)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="extended-insurance" />
                  <Label htmlFor="extended-insurance">Extended Coverage (1.2%)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="all-risk" />
                  <Label htmlFor="all-risk">All Risk Insurance (2.5%)</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Display Currency</Label>
              <Select defaultValue="usd">
                <SelectTrigger id="display-currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD (US Dollar)</SelectItem>
                  <SelectItem value="eur">EUR (Euro)</SelectItem>
                  <SelectItem value="gbp">GBP (British Pound)</SelectItem>
                  <SelectItem value="jpy">JPY (Japanese Yen)</SelectItem>
                  <SelectItem value="cny">CNY (Chinese Yuan)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-4 flex space-x-2">
              <Button className="flex-1">Calculate Costs</Button>
              <Button variant="outline" className="flex-1">Reset</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Section 3: Detailed Cost Breakdown with toggles
const DetailedCostBreakdown = () => {
  // Sample data
  const data = {
    productName: "Organic Cotton T-Shirts",
    hsCode: "6109.10.00",
    originCountry: "India",
    destinationCountry: "United States",
    quantity: 500,
    unitCost: 5,
    productValue: 2500,
    dutyRate: 15,
    dutyAmount: 375,
    freightCost: 850,
    insuranceCost: 125,
    documentationFees: 200,
    customsClearance: 175,
    totalLandedCost: 4225,
    currency: "USD"
  };

  // Format currency with proper symbols
  const formatCurrency = (amount: number, curr = data.currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr
    }).format(amount);
  };

  return (
    <Card className="bg-white shadow-sm mb-6">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-medium">Detailed Cost Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 space-y-2">
          <p className="text-sm text-gray-500">Toggle components to include/exclude from analysis:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="include-duty" defaultChecked />
              <Label htmlFor="include-duty">Duties & Tariffs</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="include-freight" defaultChecked />
              <Label htmlFor="include-freight">Freight Costs</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="include-insurance" defaultChecked />
              <Label htmlFor="include-insurance">Insurance</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="include-docs" defaultChecked />
              <Label htmlFor="include-docs">Documentation</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="include-customs" defaultChecked />
              <Label htmlFor="include-customs">Customs Clearance</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="include-handling" defaultChecked />
              <Label htmlFor="include-handling">Handling Fees</Label>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <Label htmlFor="doc-fee-adjustment">Documentation Fee Adjustment</Label>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">$100</span>
            <Slider defaultValue={[data.documentationFees]} max={500} step={10} className="flex-1" />
            <span className="text-sm text-gray-500">$500</span>
          </div>
          <div className="text-sm text-right text-gray-700 mt-1">
            Current: {formatCurrency(data.documentationFees)}
          </div>
        </div>
        
        <div className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="custom-fee">Custom Handling Fee</Label>
              <Input id="custom-fee" placeholder="Enter custom fee amount" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-exempt">Tax Exemption Status</Label>
              <div className="flex items-center space-x-2">
                <Checkbox id="tax-exempt" />
                <Label htmlFor="tax-exempt">Product qualifies for tax exemption</Label>
              </div>
            </div>
          </div>
        </div>
        
        <table className="w-full mt-4">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left">Component</th>
              <th className="whitespace-nowrap px-4 py-3 text-right">Amount</th>
              <th className="whitespace-nowrap px-4 py-3 text-right">Percentage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            <tr>
              <td className="px-4 py-3 text-gray-700">Product Value</td>
              <td className="px-4 py-3 text-gray-900 text-right">{formatCurrency(data.productValue)}</td>
              <td className="px-4 py-3 text-gray-500 text-right">{Math.round((data.productValue / data.totalLandedCost) * 100)}%</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-700">Freight Cost</td>
              <td className="px-4 py-3 text-gray-900 text-right">{formatCurrency(data.freightCost)}</td>
              <td className="px-4 py-3 text-gray-500 text-right">{Math.round((data.freightCost / data.totalLandedCost) * 100)}%</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-700">Duties ({data.dutyRate}%)</td>
              <td className="px-4 py-3 text-gray-900 text-right">{formatCurrency(data.dutyAmount)}</td>
              <td className="px-4 py-3 text-gray-500 text-right">{Math.round((data.dutyAmount / data.totalLandedCost) * 100)}%</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-700">Insurance</td>
              <td className="px-4 py-3 text-gray-900 text-right">{formatCurrency(data.insuranceCost)}</td>
              <td className="px-4 py-3 text-gray-500 text-right">{Math.round((data.insuranceCost / data.totalLandedCost) * 100)}%</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-700">Documentation</td>
              <td className="px-4 py-3 text-gray-900 text-right">{formatCurrency(data.documentationFees)}</td>
              <td className="px-4 py-3 text-gray-500 text-right">{Math.round((data.documentationFees / data.totalLandedCost) * 100)}%</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-700">Customs Clearance</td>
              <td className="px-4 py-3 text-gray-900 text-right">{formatCurrency(data.customsClearance)}</td>
              <td className="px-4 py-3 text-gray-500 text-right">{Math.round((data.customsClearance / data.totalLandedCost) * 100)}%</td>
            </tr>
            <tr className="bg-gray-50 font-semibold">
              <td className="px-4 py-3 text-gray-800">Total Landed Cost</td>
              <td className="px-4 py-3 text-gray-900 text-right">{formatCurrency(data.totalLandedCost)}</td>
              <td className="px-4 py-3 text-gray-500 text-right">100%</td>
            </tr>
            <tr className="bg-gray-50 text-sm">
              <td className="px-4 py-3 text-gray-800">Cost per Unit</td>
              <td className="px-4 py-3 text-gray-900 text-right">{formatCurrency(data.totalLandedCost / data.quantity)}</td>
              <td className="px-4 py-3 text-gray-500 text-right">-</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

// Section 4: Visual Representations with controls
const VisualizationControls = () => {
  const [chartType, setChartType] = useState('pie');
  
  // Sample data for visualization
  const costData = [
    { name: "Product Value", value: 2500, color: "#0088FE" },
    { name: "Freight Cost", value: 850, color: "#00C49F" },
    { name: "Duties & Tariffs", value: 375, color: "#FFBB28" },
    { name: "Insurance", value: 125, color: "#FF8042" },
    { name: "Documentation", value: 200, color: "#8884d8" },
    { name: "Customs Clearance", value: 175, color: "#82ca9d" }
  ];
  
  return (
    <Card className="bg-white shadow-sm mb-6">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-medium">Visual Representation</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Chart Type</Label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select defaultValue="current">
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Shipment</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="mb-2 block">Display Options</Label>
              <div className="flex items-center space-x-2">
                <Checkbox id="show-labels" defaultChecked />
                <Label htmlFor="show-labels">Show Data Labels</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="show-legend" defaultChecked />
                <Label htmlFor="show-legend">Show Legend</Label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="h-80 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={costData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {costData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend layout="vertical" verticalAlign="middle" align="right" />
                <RechartTooltip />
              </PieChart>
            ) : chartType === 'bar' ? (
              <BarChart
                data={costData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartTooltip />
                <Legend />
                <Bar dataKey="value" name="Cost Amount">
                  {costData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <LineChart
                data={costData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartTooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" size="sm">
            <FaDownload className="mr-2" />
            Export as PNG
          </Button>
          <Button variant="outline" size="sm">
            <FaDownload className="mr-2" />
            Export as CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Section 5: Cost Comparison Tool
const CostComparisonTool = () => {
  return (
    <Card className="bg-white shadow-sm mb-6">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-medium">Cost Comparison Tool</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Shipping Methods to Compare</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="compare-air" defaultChecked />
                  <Label htmlFor="compare-air">Air Freight</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="compare-sea" defaultChecked />
                  <Label htmlFor="compare-sea">Sea Freight</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="compare-rail" />
                  <Label htmlFor="compare-rail">Rail Freight</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="compare-road" />
                  <Label htmlFor="compare-road">Road Transport</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Routes to Compare</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="route-direct" defaultChecked />
                  <Label htmlFor="route-direct">Direct Route</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="route-singapore" defaultChecked />
                  <Label htmlFor="route-singapore">Via Singapore</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="route-dubai" />
                  <Label htmlFor="route-dubai">Via Dubai</Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-timeframe">Delivery Timeframe</Label>
              <Select defaultValue="standard">
                <SelectTrigger id="delivery-timeframe">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="express">Express (1-3 days)</SelectItem>
                  <SelectItem value="standard">Standard (5-10 days)</SelectItem>
                  <SelectItem value="economy">Economy (15-30 days)</SelectItem>
                  <SelectItem value="any">Any timeframe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Priority Ranking</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="priority-cost" className="text-sm">Cost</Label>
                  <Slider id="priority-cost" defaultValue={[70]} max={100} step={5} className="w-32" />
                  <span className="text-sm text-gray-500">High</span>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="priority-speed" className="text-sm">Speed</Label>
                  <Slider id="priority-speed" defaultValue={[50]} max={100} step={5} className="w-32" />
                  <span className="text-sm text-gray-500">Medium</span>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="priority-reliability" className="text-sm">Reliability</Label>
                  <Slider id="priority-reliability" defaultValue={[80]} max={100} step={5} className="w-32" />
                  <span className="text-sm text-gray-500">High</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button>Compare Options</Button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left">Shipping Method</th>
                <th className="whitespace-nowrap px-4 py-3 text-right">Cost</th>
                <th className="whitespace-nowrap px-4 py-3 text-center">Transit Time</th>
                <th className="whitespace-nowrap px-4 py-3 text-center">CO₂ Emissions</th>
                <th className="whitespace-nowrap px-4 py-3 text-center">Recommended</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              <tr>
                <td className="px-4 py-3 text-gray-700">Air Freight</td>
                <td className="px-4 py-3 text-gray-900 text-right">$1,200.00</td>
                <td className="px-4 py-3 text-gray-700 text-center">5 days</td>
                <td className="px-4 py-3 text-gray-700 text-center">1.2 tons</td>
                <td className="px-4 py-3 text-center">
                  <Badge className="bg-orange-100 text-orange-800">Fast Option</Badge>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-700">Sea Freight</td>
                <td className="px-4 py-3 text-gray-900 text-right">$800.00</td>
                <td className="px-4 py-3 text-gray-700 text-center">30 days</td>
                <td className="px-4 py-3 text-gray-700 text-center">0.5 tons</td>
                <td className="px-4 py-3 text-center">
                  <Badge className="bg-green-100 text-green-800">Best Value</Badge>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-700">Rail Freight</td>
                <td className="px-4 py-3 text-gray-900 text-right">$900.00</td>
                <td className="px-4 py-3 text-gray-700 text-center">18 days</td>
                <td className="px-4 py-3 text-gray-700 text-center">0.7 tons</td>
                <td className="px-4 py-3 text-center">
                  <Badge className="bg-blue-100 text-blue-800">Eco-Friendly</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// Section 6: Trade Agreement Benefits Calculator
const TradeAgreementCalculator = () => {
  return (
    <Card className="bg-white shadow-sm mb-6">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-medium">Trade Agreement Benefits</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Applicable Trade Agreements</Label>
              <div className="p-4 border border-gray-200 rounded-md space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="gsp" />
                  <div>
                    <Label htmlFor="gsp" className="font-medium">GSP (Generalized System of Preferences)</Label>
                    <p className="text-xs text-gray-500">Duty-free treatment for developing countries</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="usmca" defaultChecked />
                  <div>
                    <Label htmlFor="usmca" className="font-medium">USMCA</Label>
                    <p className="text-xs text-gray-500">US-Mexico-Canada Agreement</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="eu-vietnam" />
                  <div>
                    <Label htmlFor="eu-vietnam" className="font-medium">EU-Vietnam FTA</Label>
                    <p className="text-xs text-gray-500">Free Trade Agreement between EU and Vietnam</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Required Documentation</Label>
              <div className="p-4 border border-gray-200 rounded-md space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="certificate-origin" defaultChecked />
                  <Label htmlFor="certificate-origin">Certificate of Origin</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="commercial-invoice" defaultChecked />
                  <Label htmlFor="commercial-invoice">Commercial Invoice</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="packing-list" defaultChecked />
                  <Label htmlFor="packing-list">Packing List</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="bill-lading" defaultChecked />
                  <Label htmlFor="bill-lading">Bill of Lading</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="declaration" />
                  <Label htmlFor="declaration">Declaration of Preferential Origin</Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 border border-green-100 bg-green-50 rounded-md">
              <h4 className="font-medium text-green-800 mb-2">Potential Duty Savings</h4>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Standard Duty Rate:</span>
                  <span className="font-medium text-green-800">15%</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">USMCA Preferential Rate:</span>
                  <span className="font-medium text-green-800">0%</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Duty Amount (Standard):</span>
                  <span className="font-medium text-green-800">$375.00</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Duty Amount (Preferential):</span>
                  <span className="font-medium text-green-800">$0.00</span>
                </div>
                
                <div className="pt-2 border-t border-green-200 flex justify-between">
                  <span className="font-medium text-green-800">Potential Savings:</span>
                  <span className="font-bold text-green-800">$375.00</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Origin Declaration</Label>
              <Textarea 
                placeholder="The exporter of the products covered by this document declares that, except where otherwise clearly indicated, these products are of [country] preferential origin."
                className="h-24"
              />
            </div>
            
            <div className="pt-4 flex space-x-2">
              <Button className="flex-1">
                Apply for Preferential Treatment
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <FaInfoCircle />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Applying for preferential treatment requires proper documentation and certification. Processing may take 5-10 business days.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
const CostBreakdownDashboard = () => {
  const { t } = useContext(LanguageContext);
  
  // Sample data for summary cards
  const data = {
    productValue: 2500,
    totalLandedCost: 4225,
    currency: "USD",
    quantity: 500
  };

  // Format currency with proper symbols
  const formatCurrency = (amount: number, curr = data.currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr
    }).format(amount);
  };
  
  return (
    <>
      <PageHeader
        title="Cost Breakdown Analysis"
        description="Analyze your landed costs and identify optimization opportunities"
        actions={[
          {
            label: "Export Data",
            icon: <FaDownload />,
            onClick: () => console.log("Export cost breakdown"),
            variant: "outline"
          },
          {
            label: "New Analysis",
            icon: <FaPlus />,
            href: "/dashboard/new-analysis",
            variant: "default"
          }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start">
              <div className="mr-3 mt-1 bg-blue-100 rounded-full p-2">
                <FaBox className="text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Product Value</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.productValue)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {data.quantity} units
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start">
              <div className="mr-3 mt-1 bg-green-100 rounded-full p-2">
                <FaShip className="text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Landed Cost</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.totalLandedCost)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {formatCurrency(data.totalLandedCost / data.quantity)} per unit
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start">
              <div className="mr-3 mt-1 bg-orange-100 rounded-full p-2">
                <FaMoneyBill className="text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Additional Costs</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.totalLandedCost - data.productValue)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {Math.round(((data.totalLandedCost - data.productValue) / data.productValue) * 100)}% of product value
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="input" className="mb-6">
        <TabsList className="bg-white border border-gray-200 p-1">
          <TabsTrigger value="input">Input Data</TabsTrigger>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
          <TabsTrigger value="comparison">Cost Comparison</TabsTrigger>
          <TabsTrigger value="agreements">Trade Agreements</TabsTrigger>
        </TabsList>
        
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