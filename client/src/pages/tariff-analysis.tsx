import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Search, FileText, Calculator, TrendingDown } from "lucide-react";

export default function TariffAnalysis() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tariff Analysis</h1>
          <p className="text-gray-600 mt-1">Detailed HS code classification and duty calculations</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Search className="h-4 w-4 mr-2" />
          Lookup HS Code
        </Button>
      </div>

      {/* HS Code Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            HS Code Classification
          </CardTitle>
          <CardDescription>Harmonized System code details and requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Primary Classification</h3>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-lg font-bold text-blue-700">8517.12</span>
                    <Badge variant="secondary">90% Confidence</Badge>
                  </div>
                  <p className="text-sm text-gray-700">Smart watches with digital display, incorporating microprocessor</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Alternative Classifications</h3>
                <div className="space-y-2">
                  <div className="p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">8517.62</span>
                      <Badge variant="outline" className="text-xs">85%</Badge>
                    </div>
                    <p className="text-xs text-gray-600">Other watches with fitness tracking</p>
                  </div>
                  <div className="p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">8471.30</span>
                      <Badge variant="outline" className="text-xs">70%</Badge>
                    </div>
                    <p className="text-xs text-gray-600">Portable data processing machines</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Required Documentation</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Commercial Invoice</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Packing List</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Certificate of Origin (for duty benefits)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>FCC Declaration (electronics requirement)</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Special Requirements</h3>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Electronics may require FDA registration if health monitoring features are present.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duty Calculations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Duty & Tax Calculations
          </CardTitle>
          <CardDescription>Breakdown of all applicable duties and taxes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Standard Rates</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">MFN Duty Rate</span>
                  <span className="font-medium">2.6%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">General Rate</span>
                  <span className="font-medium">6.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Column 2 Rate</span>
                  <span className="font-medium">35%</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Preferential Rates</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">USMCA</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-600">Free</span>
                    <Badge variant="secondary" className="text-xs">Qualified</Badge>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">KORUS FTA</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">GSP</span>
                  <span className="font-medium">Not Eligible</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Additional Fees</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">MPF (0.3464%)</span>
                  <span className="font-medium">$34.64</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">HMF</span>
                  <span className="font-medium">$5.25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Harbor Maintenance</span>
                  <span className="font-medium">$12.50</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-green-600" />
            Savings Opportunities
          </CardTitle>
          <CardDescription>Ways to reduce your duty burden</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Free Trade Agreement</h4>
              <p className="text-sm text-green-700 mb-2">
                Qualify for USMCA benefits with proper origin documentation
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">Potential Savings: $1,240</Badge>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Foreign Trade Zone</h4>
              <p className="text-sm text-blue-700 mb-2">
                Store inventory duty-free until needed for domestic consumption
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Cash Flow Benefits</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}