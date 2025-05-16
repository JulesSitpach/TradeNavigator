import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/common/PageHeader";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, AlertCircle } from "lucide-react";
import "../../styles/form-styles.css";

const ProductInfoForm = () => {
  // State for tracking completed fields
  const [completedFields, setCompletedFields] = useState<Record<string, boolean>>({});
  const [formValues, setFormValues] = useState({
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
    height: ""
  });

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
  };

  // Function to look up HS code using AI Copilot
  const [isLookingUpHsCode, setIsLookingUpHsCode] = useState(false);
  const [copilotSuggestions, setCopilotSuggestions] = useState<Array<{code: string, description: string, confidence: number}>>([]);
  const [showCopilotModal, setShowCopilotModal] = useState(false);

  const handleHsCodeLookup = () => {
    if (!formValues.productDescription || !formValues.productCategory) {
      alert("Please enter a product description and select a category first");
      return;
    }

    setIsLookingUpHsCode(true);
    
    // In a real implementation, this would call the OpenAI API
    // Simulate API call for now
    setTimeout(() => {
      let suggestions = [];
      
      // Generate relevant suggestions based on category
      if (formValues.productCategory === "textiles") {
        suggestions = [
          { code: "6109.10", description: "T-shirts, singlets and other vests, knitted or crocheted, of cotton", confidence: 0.92 },
          { code: "6104.62", description: "Women's or girls' trousers, overalls, breeches and shorts, knitted or crocheted, of cotton", confidence: 0.78 },
          { code: "6110.20", description: "Sweaters, pullovers, sweatshirts and similar articles, knitted or crocheted, of cotton", confidence: 0.65 }
        ];
      } else if (formValues.productCategory === "electronics") {
        suggestions = [
          { code: "8517.62", description: "Machines for the reception, conversion and transmission or regeneration of voice, images or other data", confidence: 0.94 },
          { code: "8471.30", description: "Portable automatic data processing machines, weighing not more than 10 kg", confidence: 0.87 },
          { code: "8518.30", description: "Headphones and earphones, whether or not combined with a microphone", confidence: 0.72 }
        ];
      } else if (formValues.productCategory === "food") {
        suggestions = [
          { code: "2106.90", description: "Food preparations not elsewhere specified or included", confidence: 0.90 },
          { code: "1806.90", description: "Chocolate and other food preparations containing cocoa", confidence: 0.82 },
          { code: "2202.99", description: "Non-alcoholic beverages, not including fruit or vegetable juices", confidence: 0.74 }
        ];
      } else {
        suggestions = [
          { code: "8479.89", description: "Machines and mechanical appliances having individual functions", confidence: 0.85 },
          { code: "3926.90", description: "Other articles of plastics", confidence: 0.76 },
          { code: "7326.90", description: "Other articles of iron or steel", confidence: 0.67 }
        ];
      }
      
      setCopilotSuggestions(suggestions);
      setShowCopilotModal(true);
      setIsLookingUpHsCode(false);
    }, 1500);
  };
  
  // Handle selecting a suggestion from the AI Copilot
  const handleSelectHsCode = (hsCode: string) => {
    handleInputChange("hsCode", hsCode);
    setShowCopilotModal(false);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Process form submission
    console.log("Form submitted", formValues);
    // Navigate to results page or show analysis
  };

  // AI Copilot dialog component to display HS code suggestions
  const renderAICopilotDialog = () => (
    <Dialog open={showCopilotModal} onOpenChange={setShowCopilotModal}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            AI Copilot HS Code Suggestions
          </DialogTitle>
        </DialogHeader>
        
        <div className="my-6">
          <p className="text-sm text-neutral-500 mb-4">
            Based on your product description and category, here are the most likely HS codes:
          </p>
          
          <div className="space-y-4">
            {copilotSuggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="border rounded-lg p-4 hover:bg-neutral-50 cursor-pointer transition-colors"
                onClick={() => handleSelectHsCode(suggestion.code)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-lg">
                    {suggestion.code}
                  </h3>
                  <Badge className={
                    suggestion.confidence > 0.85 
                      ? "bg-green-100 text-green-800" 
                      : suggestion.confidence > 0.7 
                      ? "bg-yellow-100 text-yellow-800" 
                      : "bg-neutral-100 text-neutral-800"
                  }>
                    {Math.round(suggestion.confidence * 100)}% match
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600">{suggestion.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCopilotModal(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {/* Render the AI Copilot dialog */}
      {renderAICopilotDialog()}
      
      <PageHeader
        title="Product & Shipping Details"
        description="Enter information about your product and shipping requirements"
        actions={[
          {
            label: "Back to Dashboard",
            icon: <FaArrowLeft />,
            href: "/dashboard",
            variant: "outline"
          }
        ]}
      />

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Product Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="product-description">Product Description</Label>
                  <Textarea 
                    id="product-description"
                    placeholder="Enter product description"
                    className={completedFields.productDescription ? "form-input-completed" : "form-input-white"}
                    value={formValues.productDescription}
                    onChange={(e) => handleInputChange("productDescription", e.target.value)}
                  />
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="product-category">Product Category <span className="text-xs text-gray-500">(Select first for better HS code results)</span></Label>
                    <div className={completedFields.productCategory ? "form-select-completed" : "form-select-white"}>
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
                  </div>

                  <div>
                    <Label htmlFor="hs-code">HS Code</Label>
                    <div className="flex">
                      <Input 
                        id="hs-code"
                        placeholder="e.g., 6109.10"
                        className={`flex-1 ${completedFields.hsCode ? "form-input-completed" : "form-input-white"}`}
                        value={formValues.hsCode}
                        onChange={(e) => handleInputChange("hsCode", e.target.value)}
                      />
                      <Button 
                        type="button" 
                        className="ml-2" 
                        variant="outline"
                        onClick={handleHsCodeLookup}
                      >
                        <FaSearch className="mr-1" size={14} />
                        Lookup
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a product description to enable HS code suggestions
                    </p>
                    <p className="text-xs text-blue-600 cursor-pointer mt-1" onClick={handleHsCodeLookup}>
                      Click the pilot icon to see HS code suggestions
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="origin-country">Origin Country</Label>
                  <div className={completedFields.originCountry ? "form-select-completed" : "form-select-white"}>
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

                <div>
                  <Label htmlFor="destination-country">Destination Country</Label>
                  <div className={completedFields.destinationCountry ? "form-select-completed" : "form-select-white"}>
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

                <div>
                  <Label htmlFor="product-value">Product Value (in USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                    <Input 
                      id="product-value"
                      type="number"
                      placeholder="Enter value in USD"
                      className={`pl-7 ${completedFields.productValue ? "form-input-completed" : "form-input-white"}`}
                      value={formValues.productValue}
                      onChange={(e) => handleInputChange("productValue", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input 
                      id="quantity"
                      type="number"
                      placeholder="Enter quantity"
                      className={completedFields.quantity ? "form-input-completed" : "form-input-white"}
                      value={formValues.quantity}
                      onChange={(e) => handleInputChange("quantity", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="transport-mode">Transport Mode</Label>
                    <div className={completedFields.transportMode ? "form-select-completed" : "form-select-white"}>
                      <Select 
                        value={formValues.transportMode} 
                        onValueChange={(value) => handleInputChange("transportMode", value)}
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shipment-type">Shipment Type</Label>
                      <div className={completedFields.shipmentType ? "form-select-completed" : "form-select-white"}>
                        <Select 
                          value={formValues.shipmentType} 
                          onValueChange={(value) => handleInputChange("shipmentType", value)}
                        >
                          <SelectTrigger id="shipment-type">
                            <SelectValue placeholder="Select shipment type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fcl">Full Container Load (FCL)</SelectItem>
                            <SelectItem value="lcl">Less than Container Load (LCL)</SelectItem>
                            <SelectItem value="bulk">Bulk Cargo</SelectItem>
                            <SelectItem value="parcel">Parcel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="package-type">Package Type</Label>
                      <div className={completedFields.packageType ? "form-select-completed" : "form-select-white"}>
                        <Select 
                          value={formValues.packageType} 
                          onValueChange={(value) => handleInputChange("packageType", value)}
                        >
                          <SelectTrigger id="package-type">
                            <SelectValue placeholder="Select package type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="box">Boxes</SelectItem>
                            <SelectItem value="pallet">Pallets</SelectItem>
                            <SelectItem value="container">Container</SelectItem>
                            <SelectItem value="drum">Drums</SelectItem>
                            <SelectItem value="crate">Crates</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <div className="flex">
                      <Input 
                        id="weight"
                        type="number"
                        placeholder="Weight in kg"
                        className={`flex-1 rounded-r-none ${completedFields.weight ? "form-input-completed" : "form-input-white"}`}
                        value={formValues.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                      />
                      <div className="flex">
                        <div className="unit-selector unit-selector-active rounded-l-none py-2 px-3">kg</div>
                        <div className="unit-selector unit-selector-inactive rounded py-2 px-3 ml-1">lb</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Package Dimensions</Label>
                    <div className="dimensions-unit-selector">
                      <div className="unit-selector unit-selector-active">cm</div>
                      <div className="unit-selector unit-selector-inactive">in</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="length">Length (cm)</Label>
                      <Input 
                        id="length"
                        type="number"
                        placeholder="Length"
                        className={completedFields.length ? "form-input-completed" : "form-input-white"}
                        value={formValues.length}
                        onChange={(e) => handleInputChange("length", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="width">Width (cm)</Label>
                      <Input 
                        id="width"
                        type="number"
                        placeholder="Width"
                        className={completedFields.width ? "form-input-completed" : "form-input-white"}
                        value={formValues.width}
                        onChange={(e) => handleInputChange("width", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input 
                        id="height"
                        type="number"
                        placeholder="Height"
                        className={completedFields.height ? "form-input-completed" : "form-input-white"}
                        value={formValues.height}
                        onChange={(e) => handleInputChange("height", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button type="submit">Calculate Cost Analysis</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </>
  );
};

export default ProductInfoForm;