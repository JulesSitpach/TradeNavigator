/**
 * Calculation History Service
 * 
 * This service provides functionality for managing calculation history:
 * - Store detailed history with complete parameters and results
 * - One-click reuse of previous calculations
 * - Exportable/shareable calculation templates
 * - Cloud sync with local fallback
 */

import { getCache, setCache, clearCache } from './cache';

const CALC_HISTORY_KEY = 'tn_calc_history';
const CALC_TEMPLATES_KEY = 'tn_calc_templates';
const CALC_SYNC_STATUS_KEY = 'tn_calc_sync_status';

// Time constants
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

// Types
export interface CalculationRecord {
  id: string;
  timestamp: number;
  type: CalculationType;
  name: string;
  description?: string;
  parameters: Record<string, any>;
  results: Record<string, any>;
  isFavorite?: boolean;
  tags?: string[];
  syncStatus?: 'synced' | 'pending' | 'failed';
  lastSynced?: number;
}

export enum CalculationType {
  TARIFF_ANALYSIS = 'tariff_analysis',
  COST_BREAKDOWN = 'cost_breakdown',
  ROUTE_ANALYSIS = 'route_analysis',
  COMPLIANCE_CHECK = 'compliance_check',
  CUSTOM = 'custom'
}

export interface CalculationTemplate {
  id: string;
  name: string;
  description: string;
  type: CalculationType;
  parameters: Record<string, any>;
  tags?: string[];
  isShared?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SyncStatus {
  lastSyncAttempt: number;
  lastSuccessfulSync: number;
  pendingChanges: number;
  isOnline: boolean;
}

/**
 * Save a calculation to history
 * @param calculation The calculation to save
 * @returns The saved calculation with ID
 */
export async function saveCalculation(calculation: Omit<CalculationRecord, 'id' | 'timestamp' | 'syncStatus'>): Promise<CalculationRecord> {
  // Get the current history
  const history = await getCalculationHistory();
  
  // Create a new record with ID and timestamp
  const newRecord: CalculationRecord = {
    ...calculation,
    id: generateId(),
    timestamp: Date.now(),
    syncStatus: 'pending'
  };
  
  // Add to history and save
  const updatedHistory = [newRecord, ...history];
  await setCache(CALC_HISTORY_KEY, updatedHistory, {
    storage: ['localStorage', 'indexedDB']
  });
  
  // Try to sync to cloud
  await syncCalculationToCloud(newRecord);
  
  return newRecord;
}

/**
 * Get the user's calculation history
 * @param options Filter options
 * @returns Array of calculation records
 */
export async function getCalculationHistory(
  options: {
    type?: CalculationType;
    tags?: string[];
    limit?: number;
    offset?: number;
    sortBy?: 'timestamp' | 'name';
    sortOrder?: 'asc' | 'desc';
    favoritesOnly?: boolean;
  } = {}
): Promise<CalculationRecord[]> {
  const {
    type,
    tags,
    limit,
    offset = 0,
    sortBy = 'timestamp',
    sortOrder = 'desc',
    favoritesOnly = false
  } = options;
  
  // Get all history items from cache
  const history = await getCache<CalculationRecord[]>(CALC_HISTORY_KEY) || [];
  
  // Apply filters
  let filteredHistory = history;
  
  if (type) {
    filteredHistory = filteredHistory.filter(item => item.type === type);
  }
  
  if (tags && tags.length > 0) {
    filteredHistory = filteredHistory.filter(item => 
      item.tags && tags.every(tag => item.tags.includes(tag))
    );
  }
  
  if (favoritesOnly) {
    filteredHistory = filteredHistory.filter(item => item.isFavorite);
  }
  
  // Apply sorting
  filteredHistory.sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'timestamp') {
      comparison = a.timestamp - b.timestamp;
    } else if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  // Apply pagination if specified
  if (limit !== undefined) {
    filteredHistory = filteredHistory.slice(offset, offset + limit);
  }
  
  return filteredHistory;
}

/**
 * Get a specific calculation by ID
 * @param id The calculation ID
 * @returns The calculation record or null if not found
 */
export async function getCalculationById(id: string): Promise<CalculationRecord | null> {
  const history = await getCalculationHistory();
  return history.find(item => item.id === id) || null;
}

/**
 * Update an existing calculation
 * @param id The calculation ID to update
 * @param updates The updates to apply
 * @returns The updated calculation or null if not found
 */
export async function updateCalculation(
  id: string,
  updates: Partial<Omit<CalculationRecord, 'id' | 'type' | 'parameters' | 'results'>>
): Promise<CalculationRecord | null> {
  const history = await getCalculationHistory();
  const index = history.findIndex(item => item.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // Apply updates
  const updatedRecord = {
    ...history[index],
    ...updates,
    syncStatus: 'pending'
  };
  
  // Update the history
  history[index] = updatedRecord;
  await setCache(CALC_HISTORY_KEY, history, {
    storage: ['localStorage', 'indexedDB']
  });
  
  // Try to sync to cloud
  await syncCalculationToCloud(updatedRecord);
  
  return updatedRecord;
}

/**
 * Delete a calculation from history
 * @param id The calculation ID to delete
 * @returns True if successfully deleted
 */
export async function deleteCalculation(id: string): Promise<boolean> {
  const history = await getCalculationHistory();
  const filteredHistory = history.filter(item => item.id !== id);
  
  if (filteredHistory.length === history.length) {
    return false; // Nothing was removed
  }
  
  // Update the history
  await setCache(CALC_HISTORY_KEY, filteredHistory, {
    storage: ['localStorage', 'indexedDB']
  });
  
  // Sync deletion to cloud
  await deleteCalculationFromCloud(id);
  
  return true;
}

/**
 * Toggle favorite status of a calculation
 * @param id The calculation ID
 * @returns The updated calculation or null if not found
 */
export async function toggleFavorite(id: string): Promise<CalculationRecord | null> {
  const calculation = await getCalculationById(id);
  
  if (!calculation) {
    return null;
  }
  
  return updateCalculation(id, {
    isFavorite: !calculation.isFavorite
  });
}

/**
 * Save a calculation as a reusable template
 * @param calculationId The calculation ID to save as template
 * @param templateName Name for the new template
 * @param description Description for the template
 * @returns The created template
 */
export async function saveAsTemplate(
  calculationId: string,
  templateName: string,
  description: string
): Promise<CalculationTemplate | null> {
  const calculation = await getCalculationById(calculationId);
  
  if (!calculation) {
    return null;
  }
  
  const template: CalculationTemplate = {
    id: generateId(),
    name: templateName,
    description,
    type: calculation.type,
    parameters: calculation.parameters,
    tags: calculation.tags,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  // Get existing templates
  const templates = await getCalculationTemplates();
  
  // Add the new template
  const updatedTemplates = [template, ...templates];
  await setCache(CALC_TEMPLATES_KEY, updatedTemplates, {
    storage: ['localStorage', 'indexedDB']
  });
  
  // Try to sync to cloud
  await syncTemplateToCloud(template);
  
  return template;
}

/**
 * Get all calculation templates
 * @returns Array of calculation templates
 */
export async function getCalculationTemplates(): Promise<CalculationTemplate[]> {
  return await getCache<CalculationTemplate[]>(CALC_TEMPLATES_KEY) || [];
}

/**
 * Get a specific template by ID
 * @param id The template ID
 * @returns The template or null if not found
 */
export async function getTemplateById(id: string): Promise<CalculationTemplate | null> {
  const templates = await getCalculationTemplates();
  return templates.find(template => template.id === id) || null;
}

/**
 * Delete a template
 * @param id The template ID to delete
 * @returns True if successfully deleted
 */
export async function deleteTemplate(id: string): Promise<boolean> {
  const templates = await getCalculationTemplates();
  const filteredTemplates = templates.filter(template => template.id !== id);
  
  if (filteredTemplates.length === templates.length) {
    return false; // Nothing was removed
  }
  
  // Update the templates
  await setCache(CALC_TEMPLATES_KEY, filteredTemplates, {
    storage: ['localStorage', 'indexedDB']
  });
  
  // Sync deletion to cloud
  await deleteTemplateFromCloud(id);
  
  return true;
}

/**
 * Export a calculation or template as a shareable JSON file
 * @param id The calculation or template ID
 * @param type 'calculation' or 'template'
 * @returns A JSON string for the exported item, or null if not found
 */
export async function exportCalculation(
  id: string,
  type: 'calculation' | 'template'
): Promise<string | null> {
  let item: CalculationRecord | CalculationTemplate | null = null;
  
  if (type === 'calculation') {
    item = await getCalculationById(id);
  } else {
    item = await getTemplateById(id);
  }
  
  if (!item) {
    return null;
  }
  
  // Create an export object with metadata
  const exportData = {
    type,
    data: item,
    exportedAt: new Date().toISOString(),
    tradeNavigatorVersion: '1.0.0'
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Import a calculation or template from a JSON string
 * @param jsonData The JSON data to import
 * @returns The imported item ID or null if import failed
 */
export async function importCalculation(jsonData: string): Promise<string | null> {
  try {
    const importedData = JSON.parse(jsonData);
    
    if (!importedData || !importedData.type || !importedData.data) {
      throw new Error('Invalid import format');
    }
    
    if (importedData.type === 'calculation') {
      // Import as a new calculation (generate new ID)
      const calculation: Omit<CalculationRecord, 'id' | 'timestamp' | 'syncStatus'> = {
        name: importedData.data.name,
        description: importedData.data.description,
        type: importedData.data.type,
        parameters: importedData.data.parameters,
        results: importedData.data.results,
        tags: importedData.data.tags,
        isFavorite: false // Don't import favorite status
      };
      
      const newCalculation = await saveCalculation(calculation);
      return newCalculation.id;
    } else if (importedData.type === 'template') {
      // Import as a new template (generate new ID)
      const template: Omit<CalculationTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
        name: importedData.data.name,
        description: importedData.data.description,
        type: importedData.data.type,
        parameters: importedData.data.parameters,
        tags: importedData.data.tags,
        isShared: false // Don't import shared status
      };
      
      const now = Date.now();
      const newTemplate: CalculationTemplate = {
        ...template,
        id: generateId(),
        createdAt: now,
        updatedAt: now
      };
      
      // Get existing templates
      const templates = await getCalculationTemplates();
      
      // Add the new template
      const updatedTemplates = [newTemplate, ...templates];
      await setCache(CALC_TEMPLATES_KEY, updatedTemplates, {
        storage: ['localStorage', 'indexedDB']
      });
      
      // Try to sync to cloud
      await syncTemplateToCloud(newTemplate);
      
      return newTemplate.id;
    } else {
      throw new Error('Unknown import type');
    }
  } catch (error) {
    console.error('Import error:', error);
    return null;
  }
}

/**
 * Get the current sync status
 * @returns The sync status
 */
export async function getSyncStatus(): Promise<SyncStatus> {
  const status = await getCache<SyncStatus>(CALC_SYNC_STATUS_KEY);
  
  if (status) {
    return status;
  }
  
  // Default status if none exists
  const defaultStatus: SyncStatus = {
    lastSyncAttempt: 0,
    lastSuccessfulSync: 0,
    pendingChanges: 0,
    isOnline: navigator.onLine
  };
  
  await setCache(CALC_SYNC_STATUS_KEY, defaultStatus, {
    storage: ['localStorage']
  });
  
  return defaultStatus;
}

/**
 * Trigger a sync of all pending calculations and templates
 * @returns The sync result
 */
export async function syncAll(): Promise<{
  success: boolean;
  synced: number;
  failed: number;
}> {
  // Get all items that need syncing
  const history = await getCalculationHistory();
  const pendingCalculations = history.filter(item => item.syncStatus === 'pending');
  
  const templates = await getCalculationTemplates();
  
  // Update sync status
  let status = await getSyncStatus();
  status = {
    ...status,
    lastSyncAttempt: Date.now(),
    pendingChanges: pendingCalculations.length,
    isOnline: navigator.onLine
  };
  
  await setCache(CALC_SYNC_STATUS_KEY, status, {
    storage: ['localStorage']
  });
  
  // Can't sync if offline
  if (!navigator.onLine) {
    return {
      success: false,
      synced: 0,
      failed: pendingCalculations.length
    };
  }
  
  // Sync all pending calculations
  const results = await Promise.allSettled(
    pendingCalculations.map(item => syncCalculationToCloud(item))
  );
  
  const synced = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  // Update sync status
  status = {
    ...status,
    lastSuccessfulSync: synced > 0 ? Date.now() : status.lastSuccessfulSync,
    pendingChanges: pendingCalculations.length - synced
  };
  
  await setCache(CALC_SYNC_STATUS_KEY, status, {
    storage: ['localStorage']
  });
  
  return {
    success: failed === 0,
    synced,
    failed
  };
}

// Private helper functions

/**
 * Generate a unique ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Sync a calculation to the cloud
 * In a real implementation, this would call the API
 */
async function syncCalculationToCloud(calculation: CalculationRecord): Promise<boolean> {
  // In a real implementation, this would make an API call
  // For now, just simulate a successful sync after a delay
  return new Promise((resolve) => {
    setTimeout(async () => {
      // Update the calculation's sync status
      const history = await getCalculationHistory();
      const index = history.findIndex(item => item.id === calculation.id);
      
      if (index !== -1) {
        history[index] = {
          ...history[index],
          syncStatus: 'synced',
          lastSynced: Date.now()
        };
        
        await setCache(CALC_HISTORY_KEY, history, {
          storage: ['localStorage', 'indexedDB']
        });
      }
      
      resolve(true);
    }, 300);
  });
}

/**
 * Delete a calculation from the cloud
 * In a real implementation, this would call the API
 */
async function deleteCalculationFromCloud(id: string): Promise<boolean> {
  // In a real implementation, this would make an API call
  // For now, just simulate a successful deletion after a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 200);
  });
}

/**
 * Sync a template to the cloud
 * In a real implementation, this would call the API
 */
async function syncTemplateToCloud(template: CalculationTemplate): Promise<boolean> {
  // In a real implementation, this would make an API call
  // For now, just simulate a successful sync after a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 300);
  });
}

/**
 * Delete a template from the cloud
 * In a real implementation, this would call the API
 */
async function deleteTemplateFromCloud(id: string): Promise<boolean> {
  // In a real implementation, this would make an API call
  // For now, just simulate a successful deletion after a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 200);
  });
}
