import React from "react";
import { Button } from "@/components/ui/button";

interface Action {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: Action[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions = [] }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      
      {actions.length > 0 && (
        <div className="flex items-center space-x-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || "default"}
              size="sm"
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageHeader;