import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/common/PageHeader";
import { 
  CheckCircle, 
  X, 
  Search, 
  AlertCircle, 
  ArrowRight,
  Box,
  Ship,
  Plane
} from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaArrowLeft } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { LanguageContext } from "@/contexts/LanguageContext";

// Import the custom styles
import "../../styles/cost-breakdown-form.css";

const NewCostAnalysisForm = () => {
  const { t } = useContext(LanguageContext);
  const [formValues, setFormValues] = useState({
    productName: "",
    productDescription: "",
    productCategory: "",
    hsCode: "",
    originCountry: "",
    destinationCountry: "",
    productValue: "",
    quantity: "",
    weight: "",
    weightUnit: "kg",
    length: "",
    width: "",
    height: "",
    dimensionUnit: "cm",
    transportMode: "",
    incoterm: "",
    insurance: "yes",
    insuranceValue: ""
  });

  const [completedFields, setCompletedFields] = useState<Record<string, boolean>>({});
  const [hsCodeValidationStatus, setHsCodeValidationStatus] = useState<"valid" | "invalid" | null>(null);
  const [isLookingUpHsCode, setIsLookingUpHsCode] = useState(false);

  // Function to handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormValues({
      ...formValues,
      [field]: value
    });
    
    // Mark field as completed if it has a value
    setCompletedFields({
      ...completedFields,
      [field]: !!value.trim()
    });

    // Handle special cases
    if (field === "hsCode" && value.trim()) {
      validateHsCode(value);
    }

    // Handle insurance value updates
    if (field === "insurance" && value === "no") {
      setFormValues(prev => ({
        ...prev,
        insuranceValue: ""
      }));
    }
  };

  // Function to simulate HS code validation
  const validateHsCode = (code: string) => {
    setTimeout(() => {
      // This is a simplified validation - in a real app, you'd check against actual HS code database
      const isValid = /^\d{4}\.\d{2}$/.test(code);
      setHsCodeValidationStatus(isValid ? "valid" : "invalid");
    }, 500);
  };

  // Function to look up HS code
  const handleHsCodeLookup = () => {
    if (!formValues.productDescription || !formValues.productCategory) {
      alert("Please enter a product description and select a category first");
      return;
    }

    setIsLookingUpHsCode(true);
    
    // Simulate an API call
    setTimeout(() => {
      let hsCode = "";
      
      // Set a demo HS code based on category
      if (formValues.productCategory === "textiles") {
        hsCode = "6109.10";
      } else if (formValues.productCategory === "electronics") {
        hsCode = "8517.62";
      } else if (formValues.productCategory === "food") {
        hsCode = "2106.90";
      } else {
        hsCode = "8479.89";
      }
      
      handleInputChange("hsCode", hsCode);
      setHsCodeValidationStatus("valid");
      setIsLookingUpHsCode(false);
    }, 1200);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", formValues);
    // In a real app, you'd submit this data to your backend
    alert("Analysis request submitted!");
  };

  return (
    <div className="container mx-auto px-4 pb-12">
      <PageHeader
        title={t("dashboard.costBreakdown.newAnalysis")}
        description={t("dashboard.costBreakdown.startNewAnalysisDescription")}
        actions={[
          {
            label: t("common.buttonLabels.back"),
            icon: <FaArrowLeft />,
            href: "/dashboard/cost-breakdown",
            variant: "outline"
          }
        ]}
      />

      <div className="cost-form-container">
        <form onSubmit={handleSubmit}>
          {/* Product Information Section */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Product Information</h2>
            </div>
            <div className="section-content">
              <div className="form-grid">
                <div className="col-span-12 md:col-span-6 field-group">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input 
                    id="product-name"
                    placeholder="Enter product name"
                    className={completedFields.productName ? "form-input-filled" : ""}
                    value={formValues.productName}
                    onChange={(e) => handleInputChange("productName", e.target.value)}
                  />
                </div>

                <div className="col-span-12 md:col-span-6 field-group">
                  <Label htmlFor="product-category">Product Category</Label>
                  <div className={completedFields.productCategory ? "form-select-filled" : ""}>
                    <Select 
                      value={formValues.productCategory} 
                      onValueChange={(value) => handleInputChange("productCategory", value)}
                    >
                      <SelectTrigger id="product-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="textiles">Textiles & Garments</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="food">Food & Beverages</SelectItem>
                        <SelectItem value="cosmetics">Cosmetics</SelectItem>
                        <SelectItem value="machinery">Machinery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="helper-text">Select category first for better HS code suggestions</p>
                </div>

                <div className="col-span-12 field-group">
                  <Label htmlFor="product-description">Product Description</Label>
                  <Textarea 
                    id="product-description" 
                    placeholder="Enter detailed product description"
                    className={completedFields.productDescription ? "form-input-filled" : ""}
                    value={formValues.productDescription}
                    onChange={(e) => handleInputChange("productDescription", e.target.value)}
                    rows={3}
                  />
                  <p className="helper-text">Provide specific details to get more accurate cost analysis</p>
                </div>

                <div className="col-span-12 md:col-span-6 field-group">
                  <Label htmlFor="hs-code">HS Code</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input 
                        id="hs-code"
                        placeholder="e.g., 6109.10"
                        className={completedFields.hsCode ? "form-input-filled" : ""}
                        value={formValues.hsCode}
                        onChange={(e) => handleInputChange("hsCode", e.target.value)}
                      />
                      {hsCodeValidationStatus && (
                        <div className={`validation-indicator ${hsCodeValidationStatus}`}>
                          {hsCodeValidationStatus === "valid" ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </div>
                    <Button 
                      type="button"
                      variant="outline"
                      className="lookup-button"
                      onClick={handleHsCodeLookup}
                      disabled={isLookingUpHsCode}
                    >
                      {isLookingUpHsCode ? (
                        <div className="flex items-center">
                          <span className="animate-spin mr-1">
                            <AlertCircle className="h-4 w-4" />
                          </span>
                          <span>Looking up...</span>
                        </div>
                      ) : (
                        <>
                          <Search className="h-4 w-4" />
                          AI Lookup
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="helper-text">Harmonized System code used for customs classification</p>
                </div>

                <div className="col-span-12 md:col-span-6 field-group">
                  <Label htmlFor="product-value">Product Value (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input 
                      id="product-value" 
                      type="number" 
                      placeholder="Enter value in USD"
                      className={`pl-7 ${completedFields.productValue ? "form-input-filled" : ""}`}
                      value={formValues.productValue}
                      onChange={(e) => handleInputChange("productValue", e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-span-12 md:col-span-6 field-group">
                  <Label htmlFor="origin-country">Origin Country</Label>
                  <div className={completedFields.originCountry ? "form-select-filled" : ""}>
                    <Select 
                      value={formValues.originCountry} 
                      onValueChange={(value) => handleInputChange("originCountry", value)}
                    >
                      <SelectTrigger id="origin-country">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Major Manufacturing Origins */}
                        <SelectItem value="cn">China</SelectItem>
                        <SelectItem value="vn">Vietnam</SelectItem>
                        <SelectItem value="in">India</SelectItem>
                        <SelectItem value="mx">Mexico</SelectItem>
                        <SelectItem value="my">Malaysia</SelectItem>
                        <SelectItem value="th">Thailand</SelectItem>
                        <SelectItem value="id">Indonesia</SelectItem>
                        <SelectItem value="bd">Bangladesh</SelectItem>
                        <SelectItem value="kr">South Korea</SelectItem>
                        <SelectItem value="tw">Taiwan</SelectItem>
                        <SelectItem value="jp">Japan</SelectItem>
                        
                        {/* South American Origins */}
                        <SelectItem value="br">Brazil</SelectItem>
                        <SelectItem value="co">Colombia</SelectItem>
                        <SelectItem value="cl">Chile</SelectItem>
                        <SelectItem value="ar">Argentina</SelectItem>
                        <SelectItem value="pe">Peru</SelectItem>
                        
                        {/* Central American Origins */}
                        <SelectItem value="pa">Panama</SelectItem>
                        <SelectItem value="cr">Costa Rica</SelectItem>
                        <SelectItem value="do">Dominican Republic</SelectItem>
                        <SelectItem value="gt">Guatemala</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-6 field-group">
                  <Label htmlFor="destination-country">Destination Country</Label>
                  <div className={completedFields.destinationCountry ? "form-select-filled" : ""}>
                    <Select 
                      value={formValues.destinationCountry} 
                      onValueChange={(value) => handleInputChange("destinationCountry", value)}
                    >
                      <SelectTrigger id="destination-country">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Major Import Destinations */}
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="eu">European Union</SelectItem>
                        <SelectItem value="de">Germany</SelectItem>
                        <SelectItem value="fr">France</SelectItem>
                        <SelectItem value="it">Italy</SelectItem>
                        <SelectItem value="nl">Netherlands</SelectItem>
                        <SelectItem value="es">Spain</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="jp">Japan</SelectItem>
                        <SelectItem value="kr">South Korea</SelectItem>
                        <SelectItem value="sg">Singapore</SelectItem>
                        <SelectItem value="br">Brazil</SelectItem>
                        <SelectItem value="ae">UAE</SelectItem>
                        <SelectItem value="sa">Saudi Arabia</SelectItem>
                        
                        {/* South American Destinations */}
                        <SelectItem value="co">Colombia</SelectItem>
                        <SelectItem value="cl">Chile</SelectItem>
                        <SelectItem value="ar">Argentina</SelectItem>
                        <SelectItem value="pe">Peru</SelectItem>
                        
                        {/* Central American Destinations */}
                        <SelectItem value="mx">Mexico</SelectItem>
                        <SelectItem value="pa">Panama</SelectItem>
                        <SelectItem value="cr">Costa Rica</SelectItem>
                        <SelectItem value="do">Dominican Republic</SelectItem>
                        <SelectItem value="gt">Guatemala</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information Section */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Shipping Details</h2>
            </div>
            <div className="section-content">
              <div className="form-grid">
                <div className="col-span-12 md:col-span-6 field-group">
                  <Label htmlFor="transport-mode">Transport Mode</Label>
                  <div className={completedFields.transportMode ? "form-select-filled" : ""}>
                    <Select 
                      value={formValues.transportMode} 
                      onValueChange={(value) => handleInputChange("transportMode", value)}
                    >
                      <SelectTrigger id="transport-mode">
                        <SelectValue placeholder="Select transport mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="air">
                          <div className="flex items-center">
                            <Plane className="mr-2 h-4 w-4" />
                            Air Freight
                          </div>
                        </SelectItem>
                        <SelectItem value="sea">
                          <div className="flex items-center">
                            <Ship className="mr-2 h-4 w-4" />
                            Sea Freight
                          </div>
                        </SelectItem>
                        <SelectItem value="road">Road</SelectItem>
                        <SelectItem value="rail">Rail</SelectItem>
                        <SelectItem value="multimodal">Multimodal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-6 field-group">
                  <Label htmlFor="incoterm">Incoterm</Label>
                  <div className={completedFields.incoterm ? "form-select-filled" : ""}>
                    <Select 
                      value={formValues.incoterm} 
                      onValueChange={(value) => handleInputChange("incoterm", value)}
                    >
                      <SelectTrigger id="incoterm">
                        <SelectValue placeholder="Select Incoterm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                        <SelectItem value="FCA">FCA - Free Carrier</SelectItem>
                        <SelectItem value="FOB">FOB - Free on Board</SelectItem>
                        <SelectItem value="CIF">CIF - Cost, Insurance & Freight</SelectItem>
                        <SelectItem value="DAP">DAP - Delivered at Place</SelectItem>
                        <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="helper-text">International Commercial Terms define seller/buyer responsibilities</p>
                </div>

                <div className="col-span-12 md:col-span-6 field-group">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    placeholder="Number of items"
                    className={completedFields.quantity ? "form-input-filled" : ""}
                    value={formValues.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                  />
                </div>

                <div className="col-span-12 md:col-span-6 field-group">
                  <Label htmlFor="weight">Weight</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="weight" 
                      type="number" 
                      placeholder="Enter weight"
                      className={`flex-1 ${completedFields.weight ? "form-input-filled" : ""}`}
                      value={formValues.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                    />
                    <div className="unit-toggle">
                      <button 
                        type="button"
                        className={`unit-toggle-button ${formValues.weightUnit === 'kg' ? 'active' : ''}`}
                        onClick={() => handleInputChange("weightUnit", "kg")}
                      >
                        kg
                      </button>
                      <button 
                        type="button"
                        className={`unit-toggle-button ${formValues.weightUnit === 'lb' ? 'active' : ''}`}
                        onClick={() => handleInputChange("weightUnit", "lb")}
                      >
                        lb
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 field-group">
                  <Label>Dimensions</Label>
                  <div className="dimensions-container">
                    <div className="dimension-field">
                      <Input 
                        placeholder="Length"
                        type="number"
                        className={completedFields.length ? "form-input-filled" : ""}
                        value={formValues.length}
                        onChange={(e) => handleInputChange("length", e.target.value)}
                      />
                    </div>
                    <div className="dimension-field">
                      <Input 
                        placeholder="Width"
                        type="number"
                        className={completedFields.width ? "form-input-filled" : ""}
                        value={formValues.width}
                        onChange={(e) => handleInputChange("width", e.target.value)}
                      />
                    </div>
                    <div className="dimension-field">
                      <Input 
                        placeholder="Height"
                        type="number"
                        className={completedFields.height ? "form-input-filled" : ""}
                        value={formValues.height}
                        onChange={(e) => handleInputChange("height", e.target.value)}
                      />
                    </div>
                    <div className="unit-toggle">
                      <button 
                        type="button"
                        className={`unit-toggle-button ${formValues.dimensionUnit === 'cm' ? 'active' : ''}`}
                        onClick={() => handleInputChange("dimensionUnit", "cm")}
                      >
                        cm
                      </button>
                      <button 
                        type="button"
                        className={`unit-toggle-button ${formValues.dimensionUnit === 'in' ? 'active' : ''}`}
                        onClick={() => handleInputChange("dimensionUnit", "in")}
                      >
                        in
                      </button>
                    </div>
                  </div>
                  <p className="helper-text">Package dimensions - Length × Width × Height</p>
                </div>

                <div className="col-span-12 md:col-span-6 field-group">
                  <Label htmlFor="insurance">Insurance</Label>
                  <div className={completedFields.insurance ? "form-select-filled" : ""}>
                    <Select 
                      value={formValues.insurance} 
                      onValueChange={(value) => handleInputChange("insurance", value)}
                    >
                      <SelectTrigger id="insurance">
                        <SelectValue placeholder="Insurance required?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes, include insurance</SelectItem>
                        <SelectItem value="no">No insurance needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formValues.insurance === "yes" && (
                  <div className="col-span-12 md:col-span-6 field-group">
                    <Label htmlFor="insurance-value">Insurance Value (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input 
                        id="insurance-value" 
                        type="number" 
                        placeholder="Enter insurance value"
                        className={`pl-7 ${completedFields.insuranceValue ? "form-input-filled" : ""}`}
                        value={formValues.insuranceValue}
                        onChange={(e) => handleInputChange("insuranceValue", e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <Button type="button" variant="outline" className="action-button secondary">
              Save as Draft
            </Button>
            <Button type="submit" className="action-button">
              Calculate Cost Analysis
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCostAnalysisForm;