import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { BarChart3, PieChart, Map, Download } from "lucide-react";
import { useMasterTranslation } from "@/utils/masterTranslation";

export default function Visualizations() {
  const { t } = useMasterTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trade Analytics Visualizations</h1>
          <p className="text-gray-600 mt-1">Interactive charts and insights for trade data analysis</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Trade Volume Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Trade Volume
            </CardTitle>
            <CardDescription>Import volume trends over the past 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2 p-4 bg-gray-50 rounded-lg">
              {/* Simulated chart bars */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 bg-blue-500 rounded-t" style={{ height: '80px' }}></div>
                <span className="text-xs text-gray-600">Jan</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 bg-blue-500 rounded-t" style={{ height: '95px' }}></div>
                <span className="text-xs text-gray-600">Feb</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 bg-blue-500 rounded-t" style={{ height: '110px' }}></div>
                <span className="text-xs text-gray-600">Mar</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 bg-blue-500 rounded-t" style={{ height: '125px' }}></div>
                <span className="text-xs text-gray-600">Apr</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 bg-blue-500 rounded-t" style={{ height: '140px' }}></div>
                <span className="text-xs text-gray-600">May</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 bg-green-500 rounded-t" style={{ height: '160px' }}></div>
                <span className="text-xs text-gray-600">Jun</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Regular Months</span>
                <div className="w-3 h-3 bg-green-500 rounded ml-4"></div>
                <span>Peak Season</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Trade by Product Category
            </CardTitle>
            <CardDescription>Distribution of imports by product type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="relative">
                {/* Simulated pie chart segments */}
                <svg width="200" height="200" className="transform -rotate-90">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="20"/>
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#3b82f6" strokeWidth="20" 
                          strokeDasharray="150 352" strokeDashoffset="0"/>
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#10b981" strokeWidth="20" 
                          strokeDasharray="100 352" strokeDashoffset="-150"/>
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#f59e0b" strokeWidth="20" 
                          strokeDasharray="75 352" strokeDashoffset="-250"/>
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#ef4444" strokeWidth="20" 
                          strokeDasharray="27 352" strokeDashoffset="-325"/>
                </svg>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Electronics (42%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Textiles (28%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Machinery (21%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Other (9%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Trade Routes Heat Map
          </CardTitle>
          <CardDescription>Visual representation of your most active shipping routes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Simulated world map with route indicators */}
            <div className="relative w-full h-full">
              {/* Continent shapes (simplified) */}
              <div className="absolute top-16 left-20 w-32 h-20 bg-gray-300 rounded-lg opacity-60"></div>
              <div className="absolute top-12 left-60 w-40 h-28 bg-gray-300 rounded-lg opacity-60"></div>
              <div className="absolute top-24 right-32 w-36 h-24 bg-gray-300 rounded-lg opacity-60"></div>
              
              {/* Route lines */}
              <svg className="absolute inset-0 w-full h-full">
                <line x1="120" y1="80" x2="280" y2="70" stroke="#3b82f6" strokeWidth="3" opacity="0.8"/>
                <line x1="280" y1="70" x2="420" y2="85" stroke="#10b981" strokeWidth="4" opacity="0.8"/>
                <line x1="120" y1="80" x2="420" y2="85" stroke="#f59e0b" strokeWidth="2" opacity="0.6"/>
              </svg>
              
              {/* Port indicators */}
              <div className="absolute top-16 left-28 w-3 h-3 bg-blue-600 rounded-full"></div>
              <div className="absolute top-14 left-72 w-3 h-3 bg-green-600 rounded-full"></div>
              <div className="absolute top-20 right-40 w-3 h-3 bg-yellow-600 rounded-full"></div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span>Shanghai → Los Angeles</span>
              <Badge variant="secondary">High Volume</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span>Hamburg → New York</span>
              <Badge variant="secondary">Medium Volume</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
              <span>Ningbo → Long Beach</span>
              <Badge variant="secondary">Growing</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Analysis Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown Analysis</CardTitle>
            <CardDescription>Where your import costs are allocated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Product Value</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded">
                    <div className="w-24 h-2 bg-blue-500 rounded"></div>
                  </div>
                  <span className="text-sm font-medium">75%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Shipping Costs</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded">
                    <div className="w-8 h-2 bg-green-500 rounded"></div>
                  </div>
                  <span className="text-sm font-medium">15%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Duties & Taxes</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded">
                    <div className="w-4 h-2 bg-yellow-500 rounded"></div>
                  </div>
                  <span className="text-sm font-medium">7%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Other Fees</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded">
                    <div className="w-2 h-2 bg-red-500 rounded"></div>
                  </div>
                  <span className="text-sm font-medium">3%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Savings Opportunities</CardTitle>
            <CardDescription>Potential cost reductions identified</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-1">FTA Benefits</h4>
                <p className="text-sm text-green-700 mb-2">
                  Qualify for USMCA duty reductions
                </p>
                <div className="text-lg font-bold text-green-600">$2,840/month</div>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-1">Route Optimization</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Switch to ocean freight for non-urgent items
                </p>
                <div className="text-lg font-bold text-blue-600">$1,230/month</div>
              </div>
              
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-1">Consolidation</h4>
                <p className="text-sm text-purple-700 mb-2">
                  Combine shipments to same destinations
                </p>
                <div className="text-lg font-bold text-purple-600">$650/month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}