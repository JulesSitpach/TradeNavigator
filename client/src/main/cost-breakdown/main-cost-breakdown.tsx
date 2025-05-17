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
import { AnalysisContext } from "@/contexts/AnalysisContext";
import { Calculator, Save, FileText, RotateCcw, PlusCircle, Search } from "lucide-react";
import HSCodeAssistant from "@/components/ai/HSCodeAssistant";
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
  // Form state management
  const [formValues, setFormValues] = useState({
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
  
  // Context and hooks
  const { toast } = useToast();
  const { setCurrentAnalysis } = useContext(AnalysisContext);
  
  // Load saved analyses from localStorage on component mount
  useEffect(() => {
    const savedAnalysesFromStorage = localStorage.getItem('savedCostAnalyses');
    if (savedAnalysesFromStorage) {
      setSavedAnalyses(JSON.parse(savedAnalysesFromStorage));
    }
  }, []);
  
  // Function to handle input changes
  const handleInputChange = (field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Calculate costs
  const calculateCosts = () => {
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
    
    setResults(mockResults);
    setCalculationComplete(true);
    
    // Update the global analysis context so other dashboards can access this data
    setCurrentAnalysis({
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
      <Card className="bg-white shadow-sm mb-8">
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
              
              <div className="flex space-x-3">
                {isModifying && (
                  <Button 
                    variant="outline" 
                    onClick={newAnalysis}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Analysis
                  </Button>
                )}
                
                <Button 
                  className="calculate-btn"
                  onClick={calculateCosts}
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  {isModifying ? "Recalculate Analysis" : "Calculate Cost Analysis"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        
        {/* Results Card (shown after calculation) */}
        {results && (
          <CardFooter className="border-t p-6 bg-gray-50">
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-3">Calculation Results</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded border">
                  <p className="text-sm text-gray-500">Total Landed Cost</p>
                  <p className="text-2xl font-bold">${results.totalCost.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-white rounded border">
                  <p className="text-sm text-gray-500">Cost Breakdown</p>
                  <div className="space-y-2 mt-2">
                    {results.components.map((component, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm">{component.name}:</span>
                        <span className="text-sm font-medium">${component.value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
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