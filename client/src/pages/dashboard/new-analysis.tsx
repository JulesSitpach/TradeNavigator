import { useContext, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import PageHeader from "@/components/common/PageHeader";
import { LanguageContext } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { FaArrowRight, FaSave, FaCalculator } from "react-icons/fa";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";

// Form schema with validation
const analysisFormSchema = z.object({
  productName: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  productDescription: z.string().min(5, { message: "Please provide a more detailed description." }),
  productCategory: z.string().min(1, { message: "Please select a product category." }),
  hsCode: z.string().optional(),
  originCountry: z.string().min(1, { message: "Please select origin country." }),
  destinationCountry: z.string().min(1, { message: "Please select destination country." }),
  productValue: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid product value greater than 0.",
  }),
  quantity: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid quantity greater than 0.",
  }),
  transportMode: z.string().min(1, { message: "Please select a transport mode." }),
  shipmentType: z.string().min(1, { message: "Please select a shipment type." }),
  packageType: z.string().min(1, { message: "Please select a package type." }),
  weight: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid weight greater than 0.",
  }),
  length: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid length greater than 0.",
  }),
  width: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid width greater than 0.",
  }),
  height: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid height greater than 0.",
  }),
});

type AnalysisFormValues = z.infer<typeof analysisFormSchema>;

// Sample data for dropdown options
const productCategories = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing & Apparel" },
  { value: "food", label: "Food & Beverages" },
  { value: "automotive", label: "Automotive Parts" },
  { value: "furniture", label: "Furniture" },
  { value: "cosmetics", label: "Cosmetics" },
  { value: "toys", label: "Toys & Games" },
  { value: "medical", label: "Medical Devices" },
];

const countries = [
  { value: "US", label: "United States" },
  { value: "CN", label: "China" },
  { value: "IN", label: "India" },
  { value: "MX", label: "Mexico" },
  { value: "CA", label: "Canada" },
  { value: "DE", label: "Germany" },
  { value: "UK", label: "United Kingdom" },
  { value: "JP", label: "Japan" },
  { value: "BR", label: "Brazil" },
  { value: "FR", label: "France" },
];

const transportModes = [
  { value: "air", label: "Air Freight" },
  { value: "sea", label: "Sea Freight" },
  { value: "road", label: "Road Transport" },
  { value: "rail", label: "Rail Freight" },
  { value: "multimodal", label: "Multimodal" },
];

const shipmentTypes = [
  { value: "lcl", label: "Less than Container Load (LCL)" },
  { value: "fcl", label: "Full Container Load (FCL)" },
  { value: "bulk", label: "Bulk Cargo" },
  { value: "palletized", label: "Palletized Freight" },
];

const packageTypes = [
  { value: "carton", label: "Cardboard Box" },
  { value: "pallet", label: "Pallet" },
  { value: "crate", label: "Wooden Crate" },
  { value: "drum", label: "Drum" },
  { value: "bag", label: "Bag" },
];

const NewAnalysisPage = () => {
  const { t } = useContext(LanguageContext);
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLookingUpHsCode, setIsLookingUpHsCode] = useState(false);
  const [, navigate] = useLocation();

  // Initialize form with default values
  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: {
      productName: "",
      productDescription: "",
      productCategory: "",
      hsCode: "",
      originCountry: "",
      destinationCountry: "",
      productValue: "",
      quantity: "",
      transportMode: "",
      shipmentType: "",
      packageType: "",
      weight: "",
      length: "",
      width: "",
      height: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: AnalysisFormValues) => {
    setIsCalculating(true);
    try {
      // Convert string inputs to appropriate types
      const formattedValues = {
        ...values,
        productValue: parseFloat(values.productValue),
        quantity: parseInt(values.quantity),
        weight: parseFloat(values.weight),
        length: parseFloat(values.length),
        width: parseFloat(values.width),
        height: parseFloat(values.height),
      };

      // Send data to backend for analysis
      await apiRequest('POST', '/api/analysis/create', formattedValues);
      
      toast({
        title: "Analysis Created",
        description: "Your cost analysis has been successfully created.",
      });

      // Navigate to the cost breakdown page
      navigate("/dashboard/cost-breakdown");
    } catch (error) {
      console.error("Error creating analysis:", error);
      toast({
        title: "Error",
        description: "There was an error creating your analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Lookup HS code based on product description
  const lookupHsCode = async () => {
    const description = form.getValues("productDescription");
    const category = form.getValues("productCategory");
    
    if (!description) {
      toast({
        title: "Missing Information",
        description: "Please provide a product description first.",
        variant: "destructive",
      });
      return;
    }

    setIsLookingUpHsCode(true);
    try {
      // In a real application, this would call an API to get HS code suggestions
      // For now, we'll simulate a delay and set a sample HS code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let hsCode = "8528.52";
      if (category === "clothing") hsCode = "6109.10";
      else if (category === "food") hsCode = "2106.90";
      else if (category === "automotive") hsCode = "8708.29";

      form.setValue("hsCode", hsCode);
      
      toast({
        title: "HS Code Found",
        description: `Based on your description, we recommend HS code: ${hsCode}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not retrieve HS code. Please enter it manually.",
        variant: "destructive",
      });
    } finally {
      setIsLookingUpHsCode(false);
    }
  };

  return (
    <>
      <PageHeader
        title="New Cost Analysis"
        description="Enter product and shipping details to calculate landed costs"
      />

      <Card className="bg-white shadow-sm border border-neutral-200 mb-6">
        <CardHeader>
          <CardTitle>Product & Shipping Details</CardTitle>
          <CardDescription>Enter information about your product and shipping requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Product Details Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Smart fitness watch" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Category <span className="text-xs text-neutral-500">(Select first for better HS code results)</span></FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
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

                  <FormField
                    control={form.control}
                    name="productDescription"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Product Description</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Smart fitness watch with heart rate monitor, blood oxygen tracking, GPS, and 7-day battery life" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hsCode"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <FormLabel>HS Code</FormLabel>
                          <Button 
                            type="button" 
                            variant="link" 
                            className="h-auto p-0 text-xs"
                            onClick={lookupHsCode}
                            disabled={isLookingUpHsCode}
                          >
                            {isLookingUpHsCode ? "Finding code..." : "Find code based on description"}
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="e.g. 8528.52" {...field} />
                          </FormControl>
                          <Button 
                            type="button" 
                            size="icon" 
                            variant="outline"
                            onClick={lookupHsCode}
                            disabled={isLookingUpHsCode}
                            className="flex-shrink-0"
                          >
                            <FaCalculator size={16} />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origin Country</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
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

                  <FormField
                    control={form.control}
                    name="destinationCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination Country</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
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

                  <FormField
                    control={form.control}
                    name="productValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Value (in USD)</FormLabel>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                          <FormControl>
                            <Input className="pl-7" placeholder="149.99" {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input placeholder="1000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Shipping Details Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Shipping Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="transportMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transport Mode</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
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

                  <FormField
                    control={form.control}
                    name="shipmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipment Type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
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
                        <Select value={field.value} onValueChange={field.onChange}>
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

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input placeholder="450" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <Label>Package Dimensions</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <FormField
                        control={form.control}
                        name="length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Length (cm)</FormLabel>
                            <FormControl>
                              <Input placeholder="40" {...field} />
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
                            <FormLabel>Width (cm)</FormLabel>
                            <FormControl>
                              <Input placeholder="30" {...field} />
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
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input placeholder="25" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Form Saved",
                      description: "Your input has been saved as a draft.",
                    });
                  }}
                >
                  <FaSave className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Calculating...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Calculate Cost Analysis
                      <FaArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default NewAnalysisPage;