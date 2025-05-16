import { useState } from "react";
import { FaSearch, FaMagnifyingGlassDollar, FaDownload } from "react-icons/fa6";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Validation schema for HS code form
const hsCodeLookupSchema = z.object({
  hsCode: z.string().min(4, "HS code must be at least 4 digits"),
  countryCode: z.string().min(2, "Country is required"),
});

// Validation schema for product description form
const productDescLookupSchema = z.object({
  productDescription: z.string().min(3, "Description must be at least 3 characters long"),
});

type HSCodeLookupFormValues = z.infer<typeof hsCodeLookupSchema>;
type ProductDescLookupFormValues = z.infer<typeof productDescLookupSchema>;

const TariffLookup = () => {
  const { toast } = useToast();
  const [tariffData, setTariffData] = useState<any | null>(null);
  const [hsSuggestions, setHsSuggestions] = useState<any[] | null>(null);
  const [activeTab, setActiveTab] = useState<string>("hsCode");

  // Form for HS code lookup
  const hsForm = useForm<HSCodeLookupFormValues>({
    resolver: zodResolver(hsCodeLookupSchema),
    defaultValues: {
      hsCode: "",
      countryCode: "US",
    },
  });

  // Form for product description lookup
  const descForm = useForm<ProductDescLookupFormValues>({
    resolver: zodResolver(productDescLookupSchema),
    defaultValues: {
      productDescription: "",
    },
  });

  // Tariff lookup mutation
  const tariffLookupMutation = useMutation({
    mutationFn: async ({ hsCode, countryCode }: HSCodeLookupFormValues) => {
      const response = await apiRequest('GET', `/api/tariff?hsCode=${hsCode}&countryCode=${countryCode}`, null);
      return response.json();
    },
    onSuccess: (data) => {
      setTariffData(data);
      toast({
        title: "Tariff data found",
        description: `Found tariff information for HS code ${hsForm.getValues().hsCode}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to find tariff data. Please try again.",
        variant: "destructive",
      });
    },
  });

  // HS code suggestion mutation
  const hsSuggestionMutation = useMutation({
    mutationFn: async ({ productDescription }: ProductDescLookupFormValues) => {
      const response = await apiRequest('POST', `/api/hs-suggestions`, { productDescription });
      return response.json();
    },
    onSuccess: (data) => {
      if (Array.isArray(data)) {
        setHsSuggestions(data);
      } else {
        // Handle single suggestion format (from OpenAI)
        setHsSuggestions([{
          hsCode: data.hsCode,
          description: data.description,
          confidence: data.confidence,
        }]);
      }
      
      toast({
        title: "HS code suggestions found",
        description: "Found possible HS codes for your product",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to get HS code suggestions. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle HS code lookup
  const onHSSubmit = (values: HSCodeLookupFormValues) => {
    tariffLookupMutation.mutate(values);
  };

  // Handle product description lookup
  const onDescSubmit = (values: ProductDescLookupFormValues) => {
    hsSuggestionMutation.mutate(values);
  };

  // Use a suggested HS code
  const useHSCode = (hsCode: string) => {
    hsForm.setValue("hsCode", hsCode);
    setActiveTab("hsCode");
    // Focus on country select
    setTimeout(() => {
      const countrySelect = document.getElementById("countrySelect");
      if (countrySelect) countrySelect.focus();
    }, 100);
  };

  return (
    <>
      <PageHeader
        title="Tariff Lookup"
        description="Find tariff rates and HS codes for your products"
        actions={[
          {
            label: "Export",
            icon: <FaDownload />,
            onClick: () => {
              toast({
                title: "Export initiated",
                description: "Your tariff data is being exported.",
              });
            },
            variant: "outline",
            disabled: !tariffData && !hsSuggestions,
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Search Form */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Tariff Search</CardTitle>
            <CardDescription>Find tariff rates by HS code or product description</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="hsCode" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="hsCode" className="flex-1">By HS Code</TabsTrigger>
                <TabsTrigger value="description" className="flex-1">By Description</TabsTrigger>
              </TabsList>
              
              <TabsContent value="hsCode">
                <Form {...hsForm}>
                  <form onSubmit={hsForm.handleSubmit(onHSSubmit)} className="space-y-4">
                    <FormField
                      control={hsForm.control}
                      name="hsCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>HS Code</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 8518.30.20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={hsForm.control}
                      name="countryCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination Country</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger id="countrySelect">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="MX">Mexico</SelectItem>
                              <SelectItem value="UK">United Kingdom</SelectItem>
                              <SelectItem value="DE">Germany</SelectItem>
                              <SelectItem value="FR">France</SelectItem>
                              <SelectItem value="JP">Japan</SelectItem>
                              <SelectItem value="CN">China</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={tariffLookupMutation.isPending}
                    >
                      {tariffLookupMutation.isPending ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Searching...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <FaSearch className="mr-2" />
                          Search Tariffs
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="description">
                <Form {...descForm}>
                  <form onSubmit={descForm.handleSubmit(onDescSubmit)} className="space-y-4">
                    <FormField
                      control={descForm.control}
                      name="productDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Description</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Wireless headphones with microphone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={hsSuggestionMutation.isPending}
                    >
                      {hsSuggestionMutation.isPending ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Finding HS Codes...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <FaMagnifyingGlassDollar className="mr-2" />
                          Find HS Codes
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results Display */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              {activeTab === 'hsCode' 
                ? "Tariff rates and regulations for the specified HS code" 
                : "HS code suggestions based on product description"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Loading states */}
            {(tariffLookupMutation.isPending || hsSuggestionMutation.isPending) && (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            )}

            {/* No data state */}
            {!tariffLookupMutation.isPending && 
              !hsSuggestionMutation.isPending && 
              !tariffData && 
              !hsSuggestions && (
              <div className="text-center py-12">
                <div className="mb-4 text-neutral-400">
                  <FaMagnifyingGlassDollar className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No results to display</h3>
                <p className="text-neutral-500 max-w-md mx-auto">
                  Search for an HS code or describe your product to see tariff information and classification suggestions.
                </p>
              </div>
            )}

            {/* Tariff Data Results */}
            {activeTab === 'hsCode' && tariffData && !tariffLookupMutation.isPending && (
              <div>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-5">
                  <h3 className="text-sm font-medium text-neutral-900 mb-1">
                    HS Code: {tariffData.hsCode}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {tariffData.description || "No description available"}
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rate Type</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Base Rate</TableCell>
                        <TableCell className="text-right">{tariffData.baseRate}%</TableCell>
                        <TableCell>Standard rate applicable to most countries</TableCell>
                      </TableRow>
                      
                      {tariffData.specialPrograms && Object.entries(tariffData.specialPrograms).map(([program, rate]: [string, any]) => (
                        <TableRow key={program}>
                          <TableCell className="font-medium">{program}</TableCell>
                          <TableCell className="text-right text-secondary">
                            {typeof rate === 'number' ? `${rate}%` : rate}
                          </TableCell>
                          <TableCell>Special trade program</TableCell>
                        </TableRow>
                      ))}
                      
                      <TableRow className="bg-neutral-50 font-medium">
                        <TableCell>Final Applicable Rate</TableCell>
                        <TableCell className="text-right">{tariffData.finalRate}%</TableCell>
                        <TableCell>Rate after all applicable programs</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* HS Code Suggestions */}
            {activeTab === 'description' && hsSuggestions && !hsSuggestionMutation.isPending && (
              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-4">
                  Suggested HS codes for: "{descForm.getValues().productDescription}"
                </h3>
                
                <div className="space-y-4">
                  {hsSuggestions.map((suggestion, index) => (
                    <div key={index} className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-primary transition-colors">
                      <div className="flex justify-between mb-2">
                        <h4 className="text-md font-semibold text-primary">{suggestion.hsCode}</h4>
                        {suggestion.confidence && (
                          <span className="text-xs bg-neutral-100 rounded-full px-2 py-1">
                            {Math.round(suggestion.confidence * 100)}% Confidence
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-700 mb-3">{suggestion.description}</p>
                      <Button 
                        size="sm" 
                        onClick={() => useHSCode(suggestion.hsCode)}
                        variant="outline"
                        className="text-primary border-primary hover:bg-primary-50"
                      >
                        Use this HS Code
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TariffLookup;
