import { useContext } from "react";
import { FaDownload, FaPlus } from "react-icons/fa6";
import PageHeader from "@/components/common/PageHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { LanguageContext } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { t } = useContext(LanguageContext);

  // Recent products query
  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  // Recent shipments query
  const { data: shipments, isLoading: isShipmentsLoading } = useQuery({
    queryKey: ['/api/shipments'],
  });

  // Recent analyses query
  const { data: analyses, isLoading: isAnalysesLoading } = useQuery({
    queryKey: ['/api/analysis'],
  });

  return (
    <>
      <PageHeader
        title={t("dashboard.title")}
        description={t("dashboard.description")}
        actions={[
          {
            label: t("common.export"),
            icon: <FaDownload />,
            onClick: () => console.log("Export clicked"),
            variant: "outline"
          },
          {
            label: t("dashboard.newAnalysis"),
            icon: <FaPlus />,
            href: "/product-analysis",
            as: Link
          }
        ]}
      />

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Products */}
        <Card className="bg-white shadow-sm border border-neutral-200">
          <CardHeader className="border-b border-neutral-200 px-5 py-4 flex justify-between items-center">
            <CardTitle className="text-lg font-medium text-neutral-900">{t("dashboard.recentProducts")}</CardTitle>
            <Link href="/products">
              <Button variant="ghost" size="sm" className="text-primary">
                {t("common.viewAll")}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isProductsLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-2">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <ul className="divide-y divide-neutral-200">
                {products.slice(0, 4).map((product: any) => (
                  <li key={product.id} className="p-4 hover:bg-neutral-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-900">{product.name}</h3>
                        <p className="text-xs text-neutral-500">
                          {product.hsCode ? `HS: ${product.hsCode}` : "No HS code"} • {product.originCountry || "Unknown origin"}
                        </p>
                      </div>
                      <Link href={`/product-analysis?productId=${product.id}`}>
                        <Button size="sm" variant="outline">
                          {t("dashboard.analyze")}
                        </Button>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center">
                <p className="text-neutral-500 mb-4">{t("dashboard.noProducts")}</p>
                <Link href="/products">
                  <Button>
                    <FaPlus className="mr-2" />
                    {t("dashboard.addProduct")}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Analyses */}
        <Card className="bg-white shadow-sm border border-neutral-200">
          <CardHeader className="border-b border-neutral-200 px-5 py-4 flex justify-between items-center">
            <CardTitle className="text-lg font-medium text-neutral-900">{t("dashboard.recentAnalyses")}</CardTitle>
            <Link href="/reports">
              <Button variant="ghost" size="sm" className="text-primary">
                {t("common.viewAll")}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isAnalysesLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-2">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : analyses && analyses.length > 0 ? (
              <ul className="divide-y divide-neutral-200">
                {analyses.slice(0, 4).map((analysis: any) => (
                  <li key={analysis.id} className="p-4 hover:bg-neutral-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-900">
                          Analysis #{analysis.id}
                        </h3>
                        <p className="text-xs text-neutral-500">
                          {new Date(analysis.createdAt).toLocaleDateString()} • 
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: analysis.currency || 'USD'
                          }).format(analysis.totalLandedCost)}
                        </p>
                      </div>
                      <Link href={`/product-analysis?analysisId=${analysis.id}`}>
                        <Button size="sm" variant="outline">
                          {t("dashboard.view")}
                        </Button>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center">
                <p className="text-neutral-500 mb-4">{t("dashboard.noAnalyses")}</p>
                <Link href="/product-analysis">
                  <Button>
                    <FaPlus className="mr-2" />
                    {t("dashboard.createAnalysis")}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Global Trade Visualization */}
      <Card className="bg-white shadow-sm border border-neutral-200 mb-6">
        <CardHeader className="border-b border-neutral-200 px-5 py-4">
          <CardTitle className="text-lg font-medium text-neutral-900">{t("dashboard.globalTradeInsights")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative h-80 w-full">
            <img 
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080" 
              alt="Global trade visualization" 
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
              <div className="ml-6 text-white max-w-sm">
                <h3 className="text-xl font-bold mb-2">{t("dashboard.globalMarkets")}</h3>
                <p className="text-sm mb-4">{t("dashboard.marketInsightsDesc")}</p>
                <Link href="/market-analysis">
                  <Button variant="outline" className="bg-white/20 text-white border-white hover:bg-white/30">
                    {t("dashboard.exploreMarkets")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Dashboard;
