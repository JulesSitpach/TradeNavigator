import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  FileBarChart, 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Ship, 
  FileText, 
  ShieldCheck
} from "lucide-react";
import PageHeader from '@/components/common/PageHeader';
import CopilotAssistant from '@/components/ai/CopilotAssistant';

// Mock data structure for cost breakdown
interface CostComponent {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  description?: string;
  type: 'duty' | 'tax' | 'fee' | 'shipping' | 'other';
}

// Component for displaying cost components in a table
const CostComponentsTable = ({ components, currency }: { components: CostComponent[], currency: string }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Component</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead className="text-right">% of Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {components.map((component) => (
          <TableRow key={component.id}>
            <TableCell className="font-medium">
              {component.name}
              <span className="block text-xs text-muted-foreground mt-1">
                {component.description || ''}
              </span>
            </TableCell>
            <TableCell>
              {currency} {component.amount.toFixed(2)}
            </TableCell>
            <TableCell className="text-right">
              <Badge variant={
                component.percentage > 30 ? "destructive" : 
                component.percentage > 20 ? "warning" : 
                "secondary"
              }>
                {component.percentage.toFixed(1)}%
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// Cost Breakdown Dashboard Component
const CostBreakdownComplete: React.FC = () => {
  const [, setLocation] = useLocation();
  const [productData, setProductData] = useState<any>(null);
  const [costData, setCostData] = useState<{
    components: CostComponent[],
    totalCost: number,
    currency: string,
    calculatedAt: Date
  }>({
    components: [],
    totalCost: 0,
    currency: 'USD',
    calculatedAt: new Date()
  });

  useEffect(() => {
    // Retrieve product data from session storage
    const storedData = sessionStorage.getItem('productInfoData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setProductData(parsedData);
      
      // Generate sample cost breakdown based on product data
      generateCostBreakdown(parsedData);
    }
  }, []);

  // Function to generate cost breakdown data based on product details
  const generateCostBreakdown = (product: any) => {
    // Basic calculations (in a real app, this would be API data)
    const productValue = Number(product.unitValue) * Number(product.quantity);
    const transportCost = calculateTransportCost(product.transportMode, product.weight, product.originCountry, product.destinationCountry);
    const dutyRate = calculateDutyRate(product.hsCode, product.destinationCountry);
    const dutyAmount = productValue * dutyRate;
    const vatRate = getVatRate(product.destinationCountry);
    const vatAmount = (productValue + transportCost + dutyAmount) * vatRate;
    const customsProcessingFee = 35.0;
    const documentationFee = 25.0;
    const cargoInsurance = productValue * 0.015;
    
    // Total cost
    const totalCost = productValue + transportCost + dutyAmount + vatAmount + customsProcessingFee + documentationFee + cargoInsurance;
    
    // Generate cost components
    const components: CostComponent[] = [
      {
        id: '1',
        name: 'Product Cost',
        amount: productValue,
        percentage: (productValue / totalCost) * 100,
        description: `${product.quantity} units at ${product.unitValue} ${product.currency} each`,
        type: 'other'
      },
      {
        id: '2',
        name: 'Transport Cost',
        amount: transportCost,
        percentage: (transportCost / totalCost) * 100,
        description: `${product.transportMode} shipping (${product.weight} kg)`,
        type: 'shipping'
      },
      {
        id: '3',
        name: 'Import Duty',
        amount: dutyAmount,
        percentage: (dutyAmount / totalCost) * 100,
        description: `${(dutyRate * 100).toFixed(1)}% for HS code ${product.hsCode || 'N/A'}`,
        type: 'duty'
      },
      {
        id: '4',
        name: `VAT (${product.destinationCountry})`,
        amount: vatAmount,
        percentage: (vatAmount / totalCost) * 100,
        description: `${(vatRate * 100).toFixed(1)}% on customs value plus duty`,
        type: 'tax'
      },
      {
        id: '5',
        name: 'Customs Processing Fee',
        amount: customsProcessingFee,
        percentage: (customsProcessingFee / totalCost) * 100,
        type: 'fee'
      },
      {
        id: '6',
        name: 'Documentation Fee',
        amount: documentationFee,
        percentage: (documentationFee / totalCost) * 100,
        type: 'fee'
      },
      {
        id: '7',
        name: 'Cargo Insurance',
        amount: cargoInsurance,
        percentage: (cargoInsurance / totalCost) * 100,
        description: '1.5% of product value',
        type: 'other'
      }
    ];
    
    // Sort components by amount (descending)
    components.sort((a, b) => b.amount - a.amount);
    
    setCostData({
      components,
      totalCost,
      currency: product.currency || 'USD',
      calculatedAt: new Date()
    });
  };
  
  // Helper functions for cost calculations
  const calculateTransportCost = (mode: string, weight: string, origin: string, destination: string): number => {
    const weightNum = Number(weight);
    
    // Base rates per transport mode
    const rates: Record<string, number> = {
      'ocean_fcl': 1200,
      'ocean_lcl': 45, // per kg
      'air': 85, // per kg
      'road': 35, // per kg
      'rail': 25, // per kg
      'multimodal': 65 // per kg
    };
    
    // Distance factor (simplified)
    const distanceFactor = origin === destination ? 0.5 : 1;
    
    // Calculate based on mode
    if (mode === 'ocean_fcl') {
      return rates[mode] * distanceFactor; // Base container cost
    } else {
      // Per kg rates
      return weightNum * (rates[mode] || rates['ocean_lcl']) * distanceFactor;
    }
  };
  
  const calculateDutyRate = (hsCode: string, country: string): number => {
    // Simplified duty rates by country (in reality these would be based on HS code + country)
    const ratesByCountry: Record<string, number> = {
      'US': 0.0325,
      'EU': 0.04,
      'CA': 0.03,
      'JP': 0.05,
      'CN': 0.07,
      'UK': 0.035,
      'AU': 0.05
    };
    
    // Default rate if country not found
    return ratesByCountry[country] || 0.04;
  };
  
  const getVatRate = (country: string): number => {
    // Simplified VAT rates by country
    const vatRates: Record<string, number> = {
      'US': 0.0, // No VAT, but would have sales tax
      'CA': 0.05, // GST
      'UK': 0.20,
      'DE': 0.19,
      'FR': 0.20,
      'JP': 0.10,
      'CN': 0.13,
      'AU': 0.10
    };
    
    return vatRates[country] || 0.17; // Default VAT rate
  };
  
  // If no product data is loaded yet, show loading or redirect
  if (!productData) {
    return (
      <div className="container mx-auto p-4">
        <h1>No Product Data Found</h1>
        <p>Please enter product details to see cost breakdown.</p>
        <Button onClick={() => setLocation('/dashboard/product-info')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Product Form
        </Button>
      </div>
    );
  }
  
  // Group cost components by type
  const dutyAndTaxes = costData.components.filter(c => c.type === 'duty' || c.type === 'tax');
  const shippingAndHandling = costData.components.filter(c => c.type === 'shipping' || c.type === 'fee');
  const productAndOther = costData.components.filter(c => c.type === 'other');
  
  return (
    <div className="container mx-auto">
      <PageHeader
        title="Cost Breakdown Analysis"
        description={`Analysis for ${productData.productName || 'Product'}`}
        actions={[
          {
            label: "Back to Form",
            icon: <ChevronLeft size={16} />,
            onClick: () => setLocation('/dashboard/product-info'),
            variant: "outline"
          },
          {
            label: "Export Report",
            icon: <FileBarChart size={16} />,
            onClick: () => alert('Export feature would go here'),
            variant: "default"
          }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Summary Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {costData.currency} {costData.totalCost.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Including all duties, taxes, and fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Duties & Taxes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {costData.currency} {dutyAndTaxes.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {(dutyAndTaxes.reduce((sum, c) => sum + c.amount, 0) / costData.totalCost * 100).toFixed(1)}% of total cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Shipping & Handling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {costData.currency} {shippingAndHandling.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {(shippingAndHandling.reduce((sum, c) => sum + c.amount, 0) / costData.totalCost * 100).toFixed(1)}% of total cost
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-6">
        {/* Main cost breakdown table */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Cost Components Breakdown</CardTitle>
            <CardDescription>
              Detailed breakdown of all costs associated with this shipment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CostComponentsTable 
              components={costData.components} 
              currency={costData.currency} 
            />
          </CardContent>
        </Card>
        
        {/* Product Details Summary */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Product & Shipment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Product</h4>
                <p className="text-base font-medium">{productData.productName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                <p className="text-base font-medium">{productData.category}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">HS Code</h4>
                <p className="text-base font-medium">{productData.hsCode || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Quantity</h4>
                <p className="text-base font-medium">{productData.quantity} units</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Value per Unit</h4>
                <p className="text-base font-medium">{productData.currency} {productData.unitValue}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Total Weight</h4>
                <p className="text-base font-medium">{productData.weight} kg</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Origin</h4>
                <p className="text-base font-medium">{getCountryName(productData.originCountry)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Destination</h4>
                <p className="text-base font-medium">{getCountryName(productData.destinationCountry)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Transport Mode</h4>
                <p className="text-base font-medium">{formatTransportMode(productData.transportMode)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Incoterm</h4>
                <p className="text-base font-medium">{productData.incoterm?.toUpperCase() || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <BarChart3 size={24} className="mb-2 text-primary" />
            <h3 className="font-medium">Alternative Routes</h3>
            <p className="text-sm text-muted-foreground">Compare different shipping methods</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <TrendingUp size={24} className="mb-2 text-primary" />
            <h3 className="font-medium">Duty Optimization</h3>
            <p className="text-sm text-muted-foreground">Analyze ways to reduce duties</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <ShieldCheck size={24} className="mb-2 text-primary" />
            <h3 className="font-medium">Compliance Check</h3>
            <p className="text-sm text-muted-foreground">Verify regulatory requirements</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <FileText size={24} className="mb-2 text-primary" />
            <h3 className="font-medium">Required Documents</h3>
            <p className="text-sm text-muted-foreground">View documentation needs</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Copilot - Floating */}
      <div className="fixed bottom-4 right-4 z-50 w-96 max-w-full">
        <CopilotAssistant 
          productDescription={productData.productName}
          category={productData.category}
          hsCode={productData.hsCode}
          originCountry={productData.originCountry}
          destinationCountry={productData.destinationCountry}
          transportMode={productData.transportMode}
          incoterm={productData.incoterm}
          totalCost={costData.totalCost}
          costComponents={costData.components}
        />
      </div>
    </div>
  );
};

// Helper function to get country names from codes
function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    'US': 'United States',
    'CA': 'Canada',
    'MX': 'Mexico',
    'CN': 'China',
    'JP': 'Japan',
    'DE': 'Germany',
    'UK': 'United Kingdom',
    'FR': 'France',
    'IT': 'Italy',
    'AU': 'Australia',
    'BR': 'Brazil',
    'IN': 'India',
    'VN': 'Vietnam',
    'SG': 'Singapore',
    'MY': 'Malaysia'
  };
  
  return countries[code] || code;
}

// Helper function to format transport mode
function formatTransportMode(mode: string): string {
  const modes: Record<string, string> = {
    'ocean_fcl': 'Ocean (Full Container)',
    'ocean_lcl': 'Ocean (Less than Container)',
    'air': 'Air Freight',
    'road': 'Road Transport',
    'rail': 'Rail Transport',
    'multimodal': 'Multimodal Transport'
  };
  
  return modes[mode] || mode;
}

export default CostBreakdownComplete;