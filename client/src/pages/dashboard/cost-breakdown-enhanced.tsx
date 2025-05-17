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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import HSCodeAssistant from "@/components/ai/HSCodeAssistant";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

// Define form schema for validation
const productInfoFormSchema = z.object({
  // Product details
  productName: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  productCategory: z.string().min(1, { message: "Product category is required." }),
  hsCode: z.string().min(4, { message: "HS code must be at least 4 characters." }),
  productDescription: z.string().min(5, { message: "Description must be at least 5 characters." }),
  unitValue: z.string().min(1, { message: "Unit value is required." }),
  quantity: z.string().min(1, { message: "Quantity is required." }),
  
  // Origin and destination
  originCountry: z.string().min(1, { message: "Origin country is required." }),
  destinationCountry: z.string().min(1, { message: "Destination country is required." }),
  
  // Shipping details
  transportMode: z.string().min(1, { message: "Transport mode is required." }),
  packageType: z.string().min(1, { message: "Package type is required." }),
  weight: z.string().min(1, { message: "Weight is required." }),
  dimensions: z.string().optional(),
  
  // Commercial terms
  incoterm: z.string().min(1, { message: "Incoterm is required." }),
  paymentTerms: z.string().optional(),
  
  // Additional information
  specialPrograms: z.string().array().optional(),
  additionalNotes: z.string().optional(),
});

type ProductInfoFormValues = z.infer<typeof productInfoFormSchema>;

interface SavedAnalysis {
  id: string;
  name: string;
  date: string;
  formData: ProductInfoFormValues;
  results: any;
}

// Form component with validation
const ProductInfoForm = ({ 
  defaultValues = {},
  onCalculate,
  isModifyingAnalysis = false,
  lastAnalysis = null,
  modificationInfo = null
}: { 
  defaultValues?: Partial<ProductInfoFormValues>,
  onCalculate: (values: ProductInfoFormValues) => void,
  isModifyingAnalysis?: boolean,
  lastAnalysis?: ProductInfoFormValues | null,
  modificationInfo?: { originalName: string, date: string } | null
}) => {
  const [selectedTab, setSelectedTab] = useState("productDetails");
  const [isModified, setIsModified] = useState(false);
  const [modifiedFields, setModifiedFields] = useState<string[]>([]);
  const [showHSCodeAssistant, setShowHSCodeAssistant] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  
  // Initialize form with React Hook Form and zod validation
  const form = useForm<ProductInfoFormValues>({
    resolver: zodResolver(productInfoFormSchema),
    defaultValues: defaultValues
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
    if (lastAnalysis) {
      form.reset(lastAnalysis);
      setIsModified(false);
      setModifiedFields([]);
    } else {
      form.reset();
    }
  };
  
  // If this is a modification, set modified flag when form values change
  useEffect(() => {
    if (isModifyingAnalysis && lastAnalysis) {
      setIsModified(true);
    }
  }, [form.watch(), isModifyingAnalysis, lastAnalysis]);
  
  // Dummy data for select fields
  const categories = [
    { value: "electronics", label: "Electronics" },
    { value: "furniture", label: "Furniture" },
    { value: "clothing", label: "Clothing & Textiles" },
    { value: "food", label: "Food & Beverages" },
    { value: "machinery", label: "Machinery & Equipment" },
    { value: "chemicals", label: "Chemicals & Materials" },
    { value: "automotive", label: "Automotive Parts" },
    { value: "pharmaceuticals", label: "Pharmaceuticals" },
  ];
  
  const countries = [
    { value: "us", label: "United States" },
    { value: "cn", label: "China" },
    { value: "in", label: "India" },
    { value: "jp", label: "Japan" },
    { value: "kr", label: "South Korea" },
    { value: "mx", label: "Mexico" },
    { value: "ca", label: "Canada" },
    { value: "uk", label: "United Kingdom" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
    { value: "it", label: "Italy" },
    { value: "au", label: "Australia" },
    { value: "nz", label: "New Zealand" },
    { value: "sg", label: "Singapore" },
    { value: "id", label: "Indonesia" },
    { value: "my", label: "Malaysia" },
    { value: "th", label: "Thailand" },
    { value: "vn", label: "Vietnam" },
    { value: "ph", label: "Philippines" },
    { value: "eu", label: "European Union" },
  ];
  
  const transportModes = [
    { value: "air", label: "Air Freight" },
    { value: "sea", label: "Sea Freight" },
    { value: "road", label: "Road Transport" },
    { value: "rail", label: "Rail Transport" },
    { value: "multimodal", label: "Multimodal" },
  ];
  
  const packageTypes = [
    { value: "pallet", label: "Palletized" },
    { value: "carton", label: "Carton Box" },
    { value: "crate", label: "Wooden Crate" },
    { value: "container", label: "Full Container" },
    { value: "bulk", label: "Bulk Cargo" },
    { value: "drum", label: "Drums/Barrels" },
  ];
  
  const incoterms = [
    { value: "exw", label: "EXW (Ex Works)" },
    { value: "fca", label: "FCA (Free Carrier)" },
    { value: "fas", label: "FAS (Free Alongside Ship)" },
    { value: "fob", label: "FOB (Free On Board)" },
    { value: "cfr", label: "CFR (Cost and Freight)" },
    { value: "cif", label: "CIF (Cost, Insurance & Freight)" },
    { value: "cpt", label: "CPT (Carriage Paid To)" },
    { value: "cip", label: "CIP (Carriage & Insurance Paid)" },
    { value: "dap", label: "DAP (Delivered At Place)" },
    { value: "dpu", label: "DPU (Delivered at Place Unloaded)" },
    { value: "ddp", label: "DDP (Delivered Duty Paid)" },
  ];
  
  const specialPrograms = [
    { value: "gsp", label: "GSP (Generalized System of Preferences)" },
    { value: "fta", label: "Free Trade Agreement" },
    { value: "cptpp", label: "CPTPP Member" },
    { value: "usmca", label: "USMCA" },
    { value: "bonded", label: "Bonded Warehouse" },
    { value: "section321", label: "Section 321 (De Minimis)" },
    { value: "dutydrawback", label: "Duty Drawback" },
  ];
  
  // Handler for HS code selection from the assistant
  const handleHSCodeSelect = (code: string) => {
    form.setValue("hsCode", code);
    setShowHSCodeAssistant(false);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} id="product-info-form">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="productDetails">Product Details</TabsTrigger>
            <TabsTrigger value="shipment">Shipment Information</TabsTrigger>
            <TabsTrigger value="commercial">Commercial Terms</TabsTrigger>
          </TabsList>
          
          <TabsContent value="productDetails" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Office Desk Chair" {...field} />
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
                    <FormLabel>Product Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
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
                name="hsCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      HS Code
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHSCodeAssistant(true)}
                        className="flex items-center text-xs"
                      >
                        <FaMagnifyingGlass className="mr-1 h-3 w-3" />
                        Find Code
                      </Button>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 9403.30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unitValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Value (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
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
                        <Input type="number" min="1" placeholder="1" {...field} />
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
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Product Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the product..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="shipment" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="originCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                name="transportMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transport Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                name="packageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Input type="number" min="0.01" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dimensions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dimensions (L×W×H cm)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 100×50×25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="commercial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="incoterm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incoterm</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select incoterm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {incoterms.map((incoterm) => (
                          <SelectItem key={incoterm.value} value={incoterm.value}>
                            {incoterm.label}
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
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment terms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="advance">100% Advance</SelectItem>
                        <SelectItem value="net30">Net 30 Days</SelectItem>
                        <SelectItem value="net60">Net 60 Days</SelectItem>
                        <SelectItem value="net90">Net 90 Days</SelectItem>
                        <SelectItem value="lc">Letter of Credit</SelectItem>
                        <SelectItem value="dp">Documents against Payment</SelectItem>
                        <SelectItem value="da">Documents against Acceptance</SelectItem>
                        <SelectItem value="oa">Open Account</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="specialPrograms"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Special Programs</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {specialPrograms.map((program) => (
                        <div key={program.value} className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            id={program.value}
                            value={program.value}
                            className="mt-1"
                            onChange={(e) => {
                              const newVal = e.target.checked 
                                ? [...(field.value || []), program.value]
                                : (field.value || []).filter(val => val !== program.value);
                              field.onChange(newVal);
                            }}
                            checked={(field.value || []).includes(program.value)}
                          />
                          <label htmlFor={program.value} className="text-sm">
                            {program.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional details or requirements..."
                        className="resize-none" 
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        {/* HS Code Assistant Dialog */}
        {showHSCodeAssistant && (
          <Dialog open={showHSCodeAssistant} onOpenChange={setShowHSCodeAssistant}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>HS Code Assistant</DialogTitle>
              </DialogHeader>
              <HSCodeAssistant 
                category={form.getValues().productCategory || ""}
                onSelect={handleHSCodeSelect}
              />
            </DialogContent>
          </Dialog>
        )}
        
        {/* Display modification status if modifying */}
        {isModifyingAnalysis && modificationInfo && (
          <Alert className="mt-4 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">
              Modifying Analysis: {modificationInfo.originalName} ({modificationInfo.date})
            </AlertTitle>
            <AlertDescription className="text-blue-600">
              You are modifying a previous analysis. Fields changed: {modifiedFields.length > 0 ? 
                modifiedFields.map(field => field.replace(/([A-Z])/g, ' $1').toLowerCase()).join(', ') : 
                'None yet'}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end space-x-3 mt-6">
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
              className={isModifyingAnalysis ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
            >
              {isModifyingAnalysis ? (
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
      </form>
    </Form>
  );
};

// Main cost breakdown dashboard component
const CostBreakdownDashboard = () => {
  // State management
  const [showResults, setShowResults] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [saveName, setSaveName] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ProductInfoFormValues | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Modification tracking states
  const [isModifying, setIsModifying] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<ProductInfoFormValues | null>(null);
  const [modificationInfo, setModificationInfo] = useState<{ originalName: string, date: string } | null>(null);
  
  // Global analysis context 
  const { setAnalysisData } = useAnalysis();
  
  // Fetch data from API
  const { data } = useQuery({
    queryKey: ['/api/cost-breakdown'],
  });
  
  // Load saved analyses from local storage on mount
  useEffect(() => {
    const savedAnalysesFromStorage = localStorage.getItem('savedCostAnalyses');
    if (savedAnalysesFromStorage) {
      setSavedAnalyses(JSON.parse(savedAnalysesFromStorage));
    }
  }, []);
  
  // Handle calculation from form submission
  const handleCalculate = (values: ProductInfoFormValues) => {
    // Store the form data for later saving
    setFormData(values);
    
    // In a real application, we would make an API call here to get the results
    // For now, we'll use sample data
    const sampleResults = {
      totalCost: 5425.75,
      components: [
        { id: 1, name: "Product Cost", value: 3500, percentage: 64.5, category: "product" },
        { id: 2, name: "Duty", value: 350, percentage: 6.5, category: "duty" },
        { id: 3, name: "VAT/Sales Tax", value: 385, percentage: 7.1, category: "tax" },
        { id: 4, name: "Freight", value: 650, percentage: 12.0, category: "shipping" },
        { id: 5, name: "Insurance", value: 105, percentage: 1.9, category: "shipping" },
        { id: 6, name: "Handling", value: 75, percentage: 1.4, category: "other" },
        { id: 7, name: "Customs Processing", value: 120, percentage: 2.2, category: "other" },
        { id: 8, name: "Last Mile Delivery", value: 240.75, percentage: 4.4, category: "shipping" },
      ],
      transportMode: values.transportMode,
      calculatedDate: new Date().toISOString(),
      exchangeRates: {
        base: "USD",
        rates: {
          EUR: 0.93,
          GBP: 0.79,
          JPY: 110.21,
          CNY: 6.45,
          CAD: 1.25
        }
      },
      // Add duty rate info based on origin/destination
      dutyInfo: {
        rate: 10,
        notes: "Standard duty rate for HS 9403.30",
        specialPrograms: values.specialPrograms?.length ? values.specialPrograms : []
      },
      taxInfo: {
        name: "VAT",
        rate: 11,
        threshold: 1000,
        notes: "Standard VAT rate applies"
      }
    };
    
    // Update state with the results
    setResults(sampleResults);
    setShowResults(true);
    
    // Update global analysis context
    setAnalysisData({
      productInfo: values,
      results: sampleResults
    });
    
    // If modifying, update the saved analysis
    if (isModifying && currentAnalysisId) {
      const updatedAnalyses = savedAnalyses.map(analysis => {
        if (analysis.id === currentAnalysisId) {
          return {
            ...analysis,
            formData: values,
            results: sampleResults,
            date: new Date().toLocaleString()
          };
        }
        return analysis;
      });
      
      setSavedAnalyses(updatedAnalyses);
      localStorage.setItem('savedCostAnalyses', JSON.stringify(updatedAnalyses));
      
      // Clear modification state
      setIsModifying(false);
      setLastAnalysis(null);
      setModificationInfo(null);
      
      toast({
        title: "Analysis Updated",
        description: "Your modifications have been saved.",
        variant: "default"
      });
    }
  };
  
  // Handle saving the current analysis
  const handleSaveAnalysis = () => {
    if (!formData || !results) {
      toast({
        title: "Cannot Save",
        description: "Please calculate results before saving.",
        variant: "destructive"
      });
      return;
    }
    
    setSaveDialogOpen(true);
  };
  
  // Handle actual saving after name is provided
  const saveAnalysis = () => {
    if (!saveName || !formData || !results) return;
    
    const newAnalysis: SavedAnalysis = {
      id: Date.now().toString(),
      name: saveName,
      date: new Date().toLocaleString(),
      formData,
      results
    };
    
    const updatedAnalyses = [...savedAnalyses, newAnalysis];
    setSavedAnalyses(updatedAnalyses);
    
    // Save to local storage
    localStorage.setItem('savedCostAnalyses', JSON.stringify(updatedAnalyses));
    
    setSaveDialogOpen(false);
    setSaveName("");
    
    // Show success message
    toast({
      title: "Analysis Saved",
      description: "You can access it anytime from the Saved Analyses section.",
      variant: "default"
    });
  };
  
  // Handle initiating a modification
  const handleModify = () => {
    if (!formData) {
      toast({
        title: "Cannot Modify",
        description: "No analysis results available to modify.",
        variant: "destructive"
      });
      return;
    }
    
    // Set up modification state
    setIsModifying(true);
    setLastAnalysis(formData);
    setModificationInfo({
      originalName: "Current Analysis",
      date: new Date().toLocaleString()
    });
    setShowResults(false);
    
    // Scroll to form section
    setTimeout(() => {
      const formElement = document.getElementById('product-info-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  // Load a saved analysis
  const loadAnalysis = (analysis: SavedAnalysis) => {
    setFormData(analysis.formData);
    setResults(analysis.results);
    setShowResults(true);
    setCurrentAnalysisId(analysis.id);
    
    // Update global analysis context
    setAnalysisData({
      productInfo: analysis.formData,
      results: analysis.results
    });
    
    toast({
      title: "Analysis Loaded",
      description: `Successfully loaded: ${analysis.name}`,
      variant: "default"
    });
  };
  
  // Handle modifying a saved analysis
  const modifyAnalysis = (analysis: SavedAnalysis) => {
    setFormData(analysis.formData);
    setLastAnalysis(analysis.formData);
    setResults(null);
    setShowResults(false);
    setIsModifying(true);
    setCurrentAnalysisId(analysis.id);
    setModificationInfo({
      originalName: analysis.name,
      date: analysis.date
    });
    
    // Scroll to form section
    setTimeout(() => {
      const formElement = document.getElementById('product-info-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  // Delete a saved analysis
  const deleteAnalysis = (id: string) => {
    const updatedAnalyses = savedAnalyses.filter(analysis => analysis.id !== id);
    setSavedAnalyses(updatedAnalyses);
    localStorage.setItem('savedCostAnalyses', JSON.stringify(updatedAnalyses));
    
    toast({
      title: "Analysis Deleted",
      description: "The analysis has been removed from your saved items.",
      variant: "default"
    });
  };
  
  return (
    <>
      <PageHeader 
        title="Cost Breakdown Analysis" 
        description="Calculate and analyze all costs associated with your international shipments."
        icon={<FaCircleInfo className="h-6 w-6" />}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold">Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductInfoForm 
                defaultValues={formData || {}} 
                onCalculate={handleCalculate}
                isModifyingAnalysis={isModifying}
                lastAnalysis={lastAnalysis}
                modificationInfo={modificationInfo}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center justify-between">
                Saved Analyses
                {savedAnalyses.length > 0 && (
                  <Badge variant="outline" className="ml-2">{savedAnalyses.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savedAnalyses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No saved analyses yet.</p>
                  <p className="text-sm mt-2">Save your analyses to compare them later.</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {savedAnalyses.map((analysis) => (
                      <Card key={analysis.id} className="p-4 border border-border">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{analysis.name}</h4>
                            <p className="text-sm text-muted-foreground">{analysis.date}</p>
                            <div className="flex mt-1 flex-wrap gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {analysis.formData.originCountry} → {analysis.formData.destinationCountry}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                ${analysis.results.totalCost.toFixed(2)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button 
                              onClick={() => loadAnalysis(analysis)} 
                              size="sm" 
                              variant="outline"
                            >
                              Load
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => modifyAnalysis(analysis)}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                  Modify
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => deleteAnalysis(analysis.id)}
                                  className="text-red-600"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Results Section */}
      {showResults && formData && results && (
        <div className="mb-6">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Cost Breakdown Results</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">
                  Analysis for {formData.productName} ({formData.productCategory}) from {formData.originCountry} to {formData.destinationCountry}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleModify}
                  className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Modify Values
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSaveAnalysis}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                  </svg>
                  Save Analysis
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Cost Summary</h3>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Total Landed Cost:</span>
                        <span className="font-bold">${results.totalCost.toFixed(2)}</span>
                      </div>
                      <div className="space-y-2">
                        {results.components.reduce((groups: any, component: any) => {
                          const category = component.category;
                          if (!groups[category]) groups[category] = 0;
                          groups[category] += component.value;
                          return groups;
                        }, {})
                        && Object.entries(results.components.reduce((groups: any, component: any) => {
                          const category = component.category;
                          if (!groups[category]) groups[category] = 0;
                          groups[category] += component.value;
                          return groups;
                        }, {})).map(([category, value]: [string, any]) => (
                          <div key={category} className="flex justify-between">
                            <span className="text-muted-foreground capitalize">{category}:</span>
                            <span>${value.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Shipment Details</h3>
                    <div className="bg-muted/50 p-4 rounded-lg grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-muted-foreground text-sm">Transport Mode</p>
                        <p className="font-medium capitalize">{formData.transportMode}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Incoterm</p>
                        <p className="font-medium uppercase">{formData.incoterm}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Package Type</p>
                        <p className="font-medium capitalize">{formData.packageType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Weight</p>
                        <p className="font-medium">{formData.weight} kg</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Duty & Tax Information</h3>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                      <div>
                        <p className="text-muted-foreground text-sm">Duty Rate</p>
                        <p className="font-medium">{results.dutyInfo.rate}%</p>
                        <p className="text-xs text-muted-foreground mt-1">{results.dutyInfo.notes}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">{results.taxInfo.name} Rate</p>
                        <p className="font-medium">{results.taxInfo.rate}%</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Threshold: ${results.taxInfo.threshold}. {results.taxInfo.notes}
                        </p>
                      </div>
                      {results.dutyInfo.specialPrograms && results.dutyInfo.specialPrograms.length > 0 && (
                        <div>
                          <p className="text-muted-foreground text-sm">Special Programs</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {results.dutyInfo.specialPrograms.map((program: string) => (
                              <Badge key={program} variant="secondary">{program}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Detailed Cost Breakdown</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="space-y-3">
                      {results.components.map((component: any) => (
                        <div key={component.id} className="flex justify-between">
                          <div className="flex items-center">
                            <span 
                              className={`w-3 h-3 rounded-full mr-2 ${
                                component.category === 'product' ? 'bg-blue-500' :
                                component.category === 'duty' ? 'bg-amber-500' :
                                component.category === 'tax' ? 'bg-red-500' :
                                component.category === 'shipping' ? 'bg-green-500' :
                                'bg-purple-500'
                              }`}
                            />
                            <span>{component.name}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-muted-foreground w-16 text-right">{component.percentage}%</span>
                            <span className="font-medium w-24 text-right">${component.value.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-border mt-3 flex justify-between">
                        <span className="font-bold">Total</span>
                        <span className="font-bold">${results.totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Exchange Rates Section */}
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Exchange Rates</h3>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Base currency: {results.exchangeRates.base}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(results.exchangeRates.rates).map(([currency, rate]: [string, any]) => (
                          <div key={currency} className="text-center p-2 bg-background rounded border border-border">
                            <p className="font-medium">{currency}</p>
                            <p className="text-sm">{rate}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* AI Copilot Section */}
              <div className="mt-2">
                <CopilotAssistant 
                  context={{
                    productInfo: formData,
                    costBreakdown: results,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Analysis</DialogTitle>
            <DialogDescription>
              Give your analysis a name to save it for future reference.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FormLabel htmlFor="analysisName">Analysis Name</FormLabel>
            <Input 
              id="analysisName"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g., Office Chairs Q2 2023"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={saveAnalysis}
              disabled={!saveName}
            >
              Save Analysis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CostBreakdownDashboard;