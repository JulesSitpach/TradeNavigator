import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface DataErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * DataErrorFallback component to display when data loading or processing fails.
 * This is more specific than the general FallbackUI and used within components.
 */
export const DataErrorFallback: React.FC<DataErrorFallbackProps> = ({
  message = "Failed to load data",
  onRetry
}) => {
  return (
    <Card className="w-full shadow-sm border-red-100">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-red-500">
          <AlertOctagon size={18} />
          <CardTitle className="text-base">Data Error</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600">{message}</p>
      </CardContent>
      
      {onRetry && (
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={onRetry}
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
