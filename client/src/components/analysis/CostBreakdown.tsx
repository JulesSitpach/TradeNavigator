import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaRotate, FaDownload } from "react-icons/fa6";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CostBreakdownProps {
  data: {
    costBreakdown: {
      productCost: { amount: number; percentage: number };
      shippingFreight: { amount: number; percentage: number };
      dutiesTariffs: { amount: number; percentage: number };
      insuranceOther: { amount: number; percentage: number };
    };
    totalLandedCost: number;
    currency?: string;
  } | null;
  isLoading: boolean;
  onRecalculate: () => void;
  onExport: () => void;
}

const CostBreakdown = ({ data, isLoading, onRecalculate, onExport }: CostBreakdownProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-neutral-200 mb-6">
        <CardHeader className="border-b border-neutral-200 px-5 py-4 flex justify-between items-center">
          <CardTitle className="text-lg font-medium text-neutral-900">Cost Breakdown</CardTitle>
          <div className="flex items-center text-sm">
            <Skeleton className="h-8 w-24 mr-4" />
            <Skeleton className="h-8 w-16" />
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-2/5 mb-6 lg:mb-0">
              <div className="mb-4">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-40 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-3/5 lg:pl-6">
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="bg-white shadow-sm border border-neutral-200 mb-6">
        <CardHeader className="border-b border-neutral-200 px-5 py-4">
          <CardTitle className="text-lg font-medium text-neutral-900">Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-5 flex justify-center items-center min-h-[300px]">
          <div className="text-center">
            <p className="text-neutral-500 mb-4">No cost analysis data available</p>
            <Button onClick={onRecalculate}>Calculate Costs</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: "Product Cost", value: data.costBreakdown.productCost.percentage, amount: data.costBreakdown.productCost.amount, color: "#1a73e8" },
    { name: "Shipping & Freight", value: data.costBreakdown.shippingFreight.percentage, amount: data.costBreakdown.shippingFreight.amount, color: "#599af2" },
    { name: "Duties & Tariffs", value: data.costBreakdown.dutiesTariffs.percentage, amount: data.costBreakdown.dutiesTariffs.amount, color: "#7eaef5" },
    { name: "Insurance & Other", value: data.costBreakdown.insuranceOther.percentage, amount: data.costBreakdown.insuranceOther.amount, color: "#a5c8f8" }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency || 'USD',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const totalPerUnit = data.totalLandedCost / (data.costBreakdown.productCost.amount / (data.costBreakdown.productCost.amount / data.costBreakdown.productCost.percentage * 100));

  return (
    <Card className="bg-white shadow-sm border border-neutral-200 mb-6">
      <CardHeader className="border-b border-neutral-200 px-5 py-4 flex justify-between items-center">
        <CardTitle className="text-lg font-medium text-neutral-900">Cost Breakdown</CardTitle>
        <div className="flex items-center text-sm">
          <Button variant="ghost" size="sm" onClick={onRecalculate} className="text-neutral-500 mr-4 hover:text-primary">
            <FaRotate className="mr-1" />
            <span>Recalculate</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onExport} className="text-neutral-500 hover:text-primary">
            <FaDownload className="mr-1" />
            <span>Export</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="flex flex-col lg:flex-row">
          {/* Cost Summary */}
          <div className="w-full lg:w-2/5 mb-6 lg:mb-0">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-neutral-500 mb-2">Total Landed Cost</h3>
              <div className="text-3xl font-bold text-neutral-900">{formatCurrency(data.totalLandedCost)}</div>
              <div className="text-sm text-neutral-500 mt-1">{formatCurrency(totalPerUnit)} per unit</div>
            </div>
            
            <div className="space-y-4">
              {chartData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-neutral-700">{item.name}</span>
                    <span className="text-sm font-medium text-neutral-900">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-[#1a73e8] h-2 rounded-full" style={{ 
                      width: `${item.value}%`,
                      backgroundColor: item.color 
                    }}></div>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">{item.value.toFixed(1)}% of total cost</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Cost Chart */}
          <div className="w-full lg:w-3/5 lg:pl-6">
            <div className="bg-neutral-50 rounded-lg p-4 h-full flex flex-col justify-center items-center chart-container" ref={chartRef}>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Percentage']}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="mt-4 w-full flex flex-wrap justify-center gap-4">
                {chartData.map((entry, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-xs text-neutral-600">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostBreakdown;
