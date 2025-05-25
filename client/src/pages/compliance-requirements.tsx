import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Shield, CheckCircle, AlertTriangle, FileText, Clock } from "lucide-react";

export default function ComplianceRequirements() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compliance Requirements</h1>
            <p className="text-gray-600 mt-1">Essential compliance standards for international trade operations</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Shield className="h-4 w-4 mr-2" />
            Check Compliance Status
          </Button>
        </div>

        {/* Compliance Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Compliant Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 mb-1">18</div>
              <p className="text-sm text-green-600">Requirements met</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Clock className="h-5 w-5" />
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700 mb-1">3</div>
              <p className="text-sm text-orange-600">Awaiting verification</p>
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
              <p className="text-sm text-red-600">Immediate attention needed</p>
            </CardContent>
          </Card>
        </div>

        {/* Key Compliance Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Key Compliance Areas</CardTitle>
            <CardDescription>Essential requirements for international trade compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Documentation Requirements</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Commercial Invoice</span>
                      </div>
                      <Badge className="bg-green-600">Complete</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Packing List</span>
                      </div>
                      <Badge className="bg-green-600">Complete</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">Certificate of Origin</span>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Regulatory Compliance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">FDA Registration</span>
                      </div>
                      <Badge className="bg-green-600">Approved</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">EPA Compliance</span>
                      </div>
                      <Badge variant="destructive">Action Required</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Import License</span>
                      </div>
                      <Badge className="bg-green-600">Valid</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Security & Safety Requirements</CardTitle>
            <CardDescription>International security and safety compliance standards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">C-TPAT Certification</h3>
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Certified Partner</span>
                  </div>
                  <p className="text-sm text-green-700 mb-2">Valid through December 2025</p>
                  <ul className="text-xs text-green-600 space-y-1">
                    <li>• Supply chain security procedures verified</li>
                    <li>• Physical security measures approved</li>
                    <li>• Personnel security protocols in place</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Product Safety</h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">UL Certification</span>
                      <Badge className="bg-green-600">Valid</Badge>
                    </div>
                    <div className="text-xs text-gray-600">Electronics safety standards met</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">CE Marking</span>
                      <Badge className="bg-green-600">Compliant</Badge>
                    </div>
                    <div className="text-xs text-gray-600">EU conformity requirements satisfied</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Monthly Compliance Checklist
            </CardTitle>
            <CardDescription>Essential tasks to maintain ongoing compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-green-800">Update export control classifications</span>
                  <div className="text-xs text-green-600">Completed: January 15, 2025</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-green-800">Review denied party screening</span>
                  <div className="text-xs text-green-600">Completed: January 10, 2025</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-orange-800">Audit shipping documentation</span>
                  <div className="text-xs text-orange-600">Due: January 25, 2025</div>
                </div>
                <Button variant="outline" size="sm">Start Audit</Button>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-red-800">Renew EPA environmental permit</span>
                  <div className="text-xs text-red-600">Overdue: Required by January 20, 2025</div>
                </div>
                <Button variant="destructive" size="sm">Renew Now</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}