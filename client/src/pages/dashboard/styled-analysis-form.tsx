import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/common/PageHeader";
import { FaArrowLeft } from "react-icons/fa";
import "../../styles/form-styles.css";

const StyledAnalysisForm = () => {
  // State for tracking completed fields
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
    <>
      <PageHeader
        title="New Cost Analysis"
        description="Create a new cost breakdown analysis for your product"
        actions={[
          {
            label: "Back to Dashboard",
            icon: <FaArrowLeft />,
            href: "/dashboard",
            variant: "outline"
          }
        ]}
      />

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Product & Shipping Details</CardTitle>
            <p className="text-sm text-gray-500">Enter information about your product and shipping requirements</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Product Details Section */}
              <div>
                <h3 className="form-section-header">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
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

                    <div>
                      <Label htmlFor="hs-code">HS Code</Label>
                      <div className="relative">
                        <Input 
                          id="hs-code"
                          placeholder="e.g., 6109.10"
                          className={completedFields.hsCode ? "form-input-completed" : "form-input-white"}
                          value={formValues.hsCode}
                          onChange={(e) => handleInputChange("hsCode", e.target.value)}
                        />
                      </div>
                      <div className="mt-1">
                        <p className="form-helper-text">Enter a product description to enable HS code suggestions</p>
                        <p className="form-helper-link">Click the pilot icon to see HS code suggestions</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
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
                            <SelectItem value="cn">China</SelectItem>
                            <SelectItem value="in">India</SelectItem>
                            <SelectItem value="vn">Vietnam</SelectItem>
                            <SelectItem value="bd">Bangladesh</SelectItem>
                            <SelectItem value="th">Thailand</SelectItem>
                            <SelectItem value="id">Indonesia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                              <SelectItem value="us">United States</SelectItem>
                              <SelectItem value="ca">Canada</SelectItem>
                              <SelectItem value="eu">European Union</SelectItem>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                              <SelectItem value="au">Australia</SelectItem>
                              <SelectItem value="jp">Japan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="product-value">Product Value (in USD)</Label>
                        <Input 
                          id="product-value"
                          type="number"
                          placeholder="Enter value in USD"
                          className={completedFields.productValue ? "form-input-completed" : "form-input-white"}
                          value={formValues.productValue}
                          onChange={(e) => handleInputChange("productValue", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Details Section */}
              <div>
                <h3 className="form-section-header">Shipping Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
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

                  <div className="space-y-3">
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
                  <Button>Calculate Cost Analysis</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default StyledAnalysisForm;