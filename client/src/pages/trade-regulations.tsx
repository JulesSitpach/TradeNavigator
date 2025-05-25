import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { FileText, Globe, AlertCircle, TrendingUp, Users, Gavel } from "lucide-react";

export default function TradeRegulations() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trade Regulations</h1>
            <p className="text-gray-600 mt-1">Current international trade policies and regulatory updates</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Globe className="h-4 w-4 mr-2" />
            Check Latest Updates
          </Button>
        </div>

        {/* Regulation Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Globe className="h-5 w-5" />
                WTO Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 mb-1">164</div>
              <p className="text-sm text-blue-600">Member countries</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Users className="h-5 w-5" />
                Trade Agreements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 mb-1">42</div>
              <p className="text-sm text-green-600">Active FTAs</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <TrendingUp className="h-5 w-5" />
                Recent Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700 mb-1">8</div>
              <p className="text-sm text-orange-600">This month</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                Critical Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700 mb-1">3</div>
              <p className="text-sm text-red-600">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Regulatory Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Regulatory Updates</CardTitle>
            <CardDescription>Latest changes in international trade regulations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">Critical Update</span>
                  </div>
                  <Badge variant="destructive">Action Required</Badge>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  EU Carbon Border Adjustment Mechanism (CBAM) Phase 2
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  New reporting requirements effective February 1, 2025 for cement, iron, steel, aluminum, fertilizers, electricity, and hydrogen imports into the EU.
                </p>
                <div className="text-xs text-gray-500">
                  Effective: February 1, 2025 • Impact: High • Regions: EU
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-800">Important Change</span>
                  </div>
                  <Badge className="bg-orange-600">Monitor</Badge>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  USMCA Rules of Origin Modification
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Updated content requirements for automotive and textile products under the United States-Mexico-Canada Agreement.
                </p>
                <div className="text-xs text-gray-500">
                  Effective: March 15, 2025 • Impact: Medium • Regions: North America
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">New Opportunity</span>
                  </div>
                  <Badge className="bg-blue-600">Beneficial</Badge>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  RCEP Digital Trade Provisions Enhancement
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Expanded digital trade facilitation measures under the Regional Comprehensive Economic Partnership agreement.
                </p>
                <div className="text-xs text-gray-500">
                  Effective: January 1, 2025 • Impact: Medium • Regions: Asia-Pacific
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Control Regulations */}
        <Card>
          <CardHeader>
            <CardTitle>Export Control Regulations</CardTitle>
            <CardDescription>Key export control and sanctions requirements by jurisdiction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">United States (BIS/OFAC)</h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">EAR Controlled Items</span>
                      <Badge variant="secondary">Updated Jan 2025</Badge>
                    </div>
                    <div className="text-xs text-gray-600">Export Administration Regulations compliance required</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">ITAR Restrictions</span>
                      <Badge className="bg-red-600">Restricted</Badge>
                    </div>
                    <div className="text-xs text-gray-600">Defense articles and services controls</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">SDN List Screening</span>
                      <Badge className="bg-green-600">Current</Badge>
                    </div>
                    <div className="text-xs text-gray-600">Specially Designated Nationals verification</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">European Union</h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Dual-Use Regulation</span>
                      <Badge variant="secondary">EU 2021/821</Badge>
                    </div>
                    <div className="text-xs text-gray-600">Regulation on dual-use items export controls</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Russia Sanctions</span>
                      <Badge variant="destructive">Active</Badge>
                    </div>
                    <div className="text-xs text-gray-600">Comprehensive sanctions and restrictions</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Human Rights Due Diligence</span>
                      <Badge className="bg-orange-600">Required</Badge>
                    </div>
                    <div className="text-xs text-gray-600">Supply chain due diligence obligations</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trade Agreement Highlights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Major Trade Agreement Updates
            </CardTitle>
            <CardDescription>Recent developments in bilateral and multilateral trade agreements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">CPTPP Expansion Progress</h4>
                  <p className="text-sm text-green-700 mb-2">
                    United Kingdom formally joins the Comprehensive and Progressive Trans-Pacific Partnership.
                  </p>
                  <div className="text-xs text-green-600">
                    Status: Ratification complete • Effective: March 2025
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">AfCFTA Phase 2 Implementation</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    African Continental Free Trade Area advances to services and investment liberalization.
                  </p>
                  <div className="text-xs text-blue-600">
                    Status: Ongoing • Timeline: 2025-2027
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-2">India-EU Trade Agreement</h4>
                  <p className="text-sm text-purple-700 mb-2">
                    Negotiations resume for comprehensive trade and investment partnership.
                  </p>
                  <div className="text-xs text-purple-600">
                    Status: Active negotiations • Target: Late 2025
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                  <h4 className="font-medium text-orange-800 mb-2">MERCOSUR-EU Agreement</h4>
                  <p className="text-sm text-orange-700 mb-2">
                    Environmental provisions added to address sustainability concerns.
                  </p>
                  <div className="text-xs text-orange-600">
                    Status: Under review • Timeline: TBD
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