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
                <TabsList className="w-full bg-transparent border-b border-gray-200 rounded-none justify-start overflow-x-auto">
                  {/* Row 1 - Primary Tabs */}
                  <div className="flex w-full border-b border-gray-200">
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
                  </div>
                  
                  {/* Row 2 - Secondary Tabs */}
                  <div className="flex w-full">
                    <TabsTrigger 
                      value="exemptions" 
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-2"
                    >
                      Exemptions
                    </TabsTrigger>
                    <TabsTrigger 
                      value="duty-drawback" 
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-2"
                    >
                      Duty Drawback
                    </TabsTrigger>
                    <TabsTrigger 
                      value="special-programs" 
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-2"
                    >
                      Special Programs
                    </TabsTrigger>
                    <TabsTrigger 
                      value="market-analysis" 
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-2"
                    >
                      Market Analysis
                    </TabsTrigger>
                    <TabsTrigger 
                      value="trade-partners" 
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-2"
                    >
                      Trade Partners
                    </TabsTrigger>
                    <TabsTrigger 
                      value="ai-predictions" 
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-2"
                    >
                      AI Predictions
                    </TabsTrigger>
                  </div>
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
                
                {/* Additional tabs from the second row */}
                <TabsContent value="exemptions" className="mt-6 px-0">
                  <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <h2 className="text-lg font-medium text-neutral-900 mb-4">Duty Exemptions</h2>
                    <p className="text-neutral-600 mb-4">Available exemptions for your product in the destination market.</p>
                    
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h3 className="text-green-700 font-medium mb-2">Free Trade Agreement Exemption</h3>
                        <p className="text-sm text-neutral-600 mb-2">Your product qualifies for reduced or zero duty rates under an active trade agreement.</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-600 font-medium">Potential Savings: $1,250.00</span>
                          <button className="text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium py-1 px-3 rounded">
                            View Requirements
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-neutral-700 font-medium mb-2">De Minimis Value Exemption</h3>
                        <p className="text-sm text-neutral-600 mb-2">Shipments below certain value thresholds may qualify for duty-free entry.</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-600">Not eligible - Shipment value exceeds threshold</span>
                          <button className="text-xs bg-gray-100 hover:bg-gray-200 text-neutral-700 font-medium py-1 px-3 rounded">
                            View Details
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-neutral-700 font-medium mb-2">Temporary Import Exemption</h3>
                        <p className="text-sm text-neutral-600 mb-2">Goods imported temporarily may be exempt from duties if re-exported within a specified time.</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-600">Not applicable - Permanent import</span>
                          <button className="text-xs bg-gray-100 hover:bg-gray-200 text-neutral-700 font-medium py-1 px-3 rounded">
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="duty-drawback" className="mt-6 px-0">
                  <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <h2 className="text-lg font-medium text-neutral-900 mb-4">Duty Drawback Analysis</h2>
                    <p className="text-neutral-600 mb-4">Potential for duty refunds when imported materials are later exported in finished products.</p>
                    
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-blue-700 font-medium">What is Duty Drawback?</h3>
                          <p className="text-sm text-neutral-600 mt-1">
                            Duty drawback is a refund of up to 99% of duties, taxes, and fees paid on imported materials that are later exported in finished products. This program can significantly reduce your costs if you re-export imported materials.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border border-gray-200">
                        <h3 className="font-medium text-neutral-900 mb-2">Estimated Drawback Eligibility</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-neutral-500">Total duties paid on imports:</span>
                            <p className="font-medium text-neutral-900">$2,750.00</p>
                          </div>
                          <div>
                            <span className="text-sm text-neutral-500">Estimated drawback value:</span>
                            <p className="font-medium text-green-600">$2,200.00</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border border-gray-200">
                        <h3 className="font-medium text-neutral-900 mb-2">Required Documentation</h3>
                        <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                          <li>Import documentation (Entry summary, commercial invoice)</li>
                          <li>Export documentation (Bills of lading, commercial invoice)</li>
                          <li>Manufacturing records showing use of imported materials</li>
                          <li>Proof of duty payment</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 rounded-lg border border-gray-200">
                        <h3 className="font-medium text-neutral-900 mb-2">Timeframe for Filing</h3>
                        <p className="text-sm text-neutral-600">
                          Drawback claims must generally be filed within 5 years of the date of importation. For this shipment, the deadline would be November 15, 2030.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">
                        Generate Drawback Analysis Report
                      </button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="special-programs" className="mt-6 px-0">
                  <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <h2 className="text-lg font-medium text-neutral-900 mb-4">Special Trade Programs</h2>
                    <p className="text-neutral-600 mb-4">Trade facilitation programs that may benefit your shipment.</p>
                    
                    <div className="space-y-6">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-green-700 font-medium">Generalized System of Preferences (GSP)</h3>
                            <p className="text-sm text-neutral-600 mt-1">Your product qualifies for duty-free treatment under GSP.</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Eligible</span>
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-white rounded p-3 border border-gray-200">
                            <h4 className="text-xs text-neutral-500 uppercase">Potential Savings</h4>
                            <p className="font-medium text-green-600">$3,250.00</p>
                          </div>
                          <div className="bg-white rounded p-3 border border-gray-200">
                            <h4 className="text-xs text-neutral-500 uppercase">Requirements Met</h4>
                            <p className="font-medium text-neutral-900">6/6</p>
                          </div>
                          <div className="bg-white rounded p-3 border border-gray-200">
                            <h4 className="text-xs text-neutral-500 uppercase">Document Status</h4>
                            <p className="font-medium text-neutral-900">Pending</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-neutral-700 font-medium">Foreign Trade Zone (FTZ)</h3>
                            <p className="text-sm text-neutral-600 mt-1">Using an FTZ can defer duty payments and reduce processing fees.</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Potential Benefit</span>
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-gray-50 rounded p-3 border border-gray-200">
                            <h4 className="text-xs text-neutral-500 uppercase">Potential Savings</h4>
                            <p className="font-medium text-blue-600">$1,800.00</p>
                          </div>
                          <div className="bg-gray-50 rounded p-3 border border-gray-200">
                            <h4 className="text-xs text-neutral-500 uppercase">Nearest FTZ</h4>
                            <p className="font-medium text-neutral-900">24 miles</p>
                          </div>
                          <div className="bg-gray-50 rounded p-3 border border-gray-200">
                            <h4 className="text-xs text-neutral-500 uppercase">Setup Time</h4>
                            <p className="font-medium text-neutral-900">4-6 weeks</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-neutral-700 font-medium">First Sale Rule</h3>
                            <p className="text-sm text-neutral-600 mt-1">Allows duty to be calculated on the first sale price rather than the final price.</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Not Applicable</span>
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-gray-50 rounded p-3 border border-gray-200">
                            <h4 className="text-xs text-neutral-500 uppercase">Reason</h4>
                            <p className="font-medium text-neutral-900">Direct purchase</p>
                          </div>
                          <div className="bg-gray-50 rounded p-3 border border-gray-200 opacity-50">
                            <h4 className="text-xs text-neutral-500 uppercase">Potential Savings</h4>
                            <p className="font-medium text-neutral-400">N/A</p>
                          </div>
                          <div className="bg-gray-50 rounded p-3 border border-gray-200 opacity-50">
                            <h4 className="text-xs text-neutral-500 uppercase">Required Evidence</h4>
                            <p className="font-medium text-neutral-400">N/A</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="market-analysis" className="mt-6 px-0">
                  <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <h2 className="text-lg font-medium text-neutral-900 mb-4">Market Analysis</h2>
                    <p className="text-neutral-600 mb-6">Analysis of market conditions and trade data for your product.</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                          <h3 className="font-medium text-neutral-900 mb-4">Market Size & Growth</h3>
                          <div className="bg-gray-100 rounded-lg p-4 h-56 flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-neutral-500 mb-2">Market Growth Chart</p>
                              <p className="text-sm text-neutral-400">Visualization will appear here</p>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-3">
                            <div>
                              <span className="text-xs text-neutral-500">Market Size</span>
                              <p className="font-medium text-neutral-900">$4.2 Billion</p>
                            </div>
                            <div>
                              <span className="text-xs text-neutral-500">Annual Growth</span>
                              <p className="font-medium text-green-600">+8.3%</p>
                            </div>
                            <div>
                              <span className="text-xs text-neutral-500">Market Share</span>
                              <p className="font-medium text-neutral-900">Top 3 hold 45%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                          <h3 className="font-medium text-neutral-900 mb-4">Key Competitors</h3>
                          <ul className="space-y-3">
                            <li className="flex items-center justify-between">
                              <span className="text-sm text-neutral-800">Competitor A</span>
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">22% share</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-sm text-neutral-800">Competitor B</span>
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">15% share</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-sm text-neutral-800">Competitor C</span>
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">8% share</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-sm text-neutral-800">Others</span>
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">55% share</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                        <h3 className="font-medium text-neutral-900 mb-4">Price Trends & Seasonality</h3>
                        <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-neutral-500 mb-2">Price Trend Chart</p>
                            <p className="text-sm text-neutral-400">Visualization will appear here</p>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <span className="text-xs text-neutral-500">Current Avg. Price</span>
                            <p className="font-medium text-neutral-900">$42.50/unit</p>
                          </div>
                          <div>
                            <span className="text-xs text-neutral-500">Price Trend (YoY)</span>
                            <p className="font-medium text-red-600">+2.3%</p>
                          </div>
                          <div>
                            <span className="text-xs text-neutral-500">Peak Season</span>
                            <p className="font-medium text-neutral-900">Oct-Dec</p>
                          </div>
                          <div>
                            <span className="text-xs text-neutral-500">Low Season</span>
                            <p className="font-medium text-neutral-900">Apr-Jun</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="trade-partners" className="mt-6 px-0">
                  <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <h2 className="text-lg font-medium text-neutral-900 mb-4">Trade Partners</h2>
                    <p className="text-neutral-600 mb-6">Find and evaluate potential trade partners for your product.</p>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                        <h3 className="font-medium text-neutral-900 mb-4">Top Importing Partners</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Company</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Location</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Annual Volume</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Match Score</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              <tr>
                                <td className="px-4 py-3 text-sm text-neutral-900">Global Imports Ltd</td>
                                <td className="px-4 py-3 text-sm text-neutral-500">Chicago, IL</td>
                                <td className="px-4 py-3 text-sm text-neutral-500">$12.4M</td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="font-medium text-green-600">92%</span>
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 text-sm text-neutral-900">Eastern Trade Co</td>
                                <td className="px-4 py-3 text-sm text-neutral-500">New York, NY</td>
                                <td className="px-4 py-3 text-sm text-neutral-500">$8.7M</td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="font-medium text-green-600">87%</span>
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 text-sm text-neutral-900">Pacific Traders Inc</td>
                                <td className="px-4 py-3 text-sm text-neutral-500">Los Angeles, CA</td>
                                <td className="px-4 py-3 text-sm text-neutral-500">$6.2M</td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Seasonal</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="font-medium text-yellow-600">76%</span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                        <h3 className="font-medium text-neutral-900 mb-4">Recommended Logistics Partners</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center">
                              <div className="w-12 h-12 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <h4 className="font-medium text-neutral-900">Express Shipping Co</h4>
                                <p className="text-xs text-neutral-500">Ocean & Air Freight</p>
                              </div>
                            </div>
                            <div className="mt-3 text-xs text-neutral-500">
                              Match score: <span className="text-green-600 font-medium">94%</span>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center">
                              <div className="w-12 h-12 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <h4 className="font-medium text-neutral-900">Global Logistics Ltd</h4>
                                <p className="text-xs text-neutral-500">Full Logistics Services</p>
                              </div>
                            </div>
                            <div className="mt-3 text-xs text-neutral-500">
                              Match score: <span className="text-green-600 font-medium">89%</span>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center">
                              <div className="w-12 h-12 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <h4 className="font-medium text-neutral-900">Fast Freight Inc</h4>
                                <p className="text-xs text-neutral-500">Air & Express Courier</p>
                              </div>
                            </div>
                            <div className="mt-3 text-xs text-neutral-500">
                              Match score: <span className="text-yellow-600 font-medium">82%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="ai-predictions" className="mt-6 px-0">
                  <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <h2 className="text-lg font-medium text-neutral-900 mb-4">AI-Powered Predictions</h2>
                    <p className="text-neutral-600 mb-6">Advanced analytics and predictions based on market data and AI models.</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                          <h3 className="font-medium text-neutral-900 mb-4">Price Forecast</h3>
                          <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-neutral-500 mb-2">Price Forecast Chart</p>
                              <p className="text-sm text-neutral-400">Visualization will appear here</p>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-3">
                            <div>
                              <span className="text-xs text-neutral-500">30-Day Forecast</span>
                              <p className="font-medium text-red-600">+2.1%</p>
                            </div>
                            <div>
                              <span className="text-xs text-neutral-500">90-Day Forecast</span>
                              <p className="font-medium text-green-600">-1.3%</p>
                            </div>
                            <div>
                              <span className="text-xs text-neutral-500">Confidence Level</span>
                              <p className="font-medium text-neutral-900">87%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                          <h3 className="font-medium text-neutral-900 mb-4">Risk Assessment</h3>
                          <div className="space-y-4">
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                              <span className="text-xs text-neutral-500">Overall Risk Score</span>
                              <div className="flex items-center mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '38%' }}></div>
                                </div>
                                <span className="ml-2 font-medium text-neutral-900">3.8/10</span>
                              </div>
                            </div>
                            
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                              <span className="text-xs text-neutral-500">Supply Chain Disruption</span>
                              <div className="flex items-center mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                                </div>
                                <span className="ml-2 font-medium text-neutral-900">6.5/10</span>
                              </div>
                            </div>
                            
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                              <span className="text-xs text-neutral-500">Regulatory Changes</span>
                              <div className="flex items-center mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '22%' }}></div>
                                </div>
                                <span className="ml-2 font-medium text-neutral-900">2.2/10</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                        <h3 className="font-medium text-neutral-900 mb-4">Strategic Recommendations</h3>
                        <div className="space-y-3">
                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <h4 className="text-sm font-medium text-neutral-800">Inventory Optimization</h4>
                            <p className="text-xs text-neutral-600 mt-1">
                              Based on historical data and seasonal trends, consider increasing inventory by 15% before peak season (October) to avoid supply chain disruptions.
                            </p>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="text-xs text-blue-600">AI Confidence: 92%</span>
                              <button className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-1 px-3 rounded">
                                Generate Plan
                              </button>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <h4 className="text-sm font-medium text-neutral-800">Shipping Route Optimization</h4>
                            <p className="text-xs text-neutral-600 mt-1">
                              Consider alternate shipping routes through Vietnam to mitigate potential port congestion issues predicted for Q4 2025.
                            </p>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="text-xs text-blue-600">AI Confidence: 87%</span>
                              <button className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-1 px-3 rounded">
                                View Routes
                              </button>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <h4 className="text-sm font-medium text-neutral-800">Currency Hedging</h4>
                            <p className="text-xs text-neutral-600 mt-1">
                              Based on predicted currency fluctuations, implementing a hedging strategy could save approximately 3.2% on total landed cost.
                            </p>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="text-xs text-blue-600">AI Confidence: 81%</span>
                              <button className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-1 px-3 rounded">
                                Learn More
                              </button>
                            </div>
                          </div>
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
