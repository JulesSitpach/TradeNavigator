import { useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/common/PageHeader";
import { LanguageContext } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FaDownload, FaPlus, FaBox, FaShip, FaMoneyBill } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const CostBreakdownDashboard = () => {
  const { t } = useContext(LanguageContext);

  // Simplified data structure for the dashboard - for demonstration purposes
  const data = {
    productName: "Organic Cotton T-Shirts",
    hsCode: "6109.10.00",
    originCountry: "India",
    destinationCountry: "United States",
    quantity: 500,
    unitCost: 5,
    productValue: 2500,
    dutyRate: 15,
    dutyAmount: 375,
    freightCost: 850,
    insuranceCost: 125,
    documentationFees: 200,
    customsClearance: 175,
    totalLandedCost: 4225,
    currency: "USD"
  };

  // Format currency with proper symbols
  const formatCurrency = (amount: number, curr = data.currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr
    }).format(amount);
  };
  
  return (
    <>
      <PageHeader
        title="Cost Breakdown Analysis"
        description="Analyze your landed costs and identify optimization opportunities"
        actions={[
          {
            label: "Export Data",
            icon: <FaDownload />,
            onClick: () => console.log("Export cost breakdown"),
            variant: "outline"
          },
          {
            label: "New Analysis",
            icon: <FaPlus />,
            href: "/dashboard/new-analysis",
            variant: "default"
          }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start">
              <div className="mr-3 mt-1 bg-blue-100 rounded-full p-2">
                <FaBox className="text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Product Value</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.productValue)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {data.quantity} units × {formatCurrency(data.unitCost)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start">
              <div className="mr-3 mt-1 bg-green-100 rounded-full p-2">
                <FaShip className="text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Landed Cost</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.totalLandedCost)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {formatCurrency(data.totalLandedCost / data.quantity)} per unit
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start">
              <div className="mr-3 mt-1 bg-orange-100 rounded-full p-2">
                <FaMoneyBill className="text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Additional Costs</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.totalLandedCost - data.productValue)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {Math.round(((data.totalLandedCost - data.productValue) / data.productValue) * 100)}% of product value
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="summary" className="mb-6">
        <TabsList className="bg-white border border-gray-200 p-1">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Detailed View</TabsTrigger>
          <TabsTrigger value="comparison">Cost Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-4">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="text-xs text-gray-500 p-4 bg-gray-50">
                <p>The Trade Cost Summary shows detailed costs per item, total freight charges, and estimated duties. All values are shown in {data.currency}.</p>
              </div>

              <table className="w-full">
                <tbody className="divide-y divide-gray-200 text-sm">
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">Product Name</td>
                    <td className="px-6 py-4 text-gray-900">{data.productName}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">HS Code</td>
                    <td className="px-6 py-4 text-gray-900">
                      {data.hsCode} 
                      <Badge className="ml-2 bg-blue-50 text-blue-700">GSP Eligible</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">Origin</td>
                    <td className="px-6 py-4 text-gray-900">{data.originCountry}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">Destination</td>
                    <td className="px-6 py-4 text-gray-900">{data.destinationCountry}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">Quantity</td>
                    <td className="px-6 py-4 text-gray-900">{data.quantity} units</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">Product Value</td>
                    <td className="px-6 py-4 text-gray-900">{formatCurrency(data.productValue)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">Freight Cost</td>
                    <td className="px-6 py-4 text-gray-900">{formatCurrency(data.freightCost)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">Duties ({data.dutyRate}%)</td>
                    <td className="px-6 py-4 text-gray-900">{formatCurrency(data.dutyAmount)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">Insurance</td>
                    <td className="px-6 py-4 text-gray-900">{formatCurrency(data.insuranceCost)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">Documentation Fees</td>
                    <td className="px-6 py-4 text-gray-900">{formatCurrency(data.documentationFees)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">Customs Clearance</td>
                    <td className="px-6 py-4 text-gray-900">{formatCurrency(data.customsClearance)}</td>
                  </tr>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-6 py-4 text-gray-800">Total Landed Cost</td>
                    <td className="px-6 py-4 text-gray-900">{formatCurrency(data.totalLandedCost)}</td>
                  </tr>
                  <tr className="bg-gray-50 text-sm font-medium">
                    <td className="px-6 py-4 text-gray-800">Cost per Unit</td>
                    <td className="px-6 py-4 text-gray-900">{formatCurrency(data.totalLandedCost / data.quantity)}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details" className="mt-4">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="comparison" className="mt-4">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Optimization Recommendations */}
      <Card className="bg-white shadow-sm mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Optimization Recommendations</h3>
          <div className="space-y-4">
            <div className="p-4 border border-green-200 rounded-md bg-green-50">
              <h4 className="font-medium text-green-800 mb-1">Duty Savings Opportunity</h4>
              <p className="text-sm text-green-700 mb-2">
                Your product may qualify for preferential duty rates under GSP. Apply for certification to save up to {formatCurrency(data.dutyAmount * 0.6)}.
              </p>
              <Button size="sm" variant="outline" className="text-xs">Learn more</Button>
            </div>
            
            <div className="p-4 border border-blue-200 rounded-md bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-1">Shipping Cost Reduction</h4>
              <p className="text-sm text-blue-700 mb-2">
                Consolidating shipments could reduce your freight costs by approximately 15% ({formatCurrency(data.freightCost * 0.15)}).
              </p>
              <Button size="sm" variant="outline" className="text-xs">Explore options</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 mb-8">
        <Button variant="outline">
          Save Analysis
        </Button>
        <Button asChild>
          <Link href="/dashboard/new-analysis">New Analysis</Link>
        </Button>
      </div>
    </>
  );
};

export default CostBreakdownDashboard;