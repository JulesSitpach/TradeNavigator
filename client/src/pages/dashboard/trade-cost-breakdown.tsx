import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search } from "lucide-react";

// Styles that match the screenshot format
const styles = {
  container: "max-w-5xl mx-auto px-4 py-6",
  title: "text-3xl font-semibold mb-1",
  subtitle: "text-gray-500 mb-6",
  formSection: "mb-6",
  sectionHeader: "text-lg font-medium mb-4",
  formIntro: "text-sm text-gray-600 mb-4",
  grid: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4",
  fullWidth: "col-span-1 md:col-span-2",
  label: "block text-sm font-medium text-gray-700 mb-1",
  helpText: "text-xs text-blue-600 italic ml-1",
  valuePrefix: "absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500",
  inputWithPrefix: "pl-8",
  calculateButton: "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded",
  searchButton: "p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors",
};

export default function TradeCostBreakdown() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    productDescription: "",
    productCategory: "",
    hsCode: "",
    originCountry: "",
    destinationCountry: "",
    productValue: "",
    quantity: "1",
    transportMode: ""
  });
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Update form data handling
  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Lookoup for HS Code suggestion
  const handleHSCodeLookup = () => {
    if (!formData.productDescription || formData.productDescription.trim().length < 5) {
      toast({
        title: "Description Required",
        description: "Please enter a product description of at least 5 characters",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Searching for HS Code",
      description: "Looking up the best match based on your description...",
    });
    
    // Call the AI service to get HS code suggestions
    apiRequest("POST", "/api/ai/classify-product", {
      description: formData.productDescription,
      category: formData.productCategory
    })
      .then(res => res.json())
      .then(data => {
        setFormData({
          ...formData,
          hsCode: data.hsCode
        });
        toast({
          title: "HS Code Found",
          description: `Suggested HS Code: ${data.hsCode}`,
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

  // Handle form submission
  const handleCalculate = async () => {
    // Validate required fields
    const requiredFields = [
      'productDescription', 
      'productCategory', 
      'hsCode', 
      'originCountry', 
      'destinationCountry', 
      'productValue'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }
    
    setIsCalculating(true);
    
    try {
      // Add actual API call here to calculate cost breakdown
      // For now, we'll just simulate a success
      setTimeout(() => {
        setIsCalculating(false);
        toast({
          title: "Calculation Complete",
          description: "Your cost breakdown analysis has been generated!",
        });
        
        // In a real implementation, you would:
        // 1. Use the Analysis Context to store the results
        // 2. Update the UI to show the results or navigate to results page
      }, 1500);
    } catch (error) {
      setIsCalculating(false);
      toast({
        title: "Calculation Failed",
        description: "There was an error generating your cost breakdown. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Trade Cost Breakdown</h1>
      <p className={styles.subtitle}>Calculate and analyze all costs associated with your international shipments</p>
      
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className={styles.formSection}>
            <h2 className={styles.sectionHeader}>Information Form</h2>
            <p className={styles.formIntro}>Enter product and shipping details to calculate your trade costs</p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium mb-3">Product Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={styles.label}>
                      Product Description
                    </label>
                    <Input 
                      placeholder="e.g. High-performance laptop, 13-inch display, 32GB RAM, 1TB SSD"
                      value={formData.productDescription}
                      onChange={(e) => handleInputChange("productDescription", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className={styles.label}>
                      Product Category <span className="text-xs text-blue-600">(Select first for better HS code results)</span>
                    </label>
                    <Select 
                      value={formData.productCategory}
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
                    <label className={styles.label}>HS Code</label>
                    <div className="flex">
                      <Input 
                        placeholder="e.g. 8471.30"
                        value={formData.hsCode}
                        onChange={(e) => handleInputChange("hsCode", e.target.value)}
                        className="flex-1 mr-2"
                      />
                      <Button 
                        variant="outline" 
                        className={styles.searchButton}
                        onClick={handleHSCodeLookup}
                        type="button"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className={styles.label}>Origin Country</label>
                    <Select 
                      value={formData.originCountry}
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
                    <label className={styles.label}>Destination Country</label>
                    <Select
                      value={formData.destinationCountry}
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
                    <label className={styles.label}>Product Value (in USD)</label>
                    <div className="relative">
                      <div className={styles.valuePrefix}>$</div>
                      <Input 
                        type="number"
                        placeholder="0"
                        value={formData.productValue}
                        onChange={(e) => handleInputChange("productValue", e.target.value)}
                        className={styles.inputWithPrefix}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-3">Shipping Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={styles.label}>Quantity</label>
                    <Input 
                      type="number"
                      placeholder="1"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange("quantity", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className={styles.label}>Transport Mode</label>
                    <Select
                      value={formData.transportMode}
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
                disabled={isCalculating}
                className={styles.calculateButton}
              >
                {isCalculating ? "Calculating..." : "Calculate"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}