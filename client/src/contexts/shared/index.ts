/**
 * Shared contexts index file
 * 
 * This file exports all shared contexts and their hooks for easy importing
 * throughout the application.
 */

// Export the CostBreakdownContext and its hooks
export { 
  CostBreakdownProvider, 
  useCostBreakdown 
} from './CostBreakdownContext';

// Export utility hooks for specific dashboards
export {
  useAlternativeRoutesData,
  useTariffAnalysisData,
  useRegulationsData,
  useCostBreakdownSummary
} from '../../hooks/useDashboardData';
