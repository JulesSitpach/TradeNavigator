import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { MapPin, Globe, TrendingUp, Target, Users, Award } from "lucide-react";
import { useMasterTranslation } from "@/utils/masterTranslation";

export default function RegionalTrade() {
  const { t } = useMasterTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Regional Trade Analysis</h1>
            <p className="text-gray-600 mt-1">Comprehensive insights into regional trade patterns and opportunities</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Target className="h-4 w-4 mr-2" />
            Generate Regional Report
          </Button>
        </div>

        {/* Regional Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Globe className="h-5 w-5" />
                Active Regions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 mb-1">8</div>
              <p className="text-sm text-blue-600">Major trade blocs engaged</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <TrendingUp className="h-5 w-5" />
                Growth Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 mb-1">+12%</div>
              <p className="text-sm text-green-600">Average regional growth</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Award className="h-5 w-5" />
                Trade Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 mb-1">$8.9T</div>
              <p className="text-sm text-purple-600">Combined regional trade</p>
            </CardContent>
          </Card>
        </div>

        {/* Major Trade Blocs */}
        <Card>
          <CardHeader>
            <CardTitle>Major Trade Blocs Performance</CardTitle>
            <CardDescription>Key regional trading partnerships and their economic impact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-800 text-lg">USMCA Region</CardTitle>
                  <CardDescription className="text-blue-600">United States, Mexico, Canada</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Annual Trade Volume</span>
                      <span className="text-sm font-medium">$1.2T</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Growth Rate</span>
                      <span className="text-sm text-green-600 font-medium">+12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Key Products</span>
                      <span className="text-sm text-gray-800">Auto, Energy</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tariff Savings</span>
                      <span className="text-sm text-green-600 font-medium">15-25%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-800 text-lg">EU Single Market</CardTitle>
                  <CardDescription className="text-green-600">27 European Union Members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Annual Trade Volume</span>
                      <span className="text-sm font-medium">$3.8T</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Growth Rate</span>
                      <span className="text-sm text-green-600 font-medium">+8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Key Products</span>
                      <span className="text-sm text-gray-800">Tech, Pharma</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Market Access</span>
                      <span className="text-sm text-green-600 font-medium">450M consumers</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-800 text-lg">ASEAN+3</CardTitle>
                  <CardDescription className="text-purple-600">Southeast Asia + China, Japan, Korea</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Annual Trade Volume</span>
                      <span className="text-sm font-medium">$2.9T</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Growth Rate</span>
                      <span className="text-sm text-green-600 font-medium">+15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Key Products</span>
                      <span className="text-sm text-gray-800">Electronics, Textiles</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Population</span>
                      <span className="text-sm text-purple-600 font-medium">2.2B people</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Trade Agreement Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Agreement Benefits</CardTitle>
            <CardDescription>Comprehensive overview of regional trade agreement advantages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">CPTPP Advantages</h3>
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      95% tariff elimination by 2030
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Simplified customs procedures
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Enhanced IP protections
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      E-commerce facilitation
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">RCEP Benefits</h3>
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      World's largest trade bloc
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Progressive tariff reductions
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Streamlined origin rules
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Supply chain integration
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Trade Flows */}
        <Card>
          <CardHeader>
            <CardTitle>Regional Trade Flow Analysis</CardTitle>
            <CardDescription>Trade volume and direction by major economic regions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Intra-Regional Trade</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-sm font-medium">Asia-Pacific</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">$2.1T</span>
                        <Badge variant="secondary">68%</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm font-medium">Europe</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">$2.4T</span>
                        <Badge variant="secondary">63%</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        <span className="text-sm font-medium">North America</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">$1.8T</span>
                        <Badge variant="secondary">52%</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Inter-Regional Growth</h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Asia ↔ Americas</span>
                        <Badge className="bg-green-600">+18%</Badge>
                      </div>
                      <div className="text-xs text-gray-600">$890B annual volume</div>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Europe ↔ Asia</span>
                        <Badge className="bg-green-600">+14%</Badge>
                      </div>
                      <div className="text-xs text-gray-600">$1.2T annual volume</div>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Africa ↔ Asia</span>
                        <Badge className="bg-green-600">+22%</Badge>
                      </div>
                      <div className="text-xs text-gray-600">$245B annual volume</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emerging Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle>Emerging Regional Opportunities</CardTitle>
            <CardDescription>New trade corridors and growth markets by region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3">AfCFTA Implementation</h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex justify-between">
                      <span>Market Size</span>
                      <span className="font-medium">1.3B people</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GDP</span>
                      <span className="font-medium">$3.4T</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tariff Reduction</span>
                      <span className="font-medium">90% by 2030</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h4 className="font-medium text-green-800 mb-3">Latin America Integration</h4>
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex justify-between">
                      <span>Pacific Alliance</span>
                      <span className="font-medium">$2.2T GDP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mercosur</span>
                      <span className="font-medium">$2.4T GDP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Growth Rate</span>
                      <span className="font-medium">+8.5%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-3">Middle East Connectivity</h4>
                  <div className="space-y-2 text-sm text-purple-700">
                    <div className="flex justify-between">
                      <span>GCC Market</span>
                      <span className="font-medium">$1.8T GDP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trade Growth</span>
                      <span className="font-medium">+16%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Key Sectors</span>
                      <span className="font-medium">Energy, Tech</span>
                    </div>
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