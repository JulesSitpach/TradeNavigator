/**
 * Email Alert Destination
 * Sends alerts via email
 */

import { AlertDestination } from '../alertDestination';
import { Alert, AlertSeverity, AlertNotificationOptions } from '../types';
import nodemailer from 'nodemailer';
import { logger } from '../../../utils/logger';

interface EmailDestinationConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  recipients: string[];
}

export class EmailAlertDestination implements AlertDestination {
  private config: EmailDestinationConfig;
  private transporter: any; // nodemailer transporter

  constructor(config: EmailDestinationConfig) {
    this.config = config;

    // Initialize nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass
      }
    });
  }

  /**
   * Send a new alert notification via email
   */
  async sendAlert(alert: Alert, options?: AlertNotificationOptions): Promise<void> {
    try {
      // Create email subject with severity and alert name
      const subject = `[${alert.severity.toUpperCase()}] ${alert.name}`;

      // Create email content
      const htmlContent = this.createAlertEmailContent(alert, options);

      // Send email
      await this.transporter.sendMail({
        from: this.config.fromEmail,
        to: this.config.recipients.join(','),
        subject,
        html: htmlContent
      });

      logger.info(`Email alert sent: ${subject}`);
    } catch (error) {
      logger.error('Failed to send email alert', error);
      throw error;
    }
  }

  /**
   * Send a resolution notification via email
   */
  async sendResolution(alert: Alert, options?: AlertNotificationOptions): Promise<void> {
    try {
      // Create email subject
      const subject = `[RESOLVED] ${alert.name}`;

      // Create email content
      const htmlContent = this.createResolutionEmailContent(alert, options);

      // Send email
      await this.transporter.sendMail({
        from: this.config.fromEmail,
        to: this.config.recipients.join(','),
        subject,
        html: htmlContent
      });

      logger.info(`Email resolution alert sent: ${subject}`);
    } catch (error) {
      logger.error('Failed to send email resolution alert', error);
      throw error;
    }
  }

  /**
   * Test the email connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Verify SMTP connection
      await this.transporter.verify();
      logger.info('Email alert destination connection verified');
      return true;
    } catch (error) {
      logger.error('Email alert destination connection failed', error);
      return false;
    }
  }

  /**
   * Create HTML content for an alert email
   */
  private createAlertEmailContent(alert: Alert, options?: AlertNotificationOptions): string {
    // Get severity color
    const severityColor = this.getSeverityColor(alert.severity);

    // Format timestamps
    const startTime = alert.startTime.toLocaleString();

    // Build HTML content
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
        <div style="background-color: ${severityColor}; color: white; padding: 10px; border-radius: 4px;">
          <h2 style="margin: 0;">${alert.name}</h2>
          <p style="margin: 5px 0 0 0;">Severity: ${alert.severity.toUpperCase()}</p>
        </div>
        
        <div style="padding: 15px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 4px 4px;">
          <p><strong>Description:</strong> ${alert.description}</p>
          <p><strong>Started:</strong> ${startTime}</p>
          ${alert.value ? `<p><strong>Value:</strong> ${alert.value}</p>` : ''}
          
          <h3>Additional Information</h3>
          <ul>
            ${Object.entries(alert.labels || {}).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}
          </ul>
          
          ${options?.customMessage ? `<p><em>${options.customMessage}</em></p>` : ''}
          
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            This is an automated alert from the TradeNavigator monitoring system.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Create HTML content for a resolution email
   */
  private createResolutionEmailContent(alert: Alert, options?: AlertNotificationOptions): string {
    // Format timestamps
    const startTime = alert.startTime.toLocaleString();
    const endTime = alert.endTime ? alert.endTime.toLocaleString() : 'N/A';
    
    // Calculate duration if both timestamps are available
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

    // Build HTML content
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
        <div style="background-color: #4CAF50; color: white; padding: 10px; border-radius: 4px;">
          <h2 style="margin: 0;">RESOLVED: ${alert.name}</h2>
          <p style="margin: 5px 0 0 0;">Alert has been resolved</p>
        </div>
        
        <div style="padding: 15px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 4px 4px;">
          <p><strong>Description:</strong> ${alert.description}</p>
          <p><strong>Started:</strong> ${startTime}</p>
          <p><strong>Resolved:</strong> ${endTime}</p>
          <p><strong>Duration:</strong> ${duration}</p>
          
          ${options?.customMessage ? `<p><em>${options.customMessage}</em></p>` : ''}
          
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            This is an automated alert resolution notification from the TradeNavigator monitoring system.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Get color for severity level
   */
  private getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.INFO:
        return '#2196F3'; // Blue
      case AlertSeverity.WARNING:
        return '#FF9800'; // Orange
      case AlertSeverity.CRITICAL:
        return '#F44336'; // Red
      default:
        return '#757575'; // Grey
    }
  }
}
