import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search } from "lucide-react";

const SimpleTradeCostBreakdown = () => {
  const { toast } = useToast();
  const [productInfo, setProductInfo] = useState({
    productDescription: "",
    productCategory: "",
    hsCode: "",
    originCountry: "",
    destinationCountry: "",
    productValue: "",
    quantity: "1",
    transportMode: ""
  });
  
  const handleInputChange = (field: string, value: string) => {
    setProductInfo((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHSCodeLookup = () => {
    if (!productInfo.productDescription) {
      toast({
        title: "Description Required",
        description: "Please enter a product description",
        variant: "destructive"
      });
      return;
    }
    
    apiRequest("POST", "/api/ai/classify-product", {
      description: productInfo.productDescription,
      category: productInfo.productCategory
    })
      .then(res => res.json())
      .then(data => {
        setProductInfo({
          ...productInfo,
          hsCode: data.hsCode
        });
      })
      .catch(err => {
        toast({
          title: "HS Code Lookup Failed",
          description: "Could not determine HS code. Please enter manually.",
          variant: "destructive"
        });
      });
  };

  const handleCalculate = () => {
    // Add calculation logic here
    toast({
      title: "Calculation Started",
      description: "Processing your cost breakdown analysis..."
    });
  };
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-semibold mb-1">Trade Cost Breakdown</h1>
      <p className="text-gray-500 mb-6">Calculate and analyze all costs associated with your international shipments</p>
      
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Information Form</h2>
            <p className="text-sm text-gray-600 mb-6">Enter product and shipping details to calculate your trade costs</p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium mb-3">Product Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Description
                    </label>
                    <Input 
                      placeholder="e.g. High-performance laptop, 13-inch display, 32GB RAM, 1TB SSD"
                      value={productInfo.productDescription}
                      onChange={(e) => handleInputChange("productDescription", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Category <span className="text-xs text-blue-600">(Select first for better HS code results)</span>
                    </label>
                    <Select 
                      value={productInfo.productCategory}
                      onValueChange={(value) => handleInputChange("productCategory", value)}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">HS Code</label>
                    <div className="flex">
                      <Input 
                        placeholder="e.g. 8471.30"
                        value={productInfo.hsCode}
                        onChange={(e) => handleInputChange("hsCode", e.target.value)}
                        className="flex-1 mr-2"
                      />
                      <Button 
                        variant="outline" 
                        className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                        onClick={handleHSCodeLookup}
                        type="button"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Origin Country</label>
                    <Select 
                      value={productInfo.originCountry}
                      onValueChange={(value) => handleInputChange("originCountry", value)}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination Country</label>
                    <Select
                      value={productInfo.destinationCountry}
                      onValueChange={(value) => handleInputChange("destinationCountry", value)}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Value (in USD)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">$</span>
                      <Input 
                        type="number"
                        placeholder="0"
                        value={productInfo.productValue}
                        onChange={(e) => handleInputChange("productValue", e.target.value)}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <Input 
                      type="number"
                      placeholder="1"
                      value={productInfo.quantity}
                      onChange={(e) => handleInputChange("quantity", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transport Mode</label>
                    <Select
                      value={productInfo.transportMode}
                      onValueChange={(value) => handleInputChange("transportMode", value)}
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
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button 
                onClick={handleCalculate}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2"
              >
                Calculate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleTradeCostBreakdown;