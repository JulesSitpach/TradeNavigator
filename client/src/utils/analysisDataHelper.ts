/**
 * Utility functions to handle analysis data validation and verification across dashboard components
 */

/**
 * Checks if analysis data is valid and contains all required fields
 * @param analysis The analysis data object to validate
 * @returns Boolean indicating if the data is valid and complete
 */
export const isValidAnalysisData = (analysis: any): boolean => {
  if (!analysis) {
    return false;
  }

  // Check for the main required data structures
  const hasFormValues = !!analysis.formValues && 
    typeof analysis.formValues === 'object' && 
    Object.keys(analysis.formValues).length > 0;
    
  const hasResults = !!analysis.results && 
    typeof analysis.results === 'object' && 
    Object.keys(analysis.results).length > 0;

  // Check for the flattened structure that some components might use
  const hasTotalCost = typeof analysis.totalCost === 'number';
  const hasComponents = Array.isArray(analysis.components) && analysis.components.length > 0;
  const hasProductDetails = !!analysis.productDetails && typeof analysis.productDetails === 'object';

  // Valid if it has either the nested structure or the flattened structure
  return (hasFormValues && hasResults) || (hasTotalCost && hasComponents && hasProductDetails);
};

/**
 * Transforms analysis data to ensure it has both nested and flattened structure for compatibility
 * @param analysis The analysis data object to transform
 * @returns Normalized analysis data object with consistent structure
 */
export const normalizeAnalysisData = (analysis: any): any => {
  if (!analysis) {
    return null;
  }

  const normalized = { ...analysis };

  // Ensure formValues exists
  if (!normalized.formValues) {
    normalized.formValues = {};
    
    // Extract form values from productDetails if available
    if (normalized.productDetails) {
      normalized.formValues = {
        productDescription: normalized.productDetails.description || '',
        productCategory: normalized.productDetails.category || '',
        hsCode: normalized.productDetails.hsCode || '',
        originCountry: normalized.productDetails.originCountry || '',
        destinationCountry: normalized.productDetails.destinationCountry || '',
        productValue: normalized.productDetails.value?.toString() || '0',
        quantity: normalized.productDetails.quantity?.toString() || '1',
        weight: normalized.productDetails.weight?.toString() || '0',
        transportMode: normalized.productDetails.transportMode || 'Sea'
      };
    }
  }

  // Ensure results exists
  if (!normalized.results) {
    normalized.results = {};
    
    // Extract results from totalCost and components if available
    if (typeof normalized.totalCost === 'number' && Array.isArray(normalized.components)) {
      normalized.results = {
        totalCost: normalized.totalCost,
        components: normalized.components
      };
    }
  }

  // Ensure flattened structure exists
  if (!normalized.totalCost && normalized.results?.totalCost) {
    normalized.totalCost = normalized.results.totalCost;
  }
  
  if (!normalized.components && normalized.results?.components) {
    normalized.components = normalized.results.components;
  }
  
  if (!normalized.productDetails && normalized.formValues) {
    normalized.productDetails = {
      description: normalized.formValues.productDescription,
      category: normalized.formValues.productCategory,
      hsCode: normalized.formValues.hsCode,
      originCountry: normalized.formValues.originCountry,
      destinationCountry: normalized.formValues.destinationCountry,
      value: parseFloat(normalized.formValues.productValue) || 0,
      quantity: parseInt(normalized.formValues.quantity) || 1,
      weight: parseFloat(normalized.formValues.weight) || 0,
      transportMode: normalized.formValues.transportMode
    };
  }

  return normalized;
};

/**
 * Creates a standardized error message for missing analysis data
 * @returns Error message object with title and description
 */
export const getAnalysisDataErrorMessage = () => {
  return {
    title: "No Analysis Data Available",
    description: "Please complete a cost analysis first to view this information.",
    variant: "destructive" as const
  };
};