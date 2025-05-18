import { useMemo } from 'react';
import { useCostBreakdown } from '../contexts/shared/CostBreakdownContext';
import { useAnalysis } from '../contexts/AnalysisContext';

/**
 * Custom hook for Alternative Routes Dashboard
 * Provides formatted cost data specifically for route comparison scenarios
 */
export const useAlternativeRoutesData = () => {
  const { costData, hasCalculated, isCalculating } = useCostBreakdown();
  const { currentAnalysis } = useAnalysis();
  
  // Transform cost data for the Alternative Routes dashboard
  const routesData = useMemo(() => {
    if (!costData || !hasCalculated) {
      return {
        baseRouteCosts: null,
        costBreakdownComponents: [],
        originCountry: '',
        destinationCountry: '',
        hsCode: '',
        isLoading: isCalculating,
        isReady: false,
      };
    }
    
    // Extract origin and destination from current analysis
    const originCountry = currentAnalysis?.formValues?.originCountry || '';
    const destinationCountry = currentAnalysis?.formValues?.destinationCountry || '';
    const hsCode = currentAnalysis?.formValues?.hsCode || '';
    
    // Format data for the route comparison use case
    return {
      baseRouteCosts: {
        dutyAmount: costData.dutyAmount,
        dutyRate: costData.dutyRate,
        freightCost: costData.shippingCost,
        insuranceCost: costData.insuranceCost,
        customsFees: costData.customsFees,
        taxRate: costData.taxRate,
        lastMileDelivery: costData.lastMileDelivery,
        handlingFees: costData.handlingFees,
        totalLandedCost: costData.totalLandedCost,
        productCost: costData.productCost
      },
      costBreakdownComponents: costData.components,
      percentages: costData.percentages,
      originCountry,
      destinationCountry,
      hsCode,
      isLoading: isCalculating,
      isReady: hasCalculated
    };
  }, [costData, currentAnalysis, hasCalculated, isCalculating]);
  
  return routesData;
};

/**
 * Custom hook for Tariff Analysis Dashboard
 * Provides formatted cost data specifically for tariff analysis scenarios
 */
export const useTariffAnalysisData = () => {
  const { costData, hasCalculated, isCalculating } = useCostBreakdown();
  const { currentAnalysis } = useAnalysis();
  
  // Transform cost data for the Tariff Analysis dashboard
  const tariffData = useMemo(() => {
    if (!costData || !hasCalculated) {
      return {
        dutyDetails: null,
        taxDetails: null,
        hsCode: '',
        originCountry: '',
        destinationCountry: '',
        productCategory: '',
        isLoading: isCalculating,
        isReady: false
      };
    }
    
    // Extract relevant info from current analysis
    const hsCode = currentAnalysis?.formValues?.hsCode || '';
    const originCountry = currentAnalysis?.formValues?.originCountry || '';
    const destinationCountry = currentAnalysis?.formValues?.destinationCountry || '';
    const productCategory = currentAnalysis?.formValues?.productCategory || '';
    
    // Format data specifically for tariff analysis
    return {
      dutyDetails: {
        rate: costData.dutyRate,
        amount: costData.dutyAmount,
        percentage: costData.percentages.duties,
        source: costData.dataSource
      },
      taxDetails: {
        rate: costData.taxRate,
        amount: costData.taxAmount,
        percentage: costData.percentages.taxes
      },
      totalValue: costData.productCost,
      totalDutiableValue: costData.productCost + costData.shippingCost,
      hsCode,
      originCountry,
      destinationCountry,
      productCategory,
      isLoading: isCalculating,
      isReady: hasCalculated
    };
  }, [costData, currentAnalysis, hasCalculated, isCalculating]);
  
  return tariffData;
};

/**
 * Custom hook for Regulations Dashboard
 * Provides formatted cost data specifically for compliance and regulatory scenarios
 */
export const useRegulationsData = () => {
  const { costData, hasCalculated, isCalculating } = useCostBreakdown();
  const { currentAnalysis } = useAnalysis();
  
  // Transform cost data for the Regulations dashboard
  const regulationsData = useMemo(() => {
    if (!costData || !hasCalculated) {
      return {
        complianceCosts: null,
        hsCode: '',
        originCountry: '',
        destinationCountry: '',
        productCategory: '',
        isLoading: isCalculating,
        isReady: false
      };
    }
    
    // Extract relevant info from current analysis
    const hsCode = currentAnalysis?.formValues?.hsCode || '';
    const originCountry = currentAnalysis?.formValues?.originCountry || '';
    const destinationCountry = currentAnalysis?.formValues?.destinationCountry || '';
    const productCategory = currentAnalysis?.formValues?.productCategory || '';
    
    // Calculate compliance-related costs from overall cost data
    const customsProcessingTotalCost = costData.customsFees;
    
    // Format data specifically for regulations and compliance
    return {
      complianceCosts: {
        customsFees: costData.customsFees,
        dutyAmount: costData.dutyAmount,
        taxAmount: costData.taxAmount,
        total: customsProcessingTotalCost + costData.dutyAmount + costData.taxAmount,
        percentage: costData.percentages.duties + costData.percentages.taxes
      },
      totalImportValue: costData.productCost,
      totalLandedCost: costData.totalLandedCost,
      hsCode,
      originCountry,
      destinationCountry,
      productCategory,
      isLoading: isCalculating,
      isReady: hasCalculated
    };
  }, [costData, currentAnalysis, hasCalculated, isCalculating]);
  
  return regulationsData;
};

/**
 * Custom hook for any component needing cost breakdown summary
 * Provides simplified cost breakdown data for charts and summaries
 */
export const useCostBreakdownSummary = () => {
  const { costData, hasCalculated, isCalculating, calculateCosts, exportCostData } = useCostBreakdown();
  
  // Format the data for summary display
  const summaryData = useMemo(() => {
    if (!costData || !hasCalculated) {
      return {
        data: null,
        isLoading: isCalculating,
        onRecalculate: calculateCosts,
        onExport: exportCostData
      };
    }
    
    // Format for the CostBreakdown component's expected structure
    return {
      data: {
        costBreakdown: {
          productCost: { 
            amount: costData.costsByCategory.product, 
            percentage: costData.percentages.product 
          },
          shippingFreight: { 
            amount: costData.costsByCategory.shipping, 
            percentage: costData.percentages.shipping 
          },
          dutiesTariffs: { 
            amount: costData.costsByCategory.duties + costData.costsByCategory.taxes, 
            percentage: costData.percentages.duties + costData.percentages.taxes 
          },
          insuranceOther: { 
            amount: costData.costsByCategory.other, 
            percentage: costData.percentages.other 
          }
        },
        totalLandedCost: costData.totalLandedCost,
        currency: costData.currency
      },
      isLoading: isCalculating,
      onRecalculate: () => calculateCosts(true),
      onExport: exportCostData
    };
  }, [costData, hasCalculated, isCalculating, calculateCosts, exportCostData]);
  
  return summaryData;
};
