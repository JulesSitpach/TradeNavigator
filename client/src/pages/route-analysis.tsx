import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Ship, Plane, Truck, MapPin, Clock, DollarSign } from "lucide-react";

export default function RouteAnalysis() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Route Analysis</h1>
          <p className="text-gray-600 mt-1">Optimize shipping routes and transportation modes</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          Analyze New Route
        </Button>
      </div>

      {/* Route Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-blue-600" />
              Ocean Freight
            </CardTitle>
            <CardDescription>Most economical for large shipments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Transit Time</span>
                <span className="font-medium">18-25 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cost per kg</span>
                <span className="font-medium text-green-600">$2.40</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Reliability</span>
                <Badge variant="secondary">95%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-orange-600" />
              Air Freight
            </CardTitle>
            <CardDescription>Fastest option for urgent shipments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Transit Time</span>
                <span className="font-medium">2-5 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cost per kg</span>
                <span className="font-medium text-red-600">$8.90</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Reliability</span>
                <Badge variant="secondary">98%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-green-600" />
              Ground Transport
            </CardTitle>
            <CardDescription>Best for regional deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Transit Time</span>
                <span className="font-medium">3-7 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cost per kg</span>
                <span className="font-medium text-green-600">$1.80</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Reliability</span>
                <Badge variant="secondary">92%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Recommended Routes
          </CardTitle>
          <CardDescription>Optimized shipping routes based on your requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">Shanghai → Los Angeles</span>
                </div>
                <Badge variant="outline">Ocean</Badge>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  22 days
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  $2,840
                </div>
              </div>
              <Button variant="outline" size="sm">View Details</Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="font-medium">Hong Kong → Frankfurt</span>
                </div>
                <Badge variant="outline">Air</Badge>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  3 days
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  $4,560
                </div>
              </div>
              <Button variant="outline" size="sm">View Details</Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Mexico City → Dallas</span>
                </div>
                <Badge variant="outline">Ground</Badge>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  5 days
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  $890
                </div>
              </div>
              <Button variant="outline" size="sm">View Details</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}