import { useState, useContext } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnalysisContext } from "@/contexts/AnalysisContext";
import { useLocation } from "wouter";

export default function ExactScreenshotMatch() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    hsCode: "",
    originCountry: "",
    destinationCountry: "",
    value: "",
    quantity: "1",
    transportMode: ""
  });
  
  const handleHSCodeLookup = () => {
    toast({
      title: "Looking up HS Code",
      description: "Please wait while we find matching HS codes..."
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold">Trade Cost Breakdown</h1>
      <p className="text-gray-500 mb-6">Calculate and analyze all costs associated with your international shipments</p>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-medium mb-2">Information Form</h2>
          <p className="text-sm text-gray-500 mb-6">Enter product and shipping details to calculate your trade costs</p>
          
          <div className="mb-6">
            <h3 className="text-md font-medium mb-3">Product Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Description
                </label>
                <Input 
                  placeholder="e.g. High-performance laptop, 13-inch display, 32GB RAM, 1TB SSD"
                  value={formData.description}
                  onChange={e => handleInputChange("description", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Category <span className="text-xs text-blue-600">(Select first for better HS code results)</span>
                </label>
                <Select 
                  value={formData.category} 
                  onValueChange={v => handleInputChange("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="textiles">Textiles & Apparel</SelectItem>
                    <SelectItem value="automotive">Automotive Parts</SelectItem>
                    <SelectItem value="food">Food & Beverages</SelectItem>
                    <SelectItem value="chemicals">Chemicals & Pharmaceuticals</SelectItem>
                    <SelectItem value="machinery">Machinery & Equipment</SelectItem>
                    <SelectItem value="furniture">Furniture & Home Goods</SelectItem>
                    <SelectItem value="toys">Toys & Games</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">HS Code</label>
                <div className="flex">
                  <Input 
                    placeholder="e.g. 8471.30" 
                    value={formData.hsCode}
                    onChange={e => handleInputChange("hsCode", e.target.value)}
                    className="flex-1 mr-2"
                  />
                  <Button 
                    variant="outline"
                    size="icon"
                    className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                    onClick={handleHSCodeLookup}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Origin Country</label>
                <Select 
                  value={formData.originCountry}
                  onValueChange={v => handleInputChange("originCountry", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="cn">China</SelectItem>
                    <SelectItem value="jp">Japan</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                    <SelectItem value="kr">South Korea</SelectItem>
                    <SelectItem value="vn">Vietnam</SelectItem>
                    <SelectItem value="mx">Mexico</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Destination Country</label>
                <Select
                  value={formData.destinationCountry}
                  onValueChange={v => handleInputChange("destinationCountry", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="cn">China</SelectItem>
                    <SelectItem value="jp">Japan</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                    <SelectItem value="kr">South Korea</SelectItem>
                    <SelectItem value="vn">Vietnam</SelectItem>
                    <SelectItem value="mx">Mexico</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Product Value (in USD)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">$</span>
                  <Input 
                    type="number"
                    placeholder="0"
                    value={formData.value}
                    onChange={e => handleInputChange("value", e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-3">Shipping Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <Input 
                  type="number"
                  placeholder="1"
                  value={formData.quantity}
                  onChange={e => handleInputChange("quantity", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Transport Mode</label>
                <Select
                  value={formData.transportMode}
                  onValueChange={v => handleInputChange("transportMode", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transport mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ocean_fcl">Ocean (FCL)</SelectItem>
                    <SelectItem value="ocean_lcl">Ocean (LCL)</SelectItem>
                    <SelectItem value="air">Air Freight</SelectItem>
                    <SelectItem value="road">Road Transport</SelectItem>
                    <SelectItem value="rail">Rail Transport</SelectItem>
                    <SelectItem value="multimodal">Multimodal Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}