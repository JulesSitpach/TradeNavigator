import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useLocation } from 'wouter';

interface FallbackUIProps {
  error: Error | null;
  resetErrorBoundary: () => void;
  homeLink?: string;
}

/**
 * FallbackUI component displayed when an error occurs in the application.
 * It provides options to retry, navigate home, or see error details.
 */
export const FallbackUI: React.FC<FallbackUIProps> = ({
  error,
  resetErrorBoundary,
  homeLink = '/'
}) => {
  const [, setLocation] = useLocation();
  const [showDetails, setShowDetails] = React.useState(false);

  const goHome = () => {
    setLocation(homeLink);
    resetErrorBoundary();
  };

  return (
    <div className="w-full min-h-[40vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle size={24} />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>
            We encountered an error while trying to display this content. Please try again or return to the home page.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="bg-red-50 border border-red-100 rounded-md p-4 text-red-800">
            <p className="font-medium">Error: {error?.message || 'Unknown error'}</p>

            {showDetails && error && (
              <div className="mt-4">
                <p className="font-semibold mb-2">Error Details:</p>
                <pre className="text-xs bg-white p-3 rounded overflow-auto max-h-40">
                  {error.stack || JSON.stringify(error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <div className="flex flex-wrap gap-3 w-full">
            <Button 
              variant="default" 
              className="flex-1 flex items-center justify-center gap-2"
              onClick={resetErrorBoundary}
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>

            <Button 
              variant="outline" 
              className="flex-1 flex items-center justify-center gap-2"
              onClick={goHome}
            >
              <Home className="h-4 w-4" />
              Go to Home
            </Button>
          </div>

          <Button 
            variant="link" 
            className="text-sm text-gray-500" 
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Error Details' : 'Show Error Details'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};