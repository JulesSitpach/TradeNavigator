import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Globe, BarChart3, Target, DollarSign, MapPin } from "lucide-react";

export default function MarketsAnalysis() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Markets Analysis</h1>
          <p className="text-gray-600 mt-1">AI-powered insights into global trade markets and opportunities</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Target className="h-4 w-4 mr-2" />
          Generate Market Report
        </Button>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <TrendingUp className="h-5 w-5" />
              Growing Markets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 mb-1">7</div>
            <p className="text-sm text-blue-600">High-growth opportunities identified</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Globe className="h-5 w-5" />
              Active Markets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 mb-1">24</div>
            <p className="text-sm text-green-600">Countries with active trade</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <BarChart3 className="h-5 w-5" />
              Market Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 mb-1">$2.4M</div>
            <p className="text-sm text-purple-600">Total addressable market</p>
          </CardContent>
        </Card>
      </div>

      {/* Market Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Market Opportunities
          </CardTitle>
          <CardDescription>AI-identified growth opportunities based on trade data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-600">High Potential</Badge>
                  <span className="text-sm text-gray-500">Electronics • Southeast Asia</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Vietnam Electronics Market Expansion
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Growing demand for consumer electronics with 35% YoY import growth. New FTA benefits reduce tariffs by 8%.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600 font-medium">Market Size: $450M</span>
                  <span className="text-green-600 font-medium">Growth Rate: +35%</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Explore Market
              </Button>
            </div>

            <div className="flex items-start justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-blue-600 text-white">Medium Potential</Badge>
                  <span className="text-sm text-gray-500">Textiles • Latin America</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Mexico Textile Manufacturing Hub
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  USMCA benefits for textile imports. Strong manufacturing base with competitive labor costs.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-blue-600 font-medium">Market Size: $280M</span>
                  <span className="text-blue-600 font-medium">Growth Rate: +18%</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Explore Market
              </Button>
            </div>

            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Emerging</Badge>
                  <span className="text-sm text-gray-500">Industrial Equipment • Africa</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Kenya Industrial Equipment Demand
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Infrastructure development driving demand for industrial machinery and equipment.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600 font-medium">Market Size: $120M</span>
                  <span className="text-gray-600 font-medium">Growth Rate: +22%</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Explore Market
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Regional Trade Volume</CardTitle>
            <CardDescription>Your trade activity by region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm font-medium">North America</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">$847K</span>
                  <Badge variant="secondary">42%</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm font-medium">Asia Pacific</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">$623K</span>
                  <Badge variant="secondary">31%</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-sm font-medium">Europe</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">$445K</span>
                  <Badge variant="secondary">22%</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-sm font-medium">Latin America</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">$102K</span>
                  <Badge variant="secondary">5%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Trends</CardTitle>
            <CardDescription>Key insights from market analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-1">Tech Sector Growth</h4>
                <p className="text-sm text-blue-700">
                  Electronics imports up 28% across Asian markets, driven by 5G infrastructure rollout.
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-1">Sustainability Focus</h4>
                <p className="text-sm text-green-700">
                  EU carbon border taxes creating opportunities for low-carbon manufacturing partners.
                </p>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-1">Supply Chain Shifts</h4>
                <p className="text-sm text-orange-700">
                  Near-shoring trends benefiting Mexico and Central American manufacturing hubs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      </div>
    </div>
  );
}