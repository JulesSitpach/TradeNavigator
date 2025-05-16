import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: ReactNode;
}

const StatsCard = ({ title, value, change, icon }: StatsCardProps) => {
  return (
    <Card className="bg-white p-5 border border-neutral-200">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-primary-50 rounded-full p-3">
          {icon}
        </div>
        <div className="ml-5">
          <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
          <div className="mt-1 flex items-baseline">
            <span className="text-2xl font-semibold text-neutral-900">{value}</span>
            {change && (
              <span className="ml-2 text-xs font-medium text-secondary">{change}</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
