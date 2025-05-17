import { useState, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LanguageContext } from "@/contexts/LanguageContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import HSCodeAssistant from "@/components/ai/HSCodeAssistant";
import CopilotAssistant from "@/components/ai/CopilotAssistant";
import { 
  FaDownload, 
  FaBox, 
  FaShip, 
  FaFileInvoice, 
  FaPercent, 
  FaPlus, 
  FaSave, 
  FaTrash, 
  FaListAlt, 
  FaHistory 
} from "react-icons/fa";
import { FaCircleInfo, FaMagnifyingGlass } from "react-icons/fa6";

// Form validation schema
const formSchema = z.object({
  // Product Details
  description: z.string().min(3, "Product description must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  hsCode: z.string().min(4, "HS Code must be at least 4 characters"),
  originCountry: z.string().min(2, "Origin country is required"),
  destinationCountry: z.string().min(2, "Destination country is required"),
  value: z.number().min(0.01, "Value must be greater than 0"),
  
  // Shipping Details
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  transportMode: z.string().min(1, "Transport mode is required"),
  shipmentType: z.string().min(1, "Shipment type is required"),
  packageType: z.string().min(1, "Package type is required"),
  weight: z.number().min(0.01, "Weight must be greater than 0"),
  
  // Dimensions
  length: z.number().min(0.01, "Length must be greater than 0"),
  width: z.number().min(0.01, "Width must be greater than 0"),
  height: z.number().min(0.01, "Height must be greater than 0"),
  dimensionUnit: z.string().default("cm")
});

// Sample country options - in a real app, this would come from an API
const countryOptions = [
  { value: "US", label: "United States" },
  { value: "CN", label: "China" },
  { value: "IN", label: "India" },
  { value: "UK", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IT", label: "Italy" },
  { value: "CA", label: "Canada" },
  { value: "JP", label: "Japan" },
  { value: "AU", label: "Australia" },
  { value: "BR", label: "Brazil" },
  { value: "MX", label: "Mexico" },
  { value: "KR", label: "South Korea" },
  { value: "RU", label: "Russia" },
  { value: "ES", label: "Spain" },
  { value: "NL", label: "Netherlands" },
  { value: "SG", label: "Singapore" },
  { value: "VN", label: "Vietnam" },
  { value: "MY", label: "Malaysia" },
  { value: "TH", label: "Thailand" }
];

// Product categories
const productCategories = [
  { value: "Electronics", label: "Electronics" },
  { value: "Textiles & Apparel", label: "Textiles & Apparel" },
  { value: "Chemicals", label: "Chemicals" },
  { value: "Machinery", label: "Machinery" },
  { value: "Food & Beverages", label: "Food & Beverages" },
  { value: "Pharmaceuticals", label: "Pharmaceuticals" },
  { value: "Automotive", label: "Automotive" },
  { value: "Furniture", label: "Furniture" },
  { value: "Toys & Games", label: "Toys & Games" }
];

// Transport mode options
const transportModes = [
  { value: "Air Freight", label: "Air Freight" },
  { value: "Sea Freight", label: "Sea Freight" },
  { value: "Rail Freight", label: "Rail Freight" },
  { value: "Road Transport", label: "Road Transport" }
];

// Shipment types
const shipmentTypes = [
  { value: "LCL", label: "Less than Container Load (LCL)" },
  { value: "FCL", label: "Full Container Load (FCL)" },
  { value: "Express", label: "Express" },
  { value: "Bulk", label: "Bulk" }
];

// Package types
const packageTypes = [
  { value: "Cardboard Box", label: "Cardboard Box" },
  { value: "Wooden Crate", label: "Wooden Crate" },
  { value: "Pallet", label: "Pallet" },
  { value: "Drum", label: "Drum" },
  { value: "Bag", label: "Bag" }
];

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

// Get color for each category
const getCategoryColor = (category: string) => {
  const categoryColors = {
    'product': '#0088FE',
    'duty': '#FFBB28',
    'tax': '#FF8042',
    'shipping': '#00C49F',
    'other': '#8884d8'
  };
  
  return categoryColors[category] || '#82ca9d';
};

// Type for saved analysis
interface SavedAnalysis {
  id: string;
  name: string;
  date: string;
  productDetails: {
    description: string;
    category: string;
    hsCode: string;
    originCountry: string;
    destinationCountry: string;
    value: number;
  };
  shippingDetails: {
    quantity: number;
    transportMode: string;
    shipmentType: string;
    packageType: string;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
      unit: string;
    }
  };
  results: any;
}

const CostBreakdownCalculator = () => {
  const { t } = useContext(LanguageContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [results, setResults] = useState(null);
  const [selectedTab, setSelectedTab] = useState("product");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [saveName, setSaveName] = useState("");

  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      category: "",
      hsCode: "",
      originCountry: "",
      destinationCountry: "",
      value: 0,
      quantity: 1,
      transportMode: "",
      shipmentType: "",
      packageType: "",
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      dimensionUnit: "cm"
    }
  });

  // Format currency with proper symbols
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Mutation for cost calculation
  const calculateCostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      // Transform form data to required API format
      const payload = {
        productDetails: {
          description: data.description,
          category: data.category,
          hsCode: data.hsCode,
          originCountry: data.originCountry,
          destinationCountry: data.destinationCountry,
          value: data.value
        },
        shippingDetails: {
          quantity: data.quantity,
          transportMode: data.transportMode,
          shipmentType: data.shipmentType,
          packageType: data.packageType,
          weight: data.weight,
          dimensions: {
            length: data.length,
            width: data.width,
            height: data.height,
            unit: data.dimensionUnit
          }
        }
      };
      
      return apiRequest('POST', '/api/cost-breakdown/calculate', payload);
    },
    onSuccess: (response) => {
      setResults(response);
      toast({
        title: "Calculation Complete",
        description: "Your cost breakdown has been calculated successfully.",
      });
    },
    onError: (error) => {
      console.error("Calculation error:", error);
      toast({
        title: "Calculation Failed",
        description: "Unable to calculate cost breakdown. Please check your inputs and try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  // Load saved analyses on component mount
  useEffect(() => {
    const savedAnalysesFromStorage = localStorage.getItem('savedCostAnalyses');
    if (savedAnalysesFromStorage) {
      setSavedAnalyses(JSON.parse(savedAnalysesFromStorage));
    }
  }, []);

  // Save current analysis
  const saveAnalysis = () => {
    if (!results) {
      toast({
        title: "No Analysis to Save",
        description: "Please calculate a cost breakdown first",
        variant: "destructive"
      });
      return;
    }

    if (!saveName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for this analysis",
        variant: "destructive"
      });
      return;
    }

    const formValues = form.getValues();
    
    const newAnalysis: SavedAnalysis = {
      id: Date.now().toString(),
      name: saveName,
      date: new Date().toISOString(),
      productDetails: {
        description: formValues.description,
        category: formValues.category,
        hsCode: formValues.hsCode,
        originCountry: formValues.originCountry,
        destinationCountry: formValues.destinationCountry,
        value: formValues.value
      },
      shippingDetails: {
        quantity: formValues.quantity,
        transportMode: formValues.transportMode,
        shipmentType: formValues.shipmentType,
        packageType: formValues.packageType,
        weight: formValues.weight,
        dimensions: {
          length: formValues.length,
          width: formValues.width,
          height: formValues.height,
          unit: formValues.dimensionUnit
        }
      },
      results: results
    };
    
    const updatedSavedAnalyses = [...savedAnalyses, newAnalysis];
    setSavedAnalyses(updatedSavedAnalyses);
    localStorage.setItem('savedCostAnalyses', JSON.stringify(updatedSavedAnalyses));
    
    setSaveName("");
    
    toast({
      title: "Analysis Saved",
      description: "Your cost breakdown has been saved successfully"
    });
  };

  // Load a saved analysis
  const loadAnalysis = (analysis: SavedAnalysis) => {
    // Fill form with saved analysis data
    form.reset({
      description: analysis.productDetails.description,
      category: analysis.productDetails.category,
      hsCode: analysis.productDetails.hsCode,
      originCountry: analysis.productDetails.originCountry,
      destinationCountry: analysis.productDetails.destinationCountry,
      value: analysis.productDetails.value,
      quantity: analysis.shippingDetails.quantity,
      transportMode: analysis.shippingDetails.transportMode,
      shipmentType: analysis.shippingDetails.shipmentType,
      packageType: analysis.shippingDetails.packageType,
      weight: analysis.shippingDetails.weight,
      length: analysis.shippingDetails.dimensions.length,
      width: analysis.shippingDetails.dimensions.width,
      height: analysis.shippingDetails.dimensions.height,
      dimensionUnit: analysis.shippingDetails.dimensions.unit
    });
    
    // Set results
    setResults(analysis.results);
    
    toast({
      title: "Analysis Loaded",
      description: `${analysis.name} has been loaded successfully`
    });
  };

  // Delete a saved analysis
  const deleteAnalysis = (id: string) => {
    const updatedSavedAnalyses = savedAnalyses.filter(analysis => analysis.id !== id);
    setSavedAnalyses(updatedSavedAnalyses);
    localStorage.setItem('savedCostAnalyses', JSON.stringify(updatedSavedAnalyses));
    
    toast({
      title: "Analysis Deleted",
      description: "The selected analysis has been deleted"
    });
  };

  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    calculateCostMutation.mutate(values);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title={t("dashboard.costBreakdown.calculator.title") || "Cost Breakdown Calculator"}
        description={t("dashboard.costBreakdown.calculator.description") || "Calculate detailed cost breakdowns for your international shipments."}
        actions={[
          {
            label: t("common.export") || "Export",
            icon: <FaDownload />,
            onClick: () => console.log("Export cost breakdown"),
            variant: "outline",
            disabled: !results
          }
        ]}
      />

      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Enter Shipment Details</CardTitle>
            <CardDescription>
              Fill in the product and shipping information to get a detailed cost breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="product">Product Information</TabsTrigger>
                    <TabsTrigger value="shipping">Shipping Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="product" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Product Description */}
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Product Category */}
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Category</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select product category" />
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
                    </div>
                    
                    {/* HS Code with Assistant */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="hsCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              HS Code
                              <HSCodeAssistant 
                                category={form.getValues("category")}
                                description={form.getValues("description")}
                                onSelect={(code) => form.setValue("hsCode", code)}
                              />
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 6109.10" {...field} />
                            </FormControl>
                            <FormDescription>
                              Harmonized System code for your product
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Product Value */}
                      <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Value (USD)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Enter product value" 
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Origin & Destination Countries */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                {countryOptions.map((country) => (
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
                                {countryOptions.map((country) => (
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
                    </div>
                    
                    <Button
                      type="button" 
                      variant="outline"
                      onClick={() => setSelectedTab("shipping")}
                      className="mt-4"
                    >
                      Next: Shipping Details
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="shipping" className="space-y-6">
                    {/* Quantity and Transport Mode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Enter quantity" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
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
                    </div>
                    
                    {/* Shipment Type and Package Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    
                    {/* Weight and Dimensions */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Enter weight in kg" 
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div>
                        <h4 className="mb-2 font-medium">Dimensions</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <FormField
                            control={form.control}
                            name="length"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Length</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Length" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
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
                                <FormLabel>Width</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Width" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
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
                                <FormLabel>Height</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Height" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="dimensionUnit"
                          render={({ field }) => (
                            <FormItem className="mt-2">
                              <FormLabel>Dimension Unit</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="cm">Centimeters (cm)</SelectItem>
                                  <SelectItem value="in">Inches (in)</SelectItem>
                                  <SelectItem value="m">Meters (m)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-4">
                      <Button
                        type="button" 
                        variant="outline"
                        onClick={() => setSelectedTab("product")}
                      >
                        Back: Product Information
                      </Button>
                      
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Calculating..." : "Calculate Costs"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {results && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown Results</CardTitle>
                <CardDescription>
                  Detailed breakdown of all costs associated with your shipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Cost Card */}
                  <Card className="bg-primary/10 border-primary/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md font-medium">Total Landed Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{formatCurrency(results.totalCost)}</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        All costs included
                      </p>
                    </CardContent>
                  </Card>
                  
                  {/* Duty & Tax Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md font-medium">Duty & Tax</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-semibold">
                        {formatCurrency(
                          results.components
                            .filter(c => c.category === 'duty' || c.category === 'tax')
                            .reduce((sum, c) => sum + c.value, 0)
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {results.components
                          .filter(c => c.category === 'duty' || c.category === 'tax')
                          .map(c => c.name)
                          .join(', ')}
                      </p>
                    </CardContent>
                  </Card>
                  
                  {/* Shipping Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md font-medium">Shipping & Handling</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-semibold">
                        {formatCurrency(
                          results.components
                            .filter(c => c.category === 'shipping' || c.category === 'other')
                            .reduce((sum, c) => sum + c.value, 0)
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {results.transportMode}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cost Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={results.components}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                          >
                            {results.components.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  {/* Bar Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cost Components</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={results.components}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Bar dataKey="value" nameKey="name">
                            {results.components.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Detailed Cost Breakdown Table */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Detailed Cost Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-4 py-2 text-left">Cost Component</th>
                          <th className="px-4 py-2 text-right">Amount</th>
                          <th className="px-4 py-2 text-right">Percentage</th>
                          <th className="px-4 py-2 text-left hidden md:table-cell">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.components.map((component, index) => (
                          <tr 
                            key={index} 
                            className={index % 2 === 0 ? "" : "bg-muted/50"}
                          >
                            <td className="px-4 py-2 border-t">{component.name}</td>
                            <td className="px-4 py-2 text-right border-t">
                              {formatCurrency(component.value)}
                            </td>
                            <td className="px-4 py-2 text-right border-t">
                              {formatPercentage(component.percentage)}
                            </td>
                            <td className="px-4 py-2 text-sm text-muted-foreground border-t hidden md:table-cell">
                              {component.description || ''}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-primary/10 font-semibold">
                          <td className="px-4 py-2 border-t">Total Landed Cost</td>
                          <td className="px-4 py-2 text-right border-t">
                            {formatCurrency(results.totalCost)}
                          </td>
                          <td className="px-4 py-2 text-right border-t">100%</td>
                          <td className="px-4 py-2 text-sm border-t hidden md:table-cell">
                            Total cost including all fees and taxes
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col border-t pt-6 gap-4">
                <div className="flex flex-wrap justify-between w-full gap-2">
                  <Button variant="outline" onClick={() => setResults(null)}>
                    Start New Calculation
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      onClick={saveAnalysis}
                    >
                      <FaSave className="mr-2" /> Save Analysis
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => console.log("Export cost breakdown")}
                    >
                      <FaDownload className="mr-2" /> Export
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 w-full items-center">
                  <Input 
                    placeholder="Enter a name for this analysis" 
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="flex-grow"
                  />
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
        
        {/* Saved Analyses */}
        {savedAnalyses.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaHistory className="mr-2" />
                  Saved Analyses
                </CardTitle>
                <CardDescription>
                  Your previously saved cost breakdown analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedAnalyses.map((analysis) => (
                    <div key={analysis.id} className="bg-card/50 p-4 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{analysis.name}</h3>
                          <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground mt-1">
                            <span>{new Date(analysis.date).toLocaleDateString()}</span>
                            <span>{analysis.productDetails.description}</span>
                            <span>{analysis.productDetails.originCountry} → {analysis.productDetails.destinationCountry}</span>
                            <span>HS: {analysis.productDetails.hsCode}</span>
                          </div>
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Total Cost: </span>
                            {formatCurrency(analysis.results.totalCost)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => loadAnalysis(analysis)}
                          >
                            Load
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deleteAnalysis(analysis.id)}
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <FaTrash size={14} />
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
        <CopilotAssistant context={{ 
          page: 'cost-breakdown-calculator',
          productCategory: form.getValues('category'),
          hsCode: form.getValues('hsCode'),
          originCountry: form.getValues('originCountry'),
          destinationCountry: form.getValues('destinationCountry')
        }} />
      </div>
    </div>
  );
};

export default CostBreakdownCalculator;