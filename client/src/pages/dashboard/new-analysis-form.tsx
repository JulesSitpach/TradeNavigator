import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import "../../components/ui/custom-form-styles.css";

// This component matches the design from the screenshot, with white inputs that turn blue when completed
const NewAnalysisForm = () => {
  // State for tracking completed form fields
  const [completedFields, setCompletedFields] = useState<Record<string, boolean>>({});
  const [formValues, setFormValues] = useState({
    productDescription: "",
    hsCode: "",
    originCountry: "",
    destinationCountry: "",
    productValue: "",
    productCategory: "",
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Product & Shipping Details</h2>
        <p className="text-sm text-gray-500">Enter information about your product and shipping requirements</p>
      </div>

      {/* Product Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <Label htmlFor="product-description">Product Description</Label>
                <Textarea 
                  id="product-description"
                  placeholder="Enter product description"
                  className={completedFields.productDescription ? "input-field-completed" : "input-field-white"}
                  value={formValues.productDescription}
                  onChange={(e) => handleInputChange("productDescription", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="hs-code">HS Code</Label>
                <div className="relative">
                  <Input 
                    id="hs-code"
                    placeholder="e.g., 6109.10"
                    className={completedFields.hsCode ? "input-field-completed" : "input-field-white"}
                    value={formValues.hsCode}
                    onChange={(e) => handleInputChange("hsCode", e.target.value)}
                  />
                </div>
                <div className="mt-1">
                  <p className="text-xs text-gray-500">Enter a product description to enable HS code suggestions</p>
                  <p className="text-xs text-blue-600 cursor-pointer">Click the pilot icon to see HS code suggestions</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="product-category">Product Category <span className="text-xs text-gray-500">(Select first for better HS code results)</span></Label>
                <Select 
                  value={formValues.productCategory} 
                  onValueChange={(value) => handleInputChange("productCategory", value)}
                >
                  <SelectTrigger 
                    id="product-category" 
                    className={completedFields.productCategory ? "select-trigger-completed" : "select-trigger-white"}
                  >
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

              <div>
                <Label htmlFor="origin-country">Origin Country</Label>
                <Select 
                  value={formValues.originCountry} 
                  onValueChange={(value) => handleInputChange("originCountry", value)}
                >
                  <SelectTrigger 
                    id="origin-country" 
                    className={completedFields.originCountry ? "select-trigger-completed" : "select-trigger-white"}
                  >
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cn">China</SelectItem>
                    <SelectItem value="in">India</SelectItem>
                    <SelectItem value="vn">Vietnam</SelectItem>
                    <SelectItem value="bd">Bangladesh</SelectItem>
                    <SelectItem value="th">Thailand</SelectItem>
                    <SelectItem value="id">Indonesia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="destination-country">Destination Country</Label>
                  <Select 
                    value={formValues.destinationCountry} 
                    onValueChange={(value) => handleInputChange("destinationCountry", value)}
                  >
                    <SelectTrigger 
                      id="destination-country" 
                      className={completedFields.destinationCountry ? "select-trigger-completed" : "select-trigger-white"}
                    >
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="eu">European Union</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="jp">Japan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="product-value">Product Value (in USD)</Label>
                  <Input 
                    id="product-value"
                    type="number"
                    placeholder="Enter value in USD"
                    className={completedFields.productValue ? "input-field-completed" : "input-field-white"}
                    value={formValues.productValue}
                    onChange={(e) => handleInputChange("productValue", e.target.value)}
                  />
                </div>
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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input 
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  className={completedFields.quantity ? "input-field-completed" : "input-field-white"}
                  value={formValues.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="transport-mode">Transport Mode</Label>
                <Select 
                  value={formValues.transportMode} 
                  onValueChange={(value) => handleInputChange("transportMode", value)}
                >
                  <SelectTrigger 
                    id="transport-mode" 
                    className={completedFields.transportMode ? "select-trigger-completed" : "select-trigger-white"}
                  >
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipment-type">Shipment Type</Label>
                  <Select 
                    value={formValues.shipmentType} 
                    onValueChange={(value) => handleInputChange("shipmentType", value)}
                  >
                    <SelectTrigger 
                      id="shipment-type" 
                      className={completedFields.shipmentType ? "select-trigger-completed" : "select-trigger-white"}
                    >
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

                <div>
                  <Label htmlFor="package-type">Package Type</Label>
                  <Select 
                    value={formValues.packageType} 
                    onValueChange={(value) => handleInputChange("packageType", value)}
                  >
                    <SelectTrigger 
                      id="package-type" 
                      className={completedFields.packageType ? "select-trigger-completed" : "select-trigger-white"}
                    >
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

            <div className="space-y-3">
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <div className="flex">
                  <Input 
                    id="weight"
                    type="number"
                    placeholder="Weight in kg"
                    className={`flex-1 rounded-r-none ${completedFields.weight ? "input-field-completed" : "input-field-white"}`}
                    value={formValues.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                  />
                  <div className="flex">
                    <div className="unit-selector-active rounded-l-none py-2 px-3">kg</div>
                    <div className="unit-selector-inactive rounded py-2 px-3 ml-1">lb</div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Package Dimensions</Label>
                <div className="flex gap-2 items-center justify-center w-full">
                  <div className="unit-selector-active py-1 px-2">cm</div>
                  <div className="unit-selector-inactive py-1 px-2">in</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="length">Length (cm)</Label>
                  <Input 
                    id="length"
                    type="number"
                    placeholder="Length in cm"
                    className={completedFields.length ? "input-field-completed" : "input-field-white"}
                    value={formValues.length}
                    onChange={(e) => handleInputChange("length", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="width">Width (cm)</Label>
                  <Input 
                    id="width"
                    type="number"
                    placeholder="Width in cm"
                    className={completedFields.width ? "input-field-completed" : "input-field-white"}
                    value={formValues.width}
                    onChange={(e) => handleInputChange("width", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input 
                    id="height"
                    type="number"
                    placeholder="Height in cm"
                    className={completedFields.height ? "input-field-completed" : "input-field-white"}
                    value={formValues.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button className="w-full sm:w-auto">Calculate Cost Analysis</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewAnalysisForm;