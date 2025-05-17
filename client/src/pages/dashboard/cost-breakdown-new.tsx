import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/common/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { FaCircleInfo, FaMagnifyingGlass } from "react-icons/fa6";
import CopilotAssistant from "@/components/ai/CopilotAssistant";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import SavedAnalyses, { SavedAnalysis } from "@/components/analysis/SavedAnalyses";

// Form schema for product information
const productInfoFormSchema = z.object({
  productDescription: z.string().min(5, "Product description is required"),
  productCategory: z.string().min(1, "Product category is required"),
  hsCode: z.string().min(4, "HS Code is required"),
  originCountry: z.string().min(1, "Origin country is required"),
  destinationCountry: z.string().min(1, "Destination country is required"),
  productValue: z.coerce.number().min(0, "Product value must be a positive number"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  weight: z.coerce.number().min(0, "Weight must be a positive number"),
  transportMode: z.string().min(1, "Transport mode is required"),
  shipmentType: z.string().min(1, "Shipment type is required"),
  packageType: z.string().min(1, "Package type is required"),
  length: z.coerce.number().min(0, "Length must be a positive number"),
  width: z.coerce.number().min(0, "Width must be a positive number"),
  height: z.coerce.number().min(0, "Height must be a positive number"),
});

type ProductInfoFormValues = z.infer<typeof productInfoFormSchema>;

// Product categories for dropdown
const productCategories = [
  { label: "Electronics", value: "Electronics" },
  { label: "Textiles & Apparel", value: "Textiles & Apparel" },
  { label: "Chemicals", value: "Chemicals" },
  { label: "Machinery", value: "Machinery" },
  { label: "Food & Beverages", value: "Food & Beverages" },
  { label: "Pharmaceuticals", value: "Pharmaceuticals" },
  { label: "Automotive", value: "Automotive" },
  { label: "Furniture", value: "Furniture" },
  { label: "Toys & Games", value: "Toys & Games" },
];

// Sample country list for dropdowns
const countries = [
  { label: "Canada - CPTPP member", value: "Canada" },
  { label: "China", value: "China" },
  { label: "Germany", value: "Germany" },
  { label: "India", value: "India" },
  { label: "Japan - CPTPP member", value: "Japan" },
  { label: "Mexico - CPTPP member", value: "Mexico" },
  { label: "South Korea", value: "South Korea" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "United States", value: "United States" },
  { label: "Vietnam - CPTPP member", value: "Vietnam" },
];

// Transport modes for dropdown
const transportModes = [
  { label: "Air Freight", value: "Air Freight" },
  { label: "Sea Freight", value: "Sea Freight" },
  { label: "Rail Freight", value: "Rail Freight" },
  { label: "Road Transport", value: "Road Transport" },
];

// Shipment types for dropdown
const shipmentTypes = [
  { label: "Less than Container Load (LCL)", value: "LCL" },
  { label: "Full Container Load (FCL)", value: "FCL" },
  { label: "Express Parcel", value: "Express" },
  { label: "Bulk Cargo", value: "Bulk" },
];

// Package types for dropdown
const packageTypes = [
  { label: "Cardboard Box", value: "Cardboard Box" },
  { label: "Wooden Crate", value: "Wooden Crate" },
  { label: "Pallet", value: "Pallet" },
  { label: "Drum", value: "Drum" },
  { label: "Bag", value: "Bag" },
];

// Product Information Form Component
const ProductInformationForm = ({ onCalculate }: { onCalculate: () => void }) => {
  const [showHSAssistant, setShowHSAssistant] = useState(false);
  
  // Initialize form with default values
  const form = useForm<ProductInfoFormValues>({
    resolver: zodResolver(productInfoFormSchema),
    defaultValues: {
      productDescription: "",
      productCategory: "",
      hsCode: "",
      originCountry: "",
      destinationCountry: "",
      productValue: 0,
      quantity: 1,
      weight: 0,
      transportMode: "",
      shipmentType: "",
      packageType: "",
      length: 0,
      width: 0,
      height: 0,
    },
  });
  
  const onSubmit = (values: ProductInfoFormValues) => {
    console.log("Form values:", values);
    // Here we would send the data to the server for analysis
    onCalculate();
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Product Details</h3>
          
          {/* Product Description */}
          <FormField
            control={form.control}
            name="productDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Description</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. High-performance laptop, 13-inch display, 32GB RAM, 1TB SSD" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Product Category */}
          <FormField
            control={form.control}
            name="productCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Category <span className="text-xs text-blue-600">(Select first for better HS code results)</span></FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {productCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* HS Code with AI Assistant */}
          <FormField
            control={form.control}
            name="hsCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HS Code</FormLabel>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Input placeholder="e.g. 8471.30" {...field} />
                  </FormControl>
                  <Button 
                    type="button" 
                    size="icon"
                    variant="outline"
                    className="border-green-500 text-green-500"
                    onClick={() => setShowHSAssistant(!showHSAssistant)}
                  >
                    <FaMagnifyingGlass className="h-4 w-4" />
                  </Button>
                </div>
                {showHSAssistant && (
                  <HSCodeAssistant
                    productDescription={form.getValues("productDescription")}
                    category={form.getValues("productCategory")}
                    onSelectHSCode={(code) => {
                      form.setValue("hsCode", code);
                      setShowHSAssistant(false);
                    }}
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Origin Country */}
          <FormField
            control={form.control}
            name="originCountry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origin Country</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select origin country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Destination Country */}
          <FormField
            control={form.control}
            name="destinationCountry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination Country</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Product Value */}
          <FormField
            control={form.control}
            name="productValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Value (in USD)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                    <Input className="pl-8" type="number" placeholder="0.00" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Shipping Details</h3>
          
          {/* Quantity */}
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Transport Mode */}
          <FormField
            control={form.control}
            name="transportMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transport Mode</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transport mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {transportModes.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Shipment Type */}
          <FormField
            control={form.control}
            name="shipmentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shipment Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shipment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {shipmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Package Type */}
          <FormField
            control={form.control}
            name="packageType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select package type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {packageTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Weight */}
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Package Dimensions */}
          <div>
            <FormLabel>Package Dimensions (cm)</FormLabel>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="number" placeholder="Length" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="width"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="number" placeholder="Width" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="number" placeholder="Height" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        
        <Button type="submit" className="w-full">Calculate</Button>
      </form>
    </Form>
  );
};

// Cost Breakdown Table Component
const CostBreakdownTable = () => {
  return (
    <Card className="bg-white shadow-sm border border-neutral-200">
      <CardHeader className="border-b border-neutral-200 px-5 py-4">
        <CardTitle className="text-lg font-medium text-neutral-900">
          Detailed Cost Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
              <tr>
                <th className="whitespace-nowrap px-5 py-3 text-left">
                  Cost Component
                </th>
                <th className="whitespace-nowrap px-5 py-3 text-right">
                  Amount (USD)
                </th>
                <th className="whitespace-nowrap px-5 py-3 text-right">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              <tr>
                <td className="whitespace-nowrap px-5 py-4 text-left">
                  <div className="font-medium text-neutral-900">Product Value</div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  $20,000
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  52.3%
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-5 py-4 text-left">
                  <div className="font-medium text-neutral-900">Import Duty (12.8%)</div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  $2,560
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  6.7%
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-5 py-4 text-left">
                  <div className="font-medium text-neutral-900">Freight Cost</div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  $12,452
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  32.6%
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-5 py-4 text-left">
                  <div className="font-medium text-neutral-900">Insurance</div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  $300
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  0.8%
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-5 py-4 text-left">
                  <div className="font-medium text-neutral-900">Documentation Fees</div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  $69
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  0.2%
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-5 py-4 text-left">
                  <div className="font-medium text-neutral-900">Customs Clearance</div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  $1,600
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  4.2%
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-5 py-4 text-left">
                  <div className="font-medium text-neutral-900">Inland Transportation</div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  $1,075
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  2.8%
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-5 py-4 text-left">
                  <div className="font-medium text-neutral-900">Warehousing</div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  $50
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  0.1%
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-5 py-4 text-left">
                  <div className="font-medium text-neutral-900">Other Taxes and Fees</div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  $145
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  0.4%
                </td>
              </tr>
              <tr className="bg-neutral-50 font-semibold">
                <td className="whitespace-nowrap px-5 py-4 text-left">
                  <div className="font-semibold text-neutral-900">Total Landed Cost</div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right text-primary-700">
                  $38,251
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  100%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// Type for saved analysis
interface SavedAnalysis {
  id: string;
  name: string;
  date: string;
  formData: ProductInfoFormValues;
  results: any;
}

// Cost Breakdown Dashboard - Main Component
const CostBreakdownDashboard = () => {
  const [showResults, setShowResults] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [saveName, setSaveName] = useState("");
  const [formData, setFormData] = useState<ProductInfoFormValues | null>(null);
  const [results, setResults] = useState<any>(null);

  // Load saved analyses from local storage on mount
  useEffect(() => {
    const savedAnalysesFromStorage = localStorage.getItem('savedCostAnalyses');
    if (savedAnalysesFromStorage) {
      setSavedAnalyses(JSON.parse(savedAnalysesFromStorage));
    }
  }, []);

  const { data } = useQuery({
    queryKey: ['/api/cost-breakdown'],
  });
  
  // Prepare data for Copilot from API response
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
  
  // Save current analysis
  const saveAnalysis = () => {
    if (!data) {
      alert("Please calculate a cost breakdown first");
      return;
    }

    if (!saveName.trim()) {
      alert("Please enter a name for this analysis");
      return;
    }

    if (!formData) {
      alert("No form data available to save");
      return;
    }
    
    const newAnalysis: SavedAnalysis = {
      id: Date.now().toString(),
      name: saveName,
      date: new Date().toISOString(),
      formData: formData,
      results: data
    };
    
    const updatedSavedAnalyses = [...savedAnalyses, newAnalysis];
    setSavedAnalyses(updatedSavedAnalyses);
    localStorage.setItem('savedCostAnalyses', JSON.stringify(updatedSavedAnalyses));
    
    setSaveName("");
    alert("Analysis saved successfully!");
  };

  // Load a saved analysis
  const loadAnalysis = (analysis: SavedAnalysis) => {
    setFormData(analysis.formData);
    setTimeout(() => {
      const form = document.querySelector("form");
      if (form) {
        // Reset the form with the saved values
        const event = new Event("submit", { cancelable: true, bubbles: true });
        form.dispatchEvent(event);
      }
    }, 500);
  };

  // Delete a saved analysis
  const deleteAnalysis = (id: string) => {
    const updatedSavedAnalyses = savedAnalyses.filter(analysis => analysis.id !== id);
    setSavedAnalyses(updatedSavedAnalyses);
    localStorage.setItem('savedCostAnalyses', JSON.stringify(updatedSavedAnalyses));
    alert("Analysis deleted!");
  };
  
  const handleCalculate = (values: ProductInfoFormValues) => {
    setFormData(values);
    setShowResults(true);
    // Scroll to results section after calculation
    setTimeout(() => {
      const resultsElement = document.getElementById('cost-breakdown-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  return (
    <>
      <PageHeader
        title="Trade Cost Breakdown"
        description="Calculate and analyze all costs associated with your international shipments"
        actions={[
          {
            label: "New Analysis",
            icon: <FaCircleInfo />,
            onClick: () => setShowResults(false),
            variant: "default"
          }
        ]}
      />
      
      <div className="flex flex-col space-y-6 mt-6">
        <Card className="bg-white shadow-sm border border-neutral-200">
          <CardHeader className="border-b border-neutral-200 px-5 py-4">
            <CardTitle className="text-lg font-medium text-neutral-900">
              Information Form
            </CardTitle>
            <p className="text-sm text-neutral-500 mt-1">
              Enter product and shipping details to calculate your trade costs
            </p>
          </CardHeader>
          <CardContent className="p-5">
            <ProductInformationForm onCalculate={handleCalculate} />
          </CardContent>
        </Card>
        
        {showResults && (
          <div id="cost-breakdown-results">
            <CostBreakdownTable />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="bg-white shadow-sm border border-neutral-200">
                <CardHeader className="px-4 py-3 border-b border-neutral-200">
                  <CardTitle className="text-md font-medium">Cost Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Product Value:</span>
                      <span className="text-sm font-medium">$20,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Total Duties:</span>
                      <span className="text-sm font-medium">$2,560</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Total Shipping:</span>
                      <span className="text-sm font-medium">$12,452</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Other Costs:</span>
                      <span className="text-sm font-medium">$3,239</span>
                    </div>
                    <div className="border-t border-neutral-200 pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total Landed Cost:</span>
                        <span className="text-primary-700">$38,251</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border border-neutral-200">
                <CardHeader className="px-4 py-3 border-b border-neutral-200">
                  <CardTitle className="text-md font-medium">Regulatory Requirements</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                      <span>Certificate of Origin required</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                      <span>FCC certification needed</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                      <span>RoHS compliance declaration</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                      <span>Country of origin labeling</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border border-neutral-200">
                <CardHeader className="px-4 py-3 border-b border-neutral-200">
                  <CardTitle className="text-md font-medium">Optimization Tips</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mt-1.5 mr-2"></span>
                      <span>Consider using sea freight to save 80%</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mt-1.5 mr-2"></span>
                      <span>Apply for duty drawback potential savings: $1,200</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mt-1.5 mr-2"></span>
                      <span>Use Foreign Trade Zone to defer duties</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mt-1.5 mr-2"></span>
                      <span>Consolidate shipments to reduce documentation fees</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      
      {/* Floating AI Copilot Assistant */}
      <CopilotAssistant 
        productDetails={productDetailsForCopilot}
        shipmentDetails={shipmentDetailsForCopilot}
        costComponents={costComponentsForCopilot}
      />
    </>
  );
};

export default CostBreakdownDashboard;