/**
 * @component Main Cost Breakdown
 * @status PRODUCTION
 * @version 1.0
 * @lastModified 2025-05-17
 * @description Primary cost breakdown component with full functionality including HS Code Assistant,
 *              country selection by region, save/load analysis, and modify capability.
 * @dependencies HSCodeAssistant, AnalysisContext
 */

import { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import PageHeader from "@/components/common/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { AnalysisContext, useAnalysis } from "@/contexts/AnalysisContext";
import { Calculator, Save, FileText, RotateCcw, PlusCircle, Search, Pencil, Edit } from "lucide-react";
import HSCodeAssistant from "@/components/ai/HSCodeAssistant";
import { normalizeAnalysisData } from "@/utils/analysisDataHelper";
import "../../styles/cost-breakdown-form.css";

// Country lists organized by region with CPTPP indicators
const countryGroups = {
  'ASIA-PACIFIC REGION': [
    { label: "Japan - CPTPP member", value: "jp", region: "ASIA-PACIFIC REGION", isCPTPP: true },
    { label: "South Korea", value: "kr", region: "ASIA-PACIFIC REGION", isCPTPP: false },
    { label: "China", value: "cn", region: "ASIA-PACIFIC REGION", isCPTPP: false },
    { label: "India", value: "in", region: "ASIA-PACIFIC REGION", isCPTPP: false },
    { label: "Vietnam - CPTPP member", value: "vn", region: "ASIA-PACIFIC REGION", isCPTPP: true },
    { label: "Singapore - CPTPP member", value: "sg", region: "ASIA-PACIFIC REGION", isCPTPP: true },
    { label: "Malaysia - CPTPP member", value: "my", region: "ASIA-PACIFIC REGION", isCPTPP: true },
    { label: "Australia - CPTPP member", value: "au", region: "ASIA-PACIFIC REGION", isCPTPP: true },
    { label: "Indonesia", value: "id", region: "ASIA-PACIFIC REGION", isCPTPP: false },
    { label: "Taiwan", value: "tw", region: "ASIA-PACIFIC REGION", isCPTPP: false },
    { label: "New Zealand - CPTPP member", value: "nz", region: "ASIA-PACIFIC REGION", isCPTPP: true },
    { label: "Thailand", value: "th", region: "ASIA-PACIFIC REGION", isCPTPP: false },
    { label: "Philippines", value: "ph", region: "ASIA-PACIFIC REGION", isCPTPP: false },
  ],
  'EUROPE': [
    { label: "European Union", value: "eu", region: "EUROPE", isCPTPP: false },
    { label: "Germany", value: "de", region: "EUROPE", isCPTPP: false },
    { label: "United Kingdom - CPTPP member", value: "uk", region: "EUROPE", isCPTPP: true },
    { label: "France", value: "fr", region: "EUROPE", isCPTPP: false },
    { label: "Spain", value: "es", region: "EUROPE", isCPTPP: false },
    { label: "Italy", value: "it", region: "EUROPE", isCPTPP: false },
    { label: "Netherlands", value: "nl", region: "EUROPE", isCPTPP: false },
    { label: "Switzerland", value: "ch", region: "EUROPE", isCPTPP: false },
    { label: "Sweden", value: "se", region: "EUROPE", isCPTPP: false },
    { label: "Belgium", value: "be", region: "EUROPE", isCPTPP: false },
    { label: "Poland", value: "pl", region: "EUROPE", isCPTPP: false },
  ],
  'NORTH & CENTRAL AMERICA': [
    { label: "United States", value: "us", region: "NORTH & CENTRAL AMERICA", isCPTPP: false },
    { label: "Canada - CPTPP member", value: "ca", region: "NORTH & CENTRAL AMERICA", isCPTPP: true },
    { label: "Mexico - CPTPP member", value: "mx", region: "NORTH & CENTRAL AMERICA", isCPTPP: true },
    { label: "Costa Rica", value: "cr", region: "NORTH & CENTRAL AMERICA", isCPTPP: false },
    { label: "Panama", value: "pa", region: "NORTH & CENTRAL AMERICA", isCPTPP: false },
  ],
  'SOUTH AMERICA': [
    { label: "Brazil", value: "br", region: "SOUTH AMERICA", isCPTPP: false },
    { label: "Chile - CPTPP member", value: "cl", region: "SOUTH AMERICA", isCPTPP: true },
    { label: "Peru - CPTPP member", value: "pe", region: "SOUTH AMERICA", isCPTPP: true },
    { label: "Colombia", value: "co", region: "SOUTH AMERICA", isCPTPP: false },
    { label: "Argentina", value: "ar", region: "SOUTH AMERICA", isCPTPP: false },
  ],
  'MIDDLE EAST & AFRICA': [
    { label: "United Arab Emirates", value: "ae", region: "MIDDLE EAST & AFRICA", isCPTPP: false },
    { label: "Saudi Arabia", value: "sa", region: "MIDDLE EAST & AFRICA", isCPTPP: false },
    { label: "Israel", value: "il", region: "MIDDLE EAST & AFRICA", isCPTPP: false },
    { label: "South Africa", value: "za", region: "MIDDLE EAST & AFRICA", isCPTPP: false },
    { label: "Nigeria", value: "ng", region: "MIDDLE EAST & AFRICA", isCPTPP: false },
    { label: "Egypt", value: "eg", region: "MIDDLE EAST & AFRICA", isCPTPP: false },
  ]
};

const NewCostForm = () => {
  // Use context directly since the custom hook is not working properly
  const context = useContext(AnalysisContext);
  
  // Safe access to context properties with fallbacks
  const currentAnalysis = context?.currentAnalysis || null;
  const contextSavedAnalyses = context?.savedAnalyses || [];
  const setCurrentAnalysis = context?.setCurrentAnalysis || null;
  const analysisLoading = context?.isLoading || false;
  
  // Initialize form values from context or with defaults
  const initialFormValues = () => {
    if (currentAnalysis?.formValues) {
      console.log("Loading initial form values from context");
      return currentAnalysis.formValues;
    }
    
    // Default empty form values
    return {
      productDescription: "",
      productCategory: "",
      hsCode: "", // No default value
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
      incoterm: ""
    };
  };
  
  // Form state management with values from context or defaults
  const [formValues, setFormValues] = useState(initialFormValues());
  
  const [currency, setCurrency] = useState("USD");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [dimensionUnit, setDimensionUnit] = useState("cm");
  
  // Analysis management state
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [currentAnalysisId, setCurrentAnalysisId] = useState(null);
  const [results, setResults] = useState(null);
  const [isModifying, setIsModifying] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [modificationInfo, setModificationInfo] = useState(null);
  
  // HS Code Assistant state
  const [showHSAssistant, setShowHSAssistant] = useState(false);
  
  // UI state
  const [calculationComplete, setCalculationComplete] = useState(false);
  
  // Additional hooks
  const { toast } = useToast();
  
  // Load saved analyses and form data from localStorage on component mount
  useEffect(() => {
    // Load saved analyses
    const savedAnalysesFromStorage = localStorage.getItem('savedCostAnalyses');
    if (savedAnalysesFromStorage) {
      setSavedAnalyses(JSON.parse(savedAnalysesFromStorage));
    }
    
    // Load any previously saved form data if it exists
    const savedFormData = localStorage.getItem('currentFormData');
    if (savedFormData) {
      try {
        const parsedFormData = JSON.parse(savedFormData);
        setFormValues(parsedFormData);
      } catch (error) {
        console.error("Error loading saved form data:", error);
      }
    }
    
    // Load any previous calculation results
    const savedResults = localStorage.getItem('calculationResults');
    if (savedResults) {
      try {
        const parsedResults = JSON.parse(savedResults);
        setResults(parsedResults);
        setCalculationComplete(true);
      } catch (error) {
        console.error("Error loading saved results:", error);
      }
    }
  }, []);
  
  // Function to handle input changes
  const handleInputChange = (field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Calculate costs without clearing the form
  const calculateCosts = () => {
    // Store current form data in localStorage to preserve it
    localStorage.setItem('currentFormData', JSON.stringify(formValues));
    
    // For demo purposes, we'll generate mock results
    // In a real implementation, this would call your API or perform the calculation
    const mockResults = {
      totalCost: parseFloat(formValues.productValue) * 1.25, // 25% increase as an example
      components: [
        { name: "Duties", value: parseFloat(formValues.productValue) * 0.07 },
        { name: "Taxes", value: parseFloat(formValues.productValue) * 0.10 },
        { name: "Shipping", value: parseFloat(formValues.productValue) * 0.05 },
        { name: "Insurance", value: parseFloat(formValues.productValue) * 0.02 },
        { name: "Handling", value: parseFloat(formValues.productValue) * 0.01 }
      ]
    };
    
    // Store calculation results
    setResults(mockResults);
    setCalculationComplete(true);
    localStorage.setItem('calculationResults', JSON.stringify(mockResults));
    
    // Update the global analysis context so other dashboards can access this data
    setCurrentAnalysis({
      // Include the original form values for other dashboards to reference
      formValues: formValues,
      // Include the calculation results
      results: mockResults,
      // Include structured data for dashboards that expect specific formats
      totalCost: mockResults.totalCost,
      components: mockResults.components,
      productDetails: {
        description: formValues.productDescription,
        category: formValues.productCategory,
        hsCode: formValues.hsCode,
        originCountry: formValues.originCountry,
        destinationCountry: formValues.destinationCountry,
        value: parseFloat(formValues.productValue),
        quantity: parseInt(formValues.quantity),
        weight: parseFloat(formValues.weight),
        transportMode: formValues.transportMode
      },
      timestamp: new Date()
    });
    
    toast({
      title: "Calculation Complete",
      description: "Your cost analysis has been calculated successfully.",
    });
  };
  
  // Handler function for modifying product and shipping details
  const handleModifyDetails = () => {
    // Preserve the current form values (prevent clearing)
    // This uses the existing form data that produced the current results
    
    // Scroll back up to the input form
    const formElement = document.getElementById('product-info-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Set state to indicate we're in modification mode
    setIsModifying(true);
    
    // Show a message indicating modification mode
    toast({
      title: "Modifying Details",
      description: "Make your changes and click Calculate to update the analysis"
    });
  };
  
  // Save the current analysis
  const saveAnalysis = () => {
    if (!results) {
      toast({
        title: "Cannot Save",
        description: "Please calculate costs before saving",
        variant: "destructive"
      });
      return;
    }
    
    const newAnalysis = {
      id: currentAnalysisId || Date.now().toString(),
      name: saveName || `Analysis ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      formValues: {...formValues},
      results: {...results}
    };
    
    let updatedSavedAnalyses;
    
    if (currentAnalysisId && isModifying) {
      // Update existing analysis
      updatedSavedAnalyses = savedAnalyses.map(analysis => 
        analysis.id === currentAnalysisId ? newAnalysis : analysis
      );
    } else {
      // Create new analysis
      updatedSavedAnalyses = [...savedAnalyses, newAnalysis];
    }
    
    setSavedAnalyses(updatedSavedAnalyses);
    localStorage.setItem('savedCostAnalyses', JSON.stringify(updatedSavedAnalyses));
    
    setSaveDialogOpen(false);
    setIsModifying(false);
    setCurrentAnalysisId(newAnalysis.id);
    
    toast({
      title: isModifying ? "Analysis Updated" : "Analysis Saved",
      description: `Your analysis "${newAnalysis.name}" has been ${isModifying ? 'updated' : 'saved'} successfully.`
    });
  };
  
  // Load an existing analysis
  const loadAnalysis = (analysis) => {
    setFormValues(analysis.formValues);
    setResults(analysis.results);
    setCurrentAnalysisId(analysis.id);
    setIsModifying(false);
    setLastAnalysis(analysis);
    
    // Update the global analysis context
    setCurrentAnalysis({
      totalCost: analysis.results.totalCost,
      components: analysis.results.components,
      productDetails: {
        description: analysis.formValues.productDescription,
        category: analysis.formValues.productCategory,
        hsCode: analysis.formValues.hsCode,
        originCountry: analysis.formValues.originCountry,
        destinationCountry: analysis.formValues.destinationCountry,
        value: parseFloat(analysis.formValues.productValue),
        quantity: parseInt(analysis.formValues.quantity),
        weight: parseFloat(analysis.formValues.weight),
        transportMode: analysis.formValues.transportMode
      },
      timestamp: new Date()
    });
    
    toast({
      title: "Analysis Loaded",
      description: `Analysis "${analysis.name}" has been loaded.`
    });
  };
  
  // Modify an existing analysis
  const modifyAnalysis = (analysis) => {
    loadAnalysis(analysis);
    setIsModifying(true);
    setModificationInfo({
      name: analysis.name,
      date: new Date(analysis.date).toLocaleDateString()
    });
    
    toast({
      title: "Modifying Analysis",
      description: `You are now modifying "${analysis.name}". Make your changes and recalculate.`
    });
  };
  
  // Create a new analysis, resetting the form
  const newAnalysis = () => {
    setFormValues({
      productDescription: "",
      productCategory: "",
      hsCode: "", // No default value
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
      height: ""
    });
    setResults(null);
    setCurrentAnalysisId(null);
    setIsModifying(false);
    setModificationInfo(null);
    setCalculationComplete(false);
    
    toast({
      title: "New Analysis",
      description: "You can now create a new cost analysis."
    });
  };

  return (
    <>
      <PageHeader
        title={isModifying ? "Modify Cost Analysis" : "New Cost Analysis"}
        description={isModifying 
          ? `Modifying "${modificationInfo?.name || 'Saved Analysis'}" from ${modificationInfo?.date}` 
          : "Enter product and shipping details to calculate landed costs"}
      />
      
      {/* Saved Analyses Section */}
      {savedAnalyses.length > 0 && (
        <Card className="bg-white shadow-sm mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Saved Analyses</h2>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="space-y-4">
                {savedAnalyses.map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50">
                    <div>
                      <h3 className="font-medium">{analysis.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(analysis.date).toLocaleDateString()} 
                        {analysis.formValues && analysis.formValues.productDescription && (
                          <> • {analysis.formValues.productDescription}</>
                        )}
                        {analysis.formValues && analysis.formValues.originCountry && analysis.formValues.destinationCountry && (
                          <> • {analysis.formValues.originCountry} to {analysis.formValues.destinationCountry}</>
                        )}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => loadAnalysis(analysis)}
                      >
                        <FileText className="mr-1 h-4 w-4" />
                        Load
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => modifyAnalysis(analysis)}
                      >
                        <RotateCcw className="mr-1 h-4 w-4" />
                        Modify
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      <Card className="bg-white shadow-sm mb-8" id="product-info-form">
        <CardContent className="p-6">
          <div className="form-section">
            {isModifying && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-amber-800 flex items-center">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  You are modifying "{modificationInfo?.name}". Your changes will be saved as an update to the original analysis.
                </p>
              </div>
            )}
            
            <h2 className="section-title">Product & Shipping Details</h2>
            <p className="section-description">Enter information about your product and shipping requirements</p>
            
            <div className="form-subsection">
              <h3 className="subsection-title">Product Details</h3>
              
              <div className="form-grid">
                <div className="form-field">
                  <Label htmlFor="product-description">Product Description</Label>
                  <Input 
                    id="product-description" 
                    placeholder="High-performance laptops, 13-inch display, 32GB RAM, 1TB SSD" 
                    value={formValues.productDescription}
                    onChange={(e) => handleInputChange('productDescription', e.target.value)}
                  />
                </div>
                
                <div className="form-field">
                  <Label htmlFor="product-category">
                    Product Category <span className="text-xs text-amber-600">Select first for better HS code results</span>
                  </Label>
                  <Select 
                    value={formValues.productCategory} 
                    onValueChange={(value) => handleInputChange('productCategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="textiles">Textiles & Apparel</SelectItem>
                      <SelectItem value="food">Food & Beverages</SelectItem>
                      <SelectItem value="chemicals">Chemicals</SelectItem>
                      <SelectItem value="machinery">Machinery</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="form-field">
                  <Label htmlFor="hs-code">HS Code</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="hs-code" 
                      placeholder="e.g., 5204.11" 
                      value={formValues.hsCode}
                      onChange={(e) => handleInputChange('hsCode', e.target.value)} 
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="lookup-btn border-green-500 text-green-500 hover:bg-green-50"
                      onClick={() => setShowHSAssistant(!showHSAssistant)}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  {showHSAssistant && (
                    <div className="mt-2">
                      <HSCodeAssistant
                        productDescription={formValues.productDescription}
                        category={formValues.productCategory}
                        onSelectHSCode={(code) => {
                          handleInputChange('hsCode', code);
                          setShowHSAssistant(false);
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="country-selectors">
                  <div className="country-select">
                    <Label htmlFor="origin-country">Origin Country</Label>
                    <Select 
                      value={formValues.originCountry}
                      onValueChange={(value) => handleInputChange('originCountry', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72 overflow-y-auto">
                        {Object.entries(countryGroups).map(([region, countries]) => (
                          <div key={`origin-${region}`}>
                            <div className="px-2 py-1.5 text-xs font-semibold bg-slate-100">{region}</div>
                            {countries.map((country) => (
                              <SelectItem key={`origin-${country.value}`} value={country.value}>
                                {country.label}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="country-select">
                    <Label htmlFor="destination-country">Destination Country</Label>
                    <Select
                      value={formValues.destinationCountry}
                      onValueChange={(value) => handleInputChange('destinationCountry', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72 overflow-y-auto">
                        {Object.entries(countryGroups).map(([region, countries]) => (
                          <div key={`dest-${region}`}>
                            <div className="px-2 py-1.5 text-xs font-semibold bg-slate-100">{region}</div>
                            {countries.map((country) => (
                              <SelectItem key={`dest-${country.value}`} value={country.value}>
                                {country.label}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="form-field">
                  <Label htmlFor="product-value">Product Value (in USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input 
                      id="product-value" 
                      type="number" 
                      className="pl-7" 
                      placeholder="400"
                      value={formValues.productValue}
                      onChange={(e) => handleInputChange('productValue', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-subsection">
              <h3 className="subsection-title">Shipping Details</h3>
              
              <div className="form-grid">
                <div className="form-field">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    placeholder="50"
                    value={formValues.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                  />
                </div>
                
                <div className="form-field">
                  <Label htmlFor="transport-mode">Transport Mode</Label>
                  <Select
                    value={formValues.transportMode}
                    onValueChange={(value) => handleInputChange('transportMode', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select transport mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="air">Air Freight</SelectItem>
                      <SelectItem value="sea">Sea Freight</SelectItem>
                      <SelectItem value="rail">Rail Freight</SelectItem>
                      <SelectItem value="road">Road Freight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="form-field">
                  <Label htmlFor="shipment-type">
                    Shipment Type <span className="text-xs text-amber-600">Required</span>
                  </Label>
                  <Select
                    value={formValues.shipmentType}
                    onValueChange={(value) => handleInputChange('shipmentType', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select shipment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lcl">Less than Container Load (LCL)</SelectItem>
                      <SelectItem value="fcl">Full Container Load (FCL)</SelectItem>
                      <SelectItem value="bulk">Bulk Cargo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="form-field">
                  <Label htmlFor="package-type">
                    Package Type <span className="text-xs text-amber-600">Required</span>
                  </Label>
                  <Select
                    value={formValues.packageType}
                    onValueChange={(value) => handleInputChange('packageType', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select package type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardboard">Cardboard Box</SelectItem>
                      <SelectItem value="pallet">Pallet</SelectItem>
                      <SelectItem value="crate">Wooden Crate</SelectItem>
                      <SelectItem value="drum">Drum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="form-field">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <div className="flex items-center">
                    <Input 
                      id="weight" 
                      type="number" 
                      placeholder="450" 
                      className="flex-1"
                      value={formValues.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                    />
                    <div className="unit-toggle ml-2">
                      <Button 
                        type="button" 
                        size="sm" 
                        variant={weightUnit === "kg" ? "default" : "outline"}
                        onClick={() => setWeightUnit("kg")}
                        className="rounded-r-none"
                      >
                        kg
                      </Button>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant={weightUnit === "lb" ? "default" : "outline"}
                        onClick={() => setWeightUnit("lb")}
                        className="rounded-l-none"
                      >
                        lb
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Label className="mb-2 block">Package Dimensions</Label>
                <div className="unit-toggle-right text-right mb-2">
                  <span className="text-sm mr-2">Units:</span>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant={dimensionUnit === "cm" ? "default" : "outline"}
                    onClick={() => setDimensionUnit("cm")}
                    className="rounded-r-none"
                  >
                    cm
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant={dimensionUnit === "in" ? "default" : "outline"}
                    onClick={() => setDimensionUnit("in")}
                    className="rounded-l-none"
                  >
                    in
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="length">Length ({dimensionUnit})</Label>
                    <Input 
                      id="length" 
                      type="number" 
                      placeholder="40"
                      value={formValues.length}
                      onChange={(e) => handleInputChange('length', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="width">Width ({dimensionUnit})</Label>
                    <Input 
                      id="width" 
                      type="number" 
                      placeholder="30"
                      value={formValues.width}
                      onChange={(e) => handleInputChange('width', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height ({dimensionUnit})</Label>
                    <Input 
                      id="height" 
                      type="number" 
                      placeholder="25"
                      value={formValues.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              {calculationComplete && (
                <Button 
                  variant="outline"
                  onClick={() => setSaveDialogOpen(true)}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Analysis
                </Button>
              )}
              
              {isModifying ? (
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={newAnalysis}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Analysis
                  </Button>
                  
                  <Button 
                    className="calculate-btn"
                    onClick={calculateCosts}
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Recalculate Analysis
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button 
                    onClick={handleModifyDetails} 
                    className="px-4 py-2 border border-green-600 rounded-md text-green-600 hover:bg-green-50 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modify Product & Shipping Details
                  </button>
                  
                  <button 
                    onClick={() => {
                      setSaveDialogOpen(true);
                    }} 
                    className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        {/* Enhanced Results Card (shown after calculation) */}
        {results && (
          <CardFooter className="border-t p-6 bg-gray-50">
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-4">Calculation Results</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Left Column: Detailed Cost Breakdown */}
                <div className="lg:col-span-2">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium mb-4">Detailed Cost Breakdown</h3>
                    
                    <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-md mb-4 border border-amber-200">
                      <strong>Disclaimer:</strong> These calculations provide an estimate based on current data and standard rates. 
                      Actual costs may vary based on specific product details, current regulatory changes, exchange rate fluctuations, 
                      and carrier pricing. We recommend verifying critical figures with your customs broker or freight forwarder.
                    </div>
                    
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-left text-gray-600 text-sm">
                          <th className="py-2 px-4 font-medium">Cost Component</th>
                          <th className="py-2 px-4 font-medium text-right">Amount (USD)</th>
                          <th className="py-2 px-4 font-medium text-right">Percentage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="py-3 px-4">
                            <div className="font-medium">Product Value</div>
                            <div className="text-xs text-gray-500">Base value of goods</div>
                          </td>
                          <td className="py-3 px-4 text-right font-medium">${parseFloat(formValues.productValue).toFixed(2)}</td>
                          <td className="py-3 px-4 text-right text-gray-600">
                            {(parseFloat(formValues.productValue) / results.totalCost * 100).toFixed(1)}%
                          </td>
                        </tr>
                        
                        {results.components.map((component, index) => (
                          <tr key={index}>
                            <td className="py-3 px-4">
                              <div className="font-medium">{component.name}</div>
                              <div className="text-xs text-gray-500">
                                {component.name === "Duties" && `Based on HS code ${formValues.hsCode}`}
                                {component.name === "Taxes" && "Import VAT and other taxes"}
                                {component.name === "Shipping" && `${formValues.transportMode} transport`}
                                {component.name === "Insurance" && "Cargo protection"}
                                {component.name === "Handling" && "Documentation and processing"}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-medium">${component.value.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right text-gray-600">
                              {(component.value / results.totalCost * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                        
                        <tr className="bg-blue-50">
                          <td className="py-3 px-4 font-medium">Total Landed Cost</td>
                          <td className="py-3 px-4 text-right font-bold">${results.totalCost.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-medium">100%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Column: Summary and Actions */}
                <div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
                    <h3 className="text-lg font-medium mb-4">Cost Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Product Value:</span>
                        <span className="font-medium">${parseFloat(formValues.productValue).toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Duties & Taxes:</span>
                        <span className="font-medium">
                          ${((results.components.find(c => c.name === "Duties")?.value || 0) + 
                            (results.components.find(c => c.name === "Taxes")?.value || 0)).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping & Handling:</span>
                        <span className="font-medium">
                          ${((results.components.find(c => c.name === "Shipping")?.value || 0) + 
                            (results.components.find(c => c.name === "Handling")?.value || 0)).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Insurance & Other:</span>
                        <span className="font-medium">
                          ${(results.components.find(c => c.name === "Insurance")?.value || 0).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between">
                        <span className="font-medium">Total Landed Cost:</span>
                        <span className="font-bold text-blue-700">${results.totalCost.toFixed(2)}</span>
                      </div>
                      
                      <div className="pt-4">
                        <button 
                          onClick={() => {
                            setIsModifying(true);
                            toast({
                              title: "Modifying Analysis",
                              description: "You can now make changes to your product and shipping details."
                            });
                          }}
                          className="w-full py-2 px-4 bg-white border border-green-600 text-green-600 rounded-md hover:bg-green-50 flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Modify Product & Shipping Details
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
                    <h3 className="text-lg font-medium mb-4">Save Analysis</h3>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">Save this breakdown to reference later or share with your team</p>
                      <Input
                        type="text"
                        placeholder="Analysis name"
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                      />
                      <Button 
                        className="w-full"
                        onClick={saveAnalysis}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Analysis
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* SMB Value Insights Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Trade Program Benefits */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium mb-4">Trade Program Benefits</h3>
                  <div className="space-y-4">
                    {formValues.originCountry && formValues.destinationCountry && (
                      <div className="bg-green-50 p-4 rounded-md border border-green-200">
                        <h4 className="font-medium text-green-800">Free Trade Agreement Opportunity</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Your shipment from {formValues.originCountry} to {formValues.destinationCountry} may qualify for reduced duties 
                          under applicable trade agreements, saving approximately 
                          ${(results.components.find(c => c.name === "Duties")?.value * 0.3 || 0).toFixed(2)} (30% reduction).
                        </p>
                        <a href="#" className="text-sm text-green-700 font-medium mt-2 inline-block hover:underline">How to claim this benefit →</a>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                      <h4 className="font-medium text-blue-800">Duty Deferral Program</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        {formValues.productCategory} items may qualify for duty deferral in certain regions, 
                        improving cash flow by up to ${(results.components.find(c => c.name === "Duties")?.value || 0).toFixed(2)}.
                      </p>
                      <a href="#" className="text-sm text-blue-700 font-medium mt-2 inline-block hover:underline">Eligibility requirements →</a>
                    </div>
                  </div>
                </div>
                
                {/* Cost Optimization */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium mb-4">Cost Optimization Opportunities</h3>
                  <div className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                      <h4 className="font-medium text-amber-800">Shipping Cost Reduction</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Consolidating with other shipments could reduce your per-unit shipping costs by up to 15%, 
                        saving approximately ${(results.components.find(c => c.name === "Shipping")?.value * 0.15 || 0).toFixed(2)}.
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                      <h4 className="font-medium text-purple-800">Insurance Optimization</h4>
                      <p className="text-sm text-purple-700 mt-1">
                        Custom insurance policies for {formValues.productCategory} items typically offer better rates than general cargo insurance, 
                        potentially saving 30% (${(results.components.find(c => c.name === "Insurance")?.value * 0.3 || 0).toFixed(2)}).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Import Timeline & Next Steps */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
                <h3 className="text-lg font-medium mb-4">Import Timeline & Next Steps</h3>
                
                <div className="relative">
                  <div className="absolute left-4 h-full w-0.5 bg-gray-200"></div>
                  
                  <div className="relative flex items-start mb-6">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center -ml-4 mr-3 z-10">
                      <span className="text-white font-medium">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Documentation Preparation</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Prepare all required documents including Certificate of Origin 
                        {formValues.originCountry && formValues.destinationCountry && 
                          ` for shipping from ${formValues.originCountry} to ${formValues.destinationCountry}`}.
                      </p>
                      <p className="text-sm font-medium text-blue-600 mt-1">Estimated time: 1-2 weeks</p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start mb-6">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center -ml-4 mr-3 z-10">
                      <span className="text-white font-medium">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Shipping & Transit</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {formValues.transportMode === "Air" ? "Air freight" : formValues.transportMode === "Sea" ? "Sea freight" : "Transport"} 
                        {formValues.originCountry && formValues.destinationCountry && 
                          ` from ${formValues.originCountry} to ${formValues.destinationCountry}`} with current port conditions.
                      </p>
                      <p className="text-sm font-medium text-blue-600 mt-1">
                        Estimated time: {formValues.transportMode === "Air" ? "5-7 days" : formValues.transportMode === "Sea" ? "25-30 days" : "15-30 days"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start mb-6">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center -ml-4 mr-3 z-10">
                      <span className="text-white font-medium">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Customs Clearance</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Processing through {formValues.destinationCountry ? `${formValues.destinationCountry} customs` : 'destination customs'} 
                        with applicable trade agreement benefits.
                      </p>
                      <p className="text-sm font-medium text-blue-600 mt-1">Estimated time: 3-5 days</p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center -ml-4 mr-3 z-10">
                      <span className="text-white font-medium">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Delivery & Installation</h4>
                      <p className="text-sm text-gray-600 mt-1">Final delivery to destination and installation setup.</p>
                      <p className="text-sm font-medium text-blue-600 mt-1">Estimated time: 1-2 days</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="font-medium mb-2">Total Estimated Timeline</p>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="flex h-full">
                      <div className="bg-blue-200 w-1/4" title="Documentation"></div>
                      <div className="bg-blue-400 w-2/4" title="Shipping"></div>
                      <div className="bg-blue-500 w-1/8" title="Customs"></div>
                      <div className="bg-blue-600 w-1/8" title="Delivery"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Start</span>
                    <span>
                      {formValues.transportMode === "Air" ? "10-15" : formValues.transportMode === "Sea" ? "30-40" : "20-35"} days total
                    </span>
                  </div>
                </div>
                
                {/* Modify Button at bottom of results section */}
                <div className="mt-8 flex justify-center">
                  <Button 
                    onClick={handleModifyDetails}
                    variant="outline"
                    size="lg"
                    className="w-full md:w-auto border-amber-500 text-amber-600 hover:bg-amber-50"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modify Product & Shipping Details
                  </Button>
                </div>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
      
      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isModifying ? "Update Analysis" : "Save Analysis"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="save-name">Analysis Name</Label>
            <Input
              id="save-name"
              placeholder={`Analysis ${new Date().toLocaleDateString()}`}
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveAnalysis}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewCostForm;