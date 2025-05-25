import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { TrendingUp, Zap, BarChart3, Calendar } from "lucide-react";

export default function AiPredictions() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Market Predictions</h1>
          <p className="text-gray-600 mt-1">Advanced forecasting for strategic trade planning</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Zap className="h-4 w-4 mr-2" />
          Generate Forecast
        </Button>
      </div>

      {/* Market Forecast Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <TrendingUp className="h-5 w-5" />
              Price Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 mb-1">+12%</div>
            <p className="text-sm text-blue-600">Expected increase next quarter</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <BarChart3 className="h-5 w-5" />
              Demand Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 mb-1">High</div>
            <p className="text-sm text-green-600">Electronics sector strength</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Calendar className="h-5 w-5" />
              Optimal Timing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 mb-1">Q2 2025</div>
            <p className="text-sm text-purple-600">Best shipping window</p>
          </CardContent>
        </Card>
      </div>

      {/* Price Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Rate Predictions</CardTitle>
          <CardDescription>AI-powered forecasts for transportation costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-green-800">Trans-Pacific Ocean Freight</h4>
                <Badge className="bg-green-600">Decreasing</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Current Rate</span>
                  <div className="font-medium">$2,400/TEU</div>
                </div>
                <div>
                  <span className="text-gray-600">30-Day Forecast</span>
                  <div className="font-medium text-green-600">$2,100/TEU (-12%)</div>
                </div>
                <div>
                  <span className="text-gray-600">Confidence</span>
                  <div className="font-medium">87%</div>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-red-50 border-red-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-red-800">Air Freight - Asia to US</h4>
                <Badge variant="destructive">Increasing</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Current Rate</span>
                  <div className="font-medium">$8.90/kg</div>
                </div>
                <div>
                  <span className="text-gray-600">30-Day Forecast</span>
                  <div className="font-medium text-red-600">$9.80/kg (+10%)</div>
                </div>
                <div>
                  <span className="text-gray-600">Confidence</span>
                  <div className="font-medium">92%</div>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-800">Europe to US Ground</h4>
                <Badge variant="secondary">Stable</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Current Rate</span>
                  <div className="font-medium">$1.80/kg</div>
                </div>
                <div>
                  <span className="text-gray-600">30-Day Forecast</span>
                  <div className="font-medium text-gray-600">$1.85/kg (+3%)</div>
                </div>
                <div>
                  <span className="text-gray-600">Confidence</span>
                  <div className="font-medium">76%</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Emerging Opportunities</CardTitle>
            <CardDescription>AI-identified market trends to watch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-1">Southeast Asia Electronics Hub</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Vietnam manufacturing capacity expanding 40% by Q3 2025
                </p>
                <div className="text-xs text-blue-600">
                  Opportunity Score: 94/100
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-1">Renewable Energy Components</h4>
                <p className="text-sm text-green-700 mb-2">
                  Solar panel demand surge expected with new incentives
                </p>
                <div className="text-xs text-green-600">
                  Opportunity Score: 89/100
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-1">Medical Device Innovation</h4>
                <p className="text-sm text-purple-700 mb-2">
                  Post-pandemic healthcare investment driving imports
                </p>
                <div className="text-xs text-purple-600">
                  Opportunity Score: 85/100
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Factors</CardTitle>
            <CardDescription>Potential challenges to monitor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-1">Port Congestion Risks</h4>
                <p className="text-sm text-yellow-700 mb-2">
                  LA/Long Beach seeing 15% increase in vessel wait times
                </p>
                <div className="text-xs text-yellow-600">
                  Impact Probability: 68%
                </div>
              </div>
              
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-1">Currency Volatility</h4>
                <p className="text-sm text-orange-700 mb-2">
                  USD/CNY expected fluctuation could affect costs by 8-12%
                </p>
                <div className="text-xs text-orange-600">
                  Impact Probability: 72%
                </div>
              </div>
              
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-1">Regulatory Changes</h4>
                <p className="text-sm text-red-700 mb-2">
                  New EU carbon border taxes affecting multiple product categories
                </p>
                <div className="text-xs text-red-600">
                  Impact Probability: 95%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Recommendations</CardTitle>
          <CardDescription>AI-powered advice for your trade strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Lock in Ocean Freight Rates Now</h4>
                <p className="text-sm text-gray-600">Rates predicted to drop 12% - wait for better pricing</p>
              </div>
              <Button size="sm" variant="outline">Set Alert</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Accelerate Air Freight Bookings</h4>
                <p className="text-sm text-gray-600">Book Q2 air freight before 10% price increase</p>
              </div>
              <Button size="sm">Book Now</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Diversify Supply Routes</h4>
                <p className="text-sm text-gray-600">Consider Vietnam as alternative to China for electronics</p>
              </div>
              <Button size="sm" variant="outline">Explore</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}