/**
 * Webhook Alert Destination
 * Sends alerts to custom webhook endpoints
 */

import { AlertDestination } from '../alertDestination';
import { Alert, AlertNotificationOptions } from '../types';
import axios from 'axios';
import { logger } from '../../../utils/logger';

interface WebhookDestinationConfig {
  url: string;
  headers?: Record<string, string>;
}

export class WebhookAlertDestination implements AlertDestination {
  private config: WebhookDestinationConfig;

  constructor(config: WebhookDestinationConfig) {
    this.config = config;
  }

  /**
   * Send a new alert notification via webhook
   */
  async sendAlert(alert: Alert, options?: AlertNotificationOptions): Promise<void> {
    try {
      // Create webhook payload
      const payload = {
        eventType: 'alert',
        alert: {
          ...alert,
          timestamp: new Date().toISOString()
        },
        options
      };

      // Send to webhook endpoint
      await axios.post(this.config.url, payload, {
        headers: this.config.headers || {}
      });

      logger.info(`Webhook alert sent: ${alert.name}`);
    } catch (error) {
      logger.error('Failed to send webhook alert', error);
      throw error;
    }
  }

  /**
   * Send a resolution notification via webhook
   */
  async sendResolution(alert: Alert, options?: AlertNotificationOptions): Promise<void> {
    try {
      // Create webhook payload
      const payload = {
        eventType: 'resolution',
        alert: {
          ...alert,
          timestamp: new Date().toISOString()
        },
        options
      };

      // Send to webhook endpoint
      await axios.post(this.config.url, payload, {
        headers: this.config.headers || {}
      });

      logger.info(`Webhook resolution alert sent: ${alert.name}`);
    } catch (error) {
      logger.error('Failed to send webhook resolution alert', error);
      throw error;
    }
  }

  /**
   * Test the webhook connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Send a test payload
      const testPayload = {
        eventType: 'test',
        message: 'TradeNavigator Alert System: Connection test',
        timestamp: new Date().toISOString()
      };

      await axios.post(this.config.url, testPayload, {
        headers: this.config.headers || {}
      });
      
      logger.info('Webhook alert destination connection verified');
      return true;
    } catch (error) {
      logger.error('Webhook alert destination connection failed', error);
      return false;
    }
  }
}
