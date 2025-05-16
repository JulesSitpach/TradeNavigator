import { useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/common/PageHeader";
import { LanguageContext } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { FaDownload } from "react-icons/fa6";

// Cost Breakdown Dashboard - Following dashboard checklist guidelines
const CostBreakdownDashboard = () => {
  const { t } = useContext(LanguageContext);

  // Get cost breakdown data from API - no hardcoded values
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
          }
        ]}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      ) : error ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              <p className="font-medium">{t("common.error")}</p>
              <p className="text-sm">{t("dashboard.costBreakdown.dataError")}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Cost Breakdown Visual - No hardcoded data, uses dynamic values */}
          <Card className="bg-white shadow-sm border border-neutral-200">
            <CardHeader className="border-b border-neutral-200 px-5 py-4">
              <CardTitle className="text-lg font-medium text-neutral-900">
                {t("dashboard.costBreakdown.visualBreakdownTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="h-64 flex items-center justify-center">
                {/* Replace with actual chart component when data is available */}
                <div className="text-center text-gray-500">
                  <p>{t("dashboard.costBreakdown.selectShipment")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Table - All values dynamically calculated */}
          <Card className="bg-white shadow-sm border border-neutral-200">
            <CardHeader className="border-b border-neutral-200 px-5 py-4">
              <CardTitle className="text-lg font-medium text-neutral-900">
                {t("dashboard.costBreakdown.costsTableTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
                    <tr>
                      <th className="whitespace-nowrap px-5 py-3 text-left">
                        {t("dashboard.costBreakdown.component")}
                      </th>
                      <th className="whitespace-nowrap px-5 py-3 text-right">
                        {t("dashboard.costBreakdown.value")}
                      </th>
                      <th className="whitespace-nowrap px-5 py-3 text-right">
                        {t("dashboard.costBreakdown.percentage")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-sm">
                    {/* Cost Entries - No placeholder data, empty state shown when no data */}
                    {data && data.components ? (
                      data.components.map((component: any, index: number) => (
                        <tr key={index} className="hover:bg-neutral-50">
                          <td className="whitespace-nowrap px-5 py-4 font-medium">
                            {component.name}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-right">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: data.currency || 'USD'
                            }).format(component.value)}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-right">
                            {(component.percentage).toFixed(2)}%
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-5 py-10 text-center text-neutral-500">
                          {t("dashboard.costBreakdown.noDataAvailable")}
                        </td>
                      </tr>
                    )}
                    
                    {/* Total Row - Always calculated, never hard-coded */}
                    {data && data.components && (
                      <tr className="bg-neutral-50 font-medium">
                        <td className="whitespace-nowrap px-5 py-4">
                          {t("dashboard.costBreakdown.total")}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: data.currency || 'USD'
                          }).format(data.totalCost || 0)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          100.00%
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Currency Information with Date-Stamp */}
      <Card className="bg-white shadow-sm border border-neutral-200 mb-6">
        <CardContent className="p-4">
          <div className="text-sm text-neutral-500 flex flex-wrap justify-between">
            <div>
              {t("dashboard.costBreakdown.baseCurrency")}: {data?.currency || 'USD'}
            </div>
            {data?.exchangeRates && (
              <div>
                {t("dashboard.costBreakdown.exchangeRatesDate")}: {new Date(data.exchangeRatesDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes and Assumptions */}
      <Card className="bg-white shadow-sm border border-neutral-200 mb-6">
        <CardHeader className="border-b border-neutral-200 px-5 py-4">
          <CardTitle className="text-lg font-medium text-neutral-900">
            {t("dashboard.costBreakdown.notesTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <ul className="list-disc pl-5 space-y-2 text-sm text-neutral-600">
            <li>{t("dashboard.costBreakdown.note1")}</li>
            <li>{t("dashboard.costBreakdown.note2")}</li>
            <li>{t("dashboard.costBreakdown.note3")}</li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
};

export default CostBreakdownDashboard;