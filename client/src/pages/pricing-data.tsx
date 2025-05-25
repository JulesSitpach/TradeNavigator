import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { DollarSign, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

export default function PricingData() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pricing Data</h1>
            <p className="text-gray-600 mt-1">Real-time market pricing and shipping rate intelligence</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Price Report
          </Button>
        </div>

        {/* Price Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <DollarSign className="h-5 w-5" />
                Avg Product Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 mb-1">$18.50/kg</div>
              <p className="text-sm text-blue-600 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                3% vs last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <TrendingUp className="h-5 w-5" />
                Ocean Freight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 mb-1">$2,400</div>
              <p className="text-sm text-green-600">per 40ft container</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <TrendingUp className="h-5 w-5" />
                Air Freight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700 mb-1">$4.20/kg</div>
              <p className="text-sm text-orange-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                7% vs last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <DollarSign className="h-5 w-5" />
                Express Courier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 mb-1">$12.80/kg</div>
              <p className="text-sm text-purple-600">door-to-door</p>
            </CardContent>
          </Card>
        </div>

        {/* Product Category Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Product Category Pricing Trends</CardTitle>
            <CardDescription>Average import prices by product category (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Electronics & Technology</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Consumer Electronics</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">$12.50/kg</span>
                        <Badge className="bg-green-600 text-xs">↓ 3%</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Computer Hardware</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">$45.80/kg</span>
                        <Badge variant="secondary" className="text-xs">↑ 1%</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Mobile Devices</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">$89.20/kg</span>
                        <Badge className="bg-green-600 text-xs">↓ 5%</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Textiles & Apparel</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Cotton Textiles</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">$8.20/kg</span>
                        <Badge variant="destructive" className="text-xs">↑ 7%</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Synthetic Fabrics</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">$6.40/kg</span>
                        <Badge variant="secondary" className="text-xs">↑ 2%</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Finished Garments</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">$15.60/kg</span>
                        <Badge className="bg-green-600 text-xs">↓ 2%</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Rate Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Rate Analysis</CardTitle>
            <CardDescription>Current rates and trends by major trade routes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Asia → North America</h4>
                    <Badge className="bg-green-600">Stable</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ocean (40ft)</span>
                      <span className="font-medium">$2,400</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Air Freight</span>
                      <span className="font-medium">$4.20/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Express</span>
                      <span className="font-medium">$12.80/kg</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Europe → Asia</h4>
                    <Badge variant="destructive">Rising</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ocean (40ft)</span>
                      <span className="font-medium">$3,100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Air Freight</span>
                      <span className="font-medium">$5.80/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Express</span>
                      <span className="font-medium">$15.20/kg</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">North America → Europe</h4>
                    <Badge variant="secondary">Mixed</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ocean (40ft)</span>
                      <span className="font-medium">$2,850</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Air Freight</span>
                      <span className="font-medium">$4.95/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Express</span>
                      <span className="font-medium">$13.40/kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Factors */}
        <Card>
          <CardHeader>
            <CardTitle>Price Influencing Factors</CardTitle>
            <CardDescription>Key market drivers affecting current pricing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Upward Pressure</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800">Fuel Cost Increases</h4>
                    <p className="text-xs text-red-600">Bunker fuel up 12% affecting ocean freight</p>
                  </div>
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="text-sm font-medium text-orange-800">Port Congestion</h4>
                    <p className="text-xs text-orange-600">Delays at major Asian ports increasing costs</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Downward Pressure</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-sm font-medium text-green-800">Increased Competition</h4>
                    <p className="text-xs text-green-600">More carriers entering key routes</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800">Trade Agreements</h4>
                    <p className="text-xs text-blue-600">RCEP reducing regional tariffs</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}