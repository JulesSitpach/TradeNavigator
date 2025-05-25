import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Calculator, Clock, Info } from "lucide-react";
import type { CalculationResult } from "@/pages/home";

interface Props {
  calculationResult: CalculationResult | null;
  isCalculating: boolean;
}

export function ResultsSidebar({ calculationResult, isCalculating }: Props) {
  const { data: recentCalculations } = useQuery({
    queryKey: ["/api/calculations"],
    enabled: true,
  });

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Cost Breakdown Card */}
      <Card className="sticky top-8">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <PieChart className="text-primary mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown</h3>
          </div>
          
          {!calculationResult && !isCalculating && (
            <div className="text-center py-8 text-gray-500">
              <Calculator className="text-3xl mb-4 text-gray-300 mx-auto" />
              <p className="text-sm">
                Enter product details and click "Calculate Import Costs" to see cost breakdown
              </p>
            </div>
          )}

          {isCalculating && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Calculating costs...</p>
            </div>
          )}

          {calculationResult && (
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h4 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(calculationResult.totalCost)}
                </h4>
                <p className="text-sm text-gray-600">Total Import Cost</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Product Value</span>
                  <span className="font-medium">{formatCurrency(calculationResult.productValue)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Shipping Cost</span>
                  <span className="font-medium">{formatCurrency(calculationResult.shippingCost)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Import Duties</span>
                  <span className="font-medium">{formatCurrency(calculationResult.duties)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Customs Fees</span>
                  <span className="font-medium">{formatCurrency(calculationResult.customsFees)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Insurance</span>
                  <span className="font-medium">{formatCurrency(calculationResult.insuranceCost)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Broker Fees</span>
                  <span className="font-medium">{formatCurrency(calculationResult.brokerFees)}</span>
                </div>
                
                {parseFloat(calculationResult.taxSavings) > 0 && (
                  <div className="border-t border-gray-200 pt-3 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tax Savings</span>
                      <span className="font-medium text-green-600">
                        -{formatCurrency(calculationResult.taxSavings)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {parseFloat(calculationResult.taxSavings) > 0 && (
                <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start">
                    <Info className="text-blue-500 mt-0.5 mr-2 h-4 w-4" />
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Trade Agreement Benefit</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Trade agreement saves you {formatCurrency(calculationResult.taxSavings)} in duties
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Estimated Timeline</h5>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{calculationResult.timeline}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recent Calculations Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Calculations</h3>
            <Button variant="link" size="sm" className="text-primary hover:text-secondary p-0">
              View All
            </Button>
          </div>
          
          {recentCalculations && recentCalculations.length > 0 ? (
            <div className="space-y-3">
              {recentCalculations.slice(0, 3).map((calc: any) => (
                <div key={calc.id} className="p-3 border border-gray-200 rounded-md hover:border-gray-300 cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{calc.productName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {calc.originCountry} → {calc.destinationCountry}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(calc.totalCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {calc.shippingMethod?.replace('-', ' ') || 'Standard'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(calc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No recent calculations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
