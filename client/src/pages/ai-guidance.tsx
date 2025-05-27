import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb, TrendingUp, AlertCircle } from "lucide-react";

export default function AiGuidance() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Guidance</h1>
          <p className="text-gray-600 mt-1">Intelligent recommendations for optimizing your trade operations</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Brain className="h-4 w-4 mr-2" />
          Get New Recommendations
        </Button>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Smart Recommendations
          </CardTitle>
          <CardDescription>AI-powered insights to improve your trade efficiency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-600">Cost Savings</Badge>
                  <span className="text-sm text-gray-500">Potential savings: $2,450</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Switch to Ocean Freight for Non-Urgent Shipments
                </h4>
                <p className="text-sm text-gray-600">
                  Analysis shows 60% of your air freight shipments could use ocean transport, reducing costs by 65% with only 14 additional days transit time.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Apply
              </Button>
            </div>

            <div className="flex items-start justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-blue-600 text-white">Efficiency</Badge>
                  <span className="text-sm text-gray-500">Time savings: 3-5 days</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Consolidate Shipments to Same Destinations
                </h4>
                <p className="text-sm text-gray-600">
                  You have 4 pending shipments to Germany. Consolidating could reduce transit time and qualify for volume discounts.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Review
              </Button>
            </div>

            <div className="flex items-start justify-between p-4 border rounded-lg bg-purple-50 border-purple-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-purple-500 text-purple-700">Compliance</Badge>
                  <span className="text-sm text-gray-500">Risk reduction</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Update Product Classifications
                </h4>
                <p className="text-sm text-gray-600">
                  2 products may qualify for better HS code classifications that could reduce duty rates by 3-8%.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Analyze
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Analysis
            </CardTitle>
            <CardDescription>AI insights into your trade performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-1">Strong Performance</h4>
                <p className="text-sm text-green-700 mb-2">
                  Your electronics shipments consistently beat industry transit times by 12%.
                </p>
                <div className="text-xs text-green-600">
                  Keep using your current logistics partners for this category.
                </div>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-1">Opportunity Area</h4>
                <p className="text-sm text-yellow-700 mb-2">
                  Textile shipments have 18% higher costs than industry average.
                </p>
                <div className="text-xs text-yellow-600">
                  Consider exploring alternative routes or consolidation options.
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-1">Market Timing</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Q1 shows 23% better rates for Asia-Pacific routes.
                </p>
                <div className="text-xs text-blue-600">
                  Plan major shipments for early quarter when possible.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Risk Alerts
            </CardTitle>
            <CardDescription>AI-detected potential issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-1">High Priority</h4>
                <p className="text-sm text-red-700 mb-2">
                  New EU regulations may affect 3 of your product categories starting June 2025.
                </p>
                <Button variant="outline" size="xs" className="text-red-700 border-red-300">
                  Review Impact
                </Button>
              </div>
              
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-1">Medium Priority</h4>
                <p className="text-sm text-orange-700 mb-2">
                  Currency fluctuations suggest locking in USD/EUR rates for Q2 shipments.
                </p>
                <Button variant="outline" size="xs" className="text-orange-700 border-orange-300">
                  Get Rates
                </Button>
              </div>
              
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-1">Monitor</h4>
                <p className="text-sm text-yellow-700 mb-2">
                  Port congestion in Los Angeles may affect 2 upcoming shipments.
                </p>
                <Button variant="outline" size="xs" className="text-yellow-700 border-yellow-300">
                  Track Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trade Optimization */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Route Optimization</CardTitle>
          <CardDescription>AI recommendations for improving your supply chain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">15%</div>
              <div className="text-sm text-gray-600 mb-2">Average cost reduction potential</div>
              <Button variant="outline" size="sm">Optimize Routes</Button>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">8 days</div>
              <div className="text-sm text-gray-600 mb-2">Transit time improvement possible</div>
              <Button variant="outline" size="sm">Speed Up Delivery</Button>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">92%</div>
              <div className="text-sm text-gray-600 mb-2">Compliance accuracy score</div>
              <Button variant="outline" size="sm">Improve Compliance</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}