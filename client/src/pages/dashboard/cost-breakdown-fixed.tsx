import { useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/common/PageHeader";
import { LanguageContext } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { FaDownload, FaBox, FaPlus } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import CostSummaryTable from "@/components/dashboard/CostSummaryTable";

// Sample data for display purposes
const sampleCostData = {
  productName: "Organic Cotton T-Shirts",
  hsCode: "6109.10.00",
  originCountry: "India",
  destinationCountry: "United States",
  quantity: 500,
  components: [
    { name: "Product Value", value: 2500, percentage: 50 },
    { name: "Shipping & Freight", value: 1000, percentage: 20 },
    { name: "Duties & Tariffs", value: 750, percentage: 15 },
    { name: "Insurance", value: 250, percentage: 5 },
    { name: "Documentation", value: 200, percentage: 4 },
    { name: "Handling Fees", value: 300, percentage: 6 }
  ],
  totalCost: 5000,
  currency: "USD"
};

const CostBreakdownDashboard = () => {
  const { t } = useContext(LanguageContext);

  // Get cost breakdown data from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/cost-breakdown'],
  });

  return (
    <>
      <PageHeader
        title={t("dashboard.costBreakdown.title")}
        description={t("dashboard.costBreakdown.description")}
        actions={[
          {
            label: t("common.export"),
            icon: <FaDownload />,
            onClick: () => console.log("Export cost breakdown"),
            variant: "outline"
          },
          {
            label: "New Analysis",
            icon: <FaPlus />,
            onClick: () => console.log("Create new analysis"),
            href: "/dashboard/new-analysis",
            variant: "default"
          }
        ]}
      />

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-[600px] w-full" />
        </div>
      ) : error ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              <p className="font-medium">Error</p>
              <p className="text-sm">Error loading cost breakdown data</p>
            </div>
          </CardContent>
        </Card>
      ) : !data ? (
        // No data available state
        <Card className="mb-6 border-dashed border-2">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <FaBox className="text-neutral-400 text-xl" />
            </div>
            <h3 className="text-lg font-medium mb-2">No cost breakdown data available</h3>
            <p className="text-neutral-500 max-w-md mx-auto mb-6">
              To view cost breakdown details, please create a new analysis or select an existing shipment.
            </p>
            <Button asChild>
              <Link href="/dashboard/new-analysis">Create New Analysis</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Using our new component for consistent display */}
          <CostSummaryTable
            productName={data.productDetails?.name || sampleCostData.productName}
            hsCode={data.productDetails?.hsCode || sampleCostData.hsCode}
            originCountry={data.productDetails?.origin || sampleCostData.originCountry}
            destinationCountry={data.productDetails?.destination || sampleCostData.destinationCountry}
            quantity={data.productDetails?.quantity || sampleCostData.quantity}
            components={data.components || sampleCostData.components}
            totalCost={data.totalCost || sampleCostData.totalCost}
            currency={data.currency || sampleCostData.currency}
          />
        </div>
      )}
    </>
  );
};

export default CostBreakdownDashboard;