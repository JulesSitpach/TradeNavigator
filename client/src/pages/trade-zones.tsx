import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { MapPin, Clock, DollarSign, Truck } from "lucide-react";

export default function TradeZones() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Foreign Trade Zones</h1>
          <p className="text-gray-600 mt-1">Maximize savings with duty-free storage and processing</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <MapPin className="h-4 w-4 mr-2" />
          Find Nearby FTZ
        </Button>
      </div>

      {/* FTZ Benefits Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <DollarSign className="h-5 w-5" />
              Cost Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 mb-1">$14.6K</div>
            <p className="text-sm text-green-600">Monthly duty deferral benefit</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Clock className="h-5 w-5" />
              Processing Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 mb-1">2-3 days</div>
            <p className="text-sm text-blue-600">Faster customs clearance</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Truck className="h-5 w-5" />
              Active Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 mb-1">248</div>
            <p className="text-sm text-purple-600">FTZ locations in the US</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommended FTZ Locations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended FTZ Locations</CardTitle>
          <CardDescription>Best zones for your product categories and shipping routes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-600">Best Match</Badge>
                  <span className="text-sm text-gray-500">Houston, TX</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">FTZ 84 - Port of Houston</h4>
                <p className="text-sm text-gray-600 mb-2">
                  General purpose zone with excellent rail and trucking connections. Ideal for electronics and automotive parts.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600">Storage: $0.85/sq ft</span>
                  <span className="text-green-600">Processing: $12/hour</span>
                  <span className="text-green-600">Distance to port: 1.2 miles</span>
                </div>
              </div>
              <Button size="sm">Get Quote</Button>
            </div>

            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Good Option</Badge>
                  <span className="text-sm text-gray-500">Los Angeles, CA</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">FTZ 142 - LAX Cargo Complex</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Specialized subzone for electronics assembly and distribution to West Coast markets.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">Storage: $1.15/sq ft</span>
                  <span className="text-gray-600">Processing: $14/hour</span>
                  <span className="text-gray-600">Distance to port: 3.8 miles</span>
                </div>
              </div>
              <Button size="sm" variant="outline">Learn More</Button>
            </div>

            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Alternative</Badge>
                  <span className="text-sm text-gray-500">Newark, NJ</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">FTZ 49 - Newark Seaport</h4>
                <p className="text-sm text-gray-600 mb-2">
                  East Coast hub with access to major population centers and manufacturing regions.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">Storage: $1.05/sq ft</span>
                  <span className="text-gray-600">Processing: $15/hour</span>
                  <span className="text-gray-600">Distance to port: 2.5 miles</span>
                </div>
              </div>
              <Button size="sm" variant="outline">Compare</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FTZ Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>FTZ Savings Calculator</CardTitle>
          <CardDescription>Estimate your potential benefits from using a Foreign Trade Zone</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Current Scenario</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monthly Import Value</span>
                  <span className="font-medium">$120,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Duty Rate</span>
                  <span className="font-medium">4.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monthly Duties Paid</span>
                  <span className="font-medium text-red-600">$5,040</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Inventory Holding Period</span>
                  <span className="font-medium">45 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Re-export Rate</span>
                  <span className="font-medium">15%</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">FTZ Benefits</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Duty Deferral Benefit</span>
                    <span className="font-medium text-green-700">$7,560/month</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Cash flow improvement from delayed duty payment</p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Re-export Savings</span>
                    <span className="font-medium text-blue-700">$756/month</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">No duty on goods exported from FTZ</p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-700">Processing Savings</span>
                    <span className="font-medium text-purple-700">$240/month</span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">Reduced paperwork and faster processing</p>
                </div>
                
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total Monthly Benefit</span>
                    <span className="font-bold text-green-600">$8,556</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Annual Savings</span>
                    <span className="font-bold text-green-600">$102,672</span>
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