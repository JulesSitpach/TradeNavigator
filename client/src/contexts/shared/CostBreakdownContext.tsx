import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAnalysis } from '../AnalysisContext';
import { costBreakdownService, CostComponent } from '@/services/costBreakdownService';
import { logger } from '@/utils/logger';

// Define cost breakdown data structure
export interface CostBreakdownData {
  // Core breakdown elements
  dutyAmount: number;
  dutyRate: number;
  taxAmount: number;
  taxRate: number;
  shippingCost: number;
  insuranceCost: number;
  customsFees: number;
  lastMileDelivery: number;
  handlingFees: number;
  productCost: number;
  totalLandedCost: number;
  
  // Grouped values for easy display in different dashboards
  costsByCategory: {
    product: number;
    duties: number;
    taxes: number;
    shipping: number;
    other: number;
  };
  
  // Percentage breakdown for charts and comparisons
  percentages: {
    product: number;
    duties: number;
    taxes: number;
    shipping: number;
    other: number;
  };
  
  // Detailed components for granular displays
  components: CostComponent[];
  
  // Metadata
  lastCalculated: Date | null;
  dataSource: string;
  currency: string;
  calculationStatus: 'idle' | 'calculating' | 'success' | 'error';
  error?: string;
}

// Define the context state type
interface CostBreakdownContextState {
  costData: CostBreakdownData | null;
  isCalculating: boolean;
  hasCalculated: boolean;
  calculateCosts: (forceRecalculate?: boolean) => Promise<void>;
  exportCostData: () => void;
}

// Create the context
const CostBreakdownContext = createContext<CostBreakdownContextState | undefined>(undefined);

// Initial empty state
const initialCostData: CostBreakdownData = {
  dutyAmount: 0,
  dutyRate: 0,
  taxAmount: 0,
  taxRate: 0,
  shippingCost: 0,
  insuranceCost: 0,
  customsFees: 0,
  lastMileDelivery: 0,
  handlingFees: 0,
  productCost: 0,
  totalLandedCost: 0,
  costsByCategory: {
    product: 0,
    duties: 0,
    taxes: 0,
    shipping: 0,
    other: 0,
  },
  percentages: {
    product: 0,
    duties: 0,
    taxes: 0,
    shipping: 0,
    other: 0,
  },
  components: [],
  lastCalculated: null,
  dataSource: '',
  currency: 'USD',
  calculationStatus: 'idle',
};

// Provider component
export const CostBreakdownProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentAnalysis } = useAnalysis();
  const [costData, setCostData] = useState<CostBreakdownData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Parse current analysis data and prepare for cost calculation
  const prepareCalculationData = useCallback(() => {
    if (!currentAnalysis || !currentAnalysis.formValues) {
      throw new Error('No valid analysis data available');
    }
    
    const { 
      productDescription,
      hsCode,
      productCategory,
      originCountry,
      destinationCountry,
      productValue,
      quantity,
      weight,
      width,
      height,
      length,
      transportMode
    } = currentAnalysis.formValues;
    
    // Validate required fields
    if (!hsCode || !originCountry || !destinationCountry || !productValue) {
      throw new Error('Missing required product details');
    }
    
    // Format for costBreakdownService
    const productDetails = {
      description: productDescription,
      category: productCategory,
      hsCode,
      originCountry,
      destinationCountry,
      value: parseFloat(productValue),
    };
    
    const shippingDetails = {
      quantity: parseInt(quantity || '1', 10),
      transportMode,
      shipmentType: 'Standard',
      packageType: 'Cardboard Box',
      weight: parseFloat(weight || '1'),
      dimensions: {
        length: parseFloat(length || '10'),
        width: parseFloat(width || '10'),
        height: parseFloat(height || '10'),
        unit: 'cm',
      },
    };
    
    return { productDetails, shippingDetails };
  }, [currentAnalysis]);
  
  // Implement the cost calculation function
  const calculateCosts = useCallback(async (forceRecalculate = false) => {
    if (!currentAnalysis) {
      logger.warn('CostBreakdownContext: Cannot calculate costs - no analysis data available');
      return;
    }
    
    // Skip calculation if we already have data and aren't forcing recalculation
    if (costData && hasCalculated && !forceRecalculate) {
      logger.info('CostBreakdownContext: Using existing cost data (no recalculation needed)');
      return;
    }
    
    try {
      setIsCalculating(true);
      setCostData(prevData => ({
        ...(prevData || initialCostData),
        calculationStatus: 'calculating',
      }));
      
      const { productDetails, shippingDetails } = prepareCalculationData();
      
      // Call the cost breakdown service to calculate costs
      const results = await costBreakdownService.calculateCosts(productDetails, shippingDetails);
      
      // Format the results for the shared context
      const { breakdown, components } = results;
      
      // Calculate category totals for shipping
      const shippingTotal = 
        breakdown.shippingCost + 
        breakdown.lastMileDelivery;
      
      // Calculate category totals for other fees
      const otherTotal = 
        breakdown.insuranceCost + 
        breakdown.customsFees + 
        breakdown.handlingFees;
      
      // Calculate percentages
      const total = breakdown.totalLandedCost || 1; // Prevent division by zero
      const percentages = {
        product: (breakdown.productCost / total) * 100,
        duties: (breakdown.dutyAmount / total) * 100,
        taxes: (breakdown.taxAmount / total) * 100,
        shipping: (shippingTotal / total) * 100,
        other: (otherTotal / total) * 100,
      };
      
      // Create the full cost data object
      const newCostData: CostBreakdownData = {
        ...breakdown,
        costsByCategory: {
          product: breakdown.productCost,
          duties: breakdown.dutyAmount,
          taxes: breakdown.taxAmount,
          shipping: shippingTotal,
          other: otherTotal,
        },
        percentages,
        components,
        lastCalculated: new Date(),
        currency: 'USD', // Default currency 
        calculationStatus: 'success',
      };
      
      // Store the calculation results
      setCostData(newCostData);
      setHasCalculated(true);
      
      // Save to localStorage for persistence
      localStorage.setItem('costBreakdownData', JSON.stringify(newCostData));
      
      logger.info('CostBreakdownContext: Cost calculation completed successfully');
    } catch (error) {
      logger.error('CostBreakdownContext: Error calculating costs', error);
      setCostData(prevData => ({
        ...(prevData || initialCostData),
        calculationStatus: 'error',
        error: error instanceof Error ? error.message : 'Unknown error during calculation',
      }));
    } finally {
      setIsCalculating(false);
    }
  }, [currentAnalysis, costData, hasCalculated, prepareCalculationData]);
  
  // Export cost data (for future functionality)
  const exportCostData = useCallback(() => {
    if (!costData) {
      logger.warn('CostBreakdownContext: Cannot export - no cost data available');
      return;
    }
    
    // Create a formatted export object
    const exportData = {
      ...costData,
      exportDate: new Date().toISOString(),
      analysisDetails: currentAnalysis ? {
        productDescription: currentAnalysis.formValues.productDescription,
        hsCode: currentAnalysis.formValues.hsCode,
        originCountry: currentAnalysis.formValues.originCountry,
        destinationCountry: currentAnalysis.formValues.destinationCountry,
      } : undefined,
    };
    
    // For now, just log to console - in a real app, this would trigger a file download
    console.log('Export Cost Data:', exportData);
    
    // In a real implementation, you would:
    // 1. Convert to CSV/Excel
    // 2. Generate a download link
    // 3. Trigger download
  }, [costData, currentAnalysis]);
  
  // Automatically calculate costs when analysis data changes
  useEffect(() => {
    if (currentAnalysis) {
      // Check if we have new analysis data that requires recalculation
      const shouldRecalculate = true; // For now, always recalculate when analysis changes
      
      if (shouldRecalculate) {
        calculateCosts(true);
      }
    }
  }, [currentAnalysis, calculateCosts]);
  
  // Load saved cost data from localStorage on initial mount
  useEffect(() => {
    const savedCostData = localStorage.getItem('costBreakdownData');
    if (savedCostData) {
      try {
        const parsedData = JSON.parse(savedCostData);
        // Convert date strings back to Date objects
        if (parsedData.lastCalculated) {
          parsedData.lastCalculated = new Date(parsedData.lastCalculated);
        }
        setCostData(parsedData);
        setHasCalculated(true);
        logger.info('CostBreakdownContext: Loaded saved cost data from localStorage');
      } catch (error) {
        logger.error('CostBreakdownContext: Error loading saved cost data', error);
        localStorage.removeItem('costBreakdownData');
      }
    }
  }, []);
  
  return (
    <CostBreakdownContext.Provider
      value={{
        costData,
        isCalculating,
        hasCalculated,
        calculateCosts,
        exportCostData,
      }}
    >
      {children}
    </CostBreakdownContext.Provider>
  );
};

// Custom hook to use the cost breakdown context
export const useCostBreakdown = () => {
  const context = useContext(CostBreakdownContext);
  if (context === undefined) {
    throw new Error('useCostBreakdown must be used within a CostBreakdownProvider');
  }
  return context;
};
