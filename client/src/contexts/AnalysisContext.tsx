import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// Define the Analysis data structure
type CostComponent = {
  name: string;
  amount: number;
  percentage: number;
  details?: any;
};

type AnalysisData = {
  totalCost: number;
  components: CostComponent[];
  productDetails: {
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
  timestamp: Date;
  name?: string;
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
      setSavedAnalyses(savedAnalysesData);
    }
  }, [savedAnalysesData]);

  // Check for saved analyses in localStorage on mount
  useEffect(() => {
    const localSavedAnalyses = localStorage.getItem('savedAnalyses');
    if (localSavedAnalyses) {
      try {
        const parsedData = JSON.parse(localSavedAnalyses);
        // Convert string timestamps back to Date objects
        const processedData = parsedData.map((analysis: any) => ({
          ...analysis,
          timestamp: new Date(analysis.timestamp)
        }));
        setSavedAnalyses(processedData);
      } catch (e) {
        console.error('Error parsing saved analyses from localStorage', e);
      }
    }
  }, []);

  // Save the current analysis with a name
  const saveAnalysis = (name: string) => {
    if (!currentAnalysis) return;
    
    const newAnalysis = {
      ...currentAnalysis,
      name,
      analysisId: `analysis-${Date.now()}`,
      timestamp: new Date()
    };
    
    const updatedSavedAnalyses = [...savedAnalyses, newAnalysis];
    setSavedAnalyses(updatedSavedAnalyses);
    
    // Also save to localStorage for persistence
    localStorage.setItem('savedAnalyses', JSON.stringify(updatedSavedAnalyses));
    
    // In a real implementation, save to the API
    // fetch('/api/analysis', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(newAnalysis),
    // });
  };

  // Load a saved analysis
  const loadAnalysis = (id: string) => {
    const analysis = savedAnalyses.find(a => a.analysisId === id);
    if (analysis) {
      setCurrentAnalysis(analysis);
      setLastUpdated(new Date());
    }
  };

  // Delete a saved analysis
  const deleteAnalysis = (id: string) => {
    const updatedSavedAnalyses = savedAnalyses.filter(a => a.analysisId !== id);
    setSavedAnalyses(updatedSavedAnalyses);
    
    // Update localStorage
    localStorage.setItem('savedAnalyses', JSON.stringify(updatedSavedAnalyses));
    
    // In a real implementation, delete from the API
    // fetch(`/api/analysis/${id}`, {
    //   method: 'DELETE',
    // });
  };

  // Refresh data from API
  const refreshData = () => {
    setLastUpdated(new Date());
    refetch();
  };

  // Update current analysis with fresh data
  const updateCurrentAnalysis = (analysis: AnalysisData) => {
    setCurrentAnalysis(analysis);
    setLastUpdated(new Date());
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