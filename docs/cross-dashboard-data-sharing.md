# Cross-Dashboard Data Sharing System

This document outlines the implementation of the cross-dashboard data sharing system in the TradeNavigator application, where the Cost Breakdown dashboard acts as the central data producer for all other dashboards.

## Architecture Overview

The system is built around a central shared context (`CostBreakdownContext`) that calculates, stores, and provides cost breakdown data to all dashboards. This ensures data consistency across the application and eliminates the need for redundant calculations.

### Core Components

1. **CostBreakdownContext**: Central shared state provider that handles calculation, storage, and distribution of cost data
2. **Dashboard-specific hooks**: Custom hooks that transform the shared data for each dashboard's specific needs
3. **Integration with AnalysisContext**: Works alongside the existing AnalysisContext to provide a complete data solution

## Data Flow

1. User inputs product and shipping information in the Cost Breakdown dashboard
2. Data is saved to the AnalysisContext (for backward compatibility)
3. CostBreakdownContext calculates detailed cost data and makes it available to all dashboards
4. Each dashboard consumes the data through specialized hooks that format it for their specific needs

## Implementation Details

### 1. CostBreakdownContext

The `CostBreakdownContext` serves as the central data store for all cost-related information. It:

- Handles complex cost calculations
- Stores the results in a structured format
- Provides access to both raw and processed data
- Manages calculation status and metadata
- Handles data persistence across sessions

```typescript
// Location: client/src/contexts/shared/CostBreakdownContext.tsx
export interface CostBreakdownData {
  dutyAmount: number;
  taxAmount: number;
  shippingCost: number;
  // ... other properties
  
  costsByCategory: {
    product: number;
    duties: number;
    taxes: number;
    shipping: number;
    other: number;
  };
  
  percentages: { ... };
  components: Array<{ ... }>;
}
```

### 2. Dashboard-Specific Hooks

Each dashboard has a specialized hook that transforms the raw cost data into the format needed for that specific dashboard:

```typescript
// Location: client/src/hooks/useDashboardData.ts
export const useAlternativeRoutesData = () => {
  const { costData, hasCalculated, isCalculating } = useCostBreakdown();
  
  // Transform cost data for the Alternative Routes dashboard
  return {
    baseRouteCosts: { ... },
    costBreakdownComponents: [ ... ],
    percentages: { ... },
    isReady: hasCalculated
  };
};
```

### 3. Integration in Dashboards

Each dashboard component now uses its specialized hook to access the shared data:

```tsx
// Example: Alternative Routes Dashboard
const AlternativeRoutesDashboard = () => {
  const alternativeRoutesData = useAlternativeRoutesData();
  
  // Use the data for rendering and calculations
};
```

### 4. Provider Setup

The `CostBreakdownProvider` is added to the application's component hierarchy to make the context available throughout the app:

```tsx
// App.tsx
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <AnalysisProvider>
            <CostBreakdownProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </CostBreakdownProvider>
          </AnalysisProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

## Benefits

1. **Consistency**: All dashboards use the same source of truth for cost data
2. **Performance**: Calculations are performed once and shared across the application
3. **Maintainability**: Centralized logic makes updates and fixes easier to implement
4. **User Experience**: Real-time updates propagate to all dashboards simultaneously
5. **Error Handling**: Centralized error management ensures consistent error states

## Usage Guidelines

### How to Access Shared Cost Data

1. **In Cost Breakdown Components**:
   ```tsx
   import { useCostBreakdownSummary } from '@/hooks/useDashboardData';
   
   const CostBreakdown = () => {
     const { data, isLoading, onRecalculate, onExport } = useCostBreakdownSummary();
     // Use data for rendering
   };
   ```

2. **In Alternative Routes Dashboard**:
   ```tsx
   import { useAlternativeRoutesData } from '@/hooks/useDashboardData';
   
   const AlternativeRoutesDashboard = () => {
     const { baseRouteCosts, isReady } = useAlternativeRoutesData();
     // Use data for route comparison
   };
   ```

3. **In Tariff Analysis Dashboard**:
   ```tsx
   import { useTariffAnalysisData } from '@/hooks/useDashboardData';
   
   const TariffAnalysisDashboard = () => {
     const { dutyDetails, taxDetails, isReady } = useTariffAnalysisData();
     // Use data for tariff analysis
   };
   ```

4. **In Regulations Dashboard**:
   ```tsx
   import { useRegulationsData } from '@/hooks/useDashboardData';
   
   const RegulationsDashboard = () => {
     const { complianceCosts, isReady } = useRegulationsData();
     // Use data for compliance analysis
   };
   ```

### Adding New Cost Components

To extend the system with new cost components:

1. Update the `CostBreakdownData` interface in `CostBreakdownContext.tsx`
2. Modify the calculation logic in the `calculateCosts` method
3. Update the appropriate transformation hooks in `useDashboardData.ts`

## Future Enhancements

1. **Real-time Updates**: Add WebSocket support for multi-user collaboration
2. **API Integration**: Connect to real tariff and shipping APIs for accurate data
3. **Cost History**: Track changes in costs over time
4. **Custom Formulas**: Allow users to define custom cost calculation formulas
5. **Export/Import**: Enhanced data exchange with external systems
