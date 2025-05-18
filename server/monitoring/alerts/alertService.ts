/**
 * Alert Service
 * Handles alert generation, management, and delivery
 */

import { EventEmitter } from 'events';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { AlertRule, AlertSeverity, AlertStatus, Alert } from './types';
import { AlertDestination } from './alertDestination';
import { EmailAlertDestination } from './destinations/emailAlertDestination';
import { SlackAlertDestination } from './destinations/slackAlertDestination';
import { WebhookAlertDestination } from './destinations/webhookAlertDestination';

class AlertService {
  private rules: AlertRule[] = [];
  private activeAlerts: Map<string, Alert> = new Map();
  private destinations: AlertDestination[] = [];
  private alertEvents: EventEmitter = new EventEmitter();
  private alertCheckInterval: NodeJS.Timeout | null = null;
  private initialized: boolean = false;

  constructor() {
    // Set up event listeners
    this.alertEvents.on('alert:new', this.handleNewAlert.bind(this));
    this.alertEvents.on('alert:resolved', this.handleResolvedAlert.bind(this));
    
    if (config.getServerConfig().ENABLE_ALERTS) {
      this.initialize();
    }
  }

  /**
   * Initialize the alert service
   */
  initialize() {
    if (this.initialized) return;
    
    try {
      // Set up alert destinations
      this.setupDestinations();
      
      // Set up default rules
      this.setupDefaultRules();
      
      // Start alert checking interval
      this.startAlertChecking();
      
      this.initialized = true;
      logger.info('Alert service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize alert service', error);
    }
  }

  /**
   * Set up alert destinations based on configuration
   */
  private setupDestinations() {
    const alertConfig = config.getServerConfig().ALERTS;
    
    // Email alerts
    if (alertConfig?.EMAIL_ENABLED) {
      this.destinations.push(new EmailAlertDestination({
        smtpHost: alertConfig.EMAIL_SMTP_HOST,
        smtpPort: alertConfig.EMAIL_SMTP_PORT,
        smtpUser: alertConfig.EMAIL_SMTP_USER,
        smtpPass: alertConfig.EMAIL_SMTP_PASS,
        fromEmail: alertConfig.EMAIL_FROM,
        recipients: alertConfig.EMAIL_RECIPIENTS.split(',')
      }));
      logger.info('Email alert destination configured');
    }
    
    // Slack alerts
    if (alertConfig?.SLACK_ENABLED) {
      this.destinations.push(new SlackAlertDestination({
        webhookUrl: alertConfig.SLACK_WEBHOOK_URL,
        channel: alertConfig.SLACK_CHANNEL
      }));
      logger.info('Slack alert destination configured');
    }
    
    // Webhook alerts (for integration with external systems)
    if (alertConfig?.WEBHOOK_ENABLED) {
      this.destinations.push(new WebhookAlertDestination({
        url: alertConfig.WEBHOOK_URL,
        headers: alertConfig.WEBHOOK_HEADERS ? JSON.parse(alertConfig.WEBHOOK_HEADERS) : {}
      }));
      logger.info('Webhook alert destination configured');
    }
  }

  /**
   * Set up default alert rules
   */
  private setupDefaultRules() {
    // API Response Time alerts
    this.addRule({
      id: 'high-response-time',
      name: 'High API Response Time',
      description: 'API response time is above the threshold',
      evaluator: (metrics) => {
        const p95ResponseTime = metrics.getMetric('http_request_duration_seconds', { quantile: '0.95' });
        return p95ResponseTime > 2.0; // Alert if P95 is more than 2 seconds
      },
      severity: AlertSeverity.WARNING,
      checkIntervalSeconds: 60,
      labels: { component: 'api', category: 'performance' }
    });
    
    // Error Rate alerts
    this.addRule({
      id: 'high-error-rate',
      name: 'High API Error Rate',
      description: 'API error rate is above the threshold',
      evaluator: (metrics) => {
        const total = metrics.getMetricSum('http_requests_total') || 1; // Prevent division by zero
        const errors = metrics.getMetricSum('http_requests_total', { status: '5*' });
        const errorRate = (errors / total) * 100;
        return errorRate > 5; // Alert if error rate is more than 5%
      },
      severity: AlertSeverity.CRITICAL,
      checkIntervalSeconds: 60,
      labels: { component: 'api', category: 'errors' }
    });
    
    // Database connection pool alerts
    this.addRule({
      id: 'db-connection-pool-saturation',
      name: 'Database Connection Pool Saturation',
      description: 'Database connection pool is near capacity',
      evaluator: (metrics) => {
        const poolSize = metrics.getMetric('db_connection_pool_size') || 1;
        const poolUsed = metrics.getMetric('db_connection_pool_used') || 0;
        const poolUtilization = (poolUsed / poolSize) * 100;
        return poolUtilization > 85; // Alert if pool is more than 85% utilized
      },
      severity: AlertSeverity.WARNING,
      checkIntervalSeconds: 60,
      labels: { component: 'database', category: 'resources' }
    });
    
    // Memory usage alerts
    this.addRule({
      id: 'high-memory-usage',
      name: 'High Memory Usage',
      description: 'Server memory usage is above the threshold',
      evaluator: (metrics) => {
        const memoryUsage = metrics.getMetric('memory_usage_bytes') || 0;
        const memoryLimit = 1.5 * 1024 * 1024 * 1024; // 1.5GB
        return memoryUsage > memoryLimit;
      },
      severity: AlertSeverity.WARNING,
      checkIntervalSeconds: 120,
      labels: { component: 'server', category: 'resources' }
    });
    
    // API error spike alerts
    this.addRule({
      id: 'external-api-error-spike',
      name: 'External API Error Spike',
      description: 'Spike in errors from external API',
      evaluator: (metrics) => {
        // Calculate the rate of API errors in the last 5 minutes
        const errorRate = metrics.getMetricRate('external_api_errors_total', 300);
        return errorRate > 10; // Alert if more than 10 errors per 5 minutes
      },
      severity: AlertSeverity.CRITICAL,
      checkIntervalSeconds: 120,
      labels: { component: 'external-api', category: 'errors' }
    });
    
    // Circuit breaker alerts
    this.addRule({
      id: 'circuit-breaker-open',
      name: 'Circuit Breaker Open',
      description: 'Circuit breaker is in OPEN state',
      evaluator: (metrics) => {
        // Get all circuit breaker states
        const openCircuits = metrics.getMetricsWithValue('circuit_breaker_state', 2);
        return openCircuits.length > 0;
      },
      severity: AlertSeverity.CRITICAL,
      checkIntervalSeconds: 30,
      labels: { component: 'resilience', category: 'errors' }
    });
    
    // Low cache hit rate alerts
    this.addRule({
      id: 'low-cache-hit-rate',
      name: 'Low Cache Hit Rate',
      description: 'Cache hit rate is below the threshold',
      evaluator: (metrics) => {
        const hits = metrics.getMetricSum('cache_hits_total');
        const misses = metrics.getMetricSum('cache_misses_total');
        const total = hits + misses;
        if (total < 100) return false; // Ignore if not enough data
        
        const hitRate = (hits / total) * 100;
        return hitRate < 50; // Alert if hit rate is less than 50%
      },
      severity: AlertSeverity.WARNING,
      checkIntervalSeconds: 300, // Check every 5 minutes
      labels: { component: 'cache', category: 'performance' }
    });
    
    // SLA alerts
    this.addRule({
      id: 'sla-breach',
      name: 'SLA Breach Detected',
      description: 'Service Level Agreement threshold breached',
      evaluator: (metrics) => {
        // Get the percentage of requests that took longer than our SLA threshold (e.g., 1 second)
        const totalRequests = metrics.getMetricSum('http_requests_total');
        if (totalRequests < 100) return false; // Ignore if not enough data
        
        const slowRequests = metrics.getMetricSum('http_request_duration_seconds_bucket', { le: '+Inf' }) -
                           metrics.getMetricSum('http_request_duration_seconds_bucket', { le: '1' });
        
        const slowPercentage = (slowRequests / totalRequests) * 100;
        return slowPercentage > 5; // Alert if more than 5% of requests are slow
      },
      severity: AlertSeverity.CRITICAL,
      checkIntervalSeconds: 300, // Check every 5 minutes
      labels: { component: 'api', category: 'sla' }
    });
  }

  /**
   * Add a new alert rule
   */
  addRule(rule: AlertRule) {
    // Check if rule with same ID already exists
    const existingRuleIndex = this.rules.findIndex(r => r.id === rule.id);
    if (existingRuleIndex >= 0) {
      // Replace existing rule
      this.rules[existingRuleIndex] = rule;
      logger.info(`Updated existing alert rule: ${rule.id}`);
    } else {
      // Add new rule
      this.rules.push(rule);
      logger.info(`Added new alert rule: ${rule.id}`);
    }
  }

  /**
   * Remove an alert rule
   */
  removeRule(ruleId: string) {
    const initialLength = this.rules.length;
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
    
    if (this.rules.length < initialLength) {
      logger.info(`Removed alert rule: ${ruleId}`);
    }
  }

  /**
   * Start the alert checking interval
   */
  private startAlertChecking() {
    // Check for alerts every 15 seconds
    this.alertCheckInterval = setInterval(() => {
      this.checkAlerts();
    }, 15000);
    
    logger.info('Alert checking started');
  }

  /**
   * Stop the alert checking interval
   */
  stopAlertChecking() {
    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
      this.alertCheckInterval = null;
      logger.info('Alert checking stopped');
    }
  }

  /**
   * Check all alert rules against current metrics
   */
  private async checkAlerts() {
    if (!this.initialized) return;
    
    try {
      for (const rule of this.rules) {
        // Skip rules that don't need to be checked yet based on their check interval
        const now = Date.now();
        const lastChecked = rule.lastChecked || 0;
        if (now - lastChecked < rule.checkIntervalSeconds * 1000) {
          continue;
        }
        
        // Update last checked timestamp
        rule.lastChecked = now;
        
        // Check if alert is already active
        const alertKey = rule.id;
        const isAlertActive = this.activeAlerts.has(alertKey);
        
        // Get metrics snapshot for evaluation
        const metricsSnapshot = await this.getMetricsSnapshot();
        
        // Evaluate rule
        const isAlertConditionMet = rule.evaluator(metricsSnapshot);
        
        if (isAlertConditionMet && !isAlertActive) {
          // New alert triggered
          const alert: Alert = {
            id: `${rule.id}-${now}`,
            ruleId: rule.id,
            name: rule.name,
            description: rule.description,
            severity: rule.severity,
            status: AlertStatus.ACTIVE,
            labels: rule.labels || {},
            startTime: new Date(),
            lastUpdated: new Date(),
            value: this.getAlertValue(rule, metricsSnapshot)
          };
          
          this.activeAlerts.set(alertKey, alert);
          this.alertEvents.emit('alert:new', alert);
          
        } else if (!isAlertConditionMet && isAlertActive) {
          // Alert resolved
          const alert = this.activeAlerts.get(alertKey)!;
          alert.status = AlertStatus.RESOLVED;
          alert.endTime = new Date();
          alert.lastUpdated = new Date();
          
          this.activeAlerts.delete(alertKey);
          this.alertEvents.emit('alert:resolved', alert);
        }
      }
    } catch (error) {
      logger.error('Error checking alerts', error);
    }
  }

  /**
   * Get alert value for context
   */
  private getAlertValue(rule: AlertRule, metricsSnapshot: any): string {
    // This is a stub - in a real implementation, you'd extract the relevant metric value
    // based on the rule type to provide context in the alert notification
    return 'N/A';
  }

  /**
   * Get a snapshot of current metrics for evaluation
   */
  private async getMetricsSnapshot() {
    // This would normally query the metrics registry to get current values
    // For now, return a stub object with methods for alert rules to use
    return {
      getMetric: (name: string, labels?: Record<string, string>) => {
        // Stub - would fetch specific metric with labels
        return 0;
      },
      getMetricSum: (name: string, labels?: Record<string, string>) => {
        // Stub - would sum metrics matching the pattern
        return 0;
      },
      getMetricRate: (name: string, windowSeconds: number, labels?: Record<string, string>) => {
        // Stub - would calculate rate over time window
        return 0;
      },
      getMetricsWithValue: (name: string, value: number, labels?: Record<string, string>) => {
        // Stub - would find metrics with specific value
        return [];
      }
    };
  }

  /**
   * Handle a new alert
   */
  private async handleNewAlert(alert: Alert) {
    logger.warn(`ALERT TRIGGERED: ${alert.name} (${alert.severity}) - ${alert.description}`);
    
    // Notify all configured destinations
    for (const destination of this.destinations) {
      try {
        await destination.sendAlert(alert);
      } catch (error) {
        logger.error(`Failed to send alert to destination: ${destination.constructor.name}`, error);
      }
    }
  }

  /**
   * Handle a resolved alert
   */
  private async handleResolvedAlert(alert: Alert) {
    logger.info(`ALERT RESOLVED: ${alert.name} - Duration: ${this.getAlertDuration(alert)}`);
    
    // Notify all configured destinations
    for (const destination of this.destinations) {
      try {
        await destination.sendResolution(alert);
      } catch (error) {
        logger.error(`Failed to send alert resolution to destination: ${destination.constructor.name}`, error);
      }
    }
  }

  /**
   * Get alert duration as a human-readable string
   */
  private getAlertDuration(alert: Alert): string {
    if (!alert.startTime || !alert.endTime) return 'unknown';
    
    const durationMs = alert.endTime.getTime() - alert.startTime.getTime();
    const seconds = Math.floor(durationMs / 1000);
    
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get alert history (would be expanded in a full implementation)
   */
  getAlertHistory(limit: number = 50): Alert[] {
    // In a full implementation, this would retrieve alert history from a database
    return [];
  }
}

// Create and export singleton instance
export const alertService = new AlertService();
