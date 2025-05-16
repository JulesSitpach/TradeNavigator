import React, { ReactNode, ComponentType } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface ActionItem {
  label: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
  as?: ComponentType<any>;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ActionItem[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, children, actions }) => {
  return (
    <div className="mb-6 pb-4 border-b border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
        
        {actions && actions.length > 0 && (
          <div className="mt-4 md:mt-0 space-x-2 flex flex-wrap gap-2">
            {actions.map((action, index) => {
              const ButtonComponent = action.as || 'button';
              
              if (action.as === Link && action.href) {
                return (
                  <Link key={index} href={action.href}>
                    <Button 
                      onClick={action.onClick}
                      variant={action.variant || 'default'}
                      disabled={action.disabled}
                      className="flex items-center"
                    >
                      {action.icon && <span className="mr-2">{action.icon}</span>}
                      {action.label}
                    </Button>
                  </Link>
                );
              }
              
              return (
                <Button 
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || 'default'}
                  disabled={action.disabled}
                  className="flex items-center"
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
        
        {children && <div className="mt-4 md:mt-0">{children}</div>}
      </div>
    </div>
  );
};

export default PageHeader;