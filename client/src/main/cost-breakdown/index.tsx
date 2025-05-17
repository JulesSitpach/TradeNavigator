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

// Country lists organized by region with CPTPP indicators
const countryGroups = {
  'ASIA-PACIFIC REGION': [
    { label: "Japan - CPTPP member", value: "jp", region: "ASIA-PACIFIC REGION", isCPTPP: true },
    { label: "South Korea", value: "kr", region: "ASIA-PACIFIC REGION", isCPTPP: false },
    { label: "China", value: "cn", region: "ASIA-PACIFIC REGION", isCPTPP: false },
    { label: "Australia - CPTPP member", value: "au", region: "ASIA-PACIFIC REGION", isCPTPP: true },
    { label: "New Zealand - CPTPP member", value: "nz", region: "ASIA-PACIFIC REGION", isCPTPP: true },
    { label: "Singapore - CPTPP member", value: "sg", region: "ASIA-PACIFIC REGION", isCPTPP: true },
    { label: "Malaysia - CPTPP member", value: "my", region: "ASIA-PACIFIC REGION", isCPTPP: true },
    { label: "Vietnam - CPTPP member", value: "vn", region: "ASIA-PACIFIC REGION", isCPTPP: true },
    { label: "Indonesia", value: "id", region: "ASIA-PACIFIC REGION", isCPTPP: false },
    { label: "Thailand", value: "th", region: "ASIA-PACIFIC REGION", isCPTPP: false },
    { label: "Philippines", value: "ph", region: "ASIA-PACIFIC REGION", isCPTPP: false }
  ],
  'NORTH AMERICA': [
    { label: "United States", value: "us", region: "NORTH AMERICA", isCPTPP: false },
    { label: "Canada - CPTPP member", value: "ca", region: "NORTH AMERICA", isCPTPP: true },
    { label: "Mexico - CPTPP member", value: "mx", region: "NORTH AMERICA", isCPTPP: true }
  ],
  'EUROPE': [
    { label: "United Kingdom", value: "gb", region: "EUROPE", isCPTPP: false },
    { label: "Germany", value: "de", region: "EUROPE", isCPTPP: false },
    { label: "France", value: "fr", region: "EUROPE", isCPTPP: false },
    { label: "Italy", value: "it", region: "EUROPE", isCPTPP: false },
    { label: "Spain", value: "es", region: "EUROPE", isCPTPP: false },
    { label: "Netherlands", value: "nl", region: "EUROPE", isCPTPP: false },
    { label: "Belgium", value: "be", region: "EUROPE", isCPTPP: false },
    { label: "Sweden", value: "se", region: "EUROPE", isCPTPP: false }
  ],
  'LATIN AMERICA': [
    { label: "Brazil", value: "br", region: "LATIN AMERICA", isCPTPP: false },
    { label: "Argentina", value: "ar", region: "LATIN AMERICA", isCPTPP: false },
    { label: "Chile - CPTPP member", value: "cl", region: "LATIN AMERICA", isCPTPP: true },
    { label: "Colombia", value: "co", region: "LATIN AMERICA", isCPTPP: false },
    { label: "Peru - CPTPP member", value: "pe", region: "LATIN AMERICA", isCPTPP: true }
  ],
  'MIDDLE EAST & AFRICA': [
    { label: "United Arab Emirates", value: "ae", region: "MIDDLE EAST & AFRICA", isCPTPP: false },
    { label: "Saudi Arabia", value: "sa", region: "MIDDLE EAST & AFRICA", isCPTPP: false },
    { label: "South Africa", value: "za", region: "MIDDLE EAST & AFRICA", isCPTPP: false },
    { label: "Nigeria", value: "ng", region: "MIDDLE EAST & AFRICA", isCPTPP: false },
    { label: "Egypt", value: "eg", region: "MIDDLE EAST & AFRICA", isCPTPP: false },
  ]
};

const MainCostBreakdown = () => {
  // Form state management
  const [formValues, setFormValues] = useState({
    productDescription: "",
    productCategory: "",
    hsCode: "8471.30", // Default value for demo
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
  const [results, setResults] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [isHSCodeDialogOpen, setIsHSCodeDialogOpen] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [isModifyingAnalysis, setIsModifyingAnalysis] = useState(null);
  const [modificationInfo, setModificationInfo] = useState(null);
  
  // Context and hooks
  const { toast } = useToast();
  
  // AnalysisContext - safely access it
  const analysisContext = useContext(AnalysisContext);
  
  // Load saved analyses from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('savedCostBreakdowns');
    if (savedData) {
      try {
        setSavedAnalyses(JSON.parse(savedData));
      } catch (e) {
        console.error("Error loading saved analyses:", e);
      }
    }
  }, []);
  
  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormValues({
      ...formValues,
      [field]: value
    });
  };
  
  // Handle HS code selection from the assistant
  const handleHSCodeSelect = (code) => {
    setFormValues({
      ...formValues,
      hsCode: code
    });
    setIsHSCodeDialogOpen(false);
    toast({
      title: "HS Code selected",
      description: `HS Code ${code} has been applied to your product.`,
    });
  };
  
  // Calculate cost breakdown
  const calculateCostBreakdown = () => {
    // Here you would call an API to get the real calculation
    // For now we'll use a mock calculation
    const totalValue = parseFloat(formValues.productValue) || 0;
    const quantity = parseFloat(formValues.quantity) || 1;
    
    // Base calculation
    const dutyRate = 0.045; // 4.5%
    const dutyAmount = totalValue * dutyRate;
    
    const vatRate = 0.20; // 20%
    const vatAmount = (totalValue + dutyAmount) * vatRate;
    
    const freightCost = totalValue * 0.15; // 15% of product value
    const insuranceCost = totalValue * 0.02; // 2% of product value
    const handlingFees = 75; // Flat fee
    const customsClearance = 150; // Flat fee
    
    const total = totalValue + dutyAmount + vatAmount + freightCost + insuranceCost + handlingFees + customsClearance;
    
    // Build result object
    const costBreakdown = {
      totalCost: total,
      components: [
        { name: "Product Value", value: totalValue },
        { name: "Import Duty", value: dutyAmount },
        { name: "VAT/Sales Tax", value: vatAmount },
        { name: "Freight Cost", value: freightCost },
        { name: "Insurance", value: insuranceCost },
        { name: "Handling Fees", value: handlingFees },
        { name: "Customs Clearance", value: customsClearance }
      ]
    };
    
    setResults(costBreakdown);
    
    // Update the global analysis context if available
    if (analysisContext?.setCurrentAnalysis) {
      analysisContext.setCurrentAnalysis({
        totalCost: total,
        components: costBreakdown.components.map(c => ({
          name: c.name,
          amount: c.value,
          percentage: (c.value / total) * 100
        })),
        productDetails: {
          description: formValues.productDescription,
          hsCode: formValues.hsCode,
          category: formValues.productCategory,
          originCountry: formValues.originCountry,
          destinationCountry: formValues.destinationCountry,
          productValue: parseFloat(formValues.productValue) || 0,
          weight: parseFloat(formValues.weight) || 0,
          transportMode: formValues.transportMode,
          quantity: parseFloat(formValues.quantity) || 1,
          dimensions: {
            length: parseFloat(formValues.length) || 0,
            width: parseFloat(formValues.width) || 0,
            height: parseFloat(formValues.height) || 0
          }
        },
        timestamp: new Date()
      });
    }
    
    if (isModifying && isModifyingAnalysis) {
      toast({
        title: "Analysis Updated",
        description: "Your modifications have been applied to the analysis.",
      });
    } else {
      toast({
        title: "Analysis Complete",
        description: "Your cost breakdown has been calculated.",
      });
    }
  };
  
  // Save the current analysis
  const saveAnalysis = () => {
    if (!saveName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for your analysis.",
        variant: "destructive"
      });
      return;
    }
    
    const newAnalysis = {
      id: isModifying ? isModifyingAnalysis.id : `analysis-${Date.now()}`,
      name: saveName,
      date: new Date().toISOString(),
      formValues: { ...formValues },
      results: { ...results }
    };
    
    let updatedAnalyses = [];
    
    if (isModifying) {
      // Replace the existing analysis
      updatedAnalyses = savedAnalyses.map(analysis => 
        analysis.id === isModifyingAnalysis.id ? newAnalysis : analysis
      );
    } else {
      // Add new analysis
      updatedAnalyses = [...savedAnalyses, newAnalysis];
    }
    
    setSavedAnalyses(updatedAnalyses);
    localStorage.setItem('savedCostBreakdowns', JSON.stringify(updatedAnalyses));
    
    setSaveDialogOpen(false);
    setSaveName("");
    
    if (isModifying) {
      setIsModifying(false);
      setIsModifyingAnalysis(null);
      setModificationInfo(null);
      toast({
        title: "Analysis Updated",
        description: `The analysis has been updated as "${newAnalysis.name}".`,
      });
    } else {
      toast({
        title: "Analysis Saved",
        description: `Your analysis has been saved as "${newAnalysis.name}".`,
      });
    }
  };
  
  // Load a saved analysis
  const loadAnalysis = (analysis) => {
    setFormValues(analysis.formValues);
    setResults(analysis.results);
    
    toast({
      title: "Analysis Loaded",
      description: `Analysis "${analysis.name}" has been loaded.`,
    });
    
    // Update the global analysis context if available
    if (analysisContext?.setCurrentAnalysis) {
      const total = analysis.results.totalCost;
      
      analysisContext.setCurrentAnalysis({
        totalCost: total,
        components: analysis.results.components.map(c => ({
          name: c.name,
          amount: c.value,
          percentage: (c.value / total) * 100
        })),
        productDetails: {
          description: analysis.formValues.productDescription,
          hsCode: analysis.formValues.hsCode,
          category: analysis.formValues.productCategory,
          originCountry: analysis.formValues.originCountry,
          destinationCountry: analysis.formValues.destinationCountry,
          productValue: parseFloat(analysis.formValues.productValue) || 0,
          weight: parseFloat(analysis.formValues.weight) || 0,
          transportMode: analysis.formValues.transportMode,
          quantity: parseFloat(analysis.formValues.quantity) || 1,
          dimensions: {
            length: parseFloat(analysis.formValues.length) || 0,
            width: parseFloat(analysis.formValues.width) || 0,
            height: parseFloat(analysis.formValues.height) || 0
          }
        },
        timestamp: new Date(),
        name: analysis.name
      });
    }
  };
  
  // Start modifying a saved analysis
  const modifyAnalysis = (analysis) => {
    setFormValues(analysis.formValues);
    setResults(analysis.results);
    setIsModifying(true);
    setIsModifyingAnalysis(analysis);
    setModificationInfo({
      name: analysis.name,
      date: new Date(analysis.date).toLocaleDateString()
    });
    
    toast({
      title: "Modifying Analysis",
      description: `You are now modifying "${analysis.name}". Make your changes and click Recalculate.`,
    });
  };
  
  // Delete a saved analysis
  const deleteAnalysis = (id) => {
    const updatedAnalyses = savedAnalyses.filter(analysis => analysis.id !== id);
    setSavedAnalyses(updatedAnalyses);
    localStorage.setItem('savedCostBreakdowns', JSON.stringify(updatedAnalyses));
    
    toast({
      title: "Analysis Deleted",
      description: "The analysis has been removed from your saved analyses.",
    });
    
    // If we were modifying this analysis, reset the modification state
    if (isModifying && isModifyingAnalysis?.id === id) {
      setIsModifying(false);
      setIsModifyingAnalysis(null);
      setModificationInfo(null);
      setFormValues({
        productDescription: "",
        productCategory: "",
        hsCode: "8471.30",
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
    }
  };
  
  // Cancel modification mode
  const cancelModification = () => {
    setIsModifying(false);
    setIsModifyingAnalysis(null);
    setModificationInfo(null);
    setFormValues({
      productDescription: "",
      productCategory: "",
      hsCode: "8471.30",
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
    
    toast({
      title: "Modification Cancelled",
      description: "You've returned to creating a new analysis.",
    });
  };
  
  return (
    <div className="container mx-auto p-4">
      <PageHeader 
        title="Trade Cost Breakdown"
        description="Calculate all costs associated with importing or exporting your products"
      />
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column - Input form */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {isModifying && modificationInfo && (
                <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4">
                  <p className="text-orange-700 font-medium">
                    Modifying Analysis: {modificationInfo.name} (created {modificationInfo.date})
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-2"
                      onClick={cancelModification}
                    >
                      <RotateCcw className="mr-1 h-4 w-4" />
                      Cancel
                    </Button>
                  </p>
                </div>
              )}
              
              <h2 className="text-2xl font-bold mb-4">Product Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="space-y-2">
                  <Label htmlFor="product-description">Product Description</Label>
                  <Input 
                    id="product-description" 
                    placeholder="High-performance laptops, 13-inch display, 32GB RAM, 1TB SSD" 
                    value={formValues.productDescription}
                    onChange={(e) => handleInputChange('productDescription', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="product-category">
                    Product Category
                  </Label>
                  <Select 
                    value={formValues.productCategory} 
                    onValueChange={(value) => handleInputChange('productCategory', value)}
                  >
                    <SelectTrigger id="product-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="clothing">Clothing & Apparel</SelectItem>
                      <SelectItem value="automotive">Automotive Parts</SelectItem>
                      <SelectItem value="food">Food & Beverages</SelectItem>
                      <SelectItem value="chemicals">Chemicals</SelectItem>
                      <SelectItem value="medical">Medical Supplies</SelectItem>
                      <SelectItem value="toys">Toys & Games</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="hs-code">HS Code</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => setIsHSCodeDialogOpen(true)}
                    >
                      <Search className="mr-1 h-3 w-3" />
                      Find Code
                    </Button>
                  </div>
                  <Input 
                    id="hs-code" 
                    placeholder="e.g., 8471.30" 
                    value={formValues.hsCode}
                    onChange={(e) => handleInputChange('hsCode', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="origin-country">Origin Country</Label>
                  <Select 
                    value={formValues.originCountry} 
                    onValueChange={(value) => handleInputChange('originCountry', value)}
                  >
                    <SelectTrigger id="origin-country">
                      <SelectValue placeholder="Select origin country" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(countryGroups).map(([region, countries]) => (
                        <div key={region}>
                          <div className="px-2 py-1.5 text-sm font-semibold bg-slate-100">{region}</div>
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="destination-country">Destination Country</Label>
                  <Select 
                    value={formValues.destinationCountry} 
                    onValueChange={(value) => handleInputChange('destinationCountry', value)}
                  >
                    <SelectTrigger id="destination-country">
                      <SelectValue placeholder="Select destination country" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(countryGroups).map(([region, countries]) => (
                        <div key={region}>
                          <div className="px-2 py-1.5 text-sm font-semibold bg-slate-100">{region}</div>
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="product-value">Product Value</Label>
                  <div className="flex">
                    <Select 
                      value={currency} 
                      onValueChange={setCurrency}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="JPY">JPY</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      id="product-value" 
                      className="flex-1 ml-2" 
                      placeholder="5000"
                      value={formValues.productValue}
                      onChange={(e) => handleInputChange('productValue', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input 
                    id="quantity" 
                    placeholder="e.g., 100" 
                    value={formValues.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                  />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-4">Shipping Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="transport-mode">Transport Mode</Label>
                  <Select 
                    value={formValues.transportMode} 
                    onValueChange={(value) => handleInputChange('transportMode', value)}
                  >
                    <SelectTrigger id="transport-mode">
                      <SelectValue placeholder="Select transport mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="air">Air Freight</SelectItem>
                      <SelectItem value="sea">Sea Freight</SelectItem>
                      <SelectItem value="road">Road Transport</SelectItem>
                      <SelectItem value="rail">Rail Freight</SelectItem>
                      <SelectItem value="multimodal">Multimodal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shipment-type">Shipment Type</Label>
                  <Select 
                    value={formValues.shipmentType} 
                    onValueChange={(value) => handleInputChange('shipmentType', value)}
                  >
                    <SelectTrigger id="shipment-type">
                      <SelectValue placeholder="Select shipment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fcl">Full Container Load (FCL)</SelectItem>
                      <SelectItem value="lcl">Less than Container Load (LCL)</SelectItem>
                      <SelectItem value="bulk">Bulk Cargo</SelectItem>
                      <SelectItem value="breakbulk">Break Bulk</SelectItem>
                      <SelectItem value="roro">Roll-on/Roll-off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="package-type">Package Type</Label>
                  <Select 
                    value={formValues.packageType} 
                    onValueChange={(value) => handleInputChange('packageType', value)}
                  >
                    <SelectTrigger id="package-type">
                      <SelectValue placeholder="Select package type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pallet">Palletized</SelectItem>
                      <SelectItem value="carton">Cartons</SelectItem>
                      <SelectItem value="crate">Crates</SelectItem>
                      <SelectItem value="drum">Drums</SelectItem>
                      <SelectItem value="bag">Bags</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <div className="flex">
                    <Input 
                      id="weight" 
                      className="flex-1" 
                      placeholder="e.g., 500"
                      value={formValues.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                    />
                    <Select 
                      value={weightUnit} 
                      onValueChange={setWeightUnit}
                    >
                      <SelectTrigger className="w-20 ml-2">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="lb">lb</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Dimensions (Length × Width × Height)</Label>
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="L" 
                      value={formValues.length}
                      onChange={(e) => handleInputChange('length', e.target.value)}
                    />
                    <Input 
                      placeholder="W" 
                      value={formValues.width}
                      onChange={(e) => handleInputChange('width', e.target.value)}
                    />
                    <Input 
                      placeholder="H" 
                      value={formValues.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                    />
                    <Select 
                      value={dimensionUnit} 
                      onValueChange={setDimensionUnit}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                size="lg" 
                onClick={calculateCostBreakdown}
              >
                <Calculator className="mr-2 h-5 w-5" />
                {isModifying ? "Recalculate Cost Breakdown" : "Calculate Cost Breakdown"}
              </Button>
            </CardContent>
          </Card>
        </div>
      
        {/* Right column - Results and saved analyses */}
        <div>
          {/* Results box */}
          {results && (
            <Card className="mb-4">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Cost Breakdown</h2>
                
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-medium">Total Landed Cost:</span>
                    <span className="text-2xl font-bold">{currency} {results.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formValues.originCountry && formValues.destinationCountry && (
                      <>From {formValues.originCountry.toUpperCase()} to {formValues.destinationCountry.toUpperCase()}</>
                    )}
                    {formValues.quantity && <> • {formValues.quantity} units</>}
                    {formValues.transportMode && <> • via {formValues.transportMode}</>}
                  </p>
                </div>
                
                <h3 className="font-semibold mb-2">Cost Components</h3>
                <div className="space-y-2">
                  {results.components.map((component, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{component.name}:</span>
                      <span className="font-medium">{currency} {component.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex space-x-2">
                  <Button 
                    onClick={() => setSaveDialogOpen(true)}
                    className="flex-1"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isModifying ? "Update Analysis" : "Save Analysis"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Saved analyses */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Saved Analyses</h2>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-4">
                  {savedAnalyses.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No saved analyses yet. Calculate and save an analysis to see it here.</p>
                  ) : (
                    savedAnalyses.map((analysis) => (
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
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => modifyAnalysis(analysis)}
                          >
                            Modify
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* HS Code Assistant Dialog */}
      <Dialog open={isHSCodeDialogOpen} onOpenChange={setIsHSCodeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>HS Code Assistant</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <HSCodeAssistant 
              onSelect={handleHSCodeSelect}
              category={formValues.productCategory}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Save Analysis Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isModifying ? "Update Analysis" : "Save Analysis"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="analysis-name">Analysis Name</Label>
              <Input 
                id="analysis-name" 
                placeholder="e.g., Laptop Import from China - May 2025" 
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveAnalysis}>
              {isModifying ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MainCostBreakdown;