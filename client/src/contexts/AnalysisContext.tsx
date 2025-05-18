import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { normalizeAnalysisData } from '@/utils/analysisDataHelper';

// Define the Analysis data structure
type CostComponent = {
  name: string;
  amount: number;
  percentage: number;
  details?: any;
};

// Form values structure used in the input form
export type AnalysisFormValues = {
  productDescription: string;
  productCategory: string;
  hsCode: string;
  originCountry: string;
  destinationCountry: string;
  productValue: string;
  quantity: string;
  weight: string;
  width?: string;
  length?: string;
  height?: string;
  transportMode: string;
  incoterm?: string;
};

// Results structure returned from calculations
export type AnalysisResults = {
  totalCost: number;
  components: CostComponent[];
  timestamp?: string | Date;
};

// Complete analysis data structure that combines form values and results
// This unified structure is what should be used across all dashboard components
export type AnalysisData = {
  id?: string;
  name?: string;
  date?: string | Date;
  // Original form values (string-based for form compatibility)
  formValues: AnalysisFormValues;
  // Calculation results
  results: AnalysisResults;
  // Legacy flattened fields for backward compatibility 
  totalCost?: number;
  components?: CostComponent[];
  productDetails?: {
    description: string;
    hsCode: string;
    category: string;
    originCountry: string;
    destinationCountry: string;
    productValue: number;
    weight: number;
    transportMode: string;
    quantity: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    }
  };
  analysisId?: string;
  timestamp?: Date;
};

// Define the context type
type AnalysisContextType = {
  currentAnalysis: AnalysisData | null;
  savedAnalyses: AnalysisData[];
  isLoading: boolean;
  error: any;
  setCurrentAnalysis: (analysis: AnalysisData) => void;
  saveAnalysis: (name: string) => void;
  loadAnalysis: (id: string) => void;
  deleteAnalysis: (id: string) => void;
  refreshData: () => void;
  lastUpdated: Date | null;
};

// Create the context
export const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

// Create a provider component
export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisData | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<AnalysisData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Access the query client for cache updates
  const queryClient = useQueryClient();
  
  // Force clear demo data right at component initialization - do this first before any other effects
  useEffect(() => {
    // Clear ALL localStorage data to ensure we start completely fresh
    localStorage.removeItem('currentAnalysis');
    localStorage.removeItem('hasAnalysisData');
    localStorage.removeItem('savedAnalyses');
    console.log('Reset application data - removed all demo data');
  }, []);

  // Use tanstack/react-query to fetch saved analyses
  const { 
    data: savedAnalysesData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<AnalysisData[]>({
    queryKey: ['/api/analysis'],
    refetchOnWindowFocus: false,
    staleTime: 60000, // Consider data fresh for 1 minute
    cacheTime: 300000, // Keep unused data in cache for 5 minutes
  });
  
  // Mutation for saving a new analysis
  const saveAnalysisMutation = useMutation({
    mutationFn: async (newAnalysis: AnalysisData) => {
      // In a real implementation, this would be an API call
      // return fetch('/api/analysis', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newAnalysis),
      // }).then(res => res.json());
      
      // For now, simulate API call with localStorage
      console.log('Saving analysis:', newAnalysis);
      return Promise.resolve(newAnalysis);
    },
    onMutate: async (newAnalysis) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['/api/analysis'] });
      
      // Snapshot the previous value
      const previousAnalyses = queryClient.getQueryData<AnalysisData[]>(['/api/analysis']);
      
      // Optimistically update the cache with the new analysis
      if (previousAnalyses) {
        queryClient.setQueryData<AnalysisData[]>(['/api/analysis'], [...previousAnalyses, newAnalysis]);
      }
      
      return { previousAnalyses };
    },
    onError: (err, newAnalysis, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousAnalyses) {
        queryClient.setQueryData<AnalysisData[]>(['/api/analysis'], context.previousAnalyses);
      }
      console.error('Error saving analysis:', err);
    },
    onSettled: () => {
      // Always refetch after error or success to make sure the server state is reflected
      queryClient.invalidateQueries({ queryKey: ['/api/analysis'] });
    },
  });
  
  // Mutation for deleting an analysis
  const deleteAnalysisMutation = useMutation({
    mutationFn: async (id: string) => {
      // In a real implementation, this would be an API call
      // return fetch(`/api/analysis/${id}`, {
      //   method: 'DELETE',
      // }).then(res => res.json());
      
      // For now, simulate API call
      console.log('Deleting analysis:', id);
      return Promise.resolve(id);
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['/api/analysis'] });
      
      // Snapshot the previous value
      const previousAnalyses = queryClient.getQueryData<AnalysisData[]>(['/api/analysis']);
      
      // Optimistically update the cache by removing the deleted analysis
      if (previousAnalyses) {
        queryClient.setQueryData<AnalysisData[]>(
          ['/api/analysis'],
          previousAnalyses.filter(a => (a.id !== id && a.analysisId !== id))
        );
      }
      
      return { previousAnalyses };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousAnalyses) {
        queryClient.setQueryData<AnalysisData[]>(['/api/analysis'], context.previousAnalyses);
      }
      console.error('Error deleting analysis:', err);
    },
    onSettled: () => {
      // Always refetch after error or success to make sure the server state is reflected
      queryClient.invalidateQueries({ queryKey: ['/api/analysis'] });
    },
  });

  // Update saved analyses when data changes
  useEffect(() => {
    if (savedAnalysesData) {
      // Normalize all analyses from API before storing
      const normalizedData = savedAnalysesData.map(analysis => normalizeAnalysisData(analysis));
      setSavedAnalyses(normalizedData);
    }
  }, [savedAnalysesData]);

  // Load current analysis from localStorage on mount
  useEffect(() => {
    // Clear any demo data that might be in localStorage
    const localCurrentAnalysis = localStorage.getItem('currentAnalysis');
    if (localCurrentAnalysis) {
      try {
        const parsedData = JSON.parse(localCurrentAnalysis);
        
        // Check if this is demo data and remove it
        if (parsedData.isDemo || parsedData.name?.includes('[DEMO]')) {
          console.log('Removing demo data from localStorage');
          localStorage.removeItem('currentAnalysis');
          return; // Don't process demo data
        }
        
        // For real user data, normalize and use it
        const normalizedData = normalizeAnalysisData(parsedData);
        if (normalizedData) {
          console.log('Restored current analysis from localStorage:', normalizedData);
          setCurrentAnalysis(normalizedData);
          setLastUpdated(new Date());
        }
      } catch (e) {
        console.error('Error parsing current analysis from localStorage', e);
        // If there's an error with the stored data, clear it
        localStorage.removeItem('currentAnalysis');
      }
    } else {
      console.log('No saved analysis found in localStorage.');
    }
  }, []);

  // Check for saved analyses in localStorage on mount
  useEffect(() => {
    const localSavedAnalyses = localStorage.getItem('savedAnalyses');
    if (localSavedAnalyses) {
      try {
        const parsedData = JSON.parse(localSavedAnalyses);
        // Convert string timestamps and normalize all saved analyses
        const processedData = parsedData.map((analysis: any) => 
          normalizeAnalysisData({
            ...analysis,
            timestamp: analysis.timestamp ? new Date(analysis.timestamp) : new Date(),
            date: analysis.date ? new Date(analysis.date) : new Date()
          })
        );
        setSavedAnalyses(processedData);
      } catch (e) {
        console.error('Error parsing saved analyses from localStorage', e);
      }
    }
  }, []);

  // Save the current analysis with a name
  const saveAnalysis = (name: string) => {
    if (!currentAnalysis) return;
    
    // Create a new normalized analysis object
    const newAnalysis = normalizeAnalysisData({
      ...currentAnalysis,
      name,
      id: `analysis-${Date.now()}`,
      date: new Date(),
      analysisId: `analysis-${Date.now()}`, // for backwards compatibility
      timestamp: new Date() // for backwards compatibility
    });
    
    // Update local state
    const updatedSavedAnalyses = [...savedAnalyses, newAnalysis];
    setSavedAnalyses(updatedSavedAnalyses);
    
    // Save to localStorage for persistence
    localStorage.setItem('savedAnalyses', JSON.stringify(updatedSavedAnalyses));
    localStorage.setItem('currentAnalysis', JSON.stringify(newAnalysis));
    
    // Use the mutation to save (optimistically updates the cache)
    saveAnalysisMutation.mutate(newAnalysis);
    
    setLastUpdated(new Date());
    console.log('Analysis saved:', newAnalysis);
  };

  // Load a saved analysis
  const loadAnalysis = (id: string) => {
    const analysis = savedAnalyses.find(a => (a.id === id || a.analysisId === id));
    if (analysis) {
      // Normalize before setting as current
      const normalizedAnalysis = normalizeAnalysisData(analysis);
      setCurrentAnalysis(normalizedAnalysis);
      
      // Save current analysis to localStorage
      localStorage.setItem('currentAnalysis', JSON.stringify(normalizedAnalysis));
      
      setLastUpdated(new Date());
      console.log('Analysis loaded:', normalizedAnalysis);
    }
  };

  // Delete a saved analysis
  const deleteAnalysis = (id: string) => {
    // Update local state
    const updatedSavedAnalyses = savedAnalyses.filter(a => (a.id !== id && a.analysisId !== id));
    setSavedAnalyses(updatedSavedAnalyses);
    
    // Update localStorage
    localStorage.setItem('savedAnalyses', JSON.stringify(updatedSavedAnalyses));
    
    // Use the mutation to delete (optimistically updates the cache)
    deleteAnalysisMutation.mutate(id);
    
    setLastUpdated(new Date());
    console.log('Analysis deleted, ID:', id);
  };

  // Refresh data from API
  const refreshData = () => {
    setLastUpdated(new Date());
    refetch();
    console.log('Data refresh requested');
  };

  // Update current analysis with fresh data
  const updateCurrentAnalysis = (analysis: AnalysisData) => {
    // Always normalize data before storing in context
    const normalizedAnalysis = normalizeAnalysisData(analysis);
    
    if (normalizedAnalysis) {
      setCurrentAnalysis(normalizedAnalysis);
      
      // Save to localStorage for persistence across page refreshes
      localStorage.setItem('currentAnalysis', JSON.stringify(normalizedAnalysis));
      
      setLastUpdated(new Date());
      console.log('Current analysis updated:', normalizedAnalysis);
    } else {
      console.error('Failed to normalize analysis data:', analysis);
    }
  };

  return (
    <AnalysisContext.Provider
      value={{
        currentAnalysis,
        savedAnalyses,
        isLoading,
        error,
        setCurrentAnalysis: updateCurrentAnalysis,
        saveAnalysis,
        loadAnalysis,
        deleteAnalysis,
        refreshData,
        lastUpdated
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

// Custom hook to use the analysis context
export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};