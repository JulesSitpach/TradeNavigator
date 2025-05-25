import React, { useState, useRef } from 'react';
import { 
  exportToFile, 
  importFromFile, 
  ExportFormat, 
  TemplateType,
  ExportedTemplate,
  createTemplate
} from '@/services/exportImport';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogClose
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Download, 
  Upload, 
  FileUp, 
  FileDown, 
  Check, 
  AlertCircle, 
  FileText, 
  FilePlus2, 
  Save, 
  ChevronDown,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMasterTranslation } from '@/utils/masterTranslation';
import { ErrorBoundary } from '@/components/error';

interface ExportImportProps {
  onImport?: (template: ExportedTemplate) => void;
  onExport?: (format: ExportFormat) => ExportedTemplate | Promise<ExportedTemplate | null>;
  currentTemplate?: ExportedTemplate;
  showCreateNew?: boolean;
  className?: string;
}

/**
 * ExportImport component provides UI for exporting and importing calculation templates
 */
export const ExportImport: React.FC<ExportImportProps> = ({
  onImport,
  onExport,
  currentTemplate,
  showCreateNew = true,
  className = ''
}) => {
  const { t } = useMasterTranslation();
  const { toast } = useToast();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>(ExportFormat.JSON);
  const [exportFilename, setExportFilename] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importedTemplate, setImportedTemplate] = useState<ExportedTemplate | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Create new template state
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateType, setNewTemplateType] = useState<TemplateType>(TemplateType.TARIFF_ANALYSIS);
  
  // Handle file selection for import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportedTemplate(null);
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // Simulate upload progress
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);
      
      // Import the file
      const template = await importFromFile(file);
      
      // Complete progress and clear interval
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (template) {
        setImportedTemplate(template);
      } else {
        setImportError('Failed to import file. The format may be invalid.');
      }
    } catch (error) {
      setImportError(`Import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUploadProgress(0);
    }
  };
  
  // Handle export button click
  const handleExport = async () => {
    try {
      let templateToExport: ExportedTemplate | null = null;
      
      // Use the provided template, callback, or current template
      if (onExport) {
        templateToExport = await onExport(exportFormat);
      } else if (currentTemplate) {
        templateToExport = currentTemplate;
      }
      
      if (!templateToExport) {
        toast({
          title: 'Export Failed',
          description: 'No template data available to export.',
          variant: 'destructive'
        });
        return;
      }
      
      // Export the template to file
      const success = await exportToFile(
        templateToExport, 
        exportFormat, 
        exportFilename || undefined
      );
      
      if (success) {
        toast({
          title: 'Export Successful',
          description: `Template exported as ${exportFormat.toUpperCase()} file.`,
          variant: 'default'
        });
        setIsExportDialogOpen(false);
      } else {
        toast({
          title: 'Export Failed',
          description: 'Failed to export template.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  };
  
  // Handle import button click
  const handleImport = () => {
    if (!importedTemplate) {
      setImportError('No valid template has been imported.');
      return;
    }
    
    if (onImport) {
      onImport(importedTemplate);
    }
    
    toast({
      title: 'Import Successful',
      description: `Template "${importedTemplate.meta.name}" has been imported.`,
      variant: 'default'
    });
    
    setIsImportDialogOpen(false);
    setImportedTemplate(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle create new template
  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) {
      toast({
        title: 'Template Creation Failed',
        description: 'Please provide a name for the template.',
        variant: 'destructive'
      });
      return;
    }
    
    const template = createTemplate(
      newTemplateType,
      newTemplateName,
      newTemplateDescription
    );
    
    if (onImport) {
      onImport(template);
    }
    
    toast({
      title: 'Template Created',
      description: `New ${newTemplateType} template created successfully.`,
      variant: 'default'
    });
    
    setIsCreateDialogOpen(false);
    setNewTemplateName('');
    setNewTemplateDescription('');
  };
  
  // Format the template type for display
  const formatTemplateType = (type: string): string => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <ErrorBoundary>
      <div className={`flex gap-2 ${className}`}>
        {/* Export Button */}
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Export Template</DialogTitle>
              <DialogDescription>
                Export your calculation template to a file
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="format">Export Format</Label>
                <RadioGroup 
                  id="format" 
                  value={exportFormat} 
                  onValueChange={(value) => setExportFormat(value as ExportFormat)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={ExportFormat.JSON} id="json" />
                    <Label htmlFor="json">JSON</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={ExportFormat.CSV} id="csv" />
                    <Label htmlFor="csv">CSV</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={ExportFormat.PDF} id="pdf" disabled />
                    <Label htmlFor="pdf" className="text-gray-400">PDF (Coming Soon)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="filename">Filename (Optional)</Label>
                <Input
                  id="filename"
                  placeholder={`tradenavigator-template-${new Date().toISOString().slice(0, 10)}`}
                  value={exportFilename}
                  onChange={(e) => setExportFilename(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleExport} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Import Button */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              <span>Import</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Import Template</DialogTitle>
              <DialogDescription>
                Import a calculation template from a file
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                  <TabsTrigger value="preview" disabled={!importedTemplate}>Preview</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="py-4">
                  <div className="grid gap-4">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,.csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="template-file"
                      />
                      <Label
                        htmlFor="template-file"
                        className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                      >
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-sm font-medium">
                          Click to select a file or drag and drop
                        </span>
                        <span className="text-xs text-gray-500">
                          Supports JSON and CSV formats
                        </span>
                      </Label>
                    </div>
                    
                    {uploadProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {importError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Import Error</AlertTitle>
                        <AlertDescription>{importError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {importedTemplate && (
                      <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
                        <Check className="h-4 w-4" />
                        <AlertTitle>Template Imported Successfully</AlertTitle>
                        <AlertDescription>
                          Template "{importedTemplate.meta.name}" is ready to be used.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="preview">
                  {importedTemplate && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{importedTemplate.meta.name}</h3>
                          <Badge>{formatTemplateType(importedTemplate.type)}</Badge>
                        </div>
                        
                        {importedTemplate.meta.description && (
                          <p className="text-sm text-gray-500">{importedTemplate.meta.description}</p>
                        )}
                        
                        {importedTemplate.meta.tags && importedTemplate.meta.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {importedTemplate.meta.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md">
                        <h4 className="text-sm font-medium mb-2">Template Data Preview:</h4>
                        <pre className="text-xs overflow-auto max-h-40">
                          {JSON.stringify(importedTemplate.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={handleImport} 
                disabled={!importedTemplate}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Import Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Create New Template Button */}
        {showCreateNew && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <FilePlus2 className="h-4 w-4" />
                <span>New Template</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Create a new calculation template
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="template-type">Template Type</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {formatTemplateType(newTemplateType)}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setNewTemplateType(TemplateType.TARIFF_ANALYSIS)}>
                        Tariff Analysis
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setNewTemplateType(TemplateType.COST_BREAKDOWN)}>
                        Cost Breakdown
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setNewTemplateType(TemplateType.ROUTE_ANALYSIS)}>
                        Route Analysis
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setNewTemplateType(TemplateType.CUSTOM)}>
                        Custom Template
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    placeholder="My Calculation Template"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-description">Description (Optional)</Label>
                  <Textarea
                    id="template-description"
                    placeholder="Describe what this template is for..."
                    value={newTemplateDescription}
                    onChange={(e) => setNewTemplateDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleCreateTemplate} 
                  disabled={!newTemplateName.trim()}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Create Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Export Dropdown (Alternative UI) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hidden">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsExportDialogOpen(true)}>
              <FileDown className="h-4 w-4 mr-2" />
              Export Template
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>
              <FileUp className="h-4 w-4 mr-2" />
              Import Template
            </DropdownMenuItem>
            {showCreateNew && (
              <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
                <FilePlus2 className="h-4 w-4 mr-2" />
                Create New Template
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ErrorBoundary>
  );
};

/**
 * A card component that showcases imported templates
 */
export const TemplateCard: React.FC<{
  template: ExportedTemplate;
  onSelect?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
}> = ({ template, onSelect, onDelete, onExport }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{template.meta.name}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {formatTemplateType(template.type)}
            </CardDescription>
          </div>
          {onDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }} 
              className="h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {template.meta.description ? (
          <p className="text-sm text-gray-600 line-clamp-2">{template.meta.description}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">No description</p>
        )}
        
        {template.meta.tags && template.meta.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {template.meta.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.meta.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.meta.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <div className="text-xs text-gray-500">
          {new Date(template.exportDate).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          {onExport && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                onExport();
              }} 
              className="h-8 w-8"
            >
              <FileDown className="h-4 w-4" />
            </Button>
          )}
          {onSelect && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSelect} 
              className="h-8"
            >
              Use
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
