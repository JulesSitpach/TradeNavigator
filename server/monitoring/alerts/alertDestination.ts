/**
 * Base Alert Destination Interface
 * Defines standard methods for alert delivery destinations
 */

import { Alert, AlertNotificationOptions } from './types';

export interface AlertDestination {
  /**
   * Send a new alert notification
   * @param alert The alert to send
   * @param options Optional notification options
   * @returns Promise that resolves when alert is sent
   */
  sendAlert(alert: Alert, options?: AlertNotificationOptions): Promise<void>;
  
  /**
   * Send a resolution notification
   * @param alert The resolved alert
   * @param options Optional notification options
   * @returns Promise that resolves when alert resolution is sent
   */
  sendResolution(alert: Alert, options?: AlertNotificationOptions): Promise<void>;
  
  /**
   * Test the connection to ensure alerts can be delivered
   * @returns Promise that resolves if connection test passes
   */
  testConnection(): Promise<boolean>;
}
