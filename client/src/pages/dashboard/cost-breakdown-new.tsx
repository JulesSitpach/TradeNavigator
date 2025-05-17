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
                  <SelectContent className="max-h-80">
                    {Object.entries(countryGroups).map(([region, regionCountries]) => (
                      <div key={region}>
                        <div className="px-2 py-1.5 text-sm font-semibold bg-gray-100">{region}</div>
                        {regionCountries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
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
                  <SelectContent className="max-h-80">
                    {Object.entries(countryGroups).map(([region, regionCountries]) => (
                      <div key={region}>
                        <div className="px-2 py-1.5 text-sm font-semibold bg-gray-100">{region}</div>
                        {regionCountries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
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
        
        {isModified && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-blue-700">Modified from previous analysis</AlertTitle>
            <AlertDescription className="text-blue-600">
              You are modifying a previous analysis. Fields changed: {modifiedFields.length > 0 ? 
                modifiedFields.map(field => field.replace(/([A-Z])/g, ' $1').toLowerCase()).join(', ') : 
                'None yet'}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end space-x-3">
          {isModified && (
            <Button 
              type="button" 
              variant="outline"
              onClick={handleReset}
              className="border-gray-300 text-gray-700"
            >
              Reset Form
            </Button>
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
            
            {/* Actions Dropdown - only visible when results exist */}
            {formData && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="px-2">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isModifying && (
                    <DropdownMenuItem 
                      onClick={() => {
                        // Only proceed if we have form data
                        if (formData) {
                          // Enable modification mode with both state variables
                          setIsModifying(true);
                          setIsModifyingAnalysis(true);
                          
                          // Store original data for potential revert
                          setLastAnalysis(formData);
                          
                          // Pre-fill form with current data
                          form.reset(formData);
                          
                          // Set modification info for UI feedback
                          setModificationInfo({
                            originalName: saveName || "Current Analysis",
                            date: new Date().toLocaleDateString()
                          });

                          // Show success toast
                          toast({
                            title: "Modifying Analysis",
                            description: "Make your changes and click Recalculate when done.",
                            variant: "default"
                          });
                        }
                      }}
                      className="cursor-pointer flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Modify Values
                    </DropdownMenuItem>
                  )}
                  {isModifying && (
                    <DropdownMenuItem 
                      onClick={() => {
                        // Reset both modification states
                        setIsModifying(false);
                        setIsModifyingAnalysis(false);
                        
                        // Reset form to original data if available
                        if (lastAnalysis) {
                          form.reset(lastAnalysis);
                        }
                        
                        // Clear modification info UI display
                        setModificationInfo(null);
                        
                        // Notify user
                        toast({
                          title: "Changes Reverted",
                          description: "Returned to the original analysis values",
                          variant: "default"
                        });
                      }}
                      className="cursor-pointer flex items-center text-amber-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      Revert Changes
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => setSaveDialogOpen(true)}
                    className="cursor-pointer flex items-center text-blue-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                    </svg>
                    Save Analysis
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
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
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              <tr className="hover:bg-neutral-50">
                <td className="px-5 py-4">
                  <div className="font-medium text-neutral-800">Product Value</div>
                  <div className="text-xs text-neutral-500">Base value of goods</div>
                </td>
                <td className="px-5 py-4 text-right text-neutral-800">
                  $20,000.00
                </td>
                <td className="px-5 py-4 text-right text-neutral-800">
                  52.3%
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-5 py-4">
                  <div className="font-medium text-neutral-800">Import Duty</div>
                  <div className="text-xs text-neutral-500">Based on HS code 8471.30</div>
                </td>
                <td className="px-5 py-4 text-right text-neutral-800">
                  $2,000.00
                </td>
                <td className="px-5 py-4 text-right text-neutral-800">
                  5.2%
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-5 py-4">
                  <div className="font-medium text-neutral-800">VAT</div>
                  <div className="text-xs text-neutral-500">Value-added tax</div>
                </td>
                <td className="px-5 py-4 text-right text-neutral-800">
                  $560.00
                </td>
                <td className="px-5 py-4 text-right text-neutral-800">
                  1.5%
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-5 py-4">
                  <div className="font-medium text-neutral-800">Ocean Freight</div>
                  <div className="text-xs text-neutral-500">Main carriage fee</div>
                </td>
                <td className="px-5 py-4 text-right text-neutral-800">
                  $8,500.00
                </td>
                <td className="px-5 py-4 text-right text-neutral-800">
                  22.2%
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-5 py-4">
                  <div className="font-medium text-neutral-800">Insurance</div>
                  <div className="text-xs text-neutral-500">Cargo insurance premium</div>
                </td>
                <td className="px-5 py-4 text-right text-neutral-800">
                  $950.00
                </td>
                <td className="px-5 py-4 text-right text-neutral-800">
                  2.5%
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-5 py-4">
                  <div className="font-medium text-neutral-800">Port Handling</div>
                  <div className="text-xs text-neutral-500">Terminal handling charges</div>
                </td>
                <td className="px-5 py-4 text-right text-neutral-800">
                  $1,200.00
                </td>
                <td className="px-5 py-4 text-right text-neutral-800">
                  3.1%
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-5 py-4">
                  <div className="font-medium text-neutral-800">Customs Clearance</div>
                  <div className="text-xs text-neutral-500">Documentation and processing</div>
                </td>
                <td className="px-5 py-4 text-right text-neutral-800">
                  $1,802.00
                </td>
                <td className="px-5 py-4 text-right text-neutral-800">
                  4.7%
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-5 py-4">
                  <div className="font-medium text-neutral-800">Last Mile Delivery</div>
                  <div className="text-xs text-neutral-500">To final destination</div>
                </td>
                <td className="px-5 py-4 text-right text-neutral-800">
                  $1,860.00
                </td>
                <td className="px-5 py-4 text-right text-neutral-800">
                  4.9%
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-5 py-4">
                  <div className="font-medium text-neutral-800">Other Fees</div>
                  <div className="text-xs text-neutral-500">Miscellaneous charges</div>
                </td>
                <td className="px-5 py-4 text-right text-neutral-800">
                  $1,350.00
                </td>
                <td className="px-5 py-4 text-right text-neutral-800">
                  3.5%
                </td>
              </tr>
              <tr className="bg-neutral-100 font-semibold">
                <td className="px-5 py-4 text-neutral-900">Total</td>
                <td className="px-5 py-4 text-right text-neutral-900">
                  $38,222.00
                </td>
                <td className="px-5 py-4 text-right text-neutral-900">
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

// Cost Breakdown Dashboard - Main Component
const CostBreakdownDashboard = () => {
  const [showResults, setShowResults] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [saveName, setSaveName] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ProductInfoFormValues | null>(null);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  const [isModifying, setIsModifying] = useState(false);
  const [isModifyingAnalysis, setIsModifyingAnalysis] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<ProductInfoFormValues | null>(null);
  const [modificationInfo, setModificationInfo] = useState<{originalName: string, date: string} | null>(null);
  const { setCurrentAnalysis } = useAnalysis();
  
  // Form reference to programmatically update form values
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
      height: 0
    }
  });

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
        category: component.category
      };
    });
  }
  
  // Handler for initiating modification from the dropdown menu
  const handleModifyFromDropdown = () => {
    if (formData) {
      setIsModifying(true);
      setIsModifyingAnalysis(true);
      setLastAnalysis(formData);
      // Set modification info for user feedback
      setModificationInfo({
        originalName: saveName || "Current Analysis",
        date: new Date().toLocaleString()
      });
      
      // Show success toast
      toast({
        title: "Modifying Analysis",
        description: "Make your changes and click Recalculate when done.",
        variant: "default"
      });
    }
  };

  // Handle saving the current analysis
  const handleSaveAnalysis = () => {
    setSaveDialogOpen(true);
  };

  // Handler for calculate event from form
  const handleCalculate = (values: ProductInfoFormValues) => {
    console.log("Form values:", values);
    
    // Store the form data for later saving
    setFormData(values);
    
    // In a real application, we would make an API call here to get the results
    // For now, we'll use sample data
    const sampleResults = {
      totalCost: 38222,
      components: [
        { name: "Product Value", value: 20000, category: "product", percentage: 52.3 },
        { name: "Import Duty", value: 2000, category: "duty", percentage: 5.2 },
        { name: "VAT", value: 560, category: "tax", percentage: 1.5 },
        { name: "Ocean Freight", value: 8500, category: "shipping", percentage: 22.2 },
        { name: "Insurance", value: 950, category: "shipping", percentage: 2.5 },
        { name: "Port Handling", value: 1200, category: "shipping", percentage: 3.1 },
        { name: "Customs Clearance", value: 1802, category: "shipping", percentage: 4.7 },
        { name: "Documentation Fees", value: 350, category: "other", percentage: 0.9 },
        { name: "Last Mile Delivery", value: 1860, category: "shipping", percentage: 4.9 },
        { name: "Other Fees", value: 1000, category: "other", percentage: 2.6 }
      ]
    };
    
    setResults(sampleResults);
    setShowResults(true);
    
    // Update the central analysis context to synchronize all dashboards
    setCurrentAnalysis({
      totalCost: sampleResults.totalCost,
      components: sampleResults.components.map(c => ({
        name: c.name,
        amount: c.value,
        percentage: c.percentage,
        details: { category: c.category }
      })),
      productDetails: {
        description: values.productDescription,
        hsCode: values.hsCode,
        category: values.productCategory,
        originCountry: values.originCountry,
        destinationCountry: values.destinationCountry,
        productValue: values.productValue,
        weight: values.weight,
        transportMode: values.transportMode,
        quantity: values.quantity,
        dimensions: {
          length: values.length,
          width: values.width,
          height: values.height
        }
      },
      timestamp: new Date()
    });
    
    // Scroll to results section after calculation
    setTimeout(() => {
      const resultsElement = document.getElementById('cost-breakdown-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  // Save current analysis to local storage
  const saveAnalysis = () => {
    if (!saveName.trim()) {
      alert("Please enter a name for this analysis");
      return;
    }
    
    if (!formData || !results) {
      alert("Please calculate a cost breakdown first");
      return;
    }
    
    const newAnalysis: SavedAnalysis = {
      id: Date.now().toString(),
      name: saveName,
      date: new Date().toISOString(),
      formData: formData,
      results: results
    };
    
    const updatedSavedAnalyses = [...savedAnalyses, newAnalysis];
    setSavedAnalyses(updatedSavedAnalyses);
    localStorage.setItem('savedCostAnalyses', JSON.stringify(updatedSavedAnalyses));
    
    setSaveName("");
    alert("Analysis saved successfully!");
  };
  
  // Handle the modify action to reuse the most recent analysis
  const handleModify = () => {
    if (!formData) {
      alert("No analysis available to modify");
      return;
    }
    
    // Store the original analysis for comparison
    setLastAnalysis(formData);
    setIsModifying(true);
    setShowResults(false);
    
    // Scroll to form section
    setTimeout(() => {
      const formElement = document.getElementById('product-info-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  // Function to modify a saved analysis
  const modifyAnalysis = (analysis: SavedAnalysis) => {
    // Set form data and update the form with the analysis data
    setFormData(analysis.formData);
    form.reset(analysis.formData);
    
    // Set modification state
    setIsModifying(true);
    setCurrentAnalysisId(analysis.id);
    setModificationInfo({
      originalName: analysis.name,
      date: analysis.date
    });
    
    // Hide results to focus on the form
    setShowResults(false);
    
    // Store the original analysis for comparison
    setLastAnalysis(analysis.formData);
    
    // Show success toast
    toast({
      title: "Modifying Analysis",
      description: `You are now modifying "${analysis.name}". Make your changes and click "Recalculate".`,
      variant: "default"
    });
    
    // Scroll to form section
    setTimeout(() => {
      const formElement = document.getElementById('product-info-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  // Load a saved analysis with complete data reload functionality
  const loadAnalysis = (analysis: SavedAnalysis) => {
    // Step 1: Set application state for the form and results
    setFormData(analysis.formData);
    setResults(analysis.results);
    setShowResults(true);
    setCurrentAnalysisId(analysis.id);
    
    // Step 2: Reset form with loaded values to populate all input fields
    form.reset(analysis.formData);
    
    // Step 3: Update the central analysis context to synchronize all dashboards
    if (analysis.results) {
      // Create a comprehensive analysis object with all required data
      const completeAnalysis = {
        id: analysis.id,
        totalCost: analysis.results.totalCost,
        components: analysis.results.components,
        currency: analysis.results.currency || 'USD',
        exchangeRatesDate: analysis.results.exchangeRatesDate || new Date(),
        disclaimer: analysis.results.disclaimer,
        breakdown: analysis.results.breakdown,
        productDetails: {
          description: analysis.formData.productDescription,
          hsCode: analysis.formData.hsCode,
          category: analysis.formData.productCategory,
          originCountry: analysis.formData.originCountry,
          destinationCountry: analysis.formData.destinationCountry,
          productValue: analysis.formData.productValue,
          weight: analysis.formData.weight,
          transportMode: analysis.formData.transportMode,
          quantity: analysis.formData.quantity,
          dimensions: {
            length: analysis.formData.length,
            width: analysis.formData.width,
            height: analysis.formData.height
          }
        },
        shippingDetails: {
          transportMode: analysis.formData.transportMode,
          weight: analysis.formData.weight,
          dimensions: {
            length: analysis.formData.length,
            width: analysis.formData.width,
            height: analysis.formData.height
          },
          quantity: analysis.formData.quantity,
          packageType: analysis.formData.packageType,
          shipmentType: analysis.formData.shipmentType
        },
        timestamp: new Date(),
        loadedFrom: {
          savedAnalysisId: analysis.id,
          name: analysis.name,
          savedOn: new Date(analysis.date)
        }
      };
      
      // Set the complete analysis in the global context
      setCurrentAnalysis(completeAnalysis);
    }
    
    // Step 4: Show success message
    toast({
      title: "Analysis Loaded",
      description: `${analysis.name || 'Analysis'} has been loaded successfully with all data`,
      variant: "default"
    });
    
    // Step 5: Scroll to results section for better UX
    setTimeout(() => {
      const resultsElement = document.getElementById('cost-breakdown-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  // Delete a saved analysis
  const deleteAnalysis = (id: string) => {
    const updatedSavedAnalyses = savedAnalyses.filter(analysis => analysis.id !== id);
    setSavedAnalyses(updatedSavedAnalyses);
    localStorage.setItem('savedCostAnalyses', JSON.stringify(updatedSavedAnalyses));
    alert("Analysis deleted!");
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
            <CardTitle className="text-lg font-medium text-neutral-900 flex items-center">
              {isModifying && modificationInfo ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Modifying Analysis: {modificationInfo.originalName}
                </>
              ) : (
                "Information Form"
              )}
            </CardTitle>
            <p className="text-sm text-neutral-500 mt-1">
              {isModifying && modificationInfo 
                ? `Created on ${new Date(modificationInfo.date).toLocaleDateString()} - Make your changes and click Recalculate`
                : "Enter product and shipping details to calculate your trade costs"
              }
            </p>
            {isModifying && (
              <div className="mt-2">
                <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Modification Mode
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-5">
            <ProductInformationForm 
              onCalculate={handleCalculate}
              isModified={isModifying}
              lastAnalysis={lastAnalysis}
              onReset={() => {
                setIsModifying(false);
                setLastAnalysis(null);
              }}
            />
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
                      <span className="text-sm text-neutral-600">Other Fees:</span>
                      <span className="text-sm font-medium">$3,210</span>
                    </div>
                    <div className="flex justify-between pt-2 mt-2 border-t border-neutral-200">
                      <span className="text-sm font-medium text-neutral-700">Total:</span>
                      <span className="text-sm font-bold text-primary">$38,222</span>
                    </div>
                    
                    {/* Quick Modify Button in Results Section */}
                    {!isModifying && (
                      <div className="flex justify-center mt-4">
                        <Button 
                          onClick={handleModify}
                          variant="outline" 
                          className="w-full text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Modify Values
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Save Analysis Card */}
              <Card className="bg-white shadow-sm border border-neutral-200">
                <CardHeader className="px-4 py-3 border-b border-neutral-200">
                  <CardTitle className="text-md font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z" />
                      <path d="M8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" />
                    </svg>
                    Save Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <p className="text-sm text-neutral-600">Save this breakdown to reference later or share with your team</p>
                    <Input
                      placeholder="Analysis name"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                    />
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700" 
                      onClick={saveAnalysis}
                    >
                      Save Breakdown
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Modify Analysis Card */}
              <Card className="bg-white shadow-sm border border-neutral-200">
                <CardHeader className="px-4 py-3 border-b border-neutral-200">
                  <CardTitle className="text-md font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Modify Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <p className="text-sm text-neutral-600">Modify this analysis to test different scenarios without re-entering all information</p>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center" 
                      onClick={handleModify}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Modify Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border border-neutral-200">
                <CardHeader className="px-4 py-3 border-b border-neutral-200">
                  <CardTitle className="text-md font-medium">Optimization Tips</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                      <h4 className="text-sm font-medium text-blue-800">Duty Savings Opportunity</h4>
                      <p className="text-xs text-blue-700 mt-1">Use the Canada-US-Mexico Agreement to potentially save $560 in duties.</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-md border border-green-100">
                      <h4 className="text-sm font-medium text-green-800">Shipping Cost Reduction</h4>
                      <p className="text-xs text-green-700 mt-1">Consider FCL instead of LCL to reduce per-unit shipping costs by up to 22%.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {/* Saved Analyses Section */}
        {savedAnalyses.length > 0 && (
          <div className="mt-4">
            <Card className="bg-white shadow-sm border border-neutral-200">
              <CardHeader className="border-b border-neutral-200 px-5 py-4">
                <CardTitle className="text-lg font-medium text-neutral-900 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  Saved Analyses
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 py-4">
                <div className="space-y-4">
                  {savedAnalyses.map((analysis) => (
                    <div key={analysis.id} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium">{analysis.name}</h3>
                          <div className="flex flex-wrap gap-x-4 text-sm text-gray-500 mt-1">
                            <span>{new Date(analysis.date).toLocaleDateString()}</span>
                            <span>{analysis.formData.productDescription}</span>
                            <span>{analysis.formData.originCountry} → {analysis.formData.destinationCountry}</span>
                          </div>
                          <div className="mt-2 text-sm">
                            <span className="font-medium">HS Code: </span>
                            {analysis.formData.hsCode}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex flex-col gap-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => loadAnalysis(analysis)}
                              className="text-blue-600 border-blue-600"
                            >
                              Load
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => modifyAnalysis(analysis)}
                              className="text-green-600 border-green-600"
                            >
                              Modify
                            </Button>
                          </div>

                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deleteAnalysis(analysis.id)}
                            className="text-red-600 border-red-600"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* AI Copilot */}
        <div className="fixed bottom-6 right-6">
          <CopilotAssistant 
            productDetails={productDetailsForCopilot}
            shipmentDetails={shipmentDetailsForCopilot}
            costComponents={costComponentsForCopilot}
          />
        </div>
      </div>
    </>
  );
};

export default CostBreakdownDashboard;