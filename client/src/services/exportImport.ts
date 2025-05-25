/**
 * ExportImportService
 * 
 * Provides utilities for exporting and importing data from the application.
 * Handles different export formats and data validation on import.
 */

import { z } from 'zod';

// Export format types
export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  PDF = 'pdf'
}

// Template types that can be exported/imported
export enum TemplateType {
  TARIFF_ANALYSIS = 'tariff-analysis',
  COST_BREAKDOWN = 'cost-breakdown',
  ROUTE_ANALYSIS = 'route-analysis',
  CUSTOM = 'custom'
}

// Base schema for exported data
const baseExportSchema = z.object({
  version: z.string(),
  exportDate: z.string().datetime(),
  type: z.nativeEnum(TemplateType),
  meta: z.object({
    name: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    createdBy: z.string().optional()
  })
});

// Tariff analysis template schema
export const tariffAnalysisSchema = baseExportSchema.extend({
  type: z.literal(TemplateType.TARIFF_ANALYSIS),
  data: z.object({
    hsCode: z.string().optional(),
    originCountry: z.string(),
    destinationCountry: z.string(),
    goodsValue: z.number(),
    currency: z.string(),
    quantity: z.number().optional(),
    unit: z.string().optional(),
    customFields: z.record(z.string(), z.unknown()).optional()
  })
});

// Cost breakdown template schema
export const costBreakdownSchema = baseExportSchema.extend({
  type: z.literal(TemplateType.COST_BREAKDOWN),
  data: z.object({
    hsCode: z.string().optional(),
    originCountry: z.string(),
    destinationCountry: z.string(),
    goodsValue: z.number(),
    currency: z.string(),
    transportMode: z.string(),
    insuranceCost: z.number().optional(),
    freightCost: z.number().optional(),
    customsClearanceCost: z.number().optional(),
    otherCosts: z.array(z.object({
      name: z.string(),
      value: z.number()
    })).optional(),
    customFields: z.record(z.string(), z.unknown()).optional()
  })
});

// Route analysis template schema
export const routeAnalysisSchema = baseExportSchema.extend({
  type: z.literal(TemplateType.ROUTE_ANALYSIS),
  data: z.object({
    originCountry: z.string(),
    originCity: z.string().optional(),
    destinationCountry: z.string(),
    destinationCity: z.string().optional(),
    transportMode: z.string(),
    containerType: z.string().optional(),
    weight: z.number().optional(),
    volume: z.number().optional(),
    departureDate: z.string().datetime().optional(),
    customFields: z.record(z.string(), z.unknown()).optional()
  })
});

// Custom template schema with flexible data structure
export const customTemplateSchema = baseExportSchema.extend({
  type: z.literal(TemplateType.CUSTOM),
  data: z.record(z.string(), z.unknown())
});

// Union of all template schemas
export const templateSchema = z.discriminatedUnion('type', [
  tariffAnalysisSchema,
  costBreakdownSchema,
  routeAnalysisSchema,
  customTemplateSchema
]);

// Type inference from schemas
export type ExportedTemplate = z.infer<typeof templateSchema>;
export type TariffAnalysisTemplate = z.infer<typeof tariffAnalysisSchema>;
export type CostBreakdownTemplate = z.infer<typeof costBreakdownSchema>;
export type RouteAnalysisTemplate = z.infer<typeof routeAnalysisSchema>;
export type CustomTemplate = z.infer<typeof customTemplateSchema>;

/**
 * Export data as a file in the specified format
 */
export const exportToFile = async <T extends ExportedTemplate>(
  data: T,
  format: ExportFormat = ExportFormat.JSON,
  filename?: string
): Promise<boolean> => {
  try {
    // Validate data against schema
    templateSchema.parse(data);
    
    // Generate filename if not provided
    const defaultFilename = `tradenavigator-${data.type}-${new Date().toISOString().slice(0, 10)}`;
    const finalFilename = filename || defaultFilename;
    
    let fileContent: string | Blob;
    let mimeType: string;
    
    // Format data according to export format
    switch (format) {
      case ExportFormat.JSON:
        fileContent = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        break;
        
      case ExportFormat.CSV:
        fileContent = convertToCSV(data);
        mimeType = 'text/csv';
        break;
        
      case ExportFormat.PDF:
        throw new Error('PDF export not implemented yet');
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    // Create download link
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${finalFilename}.${format}`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    return true;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
};

/**
 * Import data from a file
 */
export const importFromFile = async (
  file: File
): Promise<ExportedTemplate | null> => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const fileContent = event.target?.result as string;
          
          // Determine file type and parse accordingly
          if (file.name.endsWith('.json')) {
            const data = JSON.parse(fileContent);
            
            // Validate data against schema
            const result = templateSchema.safeParse(data);
            
            if (result.success) {
              resolve(result.data);
            } else {
              console.error('Validation errors:', result.error);
              reject(new Error('Invalid template format'));
            }
          } else if (file.name.endsWith('.csv')) {
            const data = parseCSV(fileContent);
            resolve(data);
          } else {
            reject(new Error(`Unsupported file type: ${file.type}`));
          }
        } catch (error) {
          console.error('Import parsing error:', error);
          reject(new Error('Failed to parse imported file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  } catch (error) {
    console.error('Import failed:', error);
    return null;
  }
};

/**
 * Convert template data to CSV format
 */
const convertToCSV = (data: ExportedTemplate): string => {
  // Extract metadata to include in CSV header
  const metaRows = [
    `"Template Type","${data.type}"`,
    `"Version","${data.version}"`,
    `"Export Date","${data.exportDate}"`,
    `"Name","${data.meta.name}"`,
    `"Description","${data.meta.description || ''}"`,
    `"Tags","${(data.meta.tags || []).join(';')}"`,
    `"Created By","${data.meta.createdBy || ''}"`,
    ''  // Empty line to separate metadata from data
  ];
  
  // Convert data fields to CSV
  const dataFields = Object.entries(data.data).map(([key, value]) => {
    // Handle different value types
    let csvValue = '';
    
    if (value === null || value === undefined) {
      csvValue = '';
    } else if (Array.isArray(value)) {
      csvValue = `"${JSON.stringify(value).replace(/"/g, '""')}"`;
    } else if (typeof value === 'object') {
      csvValue = `"${JSON.stringify(value).replace(/"/g, '""')}"`;
    } else {
      csvValue = `"${String(value).replace(/"/g, '""')}"`;
    }
    
    return `"${key}",${csvValue}`;
  });
  
  return [...metaRows, ...dataFields].join('\n');
};

/**
 * Parse CSV data into a template object
 */
const parseCSV = (csvContent: string): ExportedTemplate => {
  const lines = csvContent.split('\n').map(line => line.trim()).filter(Boolean);
  
  // Extract metadata from header rows
  const metadata: Record<string, string> = {};
  let dataStartIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (!line) {
      dataStartIndex = i + 1;
      break;
    }
    
    // Parse quoted CSV format
    const match = line.match(/"([^"]+)","([^"]*)"/);
    if (match) {
      const [, key, value] = match;
      metadata[key] = value;
    }
  }
  
  // Extract data fields
  const dataFields: Record<string, any> = {};
  
  for (let i = dataStartIndex; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/"([^"]+)",(.+)/);
    
    if (match) {
      const [, key, rawValue] = match;
      
      // Handle quoted values
      let value: any = rawValue.trim();
      
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1).replace(/""/g, '"');
      }
      
      // Try to parse JSON if it looks like an object or array
      if ((value.startsWith('{') && value.endsWith('}')) || 
          (value.startsWith('[') && value.endsWith(']'))) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if parsing fails
        }
      } 
      // Try to convert to number if it looks like one
      else if (/^-?\d+(\.\d+)?$/.test(value)) {
        value = parseFloat(value);
      }
      // Convert special string values
      else if (value === 'true') {
        value = true;
      } 
      else if (value === 'false') {
        value = false;
      }
      
      dataFields[key] = value;
    }
  }
  
  // Build template object
  const template: ExportedTemplate = {
    version: metadata['Version'] || '1.0',
    exportDate: metadata['Export Date'] || new Date().toISOString(),
    type: (metadata['Template Type'] as TemplateType) || TemplateType.CUSTOM,
    meta: {
      name: metadata['Name'] || 'Imported Template',
      description: metadata['Description'] || undefined,
      tags: metadata['Tags'] ? metadata['Tags'].split(';') : undefined,
      createdBy: metadata['Created By'] || undefined
    },
    data: dataFields
  };
  
  return template;
};

/**
 * Create a new template with default values
 */
export const createTemplate = (
  type: TemplateType,
  name: string,
  description?: string
): ExportedTemplate => {
  const baseTemplate = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    type,
    meta: {
      name,
      description,
      tags: [],
      createdBy: 'User' // This would typically come from auth context
    }
  };
  
  // Create data structure based on template type
  switch (type) {
    case TemplateType.TARIFF_ANALYSIS:
      return {
        ...baseTemplate,
        type: TemplateType.TARIFF_ANALYSIS,
        data: {
          originCountry: '',
          destinationCountry: '',
          goodsValue: 0,
          currency: 'USD',
          customFields: {}
        }
      } as TariffAnalysisTemplate;
      
    case TemplateType.COST_BREAKDOWN:
      return {
        ...baseTemplate,
        type: TemplateType.COST_BREAKDOWN,
        data: {
          originCountry: '',
          destinationCountry: '',
          goodsValue: 0,
          currency: 'USD',
          transportMode: '',
          otherCosts: [],
          customFields: {}
        }
      } as CostBreakdownTemplate;
      
    case TemplateType.ROUTE_ANALYSIS:
      return {
        ...baseTemplate,
        type: TemplateType.ROUTE_ANALYSIS,
        data: {
          originCountry: '',
          originCity: '',
          destinationCountry: '',
          destinationCity: '',
          transportMode: '',
          customFields: {}
        }
      } as RouteAnalysisTemplate;
      
    case TemplateType.CUSTOM:
    default:
      return {
        ...baseTemplate,
        type: TemplateType.CUSTOM,
        data: {}
      } as CustomTemplate;
  }
};
