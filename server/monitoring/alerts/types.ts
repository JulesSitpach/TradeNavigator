/**
 * Alert System Types
 */

/**
 * Alert Severity Levels
 */
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

/**
 * Alert Status
 */
export enum AlertStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  ACKNOWLEDGED = 'acknowledged'
}

/**
 * Alert Rule
 */
export interface AlertRule {
  /**
   * Unique identifier for the rule
   */
  id: string;
  
  /**
   * Display name
   */
  name: string;
  
  /**
   * Description of what the alert checks
   */
  description: string;
  
  /**
   * Function that evaluates metrics and returns true if alert should trigger
   */
  evaluator: (metrics: any) => boolean;
  
  /**
   * Alert severity level
   */
  severity: AlertSeverity;
  
  /**
   * How often to check this rule (in seconds)
   */
  checkIntervalSeconds: number;
  
  /**
   * Additional labels/tags for the alert
   */
  labels?: Record<string, string>;
  
  /**
   * Last time the rule was checked (internal tracking)
   */
  lastChecked?: number;
}

/**
 * Alert Instance
 */
export interface Alert {
  /**
   * Unique identifier for this alert instance
   */
  id: string;
  
  /**
   * ID of the rule that triggered this alert
   */
  ruleId: string;
  
  /**
   * Display name
   */
  name: string;
  
  /**
   * Alert description
   */
  description: string;
  
  /**
   * Alert severity
   */
  severity: AlertSeverity;
  
  /**
   * Current status of the alert
   */
  status: AlertStatus;
  
  /**
   * Additional labels/tags
   */
  labels: Record<string, string>;
  
  /**
   * When the alert was first triggered
   */
  startTime: Date;
  
  /**
   * When the alert was last updated
   */
  lastUpdated: Date;
  
  /**
   * When the alert was resolved (if applicable)
   */
  endTime?: Date;
  
  /**
   * The value that triggered the alert (for context)
   */
  value?: string;
  
  /**
   * Optional additional details
   */
  details?: Record<string, any>;
}

/**
 * Alert Notification Options
 */
export interface AlertNotificationOptions {
  /**
   * Whether to include all details in the notification
   */
  includeDetails?: boolean;
  
  /**
   * Custom message to include
   */
  customMessage?: string;
}
