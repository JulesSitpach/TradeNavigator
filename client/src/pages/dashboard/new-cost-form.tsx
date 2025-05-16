import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import "../../styles/cost-breakdown-form.css";

const NewCostAnalysisForm = () => {
  const [currency, setCurrency] = useState("USD");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [dimensionUnit, setDimensionUnit] = useState("cm");

  return (
    <>
      <PageHeader
        title="New Cost Analysis"
        description="Enter product and shipping details to calculate landed costs"
      />

      <Card className="bg-white shadow-sm mb-8">
        <CardContent className="p-6">
          <div className="form-section">
            <h2 className="section-title">Product & Shipping Details</h2>
            <p className="section-description">Enter information about your product and shipping requirements</p>
            
            <div className="form-subsection">
              <h3 className="subsection-title">Product Details</h3>
              
              <div className="form-grid">
                <div className="form-field">
                  <Label htmlFor="product-description">Product Description</Label>
                  <Input 
                    id="product-description" 
                    placeholder="High-performance laptops, 13" display, 32GB RAM, 1TB SSD" 
                  />
                </div>
                
                <div className="form-field">
                  <Label htmlFor="product-category">
                    Product Category <span className="text-xs text-amber-600">Select first for better HS code results</span>
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Electronics" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="textiles">Textiles & Apparel</SelectItem>
                      <SelectItem value="food">Food & Beverages</SelectItem>
                      <SelectItem value="chemicals">Chemicals</SelectItem>
                      <SelectItem value="machinery">Machinery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="form-field">
                  <Label htmlFor="hs-code">HS Code</Label>
                  <div className="flex space-x-2">
                    <Input id="hs-code" placeholder="8471.30" value="8471.30" />
                    <Button variant="outline" size="icon" className="lookup-btn">
                      <span className="text-blue-500 font-bold">↑</span>
                    </Button>
                  </div>
                </div>
                
                <div className="form-field">
                  <Label htmlFor="origin-country">Origin Country</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="China" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cn">China</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="jp">Japan</SelectItem>
                      <SelectItem value="vn">Vietnam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="form-field">
                  <Label htmlFor="destination-country">Destination Country</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Australia - CPTPP member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="au">Australia - CPTPP member</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada - USMCA member</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="mx">Mexico - USMCA member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="form-field">
                  <Label htmlFor="product-value">Product Value (in USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate.y-1/2 text-gray-500">$</span>
                    <Input id="product-value" type="number" className="pl-7" placeholder="400" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-subsection">
              <h3 className="subsection-title">Shipping Details</h3>
              
              <div className="form-grid">
                <div className="form-field">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" placeholder="50" />
                </div>
                
                <div className="form-field">
                  <Label htmlFor="transport-mode">Transport Mode</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Air Freight" />
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
                  <Label htmlFor="shipment-type">Shipment Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Less than Container Load (LCL)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lcl">Less than Container Load (LCL)</SelectItem>
                      <SelectItem value="fcl">Full Container Load (FCL)</SelectItem>
                      <SelectItem value="bulk">Bulk Cargo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="form-field">
                  <Label htmlFor="package-type">Package Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Cardboard Box" />
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
                    <Input id="weight" type="number" placeholder="450" className="flex-1" />
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
                <div className="unit-toggle-right text.right mb-2">
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
                    <Label htmlFor="length">Length (cm)</Label>
                    <Input id="length" type="number" placeholder="40" />
                  </div>
                  <div>
                    <Label htmlFor="width">Width (cm)</Label>
                    <Input id="width" type="number" placeholder="30" />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input id="height" type="number" placeholder="25" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button className="calculate-btn">Calculate Cost Analysis</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default NewCostAnalysisForm;