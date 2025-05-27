import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Award, Percent, Globe, Calendar } from "lucide-react";
import { useMasterTranslation } from "@/utils/masterTranslation";

export default function SpecialPrograms() {
  const { t } = useMasterTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Special Trade Programs</h1>
          <p className="text-gray-600 mt-1">Maximize savings through trade preferences and special programs</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Award className="h-4 w-4 mr-2" />
          Find Eligible Programs
        </Button>
      </div>

      {/* Available Programs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Globe className="h-5 w-5" />
              Free Trade Agreements
            </CardTitle>
            <CardDescription className="text-green-700">Preferential tariff rates through FTAs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">USMCA</span>
                <Badge className="bg-green-600">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">KORUS FTA</span>
                <Badge className="bg-green-600">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">EU-Canada CETA</span>
                <Badge variant="outline">Available</Badge>
              </div>
              <div className="text-sm text-green-700 mt-2">
                Potential savings: <strong>$8,240/month</strong>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Percent className="h-5 w-5" />
              Duty Relief Programs
            </CardTitle>
            <CardDescription className="text-blue-700">Special duty reduction opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">GSP</span>
                <Badge variant="outline">Check Eligibility</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">CBI</span>
                <Badge variant="outline">Available</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">ATPA</span>
                <Badge variant="secondary">Expired</Badge>
              </div>
              <div className="text-sm text-blue-700 mt-2">
                Explore opportunities for <strong>duty-free imports</strong>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program Details */}
      <Card>
        <CardHeader>
          <CardTitle>USMCA Benefits Analysis</CardTitle>
          <CardDescription>Your qualification status and potential savings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Qualifying Products</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Electronics (8517.12)</span>
                  <Badge className="bg-green-600">Qualified</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Automotive Parts (8708)</span>
                  <Badge className="bg-green-600">Qualified</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Textiles (6204)</span>
                  <Badge variant="outline">Needs Review</Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Documentation Required</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Certificate of Origin</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Producer Certification</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Regional Value Content Analysis</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Savings Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monthly Duty Savings</span>
                  <span className="font-medium text-green-600">$3,240</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Annual Projection</span>
                  <span className="font-medium text-green-600">$38,880</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Implementation Cost</span>
                  <span className="font-medium">$450</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Foreign Trade Zones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Foreign Trade Zone Benefits
          </CardTitle>
          <CardDescription>Defer duties and reduce inventory costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Available FTZ Locations</h3>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">FTZ 49 - Newark, NJ</span>
                    <Badge variant="secondary">Available</Badge>
                  </div>
                  <p className="text-sm text-gray-600">General purpose zone, 2.5 miles from port</p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">FTZ 142 - Los Angeles, CA</span>
                    <Badge variant="secondary">Available</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Subzone available for electronics assembly</p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">FTZ 84 - Houston, TX</span>
                    <Badge className="bg-green-600">Recommended</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Best fit for your product mix and volume</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">FTZ Benefits Calculator</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Duty Deferral</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Store inventory duty-free until domestic consumption
                  </p>
                  <div className="text-sm">
                    <span className="text-blue-600 font-medium">Cash flow benefit: $12,400/month</span>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Duty Elimination</h4>
                  <p className="text-sm text-green-700 mb-2">
                    No duty on re-exported goods or waste/scrap
                  </p>
                  <div className="text-sm">
                    <span className="text-green-600 font-medium">Potential savings: $1,850/month</span>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Inverted Tariff Benefits</h4>
                  <p className="text-sm text-purple-700 mb-2">
                    Lower duty rates on finished products vs. components
                  </p>
                  <div className="text-sm">
                    <span className="text-purple-600 font-medium">Additional savings: $740/month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>Recommended actions to maximize your trade benefits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Complete USMCA Certificate of Origin</h4>
                <p className="text-sm text-gray-600">Unlock $3,240/month in duty savings</p>
              </div>
              <Button size="sm">Start Process</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Apply for FTZ Operator Status</h4>
                <p className="text-sm text-gray-600">Access Houston FTZ benefits</p>
              </div>
              <Button size="sm" variant="outline">Learn More</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Review GSP Eligibility</h4>
                <p className="text-sm text-gray-600">Check for additional duty-free opportunities</p>
              </div>
              <Button size="sm" variant="outline">Check Status</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}