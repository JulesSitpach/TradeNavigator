import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { useMasterTranslation } from '@/utils/masterTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { BarChart, Clock, Calculator, Download, Share2, Save, FileText, Search, Filter, RefreshCw, ArrowDown, ArrowUp, Eye, Trash2, FileUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExportImport } from '@/components/ExportImport';
import { TemplateType, ExportFormat, ExportedTemplate } from '@/services/exportImport';
import { ErrorBoundary } from '@/components/error';
import { useToast } from '@/hooks/use-toast';

// Types for calculation history
interface CalculationItem {
  id: string;
  title: string;
  type: 'tariff' | 'cost' | 'route';
  date: string; // ISO date string
  result: {
    totalCost?: number;
    currency?: string;
    dutiesRate?: number;
    taxesRate?: number;
    hsCode?: string;
    totalDistance?: number;
    estimatedTime?: number;
  };
  saved: boolean;
  tags: string[];
}

// Sample data
const dummyCalculations: CalculationItem[] = [
  {
    id: 'calc-1',
    title: 'Electronics Import from China',
    type: 'tariff',
    date: '2025-05-20T14:30:00Z',
    result: {
      totalCost: 12580.45,
      currency: 'USD',
      dutiesRate: 6.5,
      taxesRate: 8.25,
      hsCode: '8517.62.0000'
    },
    saved: true,
    tags: ['Electronics', 'China', 'Import']
  },
  {
    id: 'calc-2',
    title: 'Textile Shipping to EU',
    type: 'cost',
    date: '2025-05-18T09:15:00Z',
    result: {
      totalCost: 4350.00,
      currency: 'EUR',
      dutiesRate: 12.0,
      taxesRate: 19.0,
      hsCode: '6204.43.0000'
    },
    saved: true,
    tags: ['Textiles', 'EU', 'Export']
  },
  {
    id: 'calc-3',
    title: 'Automotive Parts from Mexico',
    type: 'route',
    date: '2025-05-15T16:45:00Z',
    result: {
      totalDistance: 2340,
      estimatedTime: 72,
      totalCost: 3680.25,
      currency: 'USD'
    },
    saved: false,
    tags: ['Automotive', 'Mexico', 'USMCA']
  },
  {
    id: 'calc-4',
    title: 'Food Products to Canada',
    type: 'tariff',
    date: '2025-05-12T11:20:00Z',
    result: {
      totalCost: 8920.75,
      currency: 'CAD',
      dutiesRate: 3.5,
      taxesRate: 5.0,
      hsCode: '2106.90.9800'
    },
    saved: true,
    tags: ['Food', 'Canada', 'Export']
  },
  {
    id: 'calc-5',
    title: 'Chemical Import from Germany',
    type: 'cost',
    date: '2025-05-10T08:30:00Z',
    result: {
      totalCost: 15780.50,
      currency: 'USD',
      dutiesRate: 6.5,
      taxesRate: 7.25,
      hsCode: '2933.59.9500'
    },
    saved: true,
    tags: ['Chemicals', 'Germany', 'Import']
  },
  {
    id: 'calc-6',
    title: 'Medical Supplies to Japan',
    type: 'route',
    date: '2025-05-08T13:40:00Z',
    result: {
      totalDistance: 8750,
      estimatedTime: 240,
      totalCost: 12540.75,
      currency: 'USD'
    },
    saved: false,
    tags: ['Medical', 'Japan', 'Export']
  },
  {
    id: 'calc-7',
    title: 'Electronic Components from Taiwan',
    type: 'tariff',
    date: '2025-05-05T15:55:00Z',
    result: {
      totalCost: 5680.25,
      currency: 'USD',
      dutiesRate: 0.0,
      taxesRate: 8.25,
      hsCode: '8542.31.0000'
    },
    saved: true,
    tags: ['Electronics', 'Taiwan', 'Import']
  }
];

const CalculationHistory: React.FC = () => {
  const { t } = useMasterTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [calculationList, setCalculationList] = useState<CalculationItem[]>([]);
  const [filteredCalculations, setFilteredCalculations] = useState<CalculationItem[]>([]);
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCalculation, setSelectedCalculation] = useState<CalculationItem | null>(null);
  const itemsPerPage = 5;

  // Initialize with dummy data
  useEffect(() => {
    setCalculationList(dummyCalculations);
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...calculationList];
    
    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(calc => calc.type === typeFilter);
    }
    
    // Filter by saved status
    if (activeTab === 'saved') {
      filtered = filtered.filter(calc => calc.saved);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(calc => 
        calc.title.toLowerCase().includes(query) || 
        calc.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'type') {
        comparison = a.type.localeCompare(b.type);
      } else if (sortField === 'cost') {
        const costA = a.result.totalCost || 0;
        const costB = b.result.totalCost || 0;
        comparison = costA - costB;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredCalculations(filtered);
  }, [calculationList, activeTab, searchQuery, typeFilter, sortField, sortDirection]);

  // Toggle sort direction
  const toggleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Toggle saved status
  const toggleSaved = (id: string) => {
    setCalculationList(prev => 
      prev.map(calc => 
        calc.id === id ? { ...calc, saved: !calc.saved } : calc
      )
    );
  };

  // Delete calculation
  const deleteCalculation = (id: string) => {
    setCalculationList(prev => prev.filter(calc => calc.id !== id));
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredCalculations.length / itemsPerPage);
  const currentItems = filteredCalculations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Handle export of calculation as template
  const handleExportCalculation = (calculation: CalculationItem): ExportedTemplate | null => {
    setSelectedCalculation(calculation);
    
    let templateType: TemplateType;
    let templateData: any = {};
    
    // Determine template type based on calculation type
    switch (calculation.type) {
      case 'tariff':
        templateType = TemplateType.TARIFF_ANALYSIS;
        break;
      case 'cost':
        templateType = TemplateType.COST_BREAKDOWN;
        break;
      case 'route':
        templateType = TemplateType.ROUTE_ANALYSIS;
        break;
      default:
        templateType = TemplateType.CUSTOM;
    }
    
    // Extract data for template based on calculation type
    if (calculation.type === 'tariff') {
      templateData = {
        hsCode: calculation.result.hsCode || '',
        goodsValue: calculation.result.totalCost || 0,
        currency: calculation.result.currency || 'USD',
        dutiesRate: calculation.result.dutiesRate || 0,
        taxesRate: calculation.result.taxesRate || 0,
        // These would come from the actual calculation in a real app
        originCountry: 'US',
        destinationCountry: 'CN'
      };
    } else if (calculation.type === 'cost') {
      templateData = {
        goodsValue: calculation.result.totalCost || 0,
        currency: calculation.result.currency || 'USD',
        dutiesRate: calculation.result.dutiesRate || 0,
        taxesRate: calculation.result.taxesRate || 0,
        // These would come from the actual calculation in a real app
        originCountry: 'US',
        destinationCountry: 'CN',
        transportMode: 'Sea'
      };
    } else if (calculation.type === 'route') {
      templateData = {
        totalDistance: calculation.result.totalDistance || 0,
        estimatedTime: calculation.result.estimatedTime || 0,
        totalCost: calculation.result.totalCost || 0,
        currency: calculation.result.currency || 'USD',
        // These would come from the actual calculation in a real app
        originCountry: 'US',
        originCity: 'New York',
        destinationCountry: 'CN',
        destinationCity: 'Shanghai',
        transportMode: 'Sea'
      };
    }
    
    // Create template from calculation
    const template: ExportedTemplate = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      type: templateType,
      meta: {
        name: calculation.title,
        description: `Template created from ${calculation.title} calculation`,
        tags: calculation.tags || [],
        createdBy: 'User' // Would come from auth context in a real app
      },
      data: templateData
    };
    
    toast({
      title: 'Template Created',
      description: `Template "${calculation.title}" ready for export`,
      variant: 'default'
    });
    
    return template;
  };
  
  // Handle import of template
  const handleImportTemplate = (template: ExportedTemplate) => {
    toast({
      title: 'Template Imported',
      description: 'You can now use this template in your calculations.',
      variant: 'default'
    });
    
    // In a real app, this would navigate to the appropriate calculation page with the template pre-loaded
    window.location.href = template.type === TemplateType.TARIFF_ANALYSIS
      ? '/tariff-analysis'
      : template.type === TemplateType.COST_BREAKDOWN
      ? '/cost-breakdown'
      : '/route-analysis';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold">Calculation History</h1>
          <p className="mt-2 text-blue-100">
            Browse, search, and reuse your previous trade calculations
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Calculation History</CardTitle>
                <CardDescription>View and manage your calculation history</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <ErrorBoundary>
                  <ExportImport 
                    onImport={handleImportTemplate}
                    onExport={selectedCalculation ? () => handleExportCalculation(selectedCalculation) : undefined}
                    showCreateNew={false}
                  />
                </ErrorBoundary>
                <Button variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" /> Sync
                </Button>
                <Button className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" /> New Calculation
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All Calculations</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex items-center relative flex-1">
                <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search calculations..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="tariff">Tariff Analysis</SelectItem>
                    <SelectItem value="cost">Cost Breakdown</SelectItem>
                    <SelectItem value="route">Route Analysis</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortField} onValueChange={setSortField}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="cost">Cost</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                >
                  {sortDirection === 'asc' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {currentItems.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort('title')}>
                        Title
                        {sortField === 'title' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort('type')}>
                        Type
                        {sortField === 'type' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort('date')}>
                        Date
                        {sortField === 'date' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort('cost')}>
                        Result
                        {sortField === 'cost' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((calculation) => (
                      <TableRow key={calculation.id}>
                        <TableCell>
                          <div className="font-medium">{calculation.title}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {calculation.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {calculation.type === 'tariff' && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span>Tariff</span>
                            </div>
                          )}
                          {calculation.type === 'cost' && (
                            <div className="flex items-center gap-1">
                              <BarChart className="h-4 w-4 text-green-600" />
                              <span>Cost</span>
                            </div>
                          )}
                          {calculation.type === 'route' && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-purple-600" />
                              <span>Route</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(calculation.date)}</div>
                        </TableCell>
                        <TableCell>
                          {calculation.type === 'tariff' && (
                            <div>
                              <div className="font-medium">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: calculation.result.currency || 'USD'
                                }).format(calculation.result.totalCost || 0)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Duties: {calculation.result.dutiesRate}% • 
                                HS: {calculation.result.hsCode}
                              </div>
                            </div>
                          )}
                          {calculation.type === 'cost' && (
                            <div>
                              <div className="font-medium">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: calculation.result.currency || 'USD'
                                }).format(calculation.result.totalCost || 0)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Taxes: {calculation.result.taxesRate}%
                              </div>
                            </div>
                          )}
                          {calculation.type === 'route' && (
                            <div>
                              <div className="font-medium">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: calculation.result.currency || 'USD'
                                }).format(calculation.result.totalCost || 0)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {calculation.result.totalDistance} km • 
                                {calculation.result.estimatedTime} hrs
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" title="View details">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title={calculation.saved ? "Remove from saved" : "Save calculation"}
                              onClick={() => toggleSaved(calculation.id)}
                            >
                              <Save 
                                className={`h-4 w-4 ${calculation.saved ? 'text-blue-600 fill-blue-600' : ''}`} 
                              />
                            </Button>
                            <Button variant="ghost" size="icon" title="Share">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Export as template"
                              onClick={() => setSelectedCalculation(calculation)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Delete"
                              onClick={() => deleteCalculation(calculation.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No calculations found</p>
              </div>
            )}
            
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="mx-4 flex items-center">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalculationHistory;