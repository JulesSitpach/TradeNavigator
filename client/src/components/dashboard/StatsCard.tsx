import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon }) => {
  const isPositiveChange = change?.startsWith('+');

  return (
    <Card className="bg-white shadow-sm p-5 border border-neutral-200">
      <div className="flex items-center">
        {icon && (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
            {icon}
          </div>
        )}
        <div className="ml-5">
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <div className="flex items-baseline">
            <h3 className="text-2xl font-semibold text-neutral-900">{value}</h3>
            {change && (
              <span className={`ml-2 text-xs font-medium ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                {change}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;