import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Scale, BookOpen, Users, Shield, Globe, FileText } from "lucide-react";

export default function LegalFrameworks() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Legal Frameworks</h1>
            <p className="text-gray-600 mt-1">International legal structures governing global trade operations</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Scale className="h-4 w-4 mr-2" />
            Legal Consultation
          </Button>
        </div>

        {/* Framework Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Globe className="h-5 w-5" />
                International
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 mb-1">12</div>
              <p className="text-sm text-blue-600">Key treaties</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Users className="h-5 w-5" />
                Bilateral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 mb-1">45</div>
              <p className="text-sm text-green-600">Trade agreements</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Shield className="h-5 w-5" />
                Regulatory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 mb-1">28</div>
              <p className="text-sm text-purple-600">Jurisdictions</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <FileText className="h-5 w-5" />
                Dispute Resolution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700 mb-1">8</div>
              <p className="text-sm text-orange-600">Active mechanisms</p>
            </CardContent>
          </Card>
        </div>

        {/* International Legal Frameworks */}
        <Card>
          <CardHeader>
            <CardTitle>International Legal Frameworks</CardTitle>
            <CardDescription>Foundational legal structures for international trade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">World Trade Organization (WTO)</h3>
                  <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">General Agreement on Tariffs and Trade (GATT)</h4>
                    <ul className="text-sm text-blue-700 space-y-1 mb-3">
                      <li>• Most-favored-nation (MFN) treatment</li>
                      <li>• National treatment principle</li>
                      <li>• Tariff binding and reduction commitments</li>
                    </ul>
                    <Badge className="bg-blue-600">Foundational</Badge>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">General Agreement on Trade in Services (GATS)</h4>
                    <ul className="text-sm text-green-700 space-y-1 mb-3">
                      <li>• Market access for service suppliers</li>
                      <li>• National treatment for foreign services</li>
                      <li>• Progressive liberalization framework</li>
                    </ul>
                    <Badge className="bg-green-600">Services</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">United Nations Framework</h3>
                  <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                    <h4 className="font-medium text-purple-800 mb-2">UN Convention on Contracts (CISG)</h4>
                    <ul className="text-sm text-purple-700 space-y-1 mb-3">
                      <li>• International sale of goods contracts</li>
                      <li>• Uniform commercial law principles</li>
                      <li>• Cross-border dispute resolution</li>
                    </ul>
                    <Badge className="bg-purple-600">Commercial Law</Badge>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                    <h4 className="font-medium text-orange-800 mb-2">UNCITRAL Model Laws</h4>
                    <ul className="text-sm text-orange-700 space-y-1 mb-3">
                      <li>• International commercial arbitration</li>
                      <li>• Electronic commerce frameworks</li>
                      <li>• Cross-border insolvency procedures</li>
                    </ul>
                    <Badge className="bg-orange-600">Model Law</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Legal Systems */}
        <Card>
          <CardHeader>
            <CardTitle>Regional Legal Systems</CardTitle>
            <CardDescription>Regional trade law frameworks and their jurisdictional scope</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900">European Union Trade Law</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Common Commercial Policy</span>
                      <Badge variant="secondary">Exclusive EU Competence</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customs Union</span>
                      <Badge className="bg-blue-600">Harmonized</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trade Defense Instruments</span>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-gray-900">ASEAN Legal Framework</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ASEAN Charter</span>
                      <Badge variant="secondary">Legal Personality</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Economic Community</span>
                      <Badge className="bg-green-600">Integrated</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dispute Settlement</span>
                      <Badge className="bg-orange-600">ASEAN Way</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dispute Resolution Mechanisms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Dispute Resolution Mechanisms
            </CardTitle>
            <CardDescription>Available legal remedies for international trade disputes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3">WTO Dispute Settlement</h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div>Timeline: 12-15 months typical</div>
                    <div>Scope: WTO agreement violations</div>
                    <div>Remedy: Compensation/retaliation</div>
                  </div>
                  <div className="mt-3">
                    <Badge className="bg-blue-600">State-to-State</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h4 className="font-medium text-green-800 mb-3">Investment Arbitration</h4>
                  <div className="space-y-2 text-sm text-green-700">
                    <div>Timeline: 2-4 years average</div>
                    <div>Scope: Investment treaty breaches</div>
                    <div>Remedy: Monetary compensation</div>
                  </div>
                  <div className="mt-3">
                    <Badge className="bg-green-600">Investor-State</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-3">Commercial Arbitration</h4>
                  <div className="space-y-2 text-sm text-purple-700">
                    <div>Timeline: 6-18 months typical</div>
                    <div>Scope: Contract disputes</div>
                    <div>Remedy: Damages/specific performance</div>
                  </div>
                  <div className="mt-3">
                    <Badge className="bg-purple-600">Private Parties</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Legal Compliance Best Practices
            </CardTitle>
            <CardDescription>Essential practices for maintaining legal compliance across jurisdictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Documentation Standards</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900">Contract Terms Clarity</h4>
                      <p className="text-xs text-gray-600">Use precise Incoterms and clear delivery obligations</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900">Governing Law Clauses</h4>
                      <p className="text-xs text-gray-600">Specify applicable law and jurisdiction for disputes</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900">Force Majeure Provisions</h4>
                      <p className="text-xs text-gray-600">Include comprehensive force majeure definitions</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Risk Mitigation</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900">Multi-jurisdictional Analysis</h4>
                      <p className="text-xs text-gray-600">Assess legal requirements across all relevant jurisdictions</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900">Regular Legal Updates</h4>
                      <p className="text-xs text-gray-600">Monitor changes in applicable laws and regulations</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900">Expert Legal Counsel</h4>
                      <p className="text-xs text-gray-600">Engage qualified international trade attorneys</p>
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