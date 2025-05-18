/**
 * Slack Alert Destination
 * Sends alerts to Slack channels via webhooks
 */

import { AlertDestination } from '../alertDestination';
import { Alert, AlertSeverity, AlertNotificationOptions } from '../types';
import axios from 'axios';
import { logger } from '../../../utils/logger';

interface SlackDestinationConfig {
  webhookUrl: string;
  channel?: string;
}

export class SlackAlertDestination implements AlertDestination {
  private config: SlackDestinationConfig;

  constructor(config: SlackDestinationConfig) {
    this.config = config;
  }

  /**
   * Send a new alert notification to Slack
   */
  async sendAlert(alert: Alert, options?: AlertNotificationOptions): Promise<void> {
    try {
      // Create Slack message payload
      const payload = this.createAlertSlackPayload(alert, options);

      // Send to Slack webhook
      await axios.post(this.config.webhookUrl, payload);

      logger.info(`Slack alert sent: ${alert.name}`);
    } catch (error) {
      logger.error('Failed to send Slack alert', error);
      throw error;
    }
  }

  /**
   * Send a resolution notification to Slack
   */
  async sendResolution(alert: Alert, options?: AlertNotificationOptions): Promise<void> {
    try {
      // Create Slack message payload
      const payload = this.createResolutionSlackPayload(alert, options);

      // Send to Slack webhook
      await axios.post(this.config.webhookUrl, payload);

      logger.info(`Slack resolution alert sent: ${alert.name}`);
    } catch (error) {
      logger.error('Failed to send Slack resolution alert', error);
      throw error;
    }
  }

  /**
   * Test the Slack connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Send a test message to Slack
      const testPayload = {
        text: '🔍 TradeNavigator Alert System: Connection test successful',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*TradeNavigator Alert System*: Connection test successful'
            }
          }
        ]
      };

      await axios.post(this.config.webhookUrl, testPayload);
      logger.info('Slack alert destination connection verified');
      return true;
    } catch (error) {
      logger.error('Slack alert destination connection failed', error);
      return false;
    }
  }

  /**
   * Create a Slack message payload for an alert
   */
  private createAlertSlackPayload(alert: Alert, options?: AlertNotificationOptions): any {
    // Get emoji and color based on severity
    const { emoji, color } = this.getSeverityAttributes(alert.severity);

    // Format timestamps
    const startTime = this.formatTimestamp(alert.startTime);

    // Build Slack blocks
    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} Alert: ${alert.name}`,
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Description:* ${alert.description}\n*Severity:* ${alert.severity.toUpperCase()}\n*Started:* ${startTime}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Component:* ${alert.labels.component || 'N/A'}`
            },
            {
              type: 'mrkdwn',
              text: `*Category:* ${alert.labels.category || 'N/A'}`
            }
          ]
        },
        {
          type: 'divider'
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `TradeNavigator Monitoring | Alert ID: ${alert.id}`
            }
          ]
        }
      ],
      // Fallback text for notifications
      text: `${emoji} [${alert.severity.toUpperCase()}] ${alert.name}: ${alert.description}`
    };
  }

  /**
   * Create a Slack message payload for a resolution
   */
  private createResolutionSlackPayload(alert: Alert, options?: AlertNotificationOptions): any {
    // Format timestamps
    const startTime = this.formatTimestamp(alert.startTime);
    const endTime = alert.endTime ? this.formatTimestamp(alert.endTime) : 'N/A';
    
    // Calculate duration
    let duration = 'N/A';
    if (alert.startTime && alert.endTime) {
      const durationMs = alert.endTime.getTime() - alert.startTime.getTime();
      const seconds = Math.floor(durationMs / 1000);
      
      if (seconds < 60) {
        duration = `${seconds} seconds`;
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        duration = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        duration = `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
      }
    }

    // Build Slack blocks
    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `✅ Resolved: ${alert.name}`,
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Description:* ${alert.description}\n*Duration:* ${duration}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Started:* ${startTime}`
            },
            {
              type: 'mrkdwn',
              text: `*Resolved:* ${endTime}`
            }
          ]
        },
        {
          type: 'divider'
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `TradeNavigator Monitoring | Alert ID: ${alert.id}`
            }
          ]
        }
      ],
      // Fallback text for notifications
      text: `✅ Resolved: ${alert.name} after ${duration}`
    };
  }

  /**
   * Get emoji and color for severity level
   */
  private getSeverityAttributes(severity: AlertSeverity): { emoji: string, color: string } {
    switch (severity) {
      case AlertSeverity.INFO:
        return { emoji: 'ℹ️', color: '#2196F3' }; // Blue
      case AlertSeverity.WARNING:
        return { emoji: '⚠️', color: '#FF9800' }; // Orange
      case AlertSeverity.CRITICAL:
        return { emoji: '🚨', color: '#F44336' }; // Red
      default:
        return { emoji: '🔔', color: '#757575' }; // Grey
    }
  }

  /**
   * Format timestamp for Slack display
   */
  private formatTimestamp(date: Date): string {
    return `<!date^${Math.floor(date.getTime() / 1000)}^{date_short_pretty} at {time}|${date.toLocaleString()}>`;
  }
}
