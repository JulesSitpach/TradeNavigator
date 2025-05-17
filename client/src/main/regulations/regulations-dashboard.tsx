/**
 * @component Regulations Dashboard
 * @status PRODUCTION
 * @version 1.0
 * @lastModified 2025-05-17
 * @description Dashboard for streamlining compliance requirements and documentation.
 *              Helps users understand and manage regulatory requirements for their
 *              international shipments based on product type, countries, and transport mode.
 */

import { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { AnalysisContext } from "@/contexts/AnalysisContext";
import { useToast } from "@/hooks/use-toast";
import { BarChart, PieChart, Bar, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertTriangle, FileText, ClipboardCheck, Calendar, Download, ExternalLink, Shield, Info, Clock, Check, X } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";

// Define regulation types
interface Regulation {
  id: string;
  name: string;
  agency: string;
  countryCode: string;
  description: string;
  requiredFor: string[];
  exemptions?: string[];
  documentation: DocumentRequirement[];
  processingTime: {
    min: number;
    max: number;
    unit: 'days' | 'weeks' | 'months';
  };
  fees: {
    amount: number;
    currency: string;
    description: string;
  }[];
  resources: {
    title: string;
    url: string;
    type: 'website' | 'form' | 'guide';
  }[];
  deadlines?: {
    description: string;
    days: number;
    relative: 'before' | 'after';
    event: string;
  }[];
  severity: 'critical' | 'major' | 'standard';
}

interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  conditionDescription?: string;
  templateAvailable: boolean;
  sampleUrl?: string;
  issuingAuthority?: string;
  processingTime?: {
    min: number;
    max: number;
    unit: 'days' | 'weeks' | 'months';
  };
}

interface RegulationCategory {
  id: string;
  name: string;
  description: string;
  iconName: string;
  regulations: Regulation[];
}

const RegulationsDashboard = () => {
  const { toast } = useToast();
  const analysisContext = useContext(AnalysisContext);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [regulationCategories, setRegulationCategories] = useState<RegulationCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [documentChecklist, setDocumentChecklist] = useState<DocumentRequirement[]>([]);
  const [completedDocuments, setCompletedDocuments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // Import utility functions for data validation and normalization
    import('@/utils/analysisDataHelper').then(({ isValidAnalysisData, normalizeAnalysisData, getAnalysisDataErrorMessage }) => {
      // Get the current analysis from the context
      if (analysisContext?.currentAnalysis) {
        // Normalize data to ensure it has a consistent structure
        const normalizedData = normalizeAnalysisData(analysisContext.currentAnalysis);
        
        // Validate the data before using it
        if (isValidAnalysisData(normalizedData)) {
          setCurrentAnalysis(normalizedData);
          
          // Analyze regulatory requirements based on normalized analysis data
          analyzeRegulations(normalizedData);
        } else {
          toast(getAnalysisDataErrorMessage());
        }
      } else {
        toast(getAnalysisDataErrorMessage());
      }
    });
  }, [analysisContext?.currentAnalysis]);
  
  // Analyze regulatory requirements based on the current analysis
  const analyzeRegulations = (analysis: any) => {
    if (!analysis) {
      return;
    }
    
    setIsLoading(true);
    
    // Extract relevant data from the analysis
    const { 
      hsCode, 
      productDescription, 
      productCategory,
      originCountry, 
      destinationCountry, 
      transportMode
    } = analysis.formValues;
    
    // Get regulatory requirements based on product and countries
    fetchRegulatoryRequirements(hsCode, productCategory, originCountry, destinationCountry, transportMode);
    
    setIsLoading(false);
  };
  
  // Fetch regulatory requirements
  const fetchRegulatoryRequirements = (
    hsCode: string, 
    category: string, 
    origin: string, 
    destination: string,
    transportMode: string
  ) => {
    // In a real app, this would be an API call to a regulations database
    // Simulating the result with realistic data based on the parameters
    
    const allDocuments: DocumentRequirement[] = [];
    const categories: RegulationCategory[] = [];
    
    // 1. Customs Regulations
    const customsRegulations: Regulation[] = [
      {
        id: "customs-1",
        name: "Import Declaration",
        agency: "Customs Authority",
        countryCode: destination,
        description: "Official declaration of imported goods for customs clearance purposes",
        requiredFor: ["All imported goods"],
        documentation: [
          {
            id: "doc-1",
            name: "Customs Declaration Form",
            description: "Complete and submit the official customs declaration form for the destination country",
            required: true,
            templateAvailable: true,
            sampleUrl: "https://example.com/customs-form",
            issuingAuthority: `${destination.toUpperCase()} Customs Authority`
          },
          {
            id: "doc-2",
            name: "Commercial Invoice",
            description: "Document issued by the seller to the buyer that includes a description of the goods, quantity, and value",
            required: true,
            templateAvailable: false,
            issuingAuthority: "Exporter"
          },
          {
            id: "doc-3",
            name: "Packing List",
            description: "Itemized list of package contents with weights and dimensions",
            required: true,
            templateAvailable: false,
            issuingAuthority: "Exporter"
          }
        ],
        processingTime: {
          min: 1,
          max: 3,
          unit: "days"
        },
        fees: [
          {
            amount: 35,
            currency: "USD",
            description: "Standard processing fee"
          }
        ],
        resources: [
          {
            title: "Official Customs Portal",
            url: "https://customs.gov.example",
            type: "website"
          },
          {
            title: "Declaration Form",
            url: "https://customs.gov.example/forms",
            type: "form"
          }
        ],
        severity: "critical"
      },
      {
        id: "customs-2",
        name: "Customs Valuation",
        agency: "Customs Authority",
        countryCode: destination,
        description: "Process for determining the customs value of imported goods for duty assessment",
        requiredFor: ["All imported goods"],
        documentation: [
          {
            id: "doc-4",
            name: "Valuation Declaration",
            description: "Statement of the transaction value of the goods",
            required: true,
            templateAvailable: true,
            issuingAuthority: `${destination.toUpperCase()} Customs Authority`
          },
          {
            id: "doc-5",
            name: "Proof of Payment",
            description: "Evidence of payment for the goods being imported",
            required: true,
            templateAvailable: false,
            issuingAuthority: "Importer/Exporter"
          }
        ],
        processingTime: {
          min: 1,
          max: 2,
          unit: "days"
        },
        fees: [],
        resources: [
          {
            title: "Valuation Guidelines",
            url: "https://customs.gov.example/valuation",
            type: "guide"
          }
        ],
        severity: "major"
      }
    ];
    
    allDocuments.push(...customsRegulations.flatMap(reg => reg.documentation));
    
    // 2. Product Safety Regulations
    let safetyRegulations: Regulation[] = [];
    
    // Electronic products
    if (category === "electronics") {
      safetyRegulations = [
        {
          id: "safety-1",
          name: "Electrical Safety Certification",
          agency: "Safety Standards Authority",
          countryCode: destination,
          description: "Certification that electronic products meet safety standards for the destination market",
          requiredFor: ["Electronic products", "Electrical appliances"],
          documentation: [
            {
              id: "doc-6",
              name: "Safety Test Report",
              description: "Laboratory test results confirming compliance with safety standards",
              required: true,
              templateAvailable: false,
              issuingAuthority: "Accredited Testing Laboratory"
            },
            {
              id: "doc-7",
              name: "Product Certification",
              description: "Official certification mark for the destination market",
              required: true,
              templateAvailable: false,
              issuingAuthority: `${destination.toUpperCase()} Certification Body`
            }
          ],
          processingTime: {
            min: 2,
            max: 6,
            unit: "weeks"
          },
          fees: [
            {
              amount: 500,
              currency: "USD",
              description: "Testing and certification fees"
            }
          ],
          resources: [
            {
              title: "Electrical Safety Standards",
              url: "https://safety.gov.example",
              type: "website"
            }
          ],
          deadlines: [
            {
              description: "Application for certification",
              days: 60,
              relative: "before",
              event: "Import date"
            }
          ],
          severity: "critical"
        },
        {
          id: "safety-2",
          name: "Electromagnetic Compatibility (EMC)",
          agency: "Communications Authority",
          countryCode: destination,
          description: "Requirements to ensure electronic devices don't interfere with other equipment",
          requiredFor: ["Electronic products", "Wireless devices"],
          documentation: [
            {
              id: "doc-8",
              name: "EMC Test Report",
              description: "Laboratory test results confirming compliance with EMC standards",
              required: true,
              templateAvailable: false,
              issuingAuthority: "Accredited Testing Laboratory"
            },
            {
              id: "doc-9",
              name: "Declaration of Conformity",
              description: "Manufacturer's declaration that the product complies with EMC requirements",
              required: true,
              templateAvailable: true,
              issuingAuthority: "Manufacturer"
            }
          ],
          processingTime: {
            min: 1,
            max: 4,
            unit: "weeks"
          },
          fees: [
            {
              amount: 350,
              currency: "USD",
              description: "Testing fees"
            }
          ],
          resources: [
            {
              title: "EMC Guidelines",
              url: "https://communications.gov.example/emc",
              type: "guide"
            }
          ],
          severity: "major"
        }
      ];
    }
    // Textile products
    else if (category === "textiles") {
      safetyRegulations = [
        {
          id: "safety-3",
          name: "Textile Labeling Requirements",
          agency: "Consumer Protection Agency",
          countryCode: destination,
          description: "Regulations for proper labeling of textile products including fiber content and care instructions",
          requiredFor: ["Textile products", "Apparel"],
          documentation: [
            {
              id: "doc-10",
              name: "Fiber Content Test Report",
              description: "Laboratory analysis of textile fiber composition",
              required: true,
              templateAvailable: false,
              issuingAuthority: "Accredited Testing Laboratory"
            },
            {
              id: "doc-11",
              name: "Label Compliance Declaration",
              description: "Declaration that product labels meet destination country requirements",
              required: true,
              templateAvailable: true,
              issuingAuthority: "Manufacturer"
            }
          ],
          processingTime: {
            min: 1,
            max: 2,
            unit: "weeks"
          },
          fees: [
            {
              amount: 200,
              currency: "USD",
              description: "Testing fees"
            }
          ],
          resources: [
            {
              title: "Textile Labeling Guide",
              url: "https://consumer.gov.example/textiles",
              type: "guide"
            }
          ],
          severity: "major"
        },
        {
          id: "safety-4",
          name: "Restricted Substances Testing",
          agency: "Environmental Protection Agency",
          countryCode: destination,
          description: "Testing for harmful chemicals and substances in textile products",
          requiredFor: ["Textile products", "Leather goods", "Footwear"],
          documentation: [
            {
              id: "doc-12",
              name: "Chemical Test Report",
              description: "Laboratory test results confirming compliance with restricted substances regulations",
              required: true,
              templateAvailable: false,
              issuingAuthority: "Accredited Testing Laboratory"
            }
          ],
          processingTime: {
            min: 1,
            max: 3,
            unit: "weeks"
          },
          fees: [
            {
              amount: 400,
              currency: "USD",
              description: "Testing fees"
            }
          ],
          resources: [
            {
              title: "Restricted Substances List",
              url: "https://environment.gov.example/textiles",
              type: "website"
            }
          ],
          severity: "critical"
        }
      ];
    }
    // Food products
    else if (category === "food") {
      safetyRegulations = [
        {
          id: "safety-5",
          name: "Food Safety Certification",
          agency: "Food Safety Authority",
          countryCode: destination,
          description: "Certification that food products meet safety standards and regulations",
          requiredFor: ["Food products", "Beverages"],
          documentation: [
            {
              id: "doc-13",
              name: "Food Safety Certificate",
              description: "Official certification that the product meets food safety standards",
              required: true,
              templateAvailable: false,
              issuingAuthority: `${destination.toUpperCase()} Food Safety Authority`
            },
            {
              id: "doc-14",
              name: "Ingredient List",
              description: "Detailed list of all ingredients in the food product",
              required: true,
              templateAvailable: true,
              issuingAuthority: "Manufacturer"
            },
            {
              id: "doc-15",
              name: "Lab Analysis Report",
              description: "Laboratory analysis of nutritional content and contaminants",
              required: true,
              templateAvailable: false,
              issuingAuthority: "Accredited Food Testing Laboratory"
            }
          ],
          processingTime: {
            min: 2,
            max: 8,
            unit: "weeks"
          },
          fees: [
            {
              amount: 600,
              currency: "USD",
              description: "Testing and certification fees"
            }
          ],
          resources: [
            {
              title: "Food Import Guidelines",
              url: "https://foodsafety.gov.example",
              type: "guide"
            }
          ],
          deadlines: [
            {
              description: "Pre-approval application",
              days: 90,
              relative: "before",
              event: "Import date"
            }
          ],
          severity: "critical"
        }
      ];
    }
    // Generic product safety for other categories
    else {
      safetyRegulations = [
        {
          id: "safety-6",
          name: "General Product Safety",
          agency: "Consumer Protection Agency",
          countryCode: destination,
          description: "General safety requirements for consumer products",
          requiredFor: ["Consumer products"],
          documentation: [
            {
              id: "doc-16",
              name: "Safety Declaration",
              description: "Declaration that the product meets safety requirements",
              required: true,
              templateAvailable: true,
              issuingAuthority: "Manufacturer"
            }
          ],
          processingTime: {
            min: 1,
            max: 2,
            unit: "weeks"
          },
          fees: [],
          resources: [
            {
              title: "Product Safety Guidelines",
              url: "https://consumer.gov.example/safety",
              type: "guide"
            }
          ],
          severity: "standard"
        }
      ];
    }
    
    allDocuments.push(...safetyRegulations.flatMap(reg => reg.documentation));
    
    // 3. Transport Mode-Specific Requirements
    const transportRegulations: Regulation[] = [];
    
    if (transportMode === "Air") {
      transportRegulations.push({
        id: "transport-1",
        name: "Air Cargo Security Declaration",
        agency: "Aviation Authority",
        countryCode: destination,
        description: "Security declaration for air cargo shipments",
        requiredFor: ["Air shipments"],
        documentation: [
          {
            id: "doc-17",
            name: "Air Cargo Security Declaration",
            description: "Declaration confirming cargo has been secured according to aviation security requirements",
            required: true,
            templateAvailable: true,
            issuingAuthority: "Freight Forwarder / Airline"
          }
        ],
        processingTime: {
          min: 1,
          max: 2,
          unit: "days"
        },
        fees: [],
        resources: [
          {
            title: "Air Cargo Security Requirements",
            url: "https://aviation.gov.example/cargo",
            type: "website"
          }
        ],
        severity: "major"
      });
    } else if (transportMode === "Sea") {
      transportRegulations.push({
        id: "transport-2",
        name: "Maritime Shipping Documentation",
        agency: "Maritime Authority",
        countryCode: destination,
        description: "Required documentation for sea freight shipments",
        requiredFor: ["Sea shipments"],
        documentation: [
          {
            id: "doc-18",
            name: "Bill of Lading",
            description: "Document issued by a carrier to acknowledge receipt of cargo for shipment",
            required: true,
            templateAvailable: false,
            issuingAuthority: "Shipping Line / Carrier"
          },
          {
            id: "doc-19",
            name: "Cargo Manifest",
            description: "Document listing the cargo carried on a vessel",
            required: true,
            templateAvailable: false,
            issuingAuthority: "Shipping Line / Carrier"
          }
        ],
        processingTime: {
          min: 2,
          max: 3,
          unit: "days"
        },
        fees: [],
        resources: [
          {
            title: "Maritime Shipping Guidelines",
            url: "https://maritime.gov.example",
            type: "guide"
          }
        ],
        severity: "major"
      });
      
      // Add ISPM-15 for wood packaging in sea shipments
      transportRegulations.push({
        id: "transport-3",
        name: "ISPM-15 Wood Packaging Requirements",
        agency: "Plant Health Authority",
        countryCode: destination,
        description: "International standards for wood packaging material used in international trade",
        requiredFor: ["Shipments with wooden packaging"],
        documentation: [
          {
            id: "doc-20",
            name: "ISPM-15 Compliance Statement",
            description: "Declaration that wooden packaging materials comply with ISPM-15 standards",
            required: true,
            templateAvailable: true,
            issuingAuthority: "Exporter"
          }
        ],
        processingTime: {
          min: 1,
          max: 1,
          unit: "days"
        },
        fees: [],
        resources: [
          {
            title: "ISPM-15 Guidelines",
            url: "https://planthealth.gov.example/ispm15",
            type: "guide"
          }
        ],
        severity: "standard"
      });
    }
    
    allDocuments.push(...transportRegulations.flatMap(reg => reg.documentation));
    
    // 4. Country-Specific Requirements
    const countryRegulations: Regulation[] = [];
    
    // Adding common country-specific requirements based on destination
    if (["us", "USA", "United States"].includes(destination.toLowerCase())) {
      // FDA for products under their jurisdiction
      if (["food", "medical"].includes(category.toLowerCase())) {
        countryRegulations.push({
          id: "country-1",
          name: "FDA Prior Notice",
          agency: "U.S. Food and Drug Administration",
          countryCode: "US",
          description: "Advanced notification required for food shipments to the U.S.",
          requiredFor: ["Food products", "Dietary supplements"],
          documentation: [
            {
              id: "doc-21",
              name: "FDA Prior Notice Confirmation",
              description: "Confirmation of prior notice submission to the FDA",
              required: true,
              templateAvailable: false,
              issuingAuthority: "U.S. FDA"
            }
          ],
          processingTime: {
            min: 1,
            max: 3,
            unit: "days"
          },
          fees: [],
          deadlines: [
            {
              description: "Prior Notice submission",
              days: 5,
              relative: "before",
              event: "Import date"
            }
          ],
          resources: [
            {
              title: "FDA Prior Notice System",
              url: "https://www.fda.gov/food/importing-food-products-united-states/prior-notice-imported-foods",
              type: "website"
            }
          ],
          severity: "critical"
        });
      }
    } else if (["eu", "EU", "European Union"].includes(destination.toLowerCase()) || 
               ["de", "fr", "it", "es", "nl"].includes(destination.toLowerCase())) {
      // EU requirements
      countryRegulations.push({
        id: "country-2",
        name: "CE Marking",
        agency: "European Union",
        countryCode: "EU",
        description: "Conformity marking indicating that products sold in the EEA meet health, safety, and environmental standards",
        requiredFor: ["Electronics", "Toys", "Medical devices", "Personal protective equipment"],
        documentation: [
          {
            id: "doc-22",
            name: "Declaration of Conformity",
            description: "Manufacturer's declaration that the product complies with EU requirements",
            required: true,
            templateAvailable: true,
            issuingAuthority: "Manufacturer"
          },
          {
            id: "doc-23",
            name: "Technical Documentation",
            description: "Technical file with product specifications, test reports, and risk assessments",
            required: true,
            templateAvailable: false,
            issuingAuthority: "Manufacturer"
          }
        ],
        processingTime: {
          min: 2,
          max: 8,
          unit: "weeks"
        },
        fees: [
          {
            amount: 800,
            currency: "EUR",
            description: "Testing and certification fees (varies by product)"
          }
        ],
        resources: [
          {
            title: "CE Marking Guidelines",
            url: "https://ec.europa.eu/growth/single-market/ce-marking_en",
            type: "website"
          }
        ],
        severity: "critical"
      });
    }
    
    allDocuments.push(...countryRegulations.flatMap(reg => reg.documentation));
    
    // 5. HS Code-Specific Requirements
    const hsCodeRegulations: Regulation[] = [];
    
    // Simulate HS code-specific regulations based on the first 4 digits of the HS code
    if (hsCode) {
      const hsPrefix = hsCode.substring(0, 4);
      
      // Electronics (85xx)
      if (hsPrefix.startsWith("85")) {
        hsCodeRegulations.push({
          id: "hscode-1",
          name: "RoHS Compliance",
          agency: "Environmental Protection Agency",
          countryCode: destination,
          description: "Restriction of Hazardous Substances directive for electronic equipment",
          requiredFor: ["Electronic products", "Electrical equipment"],
          documentation: [
            {
              id: "doc-24",
              name: "RoHS Compliance Declaration",
              description: "Declaration that the product complies with RoHS requirements",
              required: true,
              templateAvailable: true,
              issuingAuthority: "Manufacturer"
            },
            {
              id: "doc-25",
              name: "RoHS Test Report",
              description: "Laboratory test results confirming compliance with RoHS standards",
              required: true,
              templateAvailable: false,
              issuingAuthority: "Accredited Testing Laboratory"
            }
          ],
          processingTime: {
            min: 1,
            max: 3,
            unit: "weeks"
          },
          fees: [
            {
              amount: 300,
              currency: "USD",
              description: "Testing fees"
            }
          ],
          resources: [
            {
              title: "RoHS Compliance Guide",
              url: "https://environment.gov.example/rohs",
              type: "guide"
            }
          ],
          severity: "major"
        });
      }
      // Textiles (61xx-63xx)
      else if (hsPrefix.startsWith("61") || hsPrefix.startsWith("62") || hsPrefix.startsWith("63")) {
        hsCodeRegulations.push({
          id: "hscode-2",
          name: "Textile Certificate of Origin",
          agency: "Customs Authority",
          countryCode: destination,
          description: "Special certificate of origin requirements for textile products",
          requiredFor: ["Textile products", "Apparel"],
          documentation: [
            {
              id: "doc-26",
              name: "Textile Certificate of Origin",
              description: "Certificate confirming the country where the textile products were manufactured",
              required: true,
              templateAvailable: true,
              issuingAuthority: "Chamber of Commerce in origin country"
            }
          ],
          processingTime: {
            min: 3,
            max: 5,
            unit: "days"
          },
          fees: [
            {
              amount: 50,
              currency: "USD",
              description: "Certificate issuance fee"
            }
          ],
          resources: [
            {
              title: "Textile Import Requirements",
              url: "https://customs.gov.example/textiles",
              type: "website"
            }
          ],
          severity: "major"
        });
      }
      // Food products (04xx, 16xx-22xx)
      else if (hsPrefix.startsWith("04") || 
              (parseInt(hsPrefix) >= 1600 && parseInt(hsPrefix) <= 2200)) {
        hsCodeRegulations.push({
          id: "hscode-3",
          name: "Phytosanitary/Health Certificate",
          agency: "Food Safety Authority",
          countryCode: destination,
          description: "Certificate confirming that food products meet health standards",
          requiredFor: ["Food products", "Agricultural products"],
          documentation: [
            {
              id: "doc-27",
              name: "Phytosanitary Certificate",
              description: "Certificate confirming that plants or plant products have been inspected and are free from pests",
              required: true,
              templateAvailable: true,
              issuingAuthority: "Plant Health Authority in origin country"
            },
            {
              id: "doc-28",
              name: "Health Certificate",
              description: "Certificate confirming that food products are fit for human consumption",
              required: true,
              templateAvailable: true,
              issuingAuthority: "Food Safety Authority in origin country"
            }
          ],
          processingTime: {
            min: 1,
            max: 2,
            unit: "weeks"
          },
          fees: [
            {
              amount: 100,
              currency: "USD",
              description: "Certificate issuance fee"
            }
          ],
          deadlines: [
            {
              description: "Certificate application",
              days: 14,
              relative: "before",
              event: "Export date"
            }
          ],
          resources: [
            {
              title: "Food Import Guidelines",
              url: "https://foodsafety.gov.example/import",
              type: "guide"
            }
          ],
          severity: "critical"
        });
      }
    }
    
    allDocuments.push(...hsCodeRegulations.flatMap(reg => reg.documentation));
    
    // Build the categories
    categories.push(
      {
        id: "customs",
        name: "Customs Requirements",
        description: "Essential documentation and procedures for customs clearance",
        iconName: "ClipboardCheck",
        regulations: customsRegulations
      },
      {
        id: "safety",
        name: "Product Safety",
        description: "Regulations ensuring product safety for consumers",
        iconName: "Shield",
        regulations: safetyRegulations
      },
      {
        id: "transport",
        name: "Transport Requirements",
        description: `Specific requirements for ${transportMode} transportation`,
        iconName: "Truck",
        regulations: transportRegulations
      },
      {
        id: "country",
        name: "Country-Specific",
        description: `Requirements specific to ${getCountryName(destination)}`,
        iconName: "Globe",
        regulations: countryRegulations
      },
      {
        id: "hscode",
        name: "HS Code Requirements",
        description: `Requirements for HS code ${hsCode || ""}`,
        iconName: "Tag",
        regulations: hsCodeRegulations
      }
    );
    
    // Set the regulation categories and document checklist
    setRegulationCategories(categories.filter(cat => cat.regulations.length > 0));
    setDocumentChecklist(allDocuments);
    
    // Select the first category with regulations
    const firstCategoryWithRegs = categories.find(cat => cat.regulations.length > 0);
    if (firstCategoryWithRegs) {
      setSelectedCategory(firstCategoryWithRegs.id);
    }
  };
  
  // Toggle completion status of a document
  const toggleDocumentCompletion = (documentId: string) => {
    if (completedDocuments.includes(documentId)) {
      setCompletedDocuments(completedDocuments.filter(id => id !== documentId));
    } else {
      setCompletedDocuments([...completedDocuments, documentId]);
    }
  };
  
  // Get regulations for the selected category
  const getSelectedCategoryRegulations = (): Regulation[] => {
    if (!selectedCategory) return [];
    
    const category = regulationCategories.find(cat => cat.id === selectedCategory);
    return category ? category.regulations : [];
  };
  
  // Calculate document completion percentage
  const getCompletionPercentage = (): number => {
    if (documentChecklist.length === 0) return 0;
    return Math.round((completedDocuments.length / documentChecklist.length) * 100);
  };
  
  // Format processing time
  const formatProcessingTime = (time: { min: number; max: number; unit: string }): string => {
    if (time.min === time.max) {
      return `${time.min} ${time.unit}`;
    }
    return `${time.min}-${time.max} ${time.unit}`;
  };
  
  // Get severity badge color
  const getSeverityBadgeColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'major': return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'standard': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  // Helper function to get country name from country code
  const getCountryName = (countryCode: string): string => {
    const countryMap: { [key: string]: string } = {
      "us": "United States",
      "ca": "Canada",
      "mx": "Mexico",
      "eu": "European Union",
      "cn": "China",
      "jp": "Japan",
      "uk": "United Kingdom",
      "au": "Australia",
      "br": "Brazil",
      "de": "Germany",
      "fr": "France",
      "it": "Italy",
      "es": "Spain",
      "nl": "Netherlands"
    };
    
    return countryMap[countryCode.toLowerCase()] || countryCode;
  };
  
  // Get icon component for category
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'ClipboardCheck': return <ClipboardCheck className="h-5 w-5" />;
      case 'Shield': return <Shield className="h-5 w-5" />;
      case 'Truck': return <Clock className="h-5 w-5" />;
      case 'Globe': return <FileText className="h-5 w-5" />;
      case 'Tag': return <Info className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };
  
  // Format cost data for the chart
  const getCostBreakdownData = () => {
    const allFees = regulationCategories.flatMap(
      cat => cat.regulations.flatMap(reg => reg.fees)
    );
    
    const categoryFees: { [key: string]: number } = {};
    
    regulationCategories.forEach(cat => {
      const totalForCategory = cat.regulations.reduce(
        (sum, reg) => sum + reg.fees.reduce((feeSum, fee) => feeSum + fee.amount, 0),
        0
      );
      if (totalForCategory > 0) {
        categoryFees[cat.name] = totalForCategory;
      }
    });
    
    return Object.entries(categoryFees).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  // Get estimated time for the entire compliance process
  const getEstimatedTimeline = (): { min: number; max: number; } => {
    const allProcessingTimes = regulationCategories.flatMap(
      cat => cat.regulations.map(reg => reg.processingTime)
    );
    
    if (allProcessingTimes.length === 0) {
      return { min: 0, max: 0 };
    }
    
    // Convert all to days for comparison
    const inDays = allProcessingTimes.map(time => {
      let minDays = time.min;
      let maxDays = time.max;
      
      if (time.unit === 'weeks') {
        minDays *= 7;
        maxDays *= 7;
      } else if (time.unit === 'months') {
        minDays *= 30;
        maxDays *= 30;
      }
      
      return { min: minDays, max: maxDays };
    });
    
    // Find the longest processing time
    const maxTimeMin = Math.max(...inDays.map(t => t.min));
    const maxTimeMax = Math.max(...inDays.map(t => t.max));
    
    return { min: maxTimeMin, max: maxTimeMax };
  };
  
  // Calculate the total fees
  const getTotalFees = (): number => {
    return regulationCategories.reduce(
      (sum, cat) => sum + cat.regulations.reduce(
        (regSum, reg) => regSum + reg.fees.reduce(
          (feeSum, fee) => feeSum + fee.amount,
          0
        ),
        0
      ),
      0
    );
  };
  
  // Generate colors for the chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  return (
    <div className="container mx-auto py-6">
      <PageHeader 
        title="Regulations & Compliance" 
        description="Streamline compliance requirements and documentation for your international shipments."
      />
      
      {isLoading ? (
        <Card className="w-full my-6">
          <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Analyzing regulatory requirements...</p>
            </div>
          </CardContent>
        </Card>
      ) : !currentAnalysis ? (
        <Card className="w-full my-6">
          <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Analysis Data Available</h3>
              <p className="text-gray-500 mb-4">Please complete a cost analysis first to view regulatory requirements.</p>
              <Button onClick={() => window.location.href = '/dashboard/cost-breakdown'}>
                Go to Cost Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Product and Shipment Information Summary */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Product Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">HS Code:</span>
                      <span className="font-medium">{currentAnalysis.formValues.hsCode || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Description:</span>
                      <span className="font-medium text-right">{currentAnalysis.formValues.productDescription || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">{currentAnalysis.formValues.productCategory || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Origin & Destination</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Origin Country:</span>
                      <span className="font-medium">{getCountryName(currentAnalysis.formValues.originCountry) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Destination:</span>
                      <span className="font-medium">{getCountryName(currentAnalysis.formValues.destinationCountry) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Transport Mode:</span>
                      <span className="font-medium">{currentAnalysis.formValues.transportMode || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Compliance Overview</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Documents:</span>
                      <span className="font-medium">{documentChecklist.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Completion Status:</span>
                      <span className="font-medium">
                        {completedDocuments.length}/{documentChecklist.length} Documents
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Estimated Timeline:</span>
                      <span className="font-medium">
                        {getEstimatedTimeline().min}-{getEstimatedTimeline().max} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Compliance Progress */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Compliance Progress</h3>
                  <span className="text-sm font-medium">{getCompletionPercentage()}% Complete</span>
                </div>
                <Progress value={getCompletionPercentage()} className="h-2.5" />
              </div>
            </CardContent>
          </Card>
          
          {/* Main Content Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Category Navigation Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Regulation Categories</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    {regulationCategories.map(category => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <div className="mr-2">
                          {getCategoryIcon(category.iconName)}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs text-gray-500">{category.regulations.length} requirements</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Fee Breakdown */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Fee Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold">${getTotalFees().toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Total Compliance Costs</div>
                  </div>
                  
                  {getCostBreakdownData().length > 0 ? (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getCostBreakdownData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {getCostBreakdownData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: any) => [`$${value}`, 'Cost']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>No fee data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Timeline Overview */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Timeline Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <div className="font-medium">Total Processing Time</div>
                        <div className="text-sm text-gray-600">
                          {getEstimatedTimeline().min}-{getEstimatedTimeline().max} days
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="text-sm font-medium mb-2">Recommended Start Date</div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          {new Date(
                            Date.now() - getEstimatedTimeline().max * 24 * 60 * 60 * 1000
                          ).toLocaleDateString()}
                        </div>
                        <Calendar className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Based on your estimated import date
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="regulations">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="regulations">Regulations</TabsTrigger>
                  <TabsTrigger value="documents">Document Checklist</TabsTrigger>
                  <TabsTrigger value="timeline">Compliance Timeline</TabsTrigger>
                </TabsList>
                
                {/* Regulations Tab */}
                <TabsContent value="regulations">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {selectedCategory && 
                          regulationCategories.find(cat => cat.id === selectedCategory)?.name
                        } Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {getSelectedCategoryRegulations().map((regulation, index) => (
                          <div key={regulation.id} className="bg-white p-5 border rounded-lg">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                              <div>
                                <div className="flex items-center">
                                  <h3 className="text-lg font-medium mr-2">{regulation.name}</h3>
                                  <Badge className={getSeverityBadgeColor(regulation.severity)}>
                                    {regulation.severity.charAt(0).toUpperCase() + regulation.severity.slice(1)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{regulation.description}</p>
                              </div>
                              <div className="mt-2 md:mt-0 text-sm">
                                <div className="text-gray-500">Regulatory Agency:</div>
                                <div className="font-medium">{regulation.agency}</div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="bg-gray-50 p-3 rounded-md">
                                <div className="text-sm font-medium mb-1 flex items-center">
                                  <FileText className="h-4 w-4 text-gray-500 mr-1" />
                                  Documentation Required
                                </div>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                  {regulation.documentation.map(doc => (
                                    <li key={doc.id}>
                                      {doc.name}
                                      {doc.templateAvailable && (
                                        <Badge variant="outline" className="ml-1 text-xs">
                                          Template Available
                                        </Badge>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div className="bg-gray-50 p-3 rounded-md">
                                <div className="text-sm font-medium mb-1 flex items-center">
                                  <Clock className="h-4 w-4 text-gray-500 mr-1" />
                                  Processing Time & Fees
                                </div>
                                <div className="text-sm text-gray-600">
                                  <div className="mb-1">
                                    <span className="font-medium">Time:</span> {formatProcessingTime(regulation.processingTime)}
                                  </div>
                                  {regulation.fees.length > 0 ? (
                                    <div>
                                      <span className="font-medium">Fees:</span>
                                      <ul className="list-disc list-inside">
                                        {regulation.fees.map((fee, i) => (
                                          <li key={i}>${fee.amount} {fee.currency} - {fee.description}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  ) : (
                                    <div><span className="font-medium">Fees:</span> None</div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 p-3 rounded-md">
                                <div className="text-sm font-medium mb-1 flex items-center">
                                  <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                                  Deadlines
                                </div>
                                {regulation.deadlines && regulation.deadlines.length > 0 ? (
                                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    {regulation.deadlines.map((deadline, i) => (
                                      <li key={i}>
                                        {deadline.description}: {deadline.days} days {deadline.relative} {deadline.event}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div className="text-sm text-gray-600">
                                    No specific deadlines
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="border-t pt-3">
                              <div className="text-sm font-medium mb-2">Resources</div>
                              <div className="flex flex-wrap gap-2">
                                {regulation.resources.map((resource, i) => (
                                  <Button key={i} variant="outline" size="sm" className="text-xs" asChild>
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                      {resource.title}
                                    </a>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {getSelectedCategoryRegulations().length === 0 && (
                          <div className="text-center py-8">
                            <Info className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-600">No Requirements Found</h3>
                            <p className="text-gray-500 mt-1">
                              No specific regulatory requirements identified for this category.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Document Checklist Tab */}
                <TabsContent value="documents">
                  <Card>
                    <CardHeader>
                      <CardTitle>Document Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <Alert className="bg-blue-50 border-blue-200">
                          <Info className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-700">
                            Track your document preparation progress by checking off completed items. This checklist is specific to your product, origin, and destination.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">Status</TableHead>
                                <TableHead>Document</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Issuing Authority</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {documentChecklist.map(document => (
                                <TableRow key={document.id}>
                                  <TableCell>
                                    <Checkbox
                                      checked={completedDocuments.includes(document.id)}
                                      onCheckedChange={() => toggleDocumentCompletion(document.id)}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {document.name}
                                    {document.required && (
                                      <Badge className="ml-2 bg-red-100 text-red-800 hover:bg-red-200">
                                        Required
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>{document.description}</TableCell>
                                  <TableCell>{document.issuingAuthority || "Not specified"}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                      {document.templateAvailable && (
                                        <Button variant="outline" size="sm">
                                          <Download className="h-4 w-4 mr-1" />
                                          Template
                                        </Button>
                                      )}
                                      {document.sampleUrl && (
                                        <Button variant="outline" size="sm" asChild>
                                          <a href={document.sampleUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4 mr-1" />
                                            Sample
                                          </a>
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                              
                              {documentChecklist.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center py-8">
                                    <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500">No documents found for this shipment.</p>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                        
                        {documentChecklist.length > 0 && (
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-sm text-gray-500">
                                {completedDocuments.length} of {documentChecklist.length} documents completed
                              </span>
                              <Progress 
                                value={getCompletionPercentage()} 
                                className="h-2 w-40 mt-1" 
                              />
                            </div>
                            <Button>
                              <Download className="h-4 w-4 mr-2" />
                              Export Checklist
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Compliance Timeline Tab */}
                <TabsContent value="timeline">
                  <Card>
                    <CardHeader>
                      <CardTitle>Compliance Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <Alert className="bg-amber-50 border-amber-200">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-amber-700">
                            Start your compliance process early. Some requirements have strict deadlines and long processing times.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-6">
                          <h3 className="text-lg font-medium">Critical Path Timeline</h3>
                          
                          <div className="relative">
                            <div className="absolute left-3 top-0 h-full w-0.5 bg-gray-200"></div>
                            
                            {/* Timeline start */}
                            <div className="ml-6 mb-8 relative">
                              <div className="absolute -left-6 mt-1 h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
                                <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                              </div>
                              <div>
                                <div className="font-medium">Today</div>
                                <p className="text-sm text-gray-600">Start of compliance process</p>
                              </div>
                            </div>
                            
                            {/* Generate timeline from regulations with deadlines */}
                            {regulationCategories.flatMap(cat => 
                              cat.regulations
                                .filter(reg => reg.deadlines && reg.deadlines.length > 0)
                                .map(reg => ({
                                  ...reg,
                                  earliestDeadline: reg.deadlines?.reduce((earliest, current) => 
                                    current.days < earliest.days ? current : earliest
                                  , reg.deadlines[0])
                                }))
                            )
                            .sort((a, b) => a.earliestDeadline?.days - b.earliestDeadline?.days)
                            .map((reg, index) => (
                              <div key={reg.id} className="ml-6 mb-8 relative">
                                <div className={`absolute -left-6 mt-1 h-5 w-5 rounded-full ${reg.severity === 'critical' ? 'bg-red-100' : 'bg-amber-100'} flex items-center justify-center`}>
                                  <div className={`h-3 w-3 rounded-full ${reg.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                </div>
                                <div>
                                  <div className="font-medium">{reg.name}</div>
                                  <p className="text-sm text-gray-600">
                                    {reg.earliestDeadline?.description}: {reg.earliestDeadline?.days} days {reg.earliestDeadline?.relative} {reg.earliestDeadline?.event}
                                  </p>
                                  <div className="mt-1 flex items-center">
                                    <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                                    <span className="text-sm text-gray-500">
                                      {reg.earliestDeadline?.relative === 'before' 
                                        ? `Start by: ${new Date(
                                            Date.now() - (reg.earliestDeadline?.days || 0) * 24 * 60 * 60 * 1000
                                          ).toLocaleDateString()}`
                                        : `Complete by: ${new Date(
                                            Date.now() + (reg.earliestDeadline?.days || 0) * 24 * 60 * 60 * 1000
                                          ).toLocaleDateString()}`
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {/* Processing times from the regulations */}
                            {regulationCategories.flatMap(cat => 
                              cat.regulations
                                .filter(reg => reg.processingTime.max > 5) // Only show significant processing times
                                .map(reg => ({
                                  ...reg,
                                  processingDays: reg.processingTime.unit === 'weeks' 
                                    ? reg.processingTime.max * 7 
                                    : reg.processingTime.unit === 'months'
                                      ? reg.processingTime.max * 30
                                      : reg.processingTime.max
                                }))
                            )
                            .sort((a, b) => b.processingDays - a.processingDays) // Sort by longest processing time
                            .slice(0, 3) // Show only top 3 longest processing times
                            .map((reg, index) => (
                              <div key={`proc-${reg.id}`} className="ml-6 mb-8 relative">
                                <div className="absolute -left-6 mt-1 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                </div>
                                <div>
                                  <div className="font-medium">{reg.name} Processing</div>
                                  <p className="text-sm text-gray-600">
                                    Allow {formatProcessingTime(reg.processingTime)} for processing
                                  </p>
                                  <div className="mt-1 flex items-center">
                                    <Clock className="h-4 w-4 text-gray-500 mr-1" />
                                    <span className="text-sm text-gray-500">
                                      Estimated completion: {new Date(
                                        Date.now() + reg.processingDays * 24 * 60 * 60 * 1000
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {/* Timeline end - import date */}
                            <div className="ml-6 relative">
                              <div className="absolute -left-6 mt-1 h-5 w-5 rounded-full bg-green-200 flex items-center justify-center">
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                              </div>
                              <div>
                                <div className="font-medium">Import Date</div>
                                <p className="text-sm text-gray-600">Earliest possible import date with all compliance requirements met</p>
                                <div className="mt-1 flex items-center">
                                  <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                                  <span className="text-sm text-gray-500">
                                    {new Date(
                                      Date.now() + getEstimatedTimeline().max * 24 * 60 * 60 * 1000
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Process Optimization Tips</h4>
                            <ul className="space-y-2">
                              <li className="flex items-start">
                                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span>Start with critical requirements that have the longest processing times</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span>Submit multiple applications in parallel where possible</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span>Use expedited processing options for time-sensitive shipments</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span>Keep a digital copy of all compliance documentation</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button>
                              <Download className="h-4 w-4 mr-2" />
                              Export Timeline
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RegulationsDashboard;