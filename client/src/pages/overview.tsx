import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Calculator, TrendingUp, Globe, Shield, Zap, Users } from "lucide-react";

export default function Overview() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Complete Trade Intelligence Platform
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Everything you need to navigate the complexities of international trade - from cost analysis to compliance management.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
            Start Your Analysis
          </Button>
        </div>
      </div>

      {/* Core Features */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Trade Tools</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform offers everything you need to navigate the complexities of international trade.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardContent>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Cost Analysis</h3>
                <p className="text-gray-600">
                  Get comprehensive import cost calculations with AI-powered HS code suggestions and real-time tariff data.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Market Intelligence</h3>
                <p className="text-gray-600">
                  Access real-time market data, trade agreement optimization, and competitive analysis tools.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Compliance Management</h3>
                <p className="text-gray-600">
                  Stay compliant with automated regulatory updates, documentation requirements, and trade zone benefits.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Why Choose TradeNavigator */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Trade Professionals Choose TradeNavigator
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Zap className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">AI-Powered Accuracy</h3>
                    <p className="text-gray-600">Advanced algorithms ensure precise cost calculations and HS code suggestions.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Global Coverage</h3>
                    <p className="text-gray-600">Support for 200+ countries with real-time tariff and regulation updates.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Expert Support</h3>
                    <p className="text-gray-600">Dedicated trade specialists available to help optimize your operations.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-6">
                  Join thousands of trade professionals who save time and money with TradeNavigator.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  Start Free Trial
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}