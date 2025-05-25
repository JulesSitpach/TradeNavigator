import React, { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error';

interface WithErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

/**
 * A higher-order component that wraps children in an ErrorBoundary
 * Useful for isolating errors to specific sections of the UI
 */
export const WithErrorBoundary: React.FC<WithErrorBoundaryProps> = ({
  children,
  fallback,
  componentName = 'Component'
}) => {
  const handleError = (error: Error) => {
    console.error(`Error in ${componentName}:`, error);
    // Here you could also log to an error tracking service
  };

  return (
    <ErrorBoundary 
      fallback={fallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * A hook that returns a function to wrap components in error boundaries
 * Makes it easy to add error boundaries to any component
 */
export const useErrorBoundary = () => {
  return {
    /**
     * Wrap a component with an error boundary
     * @param ui The UI component to wrap
     * @param options Configuration options
     * @returns The wrapped component
     */
    wrap: (
      ui: ReactNode, 
      options?: { 
        fallback?: ReactNode; 
        componentName?: string; 
      }
    ) => (
      <WithErrorBoundary 
        fallback={options?.fallback}
        componentName={options?.componentName}
      >
        {ui}
      </WithErrorBoundary>
    )
  };
};
