import { useState } from "react";
import { CostAnalysisForm } from "@/components/CostAnalysisForm";
import { ResultsSidebar } from "@/components/ResultsSidebar";

export interface CalculationResult {
  id?: number;
  totalCost: string;
  productValue: string;
  shippingCost: string;
  duties: string;
  customsFees: string;
  insuranceCost: string;
  brokerFees: string;
  taxSavings: string;
  timeline: string;
}

export default function CostBreakdown() {
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Cost Breakdown Analysis</h2>
          <p className="mt-2 text-gray-600">
            Get comprehensive cost calculations for your international trade shipments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CostAnalysisForm 
              onCalculationResult={setCalculationResult}
              isCalculating={isCalculating}
              setIsCalculating={setIsCalculating}
            />
          </div>
          
          <div className="lg:col-span-1">
            <ResultsSidebar 
              calculationResult={calculationResult}
              isCalculating={isCalculating}
            />
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isCalculating && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-4"></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Calculating Costs</h3>
                <p className="text-sm text-gray-600">
                  Getting the best rates and analyzing trade agreements...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}