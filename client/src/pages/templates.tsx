import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { useMasterTranslation } from '@/utils/masterTranslation';
import { 
  ExportImport, 
  TemplateCard 
} from '@/components/ExportImport';
import { 
  ExportedTemplate, 
  ExportFormat, 
  TemplateType 
} from '@/services/exportImport';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  FileText, 
  BarChart, 
  Clock
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error';
import { WithErrorBoundary } from '@/hooks/useErrorBoundary';

// Sample template data
const sampleTemplates: ExportedTemplate[] = [
  {
    version: '1.0',
    exportDate: '2025-05-15T14:30:00Z',
    type: TemplateType.TARIFF_ANALYSIS,
    meta: {
      name: 'Electronics Import Template',
      description: 'Template for calculating tariffs on electronic imports from Asia',
      tags: ['Electronics', 'Import', 'Asia'],
      createdBy: 'User'
    },
    data: {
      originCountry: 'CN',
      destinationCountry: 'US',
      goodsValue: 5000,
      currency: 'USD',
      hsCode: '8517.62',
      customFields: {
        shippingMethod: 'Air',
        insuranceIncluded: true
      }
    }
  },
  {
    version: '1.0',
    exportDate: '2025-05-10T09:15:00Z',
    type: TemplateType.COST_BREAKDOWN,
    meta: {
      name: 'Textile Shipping Template',
      description: 'Cost breakdown for textile product shipping to European markets',
      tags: ['Textiles', 'Europe', 'Shipping'],
      createdBy: 'User'
    },
    data: {
      originCountry: 'IN',
      destinationCountry: 'DE',
      goodsValue: 12000,
      currency: 'EUR',
      transportMode: 'Sea',
      insuranceCost: 350,
      freightCost: 1200,
      customsClearanceCost: 180,
      otherCosts: [
        { name: 'Documentation', value: 75 },
        { name: 'Warehousing', value: 120 }
      ]
    }
  },
  {
    version: '1.0',
    exportDate: '2025-05-05T16:45:00Z',
    type: TemplateType.ROUTE_ANALYSIS,
    meta: {
      name: 'Mexico-US Route Template',
      description: 'Optimized route for shipping automotive parts from Mexico to US',
      tags: ['Automotive', 'USMCA', 'Land Transport'],
      createdBy: 'User'
    },
    data: {
      originCountry: 'MX',
      originCity: 'Monterrey',
      destinationCountry: 'US',
      destinationCity: 'Dallas',
      transportMode: 'Road',
      containerType: '40ft',
      weight: 18000,
      volume: 65
    }
  },
  {
    version: '1.0',
    exportDate: '2025-05-01T11:20:00Z',
    type: TemplateType.TARIFF_ANALYSIS,
    meta: {
      name: 'Food Products Template',
      description: 'Template for food product imports with special health regulations',
      tags: ['Food', 'Health Regulations', 'Import'],
      createdBy: 'User'
    },
    data: {
      originCountry: 'BR',
      destinationCountry: 'CA',
      goodsValue: 8500,
      currency: 'CAD',
      hsCode: '2106.90',
      customFields: {
        organicCertified: true,
        refrigerated: true
      }
    }
  },
  {
    version: '1.0',
    exportDate: '2025-04-25T13:10:00Z',
    type: TemplateType.CUSTOM,
    meta: {
      name: 'Special Program Template',
      description: 'Custom template for products eligible for special trade programs',
      tags: ['Special Programs', 'Duty Reduction'],
      createdBy: 'User'
    },
    data: {
      programType: 'GSP',
      eligibilityCriteria: {
        originatingGoods: true,
        directShipment: true,
        documentationComplete: true
      },
      applicableHsCodes: ['61.09', '62.05', '64.02'],
      benefitCalculation: {
        normalDuty: 12.5,
        reducedDuty: 0,
        savingsPercentage: 100
      }
    }
  }
];

/**
 * Templates management page
 * Allows users to create, import, export, and manage calculation templates
 */
const TemplatesPage: React.FC = () => {
  const { t } = useMasterTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [templates, setTemplates] = useState<ExportedTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ExportedTemplate[]>([]);
  const [templateToDelete, setTemplateToDelete] = useState<ExportedTemplate | null>(null);
  
  // Initialize with sample data
  useEffect(() => {
    // In a real app, this would load from local storage or API
    setTemplates(sampleTemplates);
  }, []);
  
  // Filter templates based on search and active tab
  useEffect(() => {
    let filtered = [...templates];
    
    // Filter by type if not 'all'
    if (activeTab !== 'all') {
      filtered = filtered.filter(template => template.type === activeTab);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.meta.name.toLowerCase().includes(query) || 
        template.meta.description?.toLowerCase().includes(query) ||
        template.meta.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => 
      new Date(b.exportDate).getTime() - new Date(a.exportDate).getTime()
    );
    
    setFilteredTemplates(filtered);
  }, [templates, activeTab, searchQuery]);
  
  // Handle template import
  const handleImportTemplate = (template: ExportedTemplate) => {
    // Check if template with same name exists
    const exists = templates.some(t => 
      t.meta.name.toLowerCase() === template.meta.name.toLowerCase()
    );
    
    if (exists) {
      // Append a unique identifier to avoid duplicates
      template.meta.name = `${template.meta.name} (Imported ${new Date().toLocaleDateString()})`;
    }
    
    // Add to templates
    setTemplates(prev => [template, ...prev]);
    
    toast({
      title: 'Template Imported',
      description: `Template "${template.meta.name}" has been added to your collection.`,
      variant: 'default'
    });
  };
  
  // Handle template export
  const handleExportTemplate = (template: ExportedTemplate) => {
    return template;
  };
  
  // Handle template deletion
  const handleDeleteTemplate = () => {
    if (!templateToDelete) return;
    
    setTemplates(prev => 
      prev.filter(template => template.meta.name !== templateToDelete.meta.name)
    );
    
    toast({
      title: 'Template Deleted',
      description: `Template "${templateToDelete.meta.name}" has been removed.`,
      variant: 'default'
    });
    
    setTemplateToDelete(null);
  };
  
  // Handle template selection (would navigate to the appropriate calculation page)
  const handleSelectTemplate = (template: ExportedTemplate) => {
    // In a real app, this would redirect to the calculation page with the template pre-loaded
    toast({
      title: 'Template Selected',
      description: `Template "${template.meta.name}" is ready to use.`,
      variant: 'default'
    });
  };
  
  // Format template type for display
  const formatTemplateType = (type: string): string => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Get icon for template type
  const getTemplateIcon = (type: string) => {
    switch (type) {
      case TemplateType.TARIFF_ANALYSIS:
        return <FileText className="h-4 w-4 text-blue-500" />;
      case TemplateType.COST_BREAKDOWN:
        return <BarChart className="h-4 w-4 text-green-500" />;
      case TemplateType.ROUTE_ANALYSIS:
        return <Clock className="h-4 w-4 text-purple-500" />;
      default:
        return <Filter className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold">Calculation Templates</h1>
            <p className="mt-2 text-blue-100">
              Create, import, and manage your calculation templates
            </p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Your Templates</CardTitle>
                  <CardDescription>
                    Reuse calculation configurations with templates
                  </CardDescription>
                </div>
                
                {/* Export/Import Component */}
                <ExportImport 
                  onImport={handleImportTemplate}
                  showCreateNew={true}
                />
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Search and Filter */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search templates..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Template Type Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value={TemplateType.TARIFF_ANALYSIS}>Tariff</TabsTrigger>
                  <TabsTrigger value={TemplateType.COST_BREAKDOWN}>Cost</TabsTrigger>
                  <TabsTrigger value={TemplateType.ROUTE_ANALYSIS}>Route</TabsTrigger>
                  <TabsTrigger value={TemplateType.CUSTOM}>Custom</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Template Grid */}
              {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((template, index) => (
                    <WithErrorBoundary key={`${template.meta.name}-${index}`}>
                      <TemplateCard 
                        template={template}
                        onSelect={() => handleSelectTemplate(template)}
                        onDelete={() => setTemplateToDelete(template)}
                        onExport={() => handleExportTemplate(template)}
                      />
                    </WithErrorBoundary>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                    <Filter className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No templates found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchQuery 
                      ? "Try adjusting your search or filters"
                      : "Create or import templates to get started"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Delete Template Confirmation Dialog */}
        <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Template</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{templateToDelete?.meta.name}"? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTemplate} className="bg-red-500 hover:bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ErrorBoundary>
  );
};

export default TemplatesPage;