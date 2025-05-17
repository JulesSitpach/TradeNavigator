import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  // Force clear demo data right at component initialization
  useEffect(() => {
    // Clear demo data from localStorage to ensure we start with clean user data
    localStorage.removeItem('currentAnalysis');
    localStorage.removeItem('hasAnalysisData');
    console.log('Cleared any demo data from localStorage');
  }, []);

  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisData | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<AnalysisData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Use tanstack/react-query to fetch saved analyses
  const { 
    data: savedAnalysesData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<AnalysisData[]>({
    queryKey: ['/api/analysis'],
    refetchOnWindowFocus: false
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
    
    const updatedSavedAnalyses = [...savedAnalyses, newAnalysis];
    setSavedAnalyses(updatedSavedAnalyses);
    
    // Save both to localStorage for persistence
    localStorage.setItem('savedAnalyses', JSON.stringify(updatedSavedAnalyses));
    localStorage.setItem('currentAnalysis', JSON.stringify(newAnalysis));
    
    // In a real implementation, save to the API
    // fetch('/api/analysis', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(newAnalysis),
    // });
    
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
    const updatedSavedAnalyses = savedAnalyses.filter(a => (a.id !== id && a.analysisId !== id));
    setSavedAnalyses(updatedSavedAnalyses);
    
    // Update localStorage
    localStorage.setItem('savedAnalyses', JSON.stringify(updatedSavedAnalyses));
    
    // In a real implementation, delete from the API
    // fetch(`/api/analysis/${id}`, {
    //   method: 'DELETE',
    // });
    
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