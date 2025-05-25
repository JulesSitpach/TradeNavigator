import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Package, Truck, Calculator, Lightbulb } from "lucide-react";
import type { CalculationResult } from "@/pages/home";
import { useMasterTranslation } from "@/utils/masterTranslation";
import { countriesByRegion } from "@/lib/countries";

const formSchema = z.object({
  productCategory: z.string().min(1, "Product category is required"),
  productName: z.string().min(1, "Product name is required"),
  productDescription: z.string().min(1, "Product description is required"),
  hsCode: z.string().optional(),
  quantity: z.string().min(1, "Quantity is required"),
  unitValue: z.string().min(1, "Unit value is required"),
  weight: z.string().optional(),
  originCountry: z.string().min(1, "Origin country is required"),
  destinationCountry: z.string().min(1, "Destination country is required"),
  shippingMethod: z.string().min(1, "Shipping method is required"),
  incoterms: z.string().min(1, "Incoterms are required"),
  insurance: z.string().default("yes"),
  urgency: z.string().default("standard"),
  customsHandling: z.string().default("broker"),
  tradeAgreement: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface HSSuggestion {
  code: string;
  description: string;
  confidence: number;
}

interface Props {
  onCalculationResult: (result: CalculationResult) => void;
  isCalculating: boolean;
  setIsCalculating: (calculating: boolean) => void;
}

export function CostAnalysisForm({ onCalculationResult, isCalculating, setIsCalculating }: Props) {
  const [hsCodeSuggestions, setHsCodeSuggestions] = useState<HSSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const { toast } = useToast();
  const { t } = useMasterTranslation();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      insurance: "yes",
      urgency: "standard",
      customsHandling: "broker",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsCalculating(true);
      
      const response = await apiRequest("POST", "/api/cost-analysis", {
        ...data,
        insurance: data.insurance === "yes",
      });
      
      const result = await response.json();
      onCalculationResult(result);
      
      toast({
        title: "Cost calculation completed",
        description: "Your import cost analysis is ready!",
      });
    } catch (error) {
      console.error("Error calculating costs:", error);
      toast({
        title: "Calculation failed",
        description: "Failed to calculate import costs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const getAISuggestions = async () => {
    const productName = form.getValues("productName");
    const productDescription = form.getValues("productDescription");
    const productCategory = form.getValues("productCategory");

    if (!productName || !productDescription) {
      toast({
        title: "Missing information",
        description: "Please enter product name and description to get AI suggestions",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoadingAI(true);
      
      const response = await fetch("/api/hs-code-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName,
          productDescription,
          productCategory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI suggestions");
      }

      const suggestions = await response.json();
      setHsCodeSuggestions(suggestions);
      setShowSuggestions(true);
      
      toast({
        title: "AI suggestions ready",
        description: `Found ${suggestions.length} HS code suggestions`,
      });
    } catch (error) {
      console.error("Error getting HS code suggestions:", error);
      toast({
        title: "AI suggestions failed",
        description: "Failed to get AI suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const selectHSCode = (code: string) => {
    form.setValue("hsCode", code);
    setShowSuggestions(false);
    toast({
      title: "HS code selected",
      description: `Selected HS code: ${code}`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Information Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Package className="text-primary mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Product Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                        <SelectContent className="bg-white">
                          <SelectItem value="electronics">{t('productCategories.electronics')}</SelectItem>
                          <SelectItem value="textiles">{t('productCategories.textiles')}</SelectItem>
                          <SelectItem value="machinery">{t('productCategories.machinery')}</SelectItem>
                          <SelectItem value="food">{t('productCategories.food')}</SelectItem>
                          <SelectItem value="chemicals">{t('productCategories.chemicals')}</SelectItem>
                          <SelectItem value="automotive">{t('productCategories.automotive')}</SelectItem>
                          <SelectItem value="home">{t('productCategories.home')}</SelectItem>
                          <SelectItem value="sports">{t('productCategories.sports')}</SelectItem>
                          <SelectItem value="medical">{t('productCategories.medical')}</SelectItem>
                          <SelectItem value="raw">{t('productCategories.raw')}</SelectItem>
                          <SelectItem value="other">{t('productCategories.other')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Wireless Bluetooth Headphones" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="productDescription"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Product Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3}
                      placeholder="Detailed description including materials, features, and specifications..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4 flex items-end gap-4">
              <FormField
                control={form.control}
                name="hsCode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>HS Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 8518.30.20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                onClick={getAISuggestions}
                disabled={loadingAI}
                className="bg-accent hover:bg-green-600 text-white"
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                {loadingAI ? "Getting AI Suggestions..." : "Get AI HS Code Suggestions"}
              </Button>
            </div>

            {/* AI Suggestions Panel */}
            {showSuggestions && hsCodeSuggestions.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start">
                  <Lightbulb className="text-blue-500 mt-1 mr-3" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      AI-Powered HS Code Suggestions
                    </h4>
                    <div className="space-y-2">
                      {hsCodeSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-white rounded border border-blue-200 hover:border-blue-300 cursor-pointer"
                          onClick={() => selectHSCode(suggestion.code)}
                        >
                          <div>
                            <span className="font-mono text-sm font-medium text-gray-900">
                              {suggestion.code}
                            </span>
                            <p className="text-xs text-gray-600 mt-1">
                              {suggestion.description}
                            </p>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {suggestion.confidence}% match
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipment Details Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Package className="text-primary mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Shipment Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Value (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="25.00" {...field} />
                    </FormControl>
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
                      <Input type="number" step="0.1" placeholder="2.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="originCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white max-h-80">
                        {/* North America */}
                        <SelectItem value="" disabled className="font-semibold text-blue-600">
                          {t('regions.northAmerica')}
                        </SelectItem>
                        {countriesByRegion.northAmerica.map(code => (
                          <SelectItem key={code} value={code}>
                            {t(`countries.${code}`)}
                          </SelectItem>
                        ))}
                        
                        {/* European Union */}
                        <SelectItem value="" disabled className="font-semibold text-blue-600 mt-2">
                          {t('regions.europeanUnion')}
                        </SelectItem>
                        {countriesByRegion.europeanUnion.map(code => (
                          <SelectItem key={code} value={code}>
                            {t(`countries.${code}`)}
                          </SelectItem>
                        ))}
                        
                        {/* Central & South America */}
                        <SelectItem value="" disabled className="font-semibold text-blue-600 mt-2">
                          {t('regions.centralSouthAmerica')}
                        </SelectItem>
                        {countriesByRegion.centralSouthAmerica.map(code => (
                          <SelectItem key={code} value={code}>
                            {t(`countries.${code}`)}
                          </SelectItem>
                        ))}
                        
                        {/* Asia */}
                        <SelectItem value="" disabled className="font-semibold text-blue-600 mt-2">
                          {t('regions.asia')}
                        </SelectItem>
                        {countriesByRegion.asia.map(code => (
                          <SelectItem key={code} value={code}>
                            {t(`countries.${code}`)}
                          </SelectItem>
                        ))}
                        
                        {/* Oceania */}
                        <SelectItem value="" disabled className="font-semibold text-blue-600 mt-2">
                          {t('regions.oceania')}
                        </SelectItem>
                        {countriesByRegion.oceania.map(code => (
                          <SelectItem key={code} value={code}>
                            {t(`countries.${code}`)}
                          </SelectItem>
                        ))}
                        
                        {/* Africa */}
                        <SelectItem value="" disabled className="font-semibold text-blue-600 mt-2">
                          {t('regions.africa')}
                        </SelectItem>
                        {countriesByRegion.africa.map(code => (
                          <SelectItem key={code} value={code}>
                            {t(`countries.${code}`)}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white max-h-80">
                        {/* North America */}
                        <SelectItem value="" disabled className="font-semibold text-blue-600">
                          {t('regions.northAmerica')}
                        </SelectItem>
                        {countriesByRegion.northAmerica.map(code => (
                          <SelectItem key={code} value={code}>
                            {t(`countries.${code}`)}
                          </SelectItem>
                        ))}
                        
                        {/* European Union */}
                        <SelectItem value="" disabled className="font-semibold text-blue-600 mt-2">
                          {t('regions.europeanUnion')}
                        </SelectItem>
                        {countriesByRegion.europeanUnion.map(code => (
                          <SelectItem key={code} value={code}>
                            {t(`countries.${code}`)}
                          </SelectItem>
                        ))}
                        
                        {/* Central & South America */}
                        <SelectItem value="" disabled className="font-semibold text-blue-600 mt-2">
                          {t('regions.centralSouthAmerica')}
                        </SelectItem>
                        {countriesByRegion.centralSouthAmerica.map(code => (
                          <SelectItem key={code} value={code}>
                            {t(`countries.${code}`)}
                          </SelectItem>
                        ))}
                        
                        {/* Asia */}
                        <SelectItem value="" disabled className="font-semibold text-blue-600 mt-2">
                          {t('regions.asia')}
                        </SelectItem>
                        {countriesByRegion.asia.map(code => (
                          <SelectItem key={code} value={code}>
                            {t(`countries.${code}`)}
                          </SelectItem>
                        ))}
                        
                        {/* Oceania */}
                        <SelectItem value="" disabled className="font-semibold text-blue-600 mt-2">
                          {t('regions.oceania')}
                        </SelectItem>
                        {countriesByRegion.oceania.map(code => (
                          <SelectItem key={code} value={code}>
                            {t(`countries.${code}`)}
                          </SelectItem>
                        ))}
                        
                        {/* Africa */}
                        <SelectItem value="" disabled className="font-semibold text-blue-600 mt-2">
                          {t('regions.africa')}
                        </SelectItem>
                        {countriesByRegion.africa.map(code => (
                          <SelectItem key={code} value={code}>
                            {t(`countries.${code}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Shipping & Trade Terms Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Truck className="text-primary mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Shipping & Trade Terms</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shippingMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipping Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select Method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="ocean-standard">🚢 Ocean Freight (Standard)</SelectItem>
                        <SelectItem value="ocean-express">🚢 Ocean Freight (Express)</SelectItem>
                        <SelectItem value="air-standard">✈️ Air Freight (Standard)</SelectItem>
                        <SelectItem value="air-express">✈️ Air Freight (Express)</SelectItem>
                        <SelectItem value="courier">📦 Courier (DHL/FedEx/UPS)</SelectItem>
                        <SelectItem value="road">🚛 Road Transport</SelectItem>
                        <SelectItem value="rail">🚂 Rail Transport</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="incoterms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incoterms</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select Terms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                        <SelectItem value="FOB">FOB - Free on Board</SelectItem>
                        <SelectItem value="CIF">CIF - Cost, Insurance, Freight</SelectItem>
                        <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
                        <SelectItem value="DAP">DAP - Delivered at Place</SelectItem>
                        <SelectItem value="FCA">FCA - Free Carrier</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <FormField
                control={form.control}
                name="insurance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Required</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customsHandling"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customs Handling</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="broker">Use Customs Broker</SelectItem>
                        <SelectItem value="self">Self-Clear</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tradeAgreement"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Trade Agreement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="No Trade Agreement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value="none">No Trade Agreement</SelectItem>
                      <SelectItem value="USMCA">USMCA (US-Mexico-Canada)</SelectItem>
                      <SelectItem value="CPTPP">CPTPP (Trans-Pacific Partnership)</SelectItem>
                      <SelectItem value="EU-FTA">EU Free Trade Agreement</SelectItem>
                      <SelectItem value="ASEAN">ASEAN Trade Agreement</SelectItem>
                      <SelectItem value="GSP">Generalized System of Preferences</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Calculate Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isCalculating}
            className="px-8 py-3 bg-primary text-white hover:bg-secondary text-lg font-medium"
          >
            <Calculator className="mr-2 h-5 w-5" />
            {isCalculating ? "Calculating..." : "Calculate Import Costs"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
