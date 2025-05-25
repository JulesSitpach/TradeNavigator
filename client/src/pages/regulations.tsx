import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Shield, AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react";

export default function Regulations() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Regulations & Compliance</h1>
          <p className="text-gray-600 mt-1">Stay compliant with international trade regulations</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Shield className="h-4 w-4 mr-2" />
          Check Compliance
        </Button>
      </div>

      {/* Compliance Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Compliant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 mb-1">24</div>
            <p className="text-sm text-green-600">Active shipments in compliance</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Clock className="h-5 w-5" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 mb-1">3</div>
            <p className="text-sm text-yellow-600">Shipments awaiting documentation</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 mb-1">1</div>
            <p className="text-sm text-red-600">Urgent compliance issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Regulatory Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Regulatory Updates
          </CardTitle>
          <CardDescription>Stay informed about the latest trade regulation changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="destructive">Critical</Badge>
                  <span className="text-sm text-gray-500">Effective March 1, 2025</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  EU CBAM Implementation Phase 2
                </h4>
                <p className="text-sm text-gray-600">
                  Carbon Border Adjustment Mechanism now requires quarterly reporting for cement, iron, steel, aluminum, fertilizers, electricity, and hydrogen imports.
                </p>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>

            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-yellow-500 text-yellow-700">Warning</Badge>
                  <span className="text-sm text-gray-500">Effective April 15, 2025</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  US CPSC Battery Safety Requirements
                </h4>
                <p className="text-sm text-gray-600">
                  New safety standards for lithium-ion batteries in consumer electronics require additional testing documentation.
                </p>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>

            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Info</Badge>
                  <span className="text-sm text-gray-500">Effective May 1, 2025</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Canada Enhanced Customs Declaration
                </h4>
                <p className="text-sm text-gray-600">
                  CBSA now requires enhanced product descriptions for all textile and apparel imports above CAD $100.
                </p>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Country-Specific Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Country-Specific Requirements</CardTitle>
          <CardDescription>Key compliance requirements by destination</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">United States</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>FDA Registration (if applicable)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>FCC Declaration (electronics)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>CPSC Compliance (consumer products)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>ISF Filing (ocean shipments)</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">European Union</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>CE Marking (applicable products)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>CBAM Reporting (carbon-intensive goods)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>REACH Compliance (chemicals)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>WEEE Registration (electronics)</span>
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