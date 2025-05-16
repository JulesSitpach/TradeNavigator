import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FaDownload, FaPlus, FaCalculator } from "react-icons/fa6";
import PageHeader from "@/components/common/PageHeader";
import ProductForm from "@/components/products/ProductForm";
import ShipmentForm from "@/components/products/ShipmentForm";
import CostBreakdown from "@/components/analysis/CostBreakdown";
import TariffInformation from "@/components/analysis/TariffInformation";
import ShippingOptions from "@/components/analysis/ShippingOptions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProductAnalysis = () => {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get query params
  const params = new URLSearchParams(location.split('?')[1]);
  const productId = params.get('productId') ? parseInt(params.get('productId')!) : undefined;
  const shipmentId = params.get('shipmentId') ? parseInt(params.get('shipmentId')!) : undefined;
  const analysisId = params.get('analysisId') ? parseInt(params.get('analysisId')!) : undefined;
  
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false);
  const [selectedShippingOption, setSelectedShippingOption] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch product if productId is provided
  const { data: product } = useQuery({
    queryKey: productId ? [`/api/products/${productId}`] : null,
    enabled: !!productId
  });

  // Fetch shipment if shipmentId is provided
  const { data: shipment } = useQuery({
    queryKey: shipmentId ? [`/api/shipments/${shipmentId}`] : null,
    enabled: !!shipmentId
  });

  // Fetch analysis if analysisId is provided
  const { 
    data: analysis, 
    isLoading: isAnalysisLoading 
  } = useQuery({
    queryKey: analysisId ? [`/api/analysis/${analysisId}`] : null,
    enabled: !!analysisId
  });

  // Create analysis mutation
  const createAnalysisMutation = useMutation({
    mutationFn: async (shipmentId: number) => {
      const response = await apiRequest('POST', '/api/analysis', { shipmentId });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/analysis'] });
      setLocation(`/product-analysis?analysisId=${data.id}`);
      toast({
        title: "Analysis created",
        description: "Cost analysis has been successfully calculated."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate analysis. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Calculate analysis based on shipment
  const calculateAnalysis = (shipmentId: number) => {
    createAnalysisMutation.mutate(shipmentId);
  };

  // Handle export
  const handleExport = () => {
    if (!analysis) return;
    
    // In a real implementation, this would generate a PDF or CSV
    toast({
      title: "Export initiated",
      description: "Your analysis is being exported."
    });
  };

  // Handle recalculate
  const handleRecalculate = () => {
    if (!shipmentId) return;
    calculateAnalysis(shipmentId);
  };

  // Prepare data for the tariff information component
  const tariffData = analysis ? {
    hsCode: product?.hsCode || "Unknown",
    description: product?.description || "No description available",
    countries: [
      {
        name: "United States",
        code: "US",
        baseRate: 7.5,
        specialPrograms: [{ name: "FTA", rate: -2.5 }],
        finalRate: 5.0,
        highlight: shipment?.destinationCountry === "US"
      },
      {
        name: "Canada",
        code: "CA",
        baseRate: 8.0,
        specialPrograms: [{ name: "USMCA", rate: -8.0 }],
        finalRate: 0.0,
        highlight: shipment?.destinationCountry === "CA"
      },
      {
        name: "Mexico",
        code: "MX",
        baseRate: 10.0,
        specialPrograms: [{ name: "USMCA", rate: -10.0 }],
        finalRate: 0.0,
        highlight: shipment?.destinationCountry === "MX"
      },
      {
        name: "United Kingdom",
        code: "UK",
        baseRate: 12.0,
        specialPrograms: [{ name: "GSP", rate: -4.0 }],
        finalRate: 8.0,
        highlight: shipment?.destinationCountry === "UK"
      },
      {
        name: "Germany",
        code: "DE",
        baseRate: 14.0,
        specialPrograms: null,
        finalRate: 14.0,
        highlight: shipment?.destinationCountry === "DE"
      }
    ]
  } : null;

  // Prepare data for the shipping options component
  const shippingOptions = analysis ? [
    {
      id: "sea",
      name: "Sea Freight",
      cost: 8250,
      transitTime: { min: 32, max: 38 },
      details: {
        freightCost: 7500,
        insurance: 450,
        handlingFees: 300
      },
      route: "Shanghai → Los Angeles → Chicago",
      carrier: "COSCO Shipping + BNSF Railway",
      isRecommended: true,
      transportIcon: "ship" as const
    },
    {
      id: "air",
      name: "Air Freight",
      cost: 12750,
      transitTime: { min: 5, max: 7 },
      details: {
        freightCost: 11600,
        insurance: 650,
        handlingFees: 500
      },
      route: "Hong Kong → Chicago (direct)",
      carrier: "Cathay Cargo + FedEx Ground",
      transportIcon: "plane" as const
    }
  ] : null;

  useEffect(() => {
    // If we have shipping options but no selection, default to the recommended one
    if (shippingOptions && !selectedShippingOption) {
      const recommended = shippingOptions.find(option => option.isRecommended);
      if (recommended) {
        setSelectedShippingOption(recommended.id);
      } else if (shippingOptions.length > 0) {
        setSelectedShippingOption(shippingOptions[0].id);
      }
    }
  }, [shippingOptions, selectedShippingOption]);

  return (
    <>
      <PageHeader
        title="Product Analysis"
        description="Analyze shipping costs and tariffs for your products"
        actions={[
          {
            label: "Export",
            icon: <FaDownload />,
            onClick: handleExport,
            variant: "outline",
            disabled: !analysis
          },
          {
            label: "New Analysis",
            icon: <FaPlus />,
            onClick: () => setLocation("/product-analysis")
          }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Info & Form */}
        <div className="lg:col-span-1">
          {productId ? (
            <ProductForm productId={productId} />
          ) : (
            <>
              <Dialog open={isNewProductDialogOpen} onOpenChange={setIsNewProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full mb-4" variant="outline">
                    <FaPlus className="mr-2" />
                    Create New Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Product</DialogTitle>
                  </DialogHeader>
                  <ProductForm onSuccess={() => setIsNewProductDialogOpen(false)} />
                </DialogContent>
              </Dialog>

              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5 mb-6">
                <h2 className="text-lg font-medium text-neutral-900 mb-4">Select Product</h2>
                <ProductSelector 
                  onSelectProduct={(id) => setLocation(`/product-analysis?productId=${id}`)} 
                />
              </div>
            </>
          )}

          {productId && !shipmentId && (
            <ShipmentForm 
              onCalculate={calculateAnalysis}
            />
          )}

          {shipmentId && (
            <ShipmentForm
              shipmentId={shipmentId}
              onCalculate={calculateAnalysis}
            />
          )}
        </div>
        
        {/* Middle & Right Columns - Results & Visualizations */}
        <div className="lg:col-span-2">
          {analysis && (
            <div className="mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full bg-transparent border-b border-gray-200 rounded-none justify-start">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-2"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="cost-breakdown" 
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-2"
                  >
                    Cost Breakdown
                  </TabsTrigger>
                  <TabsTrigger 
                    value="alternative-routes" 
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-2"
                  >
                    Alternative Routes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tariff-analysis" 
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-2"
                  >
                    Tariff Analysis
                  </TabsTrigger>
                  <TabsTrigger 
                    value="regulations" 
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-2"
                  >
                    Regulations
                  </TabsTrigger>
                  <TabsTrigger 
                    value="visualizations" 
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-2"
                  >
                    Visualizations
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-6 px-0">
                  <div className="space-y-6">
                    <CostBreakdown 
                      data={analysis} 
                      isLoading={isAnalysisLoading || createAnalysisMutation.isPending} 
                      onRecalculate={handleRecalculate}
                      onExport={handleExport}
                    />
                    
                    <ShippingOptions 
                      options={shippingOptions} 
                      isLoading={isAnalysisLoading || createAnalysisMutation.isPending}
                      onSelectOption={setSelectedShippingOption}
                      selectedOptionId={selectedShippingOption}
                      currency={analysis?.currency}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="cost-breakdown" className="mt-6 px-0">
                  <CostBreakdown 
                    data={analysis} 
                    isLoading={isAnalysisLoading || createAnalysisMutation.isPending} 
                    onRecalculate={handleRecalculate}
                    onExport={handleExport}
                    detailed={true}
                  />
                </TabsContent>
                
                <TabsContent value="alternative-routes" className="mt-6 px-0">
                  <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <h2 className="text-lg font-medium text-neutral-900 mb-4">Alternative Routes</h2>
                    <p className="text-neutral-600">Compare different shipping routes and methods for your product.</p>
                    
                    <ShippingOptions 
                      options={shippingOptions} 
                      isLoading={isAnalysisLoading || createAnalysisMutation.isPending}
                      onSelectOption={setSelectedShippingOption}
                      selectedOptionId={selectedShippingOption}
                      currency={analysis?.currency}
                      detailed={true}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="tariff-analysis" className="mt-6 px-0">
                  <TariffInformation 
                    data={tariffData} 
                    isLoading={isAnalysisLoading || createAnalysisMutation.isPending}
                    detailed={true}
                  />
                </TabsContent>
                
                <TabsContent value="regulations" className="mt-6 px-0">
                  <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <h2 className="text-lg font-medium text-neutral-900 mb-4">Regulatory Requirements</h2>
                    <p className="text-neutral-600 mb-4">Important regulatory information for {product?.name} in {shipment?.destinationCountry}.</p>
                    
                    <div className="space-y-6">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-neutral-900 mb-2">Import Requirements</h3>
                        <ul className="list-disc list-inside text-sm text-neutral-600 space-y-2">
                          <li>Certificate of Origin required</li>
                          <li>Commercial Invoice with detailed product description</li>
                          <li>Packing List with contents, weights and dimensions</li>
                          <li>Importer Security Filing (ISF) for ocean shipments</li>
                        </ul>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-neutral-900 mb-2">Compliance</h3>
                        <ul className="list-disc list-inside text-sm text-neutral-600 space-y-2">
                          <li>Product must comply with local safety standards</li>
                          <li>Labeling requirements: Country of origin marking required</li>
                          <li>Environmental regulations: Packaging must be recyclable</li>
                        </ul>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-neutral-900 mb-2">Special Permits</h3>
                        <ul className="list-disc list-inside text-sm text-neutral-600 space-y-2">
                          <li>No special permits required for this product category</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="visualizations" className="mt-6 px-0">
                  <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <h2 className="text-lg font-medium text-neutral-900 mb-4">Trade Visualizations</h2>
                    <p className="text-neutral-600 mb-6">Visual insights for your trade route and product category.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-neutral-500 mb-2">Trade Route Map</p>
                          <p className="text-sm text-neutral-400">Visualization will appear here</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-neutral-500 mb-2">Cost Comparison Chart</p>
                          <p className="text-sm text-neutral-400">Visualization will appear here</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-neutral-500 mb-2">Market Trends</p>
                          <p className="text-sm text-neutral-400">Visualization will appear here</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-neutral-500 mb-2">Transit Time Analysis</p>
                          <p className="text-sm text-neutral-400">Visualization will appear here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {/* Show when no analysis is available */}
          {!analysis && (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 text-center">
              <h2 className="text-lg font-medium text-neutral-900 mb-2">No Analysis Data</h2>
              <p className="text-neutral-600 mb-6">Select a product and create a shipment to generate an analysis.</p>
              
              {!productId && (
                <p className="text-sm text-neutral-500">First, select a product from the list on the left or create a new one.</p>
              )}
              
              {productId && !shipmentId && (
                <p className="text-sm text-neutral-500">Now, fill out the shipment information to calculate costs and generate analysis.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Product selector component
const ProductSelector = ({ onSelectProduct }: { onSelectProduct: (id: number) => void }) => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  if (isLoading) {
    return <div className="flex justify-center p-4"><span className="animate-spin">Loading...</span></div>;
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-neutral-500 mb-2">No products found</p>
        <p className="text-sm text-neutral-400">Create a new product to start analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {products.map((product: any) => (
        <Button
          key={product.id}
          variant="outline"
          className="w-full justify-between text-left font-normal hover:bg-neutral-50"
          onClick={() => onSelectProduct(product.id)}
        >
          <div>
            <span className="block font-medium">{product.name}</span>
            <span className="text-xs text-neutral-500">
              {product.hsCode ? `HS: ${product.hsCode}` : "No HS code"} • {product.originCountry || "Unknown origin"}
            </span>
          </div>
          <FaCalculator className="text-primary" />
        </Button>
      ))}
    </div>
  );
};

export default ProductAnalysis;
