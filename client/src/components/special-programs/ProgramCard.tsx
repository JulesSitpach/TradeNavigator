import React from 'react';
import { Card } from '@/components/ui/card';

interface ProgramCardProps {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  isSelected?: boolean;
  badgeText?: string;
  onClick?: () => void;
}

const ProgramCard: React.FC<ProgramCardProps> = ({
  id,
  title,
  description,
  potentialSavings,
  isSelected = false,
  badgeText,
  onClick
}) => {
  return (
    <div 
      className={`border-l-4 ${isSelected ? 'border-l-primary' : 'border-l-transparent'} 
        bg-white rounded-md shadow-sm hover:shadow transition-all cursor-pointer mb-3`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            {badgeText && (
              <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded mr-3">
                {badgeText}
              </div>
            )}
            <h3 className="font-medium text-gray-900">{title}</h3>
          </div>
          <div className="text-right">
            <div className="text-green-600 font-semibold">${potentialSavings}</div>
            <div className="text-xs text-gray-500">Potential Savings</div>
          </div>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default ProgramCard;