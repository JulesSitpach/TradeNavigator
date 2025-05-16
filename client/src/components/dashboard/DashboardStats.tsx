import { useQuery } from "@tanstack/react-query";
import StatsCard from "./StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { FaBoxesStacked, FaShip, FaDollarSign, FaGlobe } from "react-icons/fa6";

const DashboardStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-5 border border-neutral-200">
            <div className="flex items-center">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="ml-5 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
        Error loading dashboard stats. Please try again.
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard
        title="Total Products"
        value={data?.totalProducts || 0}
        change="+12%"
        icon={<FaBoxesStacked className="text-primary" />}
      />
      
      <StatsCard
        title="Active Shipments"
        value={data?.activeShipments || 0}
        change="+5%"
        icon={<FaShip className="text-primary" />}
      />
      
      <StatsCard
        title="Monthly Savings"
        value={formatCurrency(data?.monthlySavings || 0)}
        change="+18%"
        icon={<FaDollarSign className="text-primary" />}
      />
      
      <StatsCard
        title="Markets Served"
        value={data?.marketsServed || 0}
        change="+3"
        icon={<FaGlobe className="text-primary" />}
      />
    </div>
  );
};

export default DashboardStats;
