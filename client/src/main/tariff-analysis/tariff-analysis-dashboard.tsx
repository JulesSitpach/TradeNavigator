/**
 * @component Tariff Analysis Dashboard
 * @status PRODUCTION
 * @version 1.0
 * @lastModified 2025-05-17
 * @description Dashboard for analyzing and optimizing tariff classifications and duties.
 *              Helps users maximize duty savings through HS code classification optimization
 *              and origin strategy analysis.
 */

import { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { AnalysisContext } from "@/contexts/AnalysisContext";
import { useToast } from "@/hooks/use-toast";
import { BarChart, PieChart, LineChart, Bar, Pie, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { AlertTriangle, DollarSign, Tag, Globe, FileText, TrendingDown, TrendingUp, Info, Search, ExternalLink } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import HSCodeAssistant from "@/components/ai/HSCodeAssistant";

// Define tariff data types
interface TariffRate {
  countryCode: string;
  countryName: string;
  rate: number;
  isMfn: boolean;
  isFta: boolean;
  programName?: string;
  notes?: string;
}

interface HSCodeAlternative {
  code: string;
  description: string;
  rate: number;
  potentialSavings: number;
  confidence: number;
  requirements: string[];
}

interface TariffHistoricalData {
  year: string;
  rate: number;
}

const TariffAnalysisDashboard = () => {
  const { toast } = useToast();
  const analysisContext = useContext(AnalysisContext);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [tariffRates, setTariffRates] = useState<TariffRate[]>([]);
  const [alternativeHSCodes, setAlternativeHSCodes] = useState<HSCodeAlternative[]>([]);
  const [historicalRates, setHistoricalRates] = useState<TariffHistoricalData[]>([]);
  const [tradeAgreements, setTradeAgreements] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // Import enhanced utility functions for reliable data access
    import('@/utils/analysisDataHelper').then(({ getAnalysisData, isValidAnalysisData, getAnalysisDataErrorMessage }) => {
      // Get analysis data with fallback to localStorage if needed
      const analysisData = getAnalysisData(analysisContext);
      
      // Check if we have valid data
      if (analysisData && isValidAnalysisData(analysisData)) {
        console.log('Tariff Analysis Dashboard: Analysis data loaded successfully');
        setCurrentAnalysis(analysisData);
        
        // Analyze tariff data based on the valid analysis data
        analyzeTariffData(analysisData);
      } else {
        console.warn('Tariff Analysis Dashboard: No valid analysis data available');
        toast(getAnalysisDataErrorMessage());
      }
    });
  }, [analysisContext?.currentAnalysis]);
  
  // Analyze tariff data based on the current analysis
  const analyzeTariffData = (analysis: any) => {
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
      productValue
    } = analysis.formValues;
    
    const dutyAmount = analysis.results.components.find((c: any) => 
      c.name === "Duties" || c.name === "Tariffs"
    )?.value || 0;
    
    const totalCost = analysis.results.totalCost || 0;
    
    // Calculate effective duty rate
    const productValueNum = parseFloat(productValue);
    const effectiveDutyRate = productValueNum > 0 ? (dutyAmount / productValueNum) * 100 : 0;
    
    // Generate alternative HS codes
    generateAlternativeHSCodes(hsCode, productDescription, productCategory, effectiveDutyRate, dutyAmount);
    
    // Get tariff rates for various countries
    fetchTariffRates(hsCode, originCountry, destinationCountry);
    
    // Get historical tariff data
    fetchHistoricalRates(hsCode, destinationCountry);
    
    // Analyze trade agreements
    analyzeTradeAgreements(originCountry, destinationCountry, hsCode);
    
    setIsLoading(false);
  };
  
  // Generate alternative HS code suggestions
  const generateAlternativeHSCodes = (currentHSCode: string, description: string, category: string, currentRate: number, dutyAmount: number) => {
    // In a real application, this would use an AI service or database lookup
    // Here we're simulating the results with realistic alternatives
    
    const codeBase = currentHSCode.substring(0, 4);
    const potentialAlternatives: HSCodeAlternative[] = [
      {
        code: currentHSCode,
        description: "Current classification",
        rate: currentRate,
        potentialSavings: 0,
        confidence: 100,
        requirements: ["Current classification"]
      }
    ];
    
    // Electronics category
    if (category === "electronics") {
      potentialAlternatives.push({
        code: `${codeBase}.90.00`,
        description: "Parts & accessories of electronic products",
        rate: currentRate * 0.7,
        potentialSavings: dutyAmount * 0.3,
        confidence: 75,
        requirements: [
          "Product must be primarily for use with electronic devices",
          "Must be separately imported, not as a whole unit",
          "Must not have independent function"
        ]
      });
      
      potentialAlternatives.push({
        code: `${codeBase}.30.00`,
        description: "Educational electronic equipment",
        rate: currentRate * 0.5,
        potentialSavings: dutyAmount * 0.5,
        confidence: 60,
        requirements: [
          "Product must be designed for educational purposes",
          "May require certification of educational use",
          "Must be sold to educational institutions"
        ]
      });
    }
    
    // Textiles category
    if (category === "textiles") {
      potentialAlternatives.push({
        code: `${parseInt(codeBase) + 2}.21.00`,
        description: "Specialized technical textiles",
        rate: currentRate * 0.6,
        potentialSavings: dutyAmount * 0.4,
        confidence: 70,
        requirements: [
          "Must contain specific technical features",
          "Must be for industrial or technical applications",
          "Required technical documentation"
        ]
      });
    }
    
    // Food category
    if (category === "food") {
      potentialAlternatives.push({
        code: `${parseInt(codeBase) - 1}.10.00`,
        description: "Organic certified food products",
        rate: currentRate * 0.8,
        potentialSavings: dutyAmount * 0.2,
        confidence: 65,
        requirements: [
          "Must have organic certification",
          "Requires origin documentation",
          "Subject to food safety regulations"
        ]
      });
    }
    
    // Generic alternatives for any category
    potentialAlternatives.push({
      code: `${parseInt(codeBase) + 1}.99.00`,
      description: "Similar product with different material composition",
      rate: currentRate * 0.85,
      potentialSavings: dutyAmount * 0.15,
      confidence: 55,
      requirements: [
        "Product specifications must meet exact criteria",
        "May require lab testing to verify composition",
        "Documentation of manufacturing process"
      ]
    });
    
    // Sort by savings potential (descending)
    const sortedAlternatives = potentialAlternatives.sort((a, b) => b.potentialSavings - a.potentialSavings);
    
    setAlternativeHSCodes(sortedAlternatives);
  };
  
  // Fetch tariff rates for various countries
  const fetchTariffRates = (hsCode: string, originCountry: string, destinationCountry: string) => {
    // In a real app, this would be an API call to a tariff database
    // Simulating the result with realistic data
    
    const rates: TariffRate[] = [
      {
        countryCode: destinationCountry.toLowerCase() || "us",
        countryName: getCountryName(destinationCountry) || "United States",
        rate: 6.5,
        isMfn: true,
        isFta: false
      }
    ];
    
    // Add more countries with varied rates
    const additionalCountries = [
      { code: "ca", name: "Canada", rate: 0, isFta: true, programName: "USMCA" },
      { code: "mx", name: "Mexico", rate: 0, isFta: true, programName: "USMCA" },
      { code: "eu", name: "European Union", rate: 4.5, isFta: false },
      { code: "cn", name: "China", rate: 8.2, isFta: false },
      { code: "jp", name: "Japan", rate: 5.3, isFta: false },
      { code: "uk", name: "United Kingdom", rate: 4.0, isFta: false },
      { code: "au", name: "Australia", rate: 5.0, isFta: false },
      { code: "br", name: "Brazil", rate: 12.0, isFta: false },
      { code: "sg", name: "Singapore", rate: 0, isFta: true, programName: "Singapore FTA" },
      { code: "kr", name: "South Korea", rate: 3.5, isFta: true, programName: "KORUS FTA" }
    ];
    
    additionalCountries.forEach(country => {
      if (country.code !== destinationCountry.toLowerCase()) {
        rates.push({
          countryCode: country.code,
          countryName: country.name,
          rate: country.rate,
          isMfn: !country.isFta,
          isFta: country.isFta,
          programName: country.programName
        });
      }
    });
    
    // Sort by rate (ascending)
    const sortedRates = rates.sort((a, b) => a.rate - b.rate);
    
    setTariffRates(sortedRates);
  };
  
  // Fetch historical tariff rates
  const fetchHistoricalRates = (hsCode: string, countryCode: string) => {
    // Simulated historical data
    const historical = [
      { year: "2020", rate: 7.5 },
      { year: "2021", rate: 7.0 },
      { year: "2022", rate: 6.5 },
      { year: "2023", rate: 6.5 },
      { year: "2024", rate: 6.5 },
      { year: "2025", rate: 6.0 }
    ];
    
    setHistoricalRates(historical);
  };
  
  // Analyze applicable trade agreements
  const analyzeTradeAgreements = (originCountry: string, destinationCountry: string, hsCode: string) => {
    // Simulated trade agreement analysis
    const agreements = [
      {
        name: "USMCA (United States-Mexico-Canada Agreement)",
        eligibility: originCountry.toLowerCase() === "us" || originCountry.toLowerCase() === "ca" || originCountry.toLowerCase() === "mx",
        rate: 0,
        requirements: [
          "Product must originate in the US, Canada, or Mexico",
          "Must meet specific rules of origin",
          "Documentation requirements: USMCA Certificate of Origin"
        ],
        savings: originCountry.toLowerCase() === "us" || originCountry.toLowerCase() === "ca" || originCountry.toLowerCase() === "mx" ? "100% duty reduction" : "Not eligible"
      },
      {
        name: "CPTPP (Comprehensive and Progressive Agreement for Trans-Pacific Partnership)",
        eligibility: ["jp", "ca", "au", "nz", "sg", "vn", "my", "mx", "cl", "pe"].includes(originCountry.toLowerCase()),
        rate: 2.5,
        requirements: [
          "Product must originate in a CPTPP member country",
          "Must meet product-specific rules of origin",
          "Documentation requirements: CPTPP Certificate of Origin"
        ],
        savings: ["jp", "ca", "au", "nz", "sg", "vn", "my", "mx", "cl", "pe"].includes(originCountry.toLowerCase()) ? "Approximately 60% duty reduction" : "Not eligible"
      },
      {
        name: "GSP (Generalized System of Preferences)",
        eligibility: ["in", "br", "th", "za", "id"].includes(originCountry.toLowerCase()),
        rate: 3.5,
        requirements: [
          "Product must originate in a GSP beneficiary country",
          "Must be directly imported from the beneficiary country",
          "Documentation requirements: GSP Form A"
        ],
        savings: ["in", "br", "th", "za", "id"].includes(originCountry.toLowerCase()) ? "Approximately 45% duty reduction" : "Not eligible"
      }
    ];
    
    setTradeAgreements(agreements);
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
      "sg": "Singapore",
      "kr": "South Korea",
      "in": "India",
      "th": "Thailand",
      "za": "South Africa",
      "id": "Indonesia",
      "fr": "France",
      "de": "Germany",
      "it": "Italy",
      "es": "Spain"
    };
    
    return countryMap[countryCode.toLowerCase()] || countryCode;
  };
  
  // Format numbers as currency
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Format percentage
  const formatPercent = (value: number): string => {
    return value.toFixed(2) + '%';
  };
  
  // Get confidence level color
  const getConfidenceColor = (level: number): string => {
    if (level >= 80) return "text-green-600";
    if (level >= 60) return "text-amber-600";
    return "text-red-600";
  };
  
  // Filter tariff rates based on search query
  const getFilteredTariffRates = (): TariffRate[] => {
    if (!searchQuery) return tariffRates;
    
    const query = searchQuery.toLowerCase();
    return tariffRates.filter(rate => 
      rate.countryName.toLowerCase().includes(query) || 
      rate.countryCode.toLowerCase().includes(query) ||
      (rate.programName && rate.programName.toLowerCase().includes(query))
    );
  };
  
  // Render tariff comparison chart
  const renderTariffComparisonChart = () => {
    // Take top 8 countries for readability
    const chartData = tariffRates.slice(0, 8).map(rate => ({
      country: rate.countryName,
      rate: rate.rate,
      fill: rate.isFta ? "#22c55e" : "#3b82f6"
    }));
    
    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="country" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{ value: 'Duty Rate (%)', angle: -90, position: 'insideLeft' }}
            />
            <RechartsTooltip 
              formatter={(value) => [`${value}%`, 'Duty Rate']}
              labelFormatter={(label) => `Country: ${label}`}
            />
            <Legend />
            <Bar 
              dataKey="rate" 
              fill="#3b82f6" 
              name="Duty Rate (%)"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Render historical rates chart
  const renderHistoricalRatesChart = () => {
    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={historicalRates}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis
              label={{ value: 'Duty Rate (%)', angle: -90, position: 'insideLeft' }}
              domain={[0, 'dataMax + 2']}
            />
            <RechartsTooltip 
              formatter={(value) => [`${value}%`, 'Duty Rate']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="rate" 
              stroke="#3b82f6" 
              activeDot={{ r: 8 }} 
              name="Duty Rate (%)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6">
      <PageHeader 
        title="Tariff Analysis Dashboard" 
        description="Analyze and optimize HS code classifications, duty rates, and trade agreement opportunities."
        icon={<Tag className="h-6 w-6 text-blue-600" />}
      />
      
      {isLoading ? (
        <Card className="w-full my-6">
          <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Analyzing tariff data...</p>
            </div>
          </CardContent>
        </Card>
      ) : !currentAnalysis ? (
        <Card className="w-full my-6">
          <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
            <div className="text-center max-w-xl">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Tariff Analysis Needs Input</h3>
              <p className="text-gray-600 mb-4">
                To view detailed tariff analysis, first complete a cost breakdown analysis with your product details 
                including HS code, origin and destination countries.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
                <h4 className="font-medium text-blue-800 mb-2">Benefits of tariff analysis:</h4>
                <ul className="text-sm space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Find lower tariff rates in alternative destination markets</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Discover alternative HS codes that may qualify for lower duties</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Identify applicable trade agreements and special programs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Track historical tariff trends to forecast future changes</span>
                  </li>
                </ul>
              </div>
              
              <Button size="lg" onClick={() => window.location.href = '/dashboard/cost-breakdown'}>
                Go to Cost Breakdown
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Product and Tariff Information Summary */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <div className="flex justify-between">
                      <span className="text-gray-500">Value:</span>
                      <span className="font-medium">
                        {formatCurrency(parseFloat(currentAnalysis.formValues.productValue) || 0)}
                      </span>
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
                      <span className="text-gray-500">Trade Lane:</span>
                      <span className="font-medium">
                        {currentAnalysis.formValues.originCountry && currentAnalysis.formValues.destinationCountry 
                          ? `${getCountryName(currentAnalysis.formValues.originCountry)} → ${getCountryName(currentAnalysis.formValues.destinationCountry)}`
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Duty Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duty Amount:</span>
                      <span className="font-medium">
                        {formatCurrency(currentAnalysis.results.components.find((c: any) => 
                          c.name === "Duties" || c.name === "Tariffs"
                        )?.value || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Effective Rate:</span>
                      <span className="font-medium">
                        {formatPercent(
                          (currentAnalysis.results.components.find((c: any) => 
                            c.name === "Duties" || c.name === "Tariffs"
                          )?.value || 0) / parseFloat(currentAnalysis.formValues.productValue) * 100 || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">% of Total Cost:</span>
                      <span className="font-medium">
                        {formatPercent(
                          (currentAnalysis.results.components.find((c: any) => 
                            c.name === "Duties" || c.name === "Tariffs"
                          )?.value || 0) / currentAnalysis.results.totalCost * 100 || 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Optimization Potential</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Alternative Classifications:</span>
                      <span className="font-medium">{alternativeHSCodes.length - 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Max Savings Potential:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(
                          Math.max(...alternativeHSCodes.map(alt => alt.potentialSavings))
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">FTA Opportunities:</span>
                      <span className="font-medium">
                        {tradeAgreements.filter(a => a.eligibility).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Main Content Tabs */}
          <Tabs defaultValue="classification" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="classification">Classification Optimization</TabsTrigger>
              <TabsTrigger value="comparison">Country Comparison</TabsTrigger>
              <TabsTrigger value="agreements">Trade Agreements</TabsTrigger>
              <TabsTrigger value="history">Historical Analysis</TabsTrigger>
            </TabsList>
            
            {/* Classification Optimization Tab */}
            <TabsContent value="classification">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Alternative HS Code Analysis */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Alternative Classification Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-24">HS Code</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-24 text-right">Duty Rate</TableHead>
                                <TableHead className="w-32 text-right">Potential Savings</TableHead>
                                <TableHead className="w-24 text-right">Confidence</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {alternativeHSCodes.map((alternative, index) => (
                                <TableRow key={index} className={index === 0 ? "bg-blue-50" : ""}>
                                  <TableCell className="font-medium">{alternative.code}</TableCell>
                                  <TableCell>
                                    {alternative.description}
                                    {index === 0 && (
                                      <Badge variant="outline" className="ml-2 bg-blue-100">Current</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">{formatPercent(alternative.rate)}</TableCell>
                                  <TableCell className={`text-right ${alternative.potentialSavings > 0 ? "text-green-600 font-medium" : ""}`}>
                                    {formatCurrency(alternative.potentialSavings)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span className={getConfidenceColor(alternative.confidence)}>
                                      {alternative.confidence}%
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        
                        {/* Selected HS Code Requirements */}
                        {alternativeHSCodes.length > 0 && alternativeHSCodes[1] && (
                          <div className="bg-white p-4 border rounded-lg">
                            <h3 className="text-lg font-medium mb-3">Requirements for {alternativeHSCodes[1].code}</h3>
                            <ul className="list-disc pl-5 space-y-1">
                              {alternativeHSCodes[1].requirements.map((req, i) => (
                                <li key={i} className="text-gray-700">{req}</li>
                              ))}
                            </ul>
                            <div className="mt-4 flex items-center text-sm text-blue-600">
                              <Info className="h-4 w-4 mr-1" />
                              <span>Consult with a customs expert before implementing this classification change.</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Implementation Steps */}
                        <div className="bg-blue-50 p-4 border border-blue-100 rounded-lg">
                          <h3 className="text-lg font-medium text-blue-800 mb-3">Implementation Steps</h3>
                          <ol className="list-decimal pl-5 space-y-2 text-blue-700">
                            <li>Request a product ruling from customs authorities to confirm the alternative classification</li>
                            <li>Prepare detailed product specifications and technical documentation</li>
                            <li>Engage a customs broker to review and support the classification change</li>
                            <li>Update all import documentation with the new HS code</li>
                            <li>Be prepared to explain the justification for the classification during customs inspections</li>
                          </ol>
                          <Button className="mt-4" variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Request Classification Guide
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* HS Code Assistant */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>HS Code Assistant</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <HSCodeAssistant 
                        initialProductCategory={currentAnalysis.formValues.productCategory || ""}
                        initialProductDescription={currentAnalysis.formValues.productDescription || ""}
                        onHSCodeSelected={(code) => {
                          // In a real app, this would update the analysis with the new HS code
                          toast({
                            title: "HS Code Selected",
                            description: `New HS Code ${code} selected. Reanalyzing tariff data...`,
                          });
                        }}
                      />
                    </CardContent>
                  </Card>
                  
                  {/* Savings Summary */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Savings Opportunity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="text-center">
                          <span className="text-2xl font-bold text-green-600">
                            {formatCurrency(
                              Math.max(...alternativeHSCodes.map(alt => alt.potentialSavings))
                            )}
                          </span>
                          <p className="text-gray-500">Maximum potential duty savings</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Savings Breakdown</h4>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-sm">
                                <span>Optimized Classification</span>
                                <span className="font-medium">{formatCurrency(alternativeHSCodes[1]?.potentialSavings || 0)}</span>
                              </div>
                              <Progress value={70} className="h-2 mt-1" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm">
                                <span>Trade Agreement Benefits</span>
                                <span className="font-medium">{formatCurrency((currentAnalysis.results.components.find((c: any) => 
                                  c.name === "Duties" || c.name === "Tariffs"
                                )?.value || 0) * 0.3)}</span>
                              </div>
                              <Progress value={30} className="h-2 mt-1" />
                            </div>
                          </div>
                        </div>
                        
                        <Alert className="bg-amber-50 border-amber-200">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertTitle className="text-amber-800">Implementation Note</AlertTitle>
                          <AlertDescription className="text-amber-700">
                            Customs authorities may challenge classification changes. Always maintain proper documentation to support your classification decisions.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Country Comparison Tab */}
            <TabsContent value="comparison">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle>Global Tariff Rate Comparison</CardTitle>
                      <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search countries..."
                          className="pl-8 pr-4 py-2 w-full border rounded-md text-sm"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {renderTariffComparisonChart()}
                        
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Country</TableHead>
                                <TableHead>Tariff Rate</TableHead>
                                <TableHead>Program</TableHead>
                                <TableHead className="text-right">Relative to Current</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getFilteredTariffRates().map((rate, index) => {
                                const currentRate = tariffRates.find(r => 
                                  r.countryCode === currentAnalysis.formValues.destinationCountry.toLowerCase()
                                )?.rate || 0;
                                
                                const difference = currentRate - rate.rate;
                                
                                return (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">
                                      {rate.countryName}
                                      {rate.countryCode === currentAnalysis.formValues.destinationCountry.toLowerCase() && (
                                        <Badge variant="outline" className="ml-2 bg-blue-100">Current</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>{formatPercent(rate.rate)}</TableCell>
                                    <TableCell>
                                      {rate.isFta ? (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                          {rate.programName || "FTA"}
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline">MFN</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {difference === 0 ? (
                                        <span className="text-gray-500">Same</span>
                                      ) : difference > 0 ? (
                                        <span className="text-green-600 flex items-center justify-end">
                                          <TrendingDown className="h-4 w-4 mr-1" />
                                          {formatPercent(difference)} lower
                                        </span>
                                      ) : (
                                        <span className="text-red-600 flex items-center justify-end">
                                          <TrendingUp className="h-4 w-4 mr-1" />
                                          {formatPercent(Math.abs(difference))} higher
                                        </span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Market Opportunity Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="bg-green-50 p-4 border border-green-200 rounded-lg">
                          <h3 className="font-medium text-green-800 mb-2">Top 3 Market Opportunities</h3>
                          <div className="space-y-3">
                            {tariffRates.slice(0, 3).map((rate, index) => (
                              <div key={index} className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-medium mr-2">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-green-800">{rate.countryName}</p>
                                  <p className="text-sm text-green-700">
                                    {rate.rate === 0 
                                      ? "Duty-free under " + (rate.programName || "trade agreement")
                                      : `${formatPercent(rate.rate)} duty rate${rate.programName ? ` under ${rate.programName}` : ""}`
                                    }
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-3">Market Considerations</h3>
                          <div className="space-y-3">
                            <div className="border-l-4 border-blue-400 pl-3">
                              <p className="font-medium">Documentation Requirements</p>
                              <p className="text-sm text-gray-600">Requirements vary by country. Low duty rates often require additional compliance documentation.</p>
                            </div>
                            <div className="border-l-4 border-amber-400 pl-3">
                              <p className="font-medium">Lead Time Impact</p>
                              <p className="text-sm text-gray-600">Consider transit times alongside duty rates. Some lower-duty markets may have longer lead times.</p>
                            </div>
                            <div className="border-l-4 border-purple-400 pl-3">
                              <p className="font-medium">Market Size Factors</p>
                              <p className="text-sm text-gray-600">Evaluate market potential and competition, not just duty rates, when selecting target markets.</p>
                            </div>
                          </div>
                        </div>
                        
                        <Alert className="bg-blue-50 border-blue-200">
                          <Globe className="h-4 w-4 text-blue-600" />
                          <AlertTitle className="text-blue-800">Market Entry Analysis</AlertTitle>
                          <AlertDescription className="text-blue-700">
                            For a comprehensive market entry strategy including regulatory, competitive, and demand analysis, request our detailed Market Entry Report.
                          </AlertDescription>
                        </Alert>
                        
                        <Button className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          Request Market Entry Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Trade Agreements Tab */}
            <TabsContent value="agreements">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Trade Agreement Eligibility</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {tradeAgreements.map((agreement, index) => (
                          <div key={index} className={`p-4 border rounded-lg ${
                            agreement.eligibility 
                              ? "bg-green-50 border-green-200" 
                              : "bg-gray-50 border-gray-200"
                          }`}>
                            <div className="flex items-start">
                              <div className={`p-2 rounded-full mr-3 ${
                                agreement.eligibility 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-gray-200 text-gray-600"
                              }`}>
                                {agreement.eligibility ? (
                                  <FileText className="h-5 w-5" />
                                ) : (
                                  <AlertTriangle className="h-5 w-5" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className={`font-medium ${
                                    agreement.eligibility ? "text-green-800" : "text-gray-700"
                                  }`}>
                                    {agreement.name}
                                  </h3>
                                  <Badge className={
                                    agreement.eligibility 
                                      ? "bg-green-100 text-green-800" 
                                      : "bg-gray-200 text-gray-600"
                                  }>
                                    {agreement.eligibility ? "Eligible" : "Not Eligible"}
                                  </Badge>
                                </div>
                                
                                {agreement.eligibility && (
                                  <div className="mt-2 space-y-3">
                                    <div>
                                      <p className="text-sm font-medium text-green-700">Potential Duty Rate: {formatPercent(agreement.rate)}</p>
                                      <p className="text-sm text-green-700">Savings: {agreement.savings}</p>
                                    </div>
                                    
                                    <div>
                                      <p className="text-sm font-medium text-green-700">Requirements:</p>
                                      <ul className="list-disc pl-5 mt-1 space-y-1">
                                        {agreement.requirements.map((req, i) => (
                                          <li key={i} className="text-sm text-green-700">{req}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    
                                    <div className="pt-2 flex justify-between">
                                      <Button variant="outline" size="sm" className="text-green-700 border-green-200 hover:bg-green-100">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Documentation Guide
                                      </Button>
                                      <Button variant="outline" size="sm" className="text-green-700 border-green-200 hover:bg-green-100">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Check Requirements
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                
                                {!agreement.eligibility && (
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-600">
                                      Not eligible for this agreement based on product origin.
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      Eligible countries: {agreement.name.includes("USMCA") 
                                        ? "USA, Canada, Mexico"
                                        : agreement.name.includes("CPTPP")
                                          ? "Japan, Canada, Australia, New Zealand, Singapore, Vietnam, Malaysia, Mexico, Chile, Peru"
                                          : "Developing and least-developed countries"
                                      }
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Origin Strategy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="bg-blue-50 p-4 border border-blue-200 rounded-lg">
                          <h3 className="font-medium text-blue-800 mb-2">Origin Optimization Tips</h3>
                          <ul className="list-disc pl-5 space-y-2 text-blue-700">
                            <li>For substantial manufacturing operations, consider countries with preferential trade agreements</li>
                            <li>Evaluate the total landed cost including duties, not just production costs</li>
                            <li>Document the manufacturing process to support origin claims</li>
                            <li>Ensure compliance with specific rules of origin in applicable trade agreements</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">Origin Documentation Requirements</h3>
                          <div className="space-y-3">
                            <div className="flex items-start">
                              <FileText className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                              <div>
                                <p className="font-medium">Certificate of Origin</p>
                                <p className="text-sm text-gray-600">Required for all shipments claiming preferential treatment</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <FileText className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                              <div>
                                <p className="font-medium">Manufacturer's Affidavit</p>
                                <p className="text-sm text-gray-600">Details production steps and material sources</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <FileText className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                              <div>
                                <p className="font-medium">Bill of Materials</p>
                                <p className="text-sm text-gray-600">Itemized list of raw materials with origin and value</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Alert className="bg-amber-50 border-amber-200">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertTitle className="text-amber-800">Compliance Warning</AlertTitle>
                          <AlertDescription className="text-amber-700">
                            Incorrect origin claims can result in penalties and back duties. Always maintain supporting documentation for origin declarations.
                          </AlertDescription>
                        </Alert>
                        
                        <Button className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          Request Origin Strategy Consultation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Historical Analysis Tab */}
            <TabsContent value="history">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Historical Duty Rate Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {renderHistoricalRatesChart()}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white p-4 border rounded-lg">
                            <h3 className="font-medium mb-3">Historical Context</h3>
                            <div className="space-y-3 text-sm">
                              <p>
                                <span className="font-medium">2020-2022:</span> Gradual duty reductions implemented as part of broader trade liberalization policies.
                              </p>
                              <p>
                                <span className="font-medium">2022-2024:</span> Stabilization period with consistent duty rates maintained across most categories.
                              </p>
                              <p>
                                <span className="font-medium">2025 forward:</span> Projected continued reduction for this product category based on scheduled tariff reviews.
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-white p-4 border rounded-lg">
                            <h3 className="font-medium mb-3">Impact Factors</h3>
                            <div className="space-y-3 text-sm">
                              <div className="flex items-start">
                                <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium mr-2">
                                  1
                                </div>
                                <p>Trade agreements have driven most significant reductions</p>
                              </div>
                              <div className="flex items-start">
                                <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium mr-2">
                                  2
                                </div>
                                <p>Supply chain diversification created additional incentives for duty reductions</p>
                              </div>
                              <div className="flex items-start">
                                <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium mr-2">
                                  3
                                </div>
                                <p>Industry lobbying has successfully targeted this product category</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Future Outlook</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-4 border border-blue-100 rounded-lg">
                            <h3 className="font-medium text-blue-800 mb-2">Short Term (1 Year)</h3>
                            <div className="flex items-center text-blue-700 mb-2">
                              <TrendingDown className="h-5 w-5 mr-2" />
                              <span className="font-medium">Stable to Slightly Lower</span>
                            </div>
                            <p className="text-sm text-blue-700">
                              Current trade policies suggest stable rates with possible minor reductions as existing agreements are fully implemented.
                            </p>
                          </div>
                          
                          <div className="bg-blue-50 p-4 border border-blue-100 rounded-lg">
                            <h3 className="font-medium text-blue-800 mb-2">Medium Term (2-3 Years)</h3>
                            <div className="flex items-center text-blue-700 mb-2">
                              <TrendingDown className="h-5 w-5 mr-2" />
                              <span className="font-medium">Moderate Reduction</span>
                            </div>
                            <p className="text-sm text-blue-700">
                              Pending trade agreements and review processes are likely to reduce duties further for this category.
                            </p>
                          </div>
                          
                          <div className="bg-blue-50 p-4 border border-blue-100 rounded-lg">
                            <h3 className="font-medium text-blue-800 mb-2">Long Term (4+ Years)</h3>
                            <div className="flex items-center text-blue-700 mb-2">
                              <TrendingDown className="h-5 w-5 mr-2" />
                              <span className="font-medium">Significant Reduction</span>
                            </div>
                            <p className="text-sm text-blue-700">
                              Global tariff elimination initiatives may lead to further reductions or elimination for this product category.
                            </p>
                          </div>
                        </div>
                        
                        <Alert className="bg-amber-50 border-amber-200">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertTitle className="text-amber-800">Planning Consideration</AlertTitle>
                          <AlertDescription className="text-amber-700">
                            While duty rates are projected to decrease, geopolitical factors and policy changes can influence these trends. Maintain flexibility in supply chain planning.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Optimization Strategy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="bg-green-50 p-4 border border-green-200 rounded-lg">
                          <h3 className="font-medium text-green-800 mb-2">Recommended Approach</h3>
                          <ul className="list-disc pl-5 space-y-2 text-green-700">
                            <li><span className="font-medium">Near-term:</span> Pursue alternative classification opportunities and trade agreement benefits</li>
                            <li><span className="font-medium">Medium-term:</span> Consider origin optimization aligned with trade agreement countries</li>
                            <li><span className="font-medium">Long-term:</span> Monitor evolving trade policies and prepare for potential rate changes</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">Implementation Timeline</h3>
                          <div className="relative">
                            <div className="absolute left-3 top-0 h-full w-0.5 bg-gray-200"></div>
                            
                            <div className="ml-6 mb-4 relative">
                              <div className="absolute -left-6 mt-1 h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                              <div>
                                <p className="font-medium">Immediate (1-2 Weeks)</p>
                                <p className="text-sm text-gray-600">Request binding ruling for alternative HS classification</p>
                              </div>
                            </div>
                            
                            <div className="ml-6 mb-4 relative">
                              <div className="absolute -left-6 mt-1 h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                              <div>
                                <p className="font-medium">Short-term (1-2 Months)</p>
                                <p className="text-sm text-gray-600">Implement documentation procedures for trade agreement qualification</p>
                              </div>
                            </div>
                            
                            <div className="ml-6 mb-4 relative">
                              <div className="absolute -left-6 mt-1 h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                              <div>
                                <p className="font-medium">Medium-term (3-6 Months)</p>
                                <p className="text-sm text-gray-600">Evaluate and implement origin optimization strategies</p>
                              </div>
                            </div>
                            
                            <div className="ml-6 relative">
                              <div className="absolute -left-6 mt-1 h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                              <div>
                                <p className="font-medium">Long-term (6+ Months)</p>
                                <p className="text-sm text-gray-600">Develop comprehensive tariff management strategy</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <TooltipProvider>
                          <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <span className="text-blue-800 font-medium">Estimated Annual Savings</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center text-blue-800 font-bold text-lg">
                                  {formatCurrency(
                                    Math.max(...alternativeHSCodes.map(alt => alt.potentialSavings)) * 4
                                  )}
                                  <Info className="h-4 w-4 ml-1 text-blue-500" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">
                                  Based on optimal classification and trade agreement benefits, assuming quarterly shipments of similar value.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                        
                        <Button className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          Download Complete Strategy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default TariffAnalysisDashboard;