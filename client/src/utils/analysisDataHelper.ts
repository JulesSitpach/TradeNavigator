/**
 * Utility functions to handle analysis data validation and verification across dashboard components
 * Ensures data consistency between the Cost Breakdown Dashboard and all other dashboard tabs
 * 
 * The standard analysis data structure includes:
 * - formValues: Original form inputs
 * - results: Calculation results
 * - Legacy flattened fields (for backward compatibility)
 */
import { 
  AnalysisData, 
  AnalysisFormValues, 
  AnalysisResults 
} from '@/contexts/AnalysisContext';

/**
 * Checks if analysis data is valid and contains all required fields
 * @param analysis The analysis data object to validate
 * @returns Boolean indicating if the data is valid and complete
 */
export const isValidAnalysisData = (analysis: any): boolean => {
  if (!analysis) {
    console.warn('Analysis validation failed: No analysis data provided');
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
  const isValid = (hasFormValues && hasResults) || (hasTotalCost && hasComponents && hasProductDetails);
  
  if (!isValid) {
    console.warn('Analysis validation failed', {
      hasFormValues, 
      hasResults,
      hasTotalCost,
      hasComponents,
      hasProductDetails,
      analysis
    });
  }
  
  return isValid;
};

/**
 * Creates default form values with empty strings for all required fields
 * @returns A default form values object
 */
export const createDefaultFormValues = (): AnalysisFormValues => {
  return {
    productDescription: '',
    productCategory: '',
    hsCode: '',
    originCountry: '',
    destinationCountry: '',
    productValue: '0',
    quantity: '1',
    weight: '0',
    width: '',
    length: '',
    height: '',
    transportMode: 'Sea',
    incoterm: 'EXW'
  };
};

/**
 * Creates default results structure with zeros
 * @returns A default results object
 */
export const createDefaultResults = (): AnalysisResults => {
  return {
    totalCost: 0,
    components: [],
    timestamp: new Date()
  };
};

/**
 * Deep clones an object to avoid reference issues
 * @param obj The object to clone
 * @returns A deep clone of the object
 */
const deepClone = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle Date objects
  if (obj instanceof Date) {
    return new Date(obj);
  }
  
  // Handle Array objects
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  // Handle Object objects
  const clone: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  
  return clone;
};

/**
 * Transforms analysis data to ensure it has both nested and flattened structure for compatibility
 * This ensures all dashboard components can access data in the format they expect
 * 
 * @param analysis The analysis data object to transform
 * @returns Normalized analysis data object with consistent structure
 */
export const normalizeAnalysisData = (analysis: any): AnalysisData => {
  if (!analysis) {
    console.warn('Cannot normalize null analysis data');
    return {
      formValues: createDefaultFormValues(),
      results: createDefaultResults()
    };
  }

  // Create a deep copy to avoid reference issues
  const normalized = deepClone(analysis);
  
  // Step 1: Ensure proper IDs
  normalized.id = normalized.id || normalized.analysisId || `analysis-${Date.now()}`;
  normalized.name = normalized.name || 'Untitled Analysis';
  normalized.date = normalized.date || normalized.timestamp || new Date();

  // Step 2: Ensure formValues exists with all required fields
  if (!normalized.formValues || typeof normalized.formValues !== 'object') {
    normalized.formValues = createDefaultFormValues();
    
    // Extract form values from productDetails if available
    if (normalized.productDetails) {
      normalized.formValues = {
        ...normalized.formValues,
        productDescription: normalized.productDetails.description || '',
        productCategory: normalized.productDetails.category || '',
        hsCode: normalized.productDetails.hsCode || '',
        originCountry: normalized.productDetails.originCountry || '',
        destinationCountry: normalized.productDetails.destinationCountry || '',
        productValue: (normalized.productDetails.value || normalized.productDetails.productValue)?.toString() || '0',
        quantity: (normalized.productDetails.quantity)?.toString() || '1',
        weight: (normalized.productDetails.weight)?.toString() || '0',
        transportMode: normalized.productDetails.transportMode || 'Sea'
      };
      
      // Add dimensions if available
      if (normalized.productDetails.dimensions) {
        normalized.formValues.length = normalized.productDetails.dimensions.length?.toString() || '';
        normalized.formValues.width = normalized.productDetails.dimensions.width?.toString() || '';
        normalized.formValues.height = normalized.productDetails.dimensions.height?.toString() || '';
      }
    }
  }

  // Step 3: Ensure results exists with all required fields
  if (!normalized.results || typeof normalized.results !== 'object') {
    normalized.results = createDefaultResults();
    
    // Extract results from totalCost and components if available
    if (typeof normalized.totalCost === 'number' && Array.isArray(normalized.components)) {
      normalized.results = {
        totalCost: normalized.totalCost,
        components: normalized.components.map((comp: any) => ({
          name: comp.name,
          amount: comp.amount || comp.value || 0,
          percentage: comp.percentage || (comp.value && normalized.totalCost ? (comp.value / normalized.totalCost) * 100 : 0),
          details: comp.details || null
        })),
        timestamp: normalized.timestamp || new Date()
      };
    }
  } else if (Array.isArray(normalized.results.components)) {
    // Ensure components have the right structure
    normalized.results.components = normalized.results.components.map((comp: any) => ({
      name: comp.name,
      amount: comp.amount || comp.value || 0,
      percentage: comp.percentage || (comp.amount && normalized.results.totalCost ? (comp.amount / normalized.results.totalCost) * 100 : 0),
      details: comp.details || null
    }));
  }

  // Step 4: Ensure flattened structure exists for legacy compatibility
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
      productValue: parseFloat(normalized.formValues.productValue) || 0,
      value: parseFloat(normalized.formValues.productValue) || 0, // duplicate for compatibility
      quantity: parseInt(normalized.formValues.quantity) || 1,
      weight: parseFloat(normalized.formValues.weight) || 0,
      transportMode: normalized.formValues.transportMode,
      dimensions: {
        length: parseFloat(normalized.formValues.length) || 0,
        width: parseFloat(normalized.formValues.width) || 0,
        height: parseFloat(normalized.formValues.height) || 0
      }
    };
  }

  // Step 5: Log the normalization for debugging purposes
  console.debug('Normalized analysis data', { 
    before: analysis, 
    after: normalized,
    hasFormValues: !!normalized.formValues && Object.keys(normalized.formValues).length > 0,
    hasResults: !!normalized.results && Object.keys(normalized.results).length > 0,
    hasLegacyFields: !!normalized.totalCost && !!normalized.components && !!normalized.productDetails
  });

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

/**
 * Retrieves analysis data from the context with fallback to localStorage
 * @param analysisContext The analysis context from useContext
 * @returns The current analysis data or null if unavailable
 */
export const getAnalysisData = (analysisContext: any) => {
  // Get data from context if available
  if (analysisContext?.currentAnalysis) {
    return normalizeAnalysisData(analysisContext.currentAnalysis);
  }
  
  // Try localStorage as fallback
  try {
    const localData = localStorage.getItem('currentAnalysis');
    if (localData) {
      const parsedData = JSON.parse(localData);
      console.log('Fallback: Restored analysis from localStorage');
      return normalizeAnalysisData(parsedData);
    }
  } catch (error) {
    console.error('Error retrieving analysis from localStorage', error);
  }
  
  return null;
};