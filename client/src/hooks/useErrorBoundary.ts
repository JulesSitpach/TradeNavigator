import React, { ReactNode } from 'react';

export const WithErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  return children as React.ReactElement;
};

export function useErrorBoundary() {
  return {
    ErrorBoundary: ({ children }: { children: ReactNode }) => children as React.ReactElement,
    wrap: (ui: ReactNode) => ui
  };
}
