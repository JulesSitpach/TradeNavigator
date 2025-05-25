/**
 * Services Index
 * 
 * This file exports all the service modules for easy access.
 */

// Caching and Data Persistence
export * from './cache';
export * from './hsCode';
export * from './tradeAgreement';
export * from './calculationHistory';

// API Resilience and Failover
export * from './apiClient';

// Notification System
export * from './notification';

// Data Validation
export * from './validation';

// Performance Optimization
export * from './performance';

// Export/Import Functionality
export * from './exportImport';

// Initialize service workers and background processes
import { processSyncQueue } from './apiClient';
import { cleanupExpiredNotifications } from './notification';
import { syncHSCodes } from './hsCode';

// Run initialization tasks
(async () => {
  try {
    // Cleanup expired notifications
    await cleanupExpiredNotifications();
    
    // Process any pending API sync queue items
    if (navigator.onLine) {
      await processSyncQueue();
    }
    
    // Check for HS code updates in the background
    syncHSCodes().catch(err => {
      console.error('Error syncing HS codes:', err);
    });
    
    // Set up periodic maintenance tasks
    setInterval(async () => {
      // Process sync queue every 5 minutes when online
      if (navigator.onLine) {
        await processSyncQueue().catch(err => {
          console.error('Error processing sync queue:', err);
        });
      }
      
      // Clean up expired notifications daily
      await cleanupExpiredNotifications().catch(err => {
        console.error('Error cleaning up notifications:', err);
      });
    }, 5 * 60 * 1000); // 5 minutes
    
  } catch (error) {
    console.error('Error initializing services:', error);
  }
})();
