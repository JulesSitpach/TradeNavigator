import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the data structure for cost breakdown 
export interface CostBreakdownData {
  productCost: { amount: number; percentage: number };
  shippingFreight: { amount: number; percentage: number };
  dutiesTariffs: { amount: number; percentage: number };
  insuranceOther: { amount: number; percentage: number };
  totalLandedCost: number;
  currency: string;
}

// Define the data structure for product information
export interface ProductData {
  id: number;
  name: string;
  description: string;
  hsCode: string;
  originCountry: string;
  value: number;
  unitWeight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  category: string;
}

// Define the data structure for shipment information
export interface ShipmentData {
  id: number;
  origin: string;
  destination: string;
  quantity: number;
  totalWeight: number;
  shippingMethod: string;
  incoterm: string;
  estimatedDeparture: string;
  estimatedArrival: string;
}

// Define shipping options
export interface ShippingOption {
  id: string;
  name: string;
  cost: number;
  transitTime: { min: number; max: number };
  details: {
    freightCost: number;
    insurance: number;
    handlingFees: number;
  };
  route: string;
  carrier: string;
  isRecommended?: boolean;
  transportIcon: 'ship' | 'plane' | 'truck' | 'train';
}

// Define tariff information
export interface TariffInfo {
  hsCode: string;
  description: string;
  countries: {
    name: string;
    code: string;
    baseRate: number;
    specialPrograms: { name: string; rate: number }[] | null;
    finalRate: number;
    highlight: boolean;
  }[];
}

// Define special program
export interface SpecialProgram {
  id: string;
  name: string;
  description: string;
  eligibility: string[];
  potentialSavings: number;
  applicationProcess: string;
  countryCode: string;
}

// Define regulatory requirement
export interface RegulatoryRequirement {
  category: string;
  requirements: string[];
}

// Define visualization data
export interface VisualizationData {
  type: string;
  title: string;
  description: string;
  data: any;
}

// Define the complete analysis data structure
export interface AnalysisData {
  id: number;
  product: ProductData;
  shipment: ShipmentData;
  costBreakdown: CostBreakdownData;
  shippingOptions: ShippingOption[];
  tariffInfo: TariffInfo;
  specialPrograms: SpecialProgram[];
  regulations: RegulatoryRequirement[];
  visualizations: VisualizationData[];
  currency: string;
  calculatedAt: string;
}

interface AnalysisDashboardContextType {
  analysisData: AnalysisData | null;
  setAnalysisData: (data: AnalysisData | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  selectedShippingOption: string | undefined;
  setSelectedShippingOption: (optionId: string | undefined) => void;
  recalculateAnalysis: () => Promise<void>;
  exportAnalysis: () => void;
}

const AnalysisDashboardContext = createContext<AnalysisDashboardContextType>({
  analysisData: null,
  setAnalysisData: () => {},
  isLoading: false,
  setIsLoading: () => {},
  selectedShippingOption: undefined,
  setSelectedShippingOption: () => {},
  recalculateAnalysis: async () => {},
  exportAnalysis: () => {},
});

export const useAnalysisDashboard = () => useContext(AnalysisDashboardContext);

interface AnalysisDashboardProviderProps {
  children: ReactNode;
  initialData?: AnalysisData | null;
  recalculateFunction?: () => Promise<void>;
  exportFunction?: () => void;
}

export const AnalysisDashboardProvider: React.FC<AnalysisDashboardProviderProps> = ({
  children,
  initialData = null,
  recalculateFunction = async () => {},
  exportFunction = () => {},
}) => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedShippingOption, setSelectedShippingOption] = useState<string | undefined>(
    initialData?.shippingOptions.find(option => option.isRecommended)?.id ||
    (initialData?.shippingOptions.length ? initialData.shippingOptions[0].id : undefined)
  );

  const recalculateAnalysis = async () => {
    setIsLoading(true);
    try {
      await recalculateFunction();
    } finally {
      setIsLoading(false);
    }
  };

  const exportAnalysis = () => {
    exportFunction();
  };

  return (
    <AnalysisDashboardContext.Provider
      value={{
        analysisData,
        setAnalysisData,
        isLoading,
        setIsLoading,
        selectedShippingOption,
        setSelectedShippingOption,
        recalculateAnalysis,
        exportAnalysis,
      }}
    >
      {children}
    </AnalysisDashboardContext.Provider>
  );
};

export default AnalysisDashboardContext;