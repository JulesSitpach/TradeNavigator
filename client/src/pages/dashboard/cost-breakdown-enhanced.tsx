import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/common/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { FaCircleInfo, FaMagnifyingGlass } from "react-icons/fa6";
import { AlertCircle, ChevronDown } from "lucide-react";
import CopilotAssistant from "@/components/ai/CopilotAssistant";
import { Button } from "@/components/ui/button";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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

// Type for saved analysis
interface SavedAnalysis {
  id: string;
  name: string;
  date: string;
  formData: ProductInfoFormValues;
  results: any;
}

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

// Country lists organized by region
// CPTPP members are marked accordingly
const countryGroups = {
  'ASIA-PACIFIC REGION': [
    { label: "Japan - CPTPP member", value: "Japan", region: "ASIA-PACIFIC REGION", isCPTPP: true },
    { label: "South Korea", value: "South Korea", region: "ASIA-PACIFIC REGION", isCPTPP: false },
    { label: "China", value: "China", region: "ASIA-PACIFIC REGION", isCPTPP: false },
    { label: "India", value: "India", region: "ASIA-PACIFIC REGION", isCPTPP: false },
    { label: "Vietnam - CPTPP member", value: "Vietnam", region: "ASIA-PACIFIC REGION", isCPTPP: true },
    { label: "Singapore - CPTPP member", value: "Singapore", region: "ASIA-PACIFIC REGION", isCPTPP: true },
    { label: "Malaysia - CPTPP member", value: "Malaysia", region: "ASIA-PACIFIC REGION", isCPTPP: true },
    { label: "Australia - CPTPP member", value: "Australia", region: "ASIA-PACIFIC REGION", isCPTPP: true },
    { label: "Indonesia", value: "Indonesia", region: "ASIA-PACIFIC REGION", isCPTPP: false },
    { label: "Taiwan", value: "Taiwan", region: "ASIA-PACIFIC REGION", isCPTPP: false },
    { label: "New Zealand - CPTPP member", value: "New Zealand", region: "ASIA-PACIFIC REGION", isCPTPP: true },
    { label: "Thailand", value: "Thailand", region: "ASIA-PACIFIC REGION", isCPTPP: false },
    { label: "Philippines", value: "Philippines", region: "ASIA-PACIFIC REGION", isCPTPP: false },
  ],
  'EUROPE': [
    { label: "European Union", value: "European Union", region: "EUROPE", isCPTPP: false },
    { label: "Germany", value: "Germany", region: "EUROPE", isCPTPP: false },
    { label: "United Kingdom - CPTPP member", value: "United Kingdom", region: "EUROPE", isCPTPP: true },
    { label: "France", value: "France", region: "EUROPE", isCPTPP: false },
    { label: "Spain", value: "Spain", region: "EUROPE", isCPTPP: false },
    { label: "Italy", value: "Italy", region: "EUROPE", isCPTPP: false },
    { label: "Netherlands", value: "Netherlands", region: "EUROPE", isCPTPP: false },
    { label: "Switzerland", value: "Switzerland", region: "EUROPE", isCPTPP: false },
    { label: "Sweden", value: "Sweden", region: "EUROPE", isCPTPP: false },
    { label: "Belgium", value: "Belgium", region: "EUROPE", isCPTPP: false },
    { label: "Poland", value: "Poland", region: "EUROPE", isCPTPP: false },
  ],
  'NORTH & CENTRAL AMERICA': [
    { label: "United States", value: "United States", region: "NORTH & CENTRAL AMERICA", isCPTPP: false },
    { label: "Canada - CPTPP member", value: "Canada", region: "NORTH & CENTRAL AMERICA", isCPTPP: true },
    { label: "Mexico - CPTPP member", value: "Mexico", region: "NORTH & CENTRAL AMERICA", isCPTPP: true },
    { label: "Costa Rica", value: "Costa Rica", region: "NORTH & CENTRAL AMERICA", isCPTPP: false },
    { label: "Panama", value: "Panama", region: "NORTH & CENTRAL AMERICA", isCPTPP: false },
  ],
  'SOUTH AMERICA': [
    { label: "Brazil", value: "Brazil", region: "SOUTH AMERICA", isCPTPP: false },
    { label: "Chile - CPTPP member", value: "Chile", region: "SOUTH AMERICA", isCPTPP: true },
    { label: "Peru - CPTPP member", value: "Peru", region: "SOUTH AMERICA", isCPTPP: true },
    { label: "Colombia", value: "Colombia", region: "SOUTH AMERICA", isCPTPP: false },
    { label: "Argentina", value: "Argentina", region: "SOUTH AMERICA", isCPTPP: false },
  ],
  'MIDDLE EAST & AFRICA': [
    { label: "United Arab Emirates", value: "United Arab Emirates", region: "MIDDLE EAST & AFRICA", isCPTPP: false },
    { label: "Saudi Arabia", value: "Saudi Arabia", region: "MIDDLE EAST & AFRICA", isCPTPP: false },
    { label: "Israel", value: "Israel", region: "MIDDLE EAST & AFRICA", isCPTPP: false },
    { label: "South Africa", value: "South Africa", region: "MIDDLE EAST & AFRICA", isCPTPP: false },
    { label: "Nigeria", value: "Nigeria", region: "MIDDLE EAST & AFRICA", isCPTPP: false },
    { label: "Egypt", value: "Egypt", region: "MIDDLE EAST & AFRICA", isCPTPP: false },
  ]
};

// Flatten for use in dropdowns when regional grouping isn't needed
const countries = Object.values(countryGroups).flat();

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
const ProductInformationForm = ({ 
  onCalculate, 
  isModified = false,
  lastAnalysis = null,
  onReset = () => {}
}: { 
  onCalculate: (values: ProductInfoFormValues) => void,
  isModified?: boolean,
  lastAnalysis?: ProductInfoFormValues | null,
  onReset?: () => void
}) => {
  const [showHSAssistant, setShowHSAssistant] = useState(false);
  const [modifiedFields, setModifiedFields] = useState<string[]>([]);
  
  // Initialize form with default values or modified values
  const form = useForm<ProductInfoFormValues>({
    resolver: zodResolver(productInfoFormSchema),
    defaultValues: lastAnalysis || {
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
  
  // When form values change, track which fields are different from lastAnalysis
  useEffect(() => {
    if (isModified && lastAnalysis) {
      const formValues = form.getValues();
      const changedFields = Object.keys(formValues).filter(key => {
        return formValues[key as keyof ProductInfoFormValues] !== 
               lastAnalysis[key as keyof ProductInfoFormValues];
      });
      setModifiedFields(changedFields);
    }
  }, [form.watch(), isModified, lastAnalysis]);
  
  const onSubmit = (values: ProductInfoFormValues) => {
    console.log("Form values:", values);
    // Here we would send the data to the server for analysis
    onCalculate(values);
  };
  
  // Handle form reset
  const handleReset = () => {
    form.reset();
    setModifiedFields([]);
    onReset();
  };
  
  // Check if this form is currently in modification mode
  const isModifyingAnalysis = isModified && lastAnalysis !== null;
  
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
                    category={form.getValues("productCategory")}
                    onSelect={(code: string) => {
                      form.setValue("hsCode", code);
                      setShowHSAssistant(false);
                    }}
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectContent className="max-h-[300px]">
                      {Object.entries(countryGroups).map(([groupName, groupCountries]) => (
                        <div key={groupName}>
                          <div className="px-2 py-1.5 font-semibold text-sm text-slate-500 bg-slate-50">
                            {groupName}
                          </div>
                          {groupCountries.map((country) => (
                            <SelectItem 
                              key={country.value} 
                              value={country.value}
                              className={country.isCPTPP ? "text-blue-600 font-medium" : ""}
                            >
                              {country.label}
                            </SelectItem>
                          ))}
                        </div>
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
                    <SelectContent className="max-h-[300px]">
                      {Object.entries(countryGroups).map(([groupName, groupCountries]) => (
                        <div key={groupName}>
                          <div className="px-2 py-1.5 font-semibold text-sm text-slate-500 bg-slate-50">
                            {groupName}
                          </div>
                          {groupCountries.map((country) => (
                            <SelectItem 
                              key={country.value} 
                              value={country.value}
                              className={country.isCPTPP ? "text-blue-600 font-medium" : ""}
                            >
                              {country.label}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Product Value */}
            <FormField
              control={form.control}
              name="productValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Value (USD)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
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
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <h3 className="font-medium text-lg pt-2">Shipping Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
          
          <h3 className="font-medium text-lg pt-2">Dimensions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Length */}
            <FormField
              control={form.control}
              name="length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Length (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Width */}
            <FormField
              control={form.control}
              name="width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Width (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Height */}
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Modification Indicator */}
          {isModifyingAnalysis && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Modifying Existing Analysis</AlertTitle>
              <AlertDescription className="text-yellow-700">
                You are modifying a saved analysis.
                {modifiedFields.length > 0 && (
                  <div className="pt-1">
                    <div className="text-xs">Modified fields:</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {modifiedFields.map(field => (
                        <Badge key={field} variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Form Buttons */}
          <div className="flex justify-between pt-2">
            {/* Reset Button - only show when fields have been modified */}
            {isModifyingAnalysis ? (
              <Button type="button" variant="outline" onClick={handleReset}>
                Revert Changes
              </Button>
            ) : (
              <div></div> 
            )}
            
            {/* Split Button: Calculate/Modify */}
            <div className="flex space-x-1">
              {/* Main Calculate/Recalculate Button */}
              <Button 
                type="submit" 
                className={isModified ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
              >
                {isModified ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Recalculate
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Calculate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

// Cost breakdown results component
const CostBreakdownResults = ({ 
  results, 
  onSave, 
  isSaving = false,
  isModifying = false,
  analysisName = "",
  canSave = true
}: { 
  results: any, 
  onSave: (name: string) => void,
  isSaving?: boolean,
  isModifying?: boolean,
  analysisName?: string,
  canSave?: boolean
}) => {
  const [analysisTitle, setAnalysisTitle] = useState(analysisName || "");
  
  // Helper function to format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  // Helper function to determine the text color based on percentage
  const getPercentageTextColor = (percentage: number) => {
    if (percentage > 25) return "text-red-600";
    if (percentage > 15) return "text-orange-600";
    if (percentage > 10) return "text-yellow-600";
    return "text-green-600";
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Cost Breakdown Results</h3>
          <div className="text-sm text-slate-500">
            {isModifying && (
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                Modified Analysis
              </Badge>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md border border-blue-100">
            <div className="font-medium">Total Cost</div>
            <div className="font-bold text-lg">{formatCurrency(results.totalCost)}</div>
          </div>
          
          <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-100 p-3 text-sm font-medium text-slate-600">
              <div className="col-span-5">Component</div>
              <div className="col-span-3 text-right">Amount</div>
              <div className="col-span-2 text-right">% of Total</div>
              <div className="col-span-2 text-right">Category</div>
            </div>
            <div className="divide-y divide-slate-100">
              {results.components.map((component: any, index: number) => (
                <div key={index} className="grid grid-cols-12 p-3 text-sm hover:bg-slate-50">
                  <div className="col-span-5 font-medium">{component.name}</div>
                  <div className="col-span-3 text-right">
                    {formatCurrency(component.value)}
                  </div>
                  <div className={`col-span-2 text-right ${getPercentageTextColor(component.percentage)}`}>
                    {component.percentage.toFixed(1)}%
                  </div>
                  <div className="col-span-2 text-right text-slate-500">
                    {component.category}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* VAT and Duty Information */}
          <div className="bg-white rounded-md border border-slate-200 p-4">
            <h4 className="font-medium mb-2">Tax & Duty Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-slate-500 mb-1">VAT/Sales Tax</div>
                <div className="flex justify-between">
                  <div>{results.taxDetails?.name || "VAT"}</div>
                  <div>{results.taxDetails?.rate || 0}%</div>
                </div>
                {results.taxDetails?.description && (
                  <div className="text-xs text-slate-500 mt-1">
                    {results.taxDetails.description}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500 mb-1">Import Duty</div>
                <div className="flex justify-between">
                  <div>Effective Rate</div>
                  <div>{results.dutyDetails?.effectiveRate || 0}%</div>
                </div>
                {results.dutyDetails?.description && (
                  <div className="text-xs text-slate-500 mt-1">
                    {results.dutyDetails.description}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {canSave && (
            <div className="flex items-center space-x-2 mt-4">
              <Input
                placeholder="Enter name for this analysis"
                value={analysisTitle}
                onChange={(e) => setAnalysisTitle(e.target.value)}
                className="max-w-md"
              />
              <Button 
                onClick={() => onSave(analysisTitle)}
                disabled={isSaving || !analysisTitle.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                    </svg>
                    Save Analysis
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <CopilotAssistant
        title="Trade Navigator Copilot"
        productInfo={{
          productName: results.productInfo?.productName || "",
          productCategory: results.productInfo?.productCategory || "",
          hsCode: results.productInfo?.hsCode || "",
          productDescription: results.productInfo?.productDescription || "",
          unitValue: String(results.productInfo?.unitValue || "0"),
          quantity: String(results.productInfo?.quantity || "1"),
          originCountry: results.productInfo?.originCountry || "",
          destinationCountry: results.productInfo?.destinationCountry || "",
          weight: String(results.productInfo?.weight || "0"),
          dimensions: {
            length: String(results.productInfo?.dimensions?.length || "0"),
            width: String(results.productInfo?.dimensions?.width || "0"),
            height: String(results.productInfo?.dimensions?.height || "0"),
          },
          transportMode: results.productInfo?.transportMode || "",
          additionalNotes: results.productInfo?.additionalNotes || "",
        }}
        costBreakdown={results}
      />
    </div>
  );
};

// Main Dashboard Component
const CostBreakdownDashboard = () => {
  const [formData, setFormData] = useState<ProductInfoFormValues | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [isModifying, setIsModifying] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<ProductInfoFormValues | null>(null);
  const [modificationInfo, setModificationInfo] = useState<{ originalName: string, date: string } | null>(null);
  
  // Global analysis context 
  const { setCurrentAnalysis } = useAnalysis();
  
  // Fetch data from API
  const { data } = useQuery({
    queryKey: ['/api/cost-breakdown'],
  });
  
  const { toast } = useToast();
  
  // Load saved analyses from local storage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedAnalyses');
    if (saved) {
      try {
        setSavedAnalyses(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse saved analyses:', error);
      }
    }
  }, []);
  
  // Handle calculate/recalculate action
  const handleCalculate = (values: ProductInfoFormValues) => {
    setFormData(values);
    
    // In a real app, this would make an API call to calculate costs
    // For now, we'll use sample data
    const sampleResults = {
      totalCost: calculateTotalCost(values),
      components: [
        { 
          name: "Product Value", 
          value: values.productValue * values.quantity, 
          percentage: ((values.productValue * values.quantity) / calculateTotalCost(values)) * 100,
          category: "Base Cost"
        },
        { 
          name: "Import Duty", 
          value: calculateDuty(values), 
          percentage: (calculateDuty(values) / calculateTotalCost(values)) * 100,
          category: "Tariffs & Duties"
        },
        { 
          name: "VAT/Sales Tax", 
          value: calculateVAT(values), 
          percentage: (calculateVAT(values) / calculateTotalCost(values)) * 100,
          category: "Taxes"
        },
        { 
          name: "Shipping Cost", 
          value: calculateShipping(values), 
          percentage: (calculateShipping(values) / calculateTotalCost(values)) * 100,
          category: "Logistics"
        },
        { 
          name: "Insurance", 
          value: calculateInsurance(values), 
          percentage: (calculateInsurance(values) / calculateTotalCost(values)) * 100,
          category: "Logistics"
        },
        { 
          name: "Customs Clearance Fees", 
          value: calculateCustomsFees(values), 
          percentage: (calculateCustomsFees(values) / calculateTotalCost(values)) * 100,
          category: "Regulations & Compliance"
        },
        { 
          name: "Handling Fees", 
          value: calculateHandlingFees(values), 
          percentage: (calculateHandlingFees(values) / calculateTotalCost(values)) * 100,
          category: "Logistics"
        },
      ],
      productInfo: {
        productName: `${values.productCategory} Product`,
        productCategory: values.productCategory,
        hsCode: values.hsCode,
        productDescription: values.productDescription,
        unitValue: values.productValue,
        quantity: values.quantity,
        originCountry: values.originCountry,
        destinationCountry: values.destinationCountry,
        weight: values.weight,
        dimensions: {
          length: values.length,
          width: values.width,
          height: values.height,
        },
        transportMode: values.transportMode,
      },
      taxDetails: {
        name: getVATName(values.destinationCountry),
        rate: getVATRate(values.destinationCountry, values.productCategory),
        description: getVATDescription(values.destinationCountry, values.productCategory, values.productValue * values.quantity),
      },
      dutyDetails: {
        effectiveRate: getDutyRate(values.hsCode, values.originCountry, values.destinationCountry),
        description: getDutyDescription(values.hsCode, values.originCountry, values.destinationCountry),
      }
    };
    
    // Update state with the results
    setResults(sampleResults);
    setShowResults(true);
    
    // Update global analysis context with total cost and components
    setCurrentAnalysis({
      totalCost: sampleResults.totalCost,
      components: sampleResults.components.map((c: any) => ({
        name: c.name,
        amount: c.value,
        percentage: c.percentage,
        details: { category: c.category }
      })),
      productDetails: {
        description: values.productDescription || '',
        hsCode: values.hsCode,
        category: values.productCategory,
        originCountry: values.originCountry,
        destinationCountry: values.destinationCountry,
        productValue: values.productValue,
        weight: values.weight,
        transportMode: values.transportMode,
        quantity: values.quantity,
      },
      timestamp: new Date()
    });
    
    // If modifying, update the saved analysis
    if (isModifying && currentAnalysisId) {
      const updatedAnalyses = savedAnalyses.map(analysis => {
        if (analysis.id === currentAnalysisId) {
          return {
            ...analysis,
            formData: values,
            results: sampleResults
          };
        }
        return analysis;
      });
      
      setSavedAnalyses(updatedAnalyses);
      localStorage.setItem('savedAnalyses', JSON.stringify(updatedAnalyses));
      
      toast({
        title: "Analysis Updated",
        description: "Your modifications have been applied and the analysis has been updated.",
      });
    }
  };
  
  // Handle save analysis
  const handleSaveAnalysis = (name: string) => {
    if (!formData || !results) return;
    
    setIsSaving(true);
    
    // Generate a unique ID
    const newId = Date.now().toString();
    
    // Create a new analysis object
    const newAnalysis: SavedAnalysis = {
      id: newId,
      name: name,
      date: new Date().toISOString(),
      formData: formData,
      results: results
    };
    
    // Add to saved analyses
    const updatedAnalyses = [...savedAnalyses, newAnalysis];
    setSavedAnalyses(updatedAnalyses);
    
    // Save to localStorage
    localStorage.setItem('savedAnalyses', JSON.stringify(updatedAnalyses));
    
    // Update current analysis ID
    setCurrentAnalysisId(newId);
    
    // Show success toast
    toast({
      title: "Analysis Saved",
      description: `"${name}" has been saved to your analyses.`,
    });
    
    setIsSaving(false);
  };
  
  // Handle load analysis
  const handleLoadAnalysis = (analysis: SavedAnalysis) => {
    setFormData(analysis.formData);
    setResults(analysis.results);
    setShowResults(true);
    setCurrentAnalysisId(analysis.id);
    
    // Update global analysis context with total cost and components
    setCurrentAnalysis({
      totalCost: analysis.results.totalCost,
      components: analysis.results.components.map((c: any) => ({
        name: c.name,
        amount: c.value,
        percentage: c.percentage,
        details: { category: c.category }
      })),
      productDetails: {
        description: analysis.formData.productDescription || '',
        hsCode: analysis.formData.hsCode,
        category: analysis.formData.productCategory,
        originCountry: analysis.formData.originCountry,
        destinationCountry: analysis.formData.destinationCountry,
        productValue: analysis.formData.productValue,
        weight: analysis.formData.weight,
        transportMode: analysis.formData.transportMode,
        quantity: analysis.formData.quantity,
      },
      timestamp: new Date()
    });
    
    toast({
      title: "Analysis Loaded",
      description: `Successfully loaded: ${analysis.name}`,
    });
  };
  
  // Handle Modify button click
  const handleModify = (analysis: SavedAnalysis) => {
    setLastAnalysis(analysis.formData);
    setModificationInfo({
      originalName: analysis.name,
      date: new Date(analysis.date).toLocaleDateString()
    });
    setIsModifying(true);
    setFormData(analysis.formData);
    setCurrentAnalysisId(analysis.id);
    setShowResults(false);
    
    toast({
      title: "Modifying Analysis",
      description: `You are now modifying "${analysis.name}". Make your changes and click Recalculate.`,
    });
  };
  
  // Handle reset modification
  const handleResetModification = () => {
    setIsModifying(false);
    setLastAnalysis(null);
    setModificationInfo(null);
    setFormData(null);
    setCurrentAnalysisId(null);
    setShowResults(false);
  };
  
  // Helper function for calculating the total cost
  function calculateTotalCost(values: ProductInfoFormValues): number {
    const productCost = values.productValue * values.quantity;
    const duty = calculateDuty(values);
    const vat = calculateVAT(values);
    const shipping = calculateShipping(values);
    const insurance = calculateInsurance(values);
    const customsFees = calculateCustomsFees(values);
    const handlingFees = calculateHandlingFees(values);
    
    return productCost + duty + vat + shipping + insurance + customsFees + handlingFees;
  }
  
  // Helper functions for calculating individual components
  function calculateDuty(values: ProductInfoFormValues): number {
    const productCost = values.productValue * values.quantity;
    const rate = getDutyRate(values.hsCode, values.originCountry, values.destinationCountry);
    return productCost * (rate / 100);
  }
  
  function calculateVAT(values: ProductInfoFormValues): number {
    const productCost = values.productValue * values.quantity;
    const duty = calculateDuty(values);
    const rate = getVATRate(values.destinationCountry, values.productCategory);
    return (productCost + duty) * (rate / 100);
  }
  
  function calculateShipping(values: ProductInfoFormValues): number {
    const baseRate = values.transportMode === "Air Freight" ? 45 : 
                    values.transportMode === "Sea Freight" ? 25 : 
                    values.transportMode === "Rail Freight" ? 30 : 20;
    
    // Calculate volumetric weight
    const volumetricWeight = (values.length * values.width * values.height) / 5000;
    const chargeableWeight = Math.max(values.weight, volumetricWeight);
    
    // Distance factor based on origin and destination
    const distanceFactor = getDistanceFactor(values.originCountry, values.destinationCountry);
    
    return baseRate * chargeableWeight * distanceFactor;
  }
  
  function calculateInsurance(values: ProductInfoFormValues): number {
    const productCost = values.productValue * values.quantity;
    // Insurance rate depends on transport mode and product value
    const rate = values.transportMode === "Air Freight" ? 0.015 : 
                values.transportMode === "Sea Freight" ? 0.025 : 0.02;
    return productCost * rate;
  }
  
  function calculateCustomsFees(values: ProductInfoFormValues): number {
    // Base fee depends on destination country
    const baseFee = values.destinationCountry === "United States" ? 75 :
                   values.destinationCountry === "European Union" ? 85 :
                   values.destinationCountry === "United Kingdom" ? 70 : 65;
    
    // Additional fees for high-value shipments
    const productCost = values.productValue * values.quantity;
    const valueAddition = productCost > 10000 ? 50 : productCost > 5000 ? 25 : 0;
    
    return baseFee + valueAddition;
  }
  
  function calculateHandlingFees(values: ProductInfoFormValues): number {
    const baseRate = values.packageType === "Wooden Crate" ? 30 :
                    values.packageType === "Pallet" ? 25 : 15;
    
    return baseRate * values.quantity;
  }
  
  // Helper function to get duty rate based on HS code and countries
  function getDutyRate(hsCode: string, originCountry: string, destinationCountry: string): number {
    // Check if countries are part of trade agreements
    const isCPTPP = 
      ["Japan", "Vietnam", "Singapore", "Malaysia", "Australia", "New Zealand", "Canada", "Mexico", "Chile", "Peru", "United Kingdom"].includes(originCountry) && 
      ["Japan", "Vietnam", "Singapore", "Malaysia", "Australia", "New Zealand", "Canada", "Mexico", "Chile", "Peru", "United Kingdom"].includes(destinationCountry);
    
    const isUSMCA = 
      ["United States", "Canada", "Mexico"].includes(originCountry) && 
      ["United States", "Canada", "Mexico"].includes(destinationCountry);
    
    const isASEAN = 
      ["Singapore", "Malaysia", "Indonesia", "Thailand", "Vietnam", "Philippines"].includes(originCountry) && 
      ["Singapore", "Malaysia", "Indonesia", "Thailand", "Vietnam", "Philippines"].includes(destinationCountry);
    
    // Apply preferential rates if applicable
    if (isCPTPP) return 0; // Zero duty under CPTPP
    if (isUSMCA) return 0; // Zero duty under USMCA
    if (isASEAN) return 0; // Zero duty under ASEAN
    
    // HS Code-based rates (simplified example)
    if (hsCode.startsWith("84") || hsCode.startsWith("85")) return 2.5; // Electronics
    if (hsCode.startsWith("61") || hsCode.startsWith("62")) return 12; // Textiles
    if (hsCode.startsWith("28") || hsCode.startsWith("29")) return 6.5; // Chemicals
    if (hsCode.startsWith("87")) return 10; // Vehicles
    if (hsCode.startsWith("94")) return 3.5; // Furniture
    if (hsCode.startsWith("90")) return 1.5; // Medical devices
    if (hsCode.startsWith("21") || hsCode.startsWith("22")) return 8; // Food products
    
    // Default rate
    return 7.5;
  }
  
  // Helper function to get duty description
  function getDutyDescription(hsCode: string, originCountry: string, destinationCountry: string): string {
    // Check if countries are part of trade agreements
    const isCPTPP = 
      ["Japan", "Vietnam", "Singapore", "Malaysia", "Australia", "New Zealand", "Canada", "Mexico", "Chile", "Peru", "United Kingdom"].includes(originCountry) && 
      ["Japan", "Vietnam", "Singapore", "Malaysia", "Australia", "New Zealand", "Canada", "Mexico", "Chile", "Peru", "United Kingdom"].includes(destinationCountry);
    
    const isUSMCA = 
      ["United States", "Canada", "Mexico"].includes(originCountry) && 
      ["United States", "Canada", "Mexico"].includes(destinationCountry);
    
    const isASEAN = 
      ["Singapore", "Malaysia", "Indonesia", "Thailand", "Vietnam", "Philippines"].includes(originCountry) && 
      ["Singapore", "Malaysia", "Indonesia", "Thailand", "Vietnam", "Philippines"].includes(destinationCountry);
    
    if (isCPTPP) return "Duty-free under CPTPP trade agreement";
    if (isUSMCA) return "Duty-free under USMCA trade agreement";
    if (isASEAN) return "Duty-free under ASEAN trade agreement";
    
    return `Standard duty rate applies for HS code ${hsCode}`;
  }
  
  // Helper function to get VAT/Sales Tax name based on country
  function getVATName(country: string): string {
    if (["United States"].includes(country)) return "Sales Tax";
    if (["Canada"].includes(country)) return "GST/HST";
    if (["Australia", "New Zealand"].includes(country)) return "GST";
    if (["Japan"].includes(country)) return "Consumption Tax";
    return "VAT";
  }
  
  // Helper function to get VAT/Sales Tax rate based on country and product category
  function getVATRate(country: string, category: string): number {
    // Check for category-based exemptions
    const isExempt = 
      category === "Food & Beverages" || 
      category === "Pharmaceuticals";
    
    // Country-specific rates with category exemptions
    if (country === "United Kingdom") return isExempt ? 0 : 20;
    if (country === "Germany" || country === "France" || country === "Italy" || country === "Spain") return isExempt ? 7 : 19;
    if (country === "European Union") return isExempt ? 8 : 21;
    if (country === "Japan") return 10;
    if (country === "Singapore") return 8;
    if (country === "Australia" || country === "New Zealand") return 10;
    if (country === "Canada") return 13;
    if (country === "United States") return 8.5; // Average sales tax
    if (country === "China") return 13;
    
    // Default rate
    return isExempt ? 5 : 15;
  }
  
  // Helper function to get VAT/Sales Tax description
  function getVATDescription(country: string, category: string, value: number): string {
    // Check for category-based exemptions
    const isExempt = 
      category === "Food & Beverages" || 
      category === "Pharmaceuticals";
    
    // Check for value-based threshold exemptions
    const isBelowThreshold = 
      (country === "European Union" && value < 150) ||
      (country === "United Kingdom" && value < 135) ||
      (country === "Australia" && value < 1000);
    
    if (isExempt) {
      return `${category} products are exempt or have reduced rates`;
    }
    
    if (isBelowThreshold) {
      if (country === "European Union") return "Exempt: Below €150 import threshold";
      if (country === "United Kingdom") return "Exempt: Below £135 import threshold";
      if (country === "Australia") return "Exempt: Below AUD 1,000 import threshold";
    }
    
    return `Standard rate applies for ${country}`;
  }
  
  // Helper function to calculate distance factor
  function getDistanceFactor(originCountry: string, destinationCountry: string): number {
    // Simplified distance calculation based on regions
    const originRegion = getRegion(originCountry);
    const destRegion = getRegion(destinationCountry);
    
    if (originRegion === destRegion) return 1;
    
    const regionDistances: Record<string, Record<string, number>> = {
      "ASIA-PACIFIC REGION": {
        "EUROPE": 1.8,
        "NORTH & CENTRAL AMERICA": 2.2,
        "SOUTH AMERICA": 2.5,
        "MIDDLE EAST & AFRICA": 1.5
      },
      "EUROPE": {
        "ASIA-PACIFIC REGION": 1.8,
        "NORTH & CENTRAL AMERICA": 1.5,
        "SOUTH AMERICA": 2.0,
        "MIDDLE EAST & AFRICA": 1.2
      },
      "NORTH & CENTRAL AMERICA": {
        "ASIA-PACIFIC REGION": 2.2,
        "EUROPE": 1.5,
        "SOUTH AMERICA": 1.3,
        "MIDDLE EAST & AFRICA": 2.0
      },
      "SOUTH AMERICA": {
        "ASIA-PACIFIC REGION": 2.5,
        "EUROPE": 2.0,
        "NORTH & CENTRAL AMERICA": 1.3,
        "MIDDLE EAST & AFRICA": 2.3
      },
      "MIDDLE EAST & AFRICA": {
        "ASIA-PACIFIC REGION": 1.5,
        "EUROPE": 1.2,
        "NORTH & CENTRAL AMERICA": 2.0,
        "SOUTH AMERICA": 2.3
      }
    };
    
    return regionDistances[originRegion]?.[destRegion] || 1.5;
  }
  
  // Helper function to get region for a country
  function getRegion(country: string): string {
    for (const [region, countryList] of Object.entries(countryGroups)) {
      if (countryList.some(c => c.value === country)) {
        return region;
      }
    }
    return "UNKNOWN";
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <PageHeader
        title="Cost Breakdown Dashboard"
        description="Calculate and analyze all costs associated with importing or exporting products"
        icon={<FaCircleInfo className="h-6 w-6 text-blue-500" />}
      />
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column - Input Form */}
        <div className="lg:col-span-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold">
                  {isModifying ? "Modify Product Information" : "Product Information"}
                </CardTitle>
                {modificationInfo && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Modifying: {modificationInfo.originalName} ({modificationInfo.date})
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ProductInformationForm 
                onCalculate={handleCalculate}
                isModified={isModifying}
                lastAnalysis={lastAnalysis}
                onReset={handleResetModification}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Results or Saved Analyses */}
        <div className="lg:col-span-6">
          {showResults && results ? (
            <CostBreakdownResults 
              results={results} 
              onSave={handleSaveAnalysis}
              isSaving={isSaving}
              isModifying={isModifying && !!currentAnalysisId}
              analysisName={currentAnalysisId ? savedAnalyses.find(a => a.id === currentAnalysisId)?.name : ""}
              canSave={!currentAnalysisId || (isModifying && !!currentAnalysisId)}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Saved Analyses</CardTitle>
              </CardHeader>
              <CardContent>
                {savedAnalyses.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 border border-dashed border-slate-300 rounded-lg">
                    <div className="mb-2">No saved analyses yet</div>
                    <div className="text-sm">Complete the form and calculate costs to save your analysis</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedAnalyses.map((analysis) => (
                      <div key={analysis.id} className="p-4 border rounded-lg hover:bg-slate-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{analysis.name}</h3>
                            <div className="text-sm text-slate-500">
                              {new Date(analysis.date).toLocaleDateString()} · {analysis.formData.productCategory}
                            </div>
                          </div>
                          <div className="text-lg font-bold">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(analysis.results.totalCost)}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="bg-slate-100">
                            {analysis.formData.hsCode}
                          </Badge>
                          <Badge variant="outline" className="bg-slate-100">
                            {analysis.formData.originCountry} → {analysis.formData.destinationCountry}
                          </Badge>
                          <Badge variant="outline" className="bg-slate-100">
                            {analysis.formData.transportMode}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleLoadAnalysis(analysis)}
                          >
                            View Details
                          </Button>
                          
                          {/* Modify Button in Saved Analysis Card */}
                          <Button 
                            variant="outline"
                            size="sm"
                            className="border-green-500 text-green-700 hover:bg-green-50"
                            onClick={() => handleModify(analysis)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Modify
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostBreakdownDashboard;