/**
 * Notification System
 * 
 * This module provides a comprehensive notification system with:
 * - In-app notification center with priority levels
 * - Context-aware update notifications
 * - Service status communications
 * - Multi-channel delivery options
 * - User preference management
 */

import { getCache, setCache } from './cache';

// Constants
const NOTIFICATIONS_KEY = 'tn_notifications';
const NOTIFICATION_SETTINGS_KEY = 'tn_notification_settings';
const SERVICE_STATUS_KEY = 'tn_service_status';
const USER_PREFERENCES_KEY = 'tn_user_notification_preferences';

// Types
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationType {
  GENERAL = 'general',
  TRADE_REGULATION = 'trade_regulation',
  TARIFF_CHANGE = 'tariff_change',
  MARKET_OPPORTUNITY = 'market_opportunity',
  SYSTEM_STATUS = 'system_status',
  MAINTENANCE = 'maintenance',
  ACCOUNT = 'account',
  CALCULATION = 'calculation'
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived'
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  BROWSER_PUSH = 'browser_push',
  SMS = 'sms'
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: number;
  status: NotificationStatus;
  actions?: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
  metadata?: Record<string, any>;
  expiresAt?: number;
}

export interface NotificationSettings {
  channels: {
    [key in NotificationType]: NotificationChannel[];
  };
  preferences: {
    dailyDigest: boolean;
    digestTime?: string; // e.g. "09:00"
    disableAll: boolean;
    priorityThreshold: NotificationPriority;
    muteUntil?: number;
  };
}

export interface ServiceStatus {
  components: {
    [key: string]: {
      status: 'operational' | 'degraded' | 'outage' | 'maintenance';
      lastUpdated: number;
      message?: string;
      estimatedResolution?: number;
    };
  };
  lastUpdated: number;
  overallStatus: 'operational' | 'degraded' | 'outage' | 'maintenance';
}

// User notification preferences interface
export interface NotificationPreference {
  id: string;
  category: 'system' | 'trade' | 'market' | 'compliance';
  name: string;
  description: string;
  channels: {
    app: boolean;
    email: boolean;
    sms: boolean;
  };
  importance: 'high' | 'medium' | 'low';
}

/**
 * Add a new notification
 * @param notification The notification to add
 * @returns The notification with ID
 */
export async function addNotification(
  notification: Omit<Notification, 'id' | 'timestamp' | 'status'>
): Promise<Notification> {
  const notifications = await getNotifications();
  
  const newNotification: Notification = {
    ...notification,
    id: generateId(),
    timestamp: Date.now(),
    status: NotificationStatus.UNREAD
  };
  
  // Add to notifications and save
  const updatedNotifications = [newNotification, ...notifications];
  await setCache(NOTIFICATIONS_KEY, updatedNotifications, {
    storage: ['localStorage', 'indexedDB']
  });
  
  // Send to appropriate channels based on settings
  await sendToChannels(newNotification);
  
  return newNotification;
}

/**
 * Get all notifications
 * @param options Filter options
 * @returns Array of notifications
 */
export async function getNotifications(
  options: {
    status?: NotificationStatus | NotificationStatus[];
    type?: NotificationType | NotificationType[];
    priority?: NotificationPriority | NotificationPriority[];
    limit?: number;
    offset?: number;
    includeExpired?: boolean;
  } = {}
): Promise<Notification[]> {
  const {
    status,
    type,
    priority,
    limit,
    offset = 0,
    includeExpired = false
  } = options;
  
  // Get all notifications from cache
  const notifications = await getCache<Notification[]>(NOTIFICATIONS_KEY) || [];
  
  // Apply filters
  let filteredNotifications = notifications;
  
  // Filter by status
  if (status) {
    const statusArray = Array.isArray(status) ? status : [status];
    filteredNotifications = filteredNotifications.filter(n => statusArray.includes(n.status));
  }
  
  // Filter by type
  if (type) {
    const typeArray = Array.isArray(type) ? type : [type];
    filteredNotifications = filteredNotifications.filter(n => typeArray.includes(n.type));
  }
  
  // Filter by priority
  if (priority) {
    const priorityArray = Array.isArray(priority) ? priority : [priority];
    filteredNotifications = filteredNotifications.filter(n => priorityArray.includes(n.priority));
  }
  
  // Filter out expired notifications if needed
  if (!includeExpired) {
    const now = Date.now();
    filteredNotifications = filteredNotifications.filter(n => !n.expiresAt || n.expiresAt > now);
  }
  
  // Sort by timestamp (newest first)
  filteredNotifications.sort((a, b) => b.timestamp - a.timestamp);
  
  // Apply pagination if specified
  if (limit !== undefined) {
    filteredNotifications = filteredNotifications.slice(offset, offset + limit);
  }
  
  return filteredNotifications;
}

/**
 * Get a specific notification by ID
 * @param id The notification ID
 * @returns The notification or null if not found
 */
export async function getNotificationById(id: string): Promise<Notification | null> {
  const notifications = await getNotifications({
    includeExpired: true
  });
  return notifications.find(n => n.id === id) || null;
}

/**
 * Update a notification's status
 * @param id The notification ID
 * @param status The new status
 * @returns The updated notification or null if not found
 */
export async function updateNotificationStatus(
  id: string,
  status: NotificationStatus
): Promise<Notification | null> {
  const notifications = await getNotifications({
    includeExpired: true
  });
  
  const index = notifications.findIndex(n => n.id === id);
  if (index === -1) {
    return null;
  }
  
  // Update the status
  notifications[index] = {
    ...notifications[index],
    status
  };
  
  // Save updated notifications
  await setCache(NOTIFICATIONS_KEY, notifications, {
    storage: ['localStorage', 'indexedDB']
  });
  
  return notifications[index];
}

/**
 * Mark all notifications as read
 * @param type Optional notification type to filter by
 * @returns Number of notifications updated
 */
export async function markAllAsRead(type?: NotificationType): Promise<number> {
  const notifications = await getNotifications({
    includeExpired: true
  });
  
  let updated = 0;
  
  const updatedNotifications = notifications.map(notification => {
    if (
      notification.status === NotificationStatus.UNREAD &&
      (!type || notification.type === type)
    ) {
      updated++;
      return {
        ...notification,
        status: NotificationStatus.READ
      };
    }
    return notification;
  });
  
  // Save updated notifications
  await setCache(NOTIFICATIONS_KEY, updatedNotifications, {
    storage: ['localStorage', 'indexedDB']
  });
  
  return updated;
}

/**
 * Get unread notification count
 * @param type Optional notification type to filter by
 * @returns Number of unread notifications
 */
export async function getUnreadCount(type?: NotificationType): Promise<number> {
  const notifications = await getNotifications({
    status: NotificationStatus.UNREAD
  });
  
  if (type) {
    return notifications.filter(n => n.type === type).length;
  }
  
  return notifications.length;
}

/**
 * Delete a notification
 * @param id The notification ID to delete
 * @returns True if successfully deleted
 */
export async function deleteNotification(id: string): Promise<boolean> {
  const notifications = await getNotifications({
    includeExpired: true
  });
  
  const filteredNotifications = notifications.filter(n => n.id !== id);
  
  if (filteredNotifications.length === notifications.length) {
    return false; // Nothing was removed
  }
  
  // Save updated notifications
  await setCache(NOTIFICATIONS_KEY, filteredNotifications, {
    storage: ['localStorage', 'indexedDB']
  });
  
  return true;
}

/**
 * Clean up expired notifications
 * @returns Number of notifications cleaned up
 */
export async function cleanupExpiredNotifications(): Promise<number> {
  const notifications = await getNotifications({
    includeExpired: true
  });
  
  const now = Date.now();
  const unexpiredNotifications = notifications.filter(n => !n.expiresAt || n.expiresAt > now);
  
  const removedCount = notifications.length - unexpiredNotifications.length;
  
  if (removedCount > 0) {
    // Save updated notifications
    await setCache(NOTIFICATIONS_KEY, unexpiredNotifications, {
      storage: ['localStorage', 'indexedDB']
    });
  }
  
  return removedCount;
}

/**
 * Get user notification settings
 * @returns The notification settings
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  const settings = await getCache<NotificationSettings>(NOTIFICATION_SETTINGS_KEY);
  
  if (settings) {
    return settings;
  }
  
  // Default settings if none exist
  const defaultSettings: NotificationSettings = {
    channels: {
      [NotificationType.GENERAL]: [NotificationChannel.IN_APP],
      [NotificationType.TRADE_REGULATION]: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      [NotificationType.TARIFF_CHANGE]: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      [NotificationType.MARKET_OPPORTUNITY]: [NotificationChannel.IN_APP],
      [NotificationType.SYSTEM_STATUS]: [NotificationChannel.IN_APP],
      [NotificationType.MAINTENANCE]: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      [NotificationType.ACCOUNT]: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      [NotificationType.CALCULATION]: [NotificationChannel.IN_APP]
    },
    preferences: {
      dailyDigest: true,
      digestTime: '09:00',
      disableAll: false,
      priorityThreshold: NotificationPriority.LOW
    }
  };
  
  await setCache(NOTIFICATION_SETTINGS_KEY, defaultSettings, {
    storage: ['localStorage']
  });
  
  return defaultSettings;
}

/**
 * Update notification settings
 * @param settings The settings to update
 * @returns The updated settings
 */
export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  const currentSettings = await getNotificationSettings();
  
  // Deep merge the settings
  const updatedSettings = {
    ...currentSettings,
    channels: {
      ...currentSettings.channels,
      ...(settings.channels || {})
    },
    preferences: {
      ...currentSettings.preferences,
      ...(settings.preferences || {})
    }
  };
  
  await setCache(NOTIFICATION_SETTINGS_KEY, updatedSettings, {
    storage: ['localStorage']
  });
  
  return updatedSettings;
}

/**
 * Get the current service status
 * @returns The service status
 */
export async function getServiceStatus(): Promise<ServiceStatus> {
  const status = await getCache<ServiceStatus>(SERVICE_STATUS_KEY);
  
  if (status) {
    return status;
  }
  
  // Default status if none exists
  const defaultStatus: ServiceStatus = {
    components: {
      api: {
        status: 'operational',
        lastUpdated: Date.now()
      },
      database: {
        status: 'operational',
        lastUpdated: Date.now()
      },
      payments: {
        status: 'operational',
        lastUpdated: Date.now()
      },
      auth: {
        status: 'operational',
        lastUpdated: Date.now()
      }
    },
    lastUpdated: Date.now(),
    overallStatus: 'operational'
  };
  
  await setCache(SERVICE_STATUS_KEY, defaultStatus, {
    storage: ['localStorage']
  });
  
  return defaultStatus;
}

/**
 * Update the service status
 * @param componentName The component name to update
 * @param status The new status
 * @param message Optional status message
 * @param estimatedResolution Optional estimated resolution time
 * @returns The updated service status
 */
export async function updateServiceStatus(
  componentName: string,
  status: 'operational' | 'degraded' | 'outage' | 'maintenance',
  message?: string,
  estimatedResolution?: number
): Promise<ServiceStatus> {
  const currentStatus = await getServiceStatus();
  
  // Update the component status
  currentStatus.components[componentName] = {
    status,
    lastUpdated: Date.now(),
    message,
    estimatedResolution
  };
  
  // Recalculate overall status (worst of all components)
  const statusPriority = {
    operational: 0,
    degraded: 1,
    maintenance: 2,
    outage: 3
  };
  
  let worstStatus = 'operational';
  
  Object.values(currentStatus.components).forEach(component => {
    if (statusPriority[component.status] > statusPriority[worstStatus as keyof typeof statusPriority]) {
      worstStatus = component.status;
    }
  });
  
  currentStatus.overallStatus = worstStatus as any;
  currentStatus.lastUpdated = Date.now();
  
  await setCache(SERVICE_STATUS_KEY, currentStatus, {
    storage: ['localStorage']
  });
  
  // Create a notification for non-operational statuses
  if (status !== 'operational') {
    await addNotification({
      title: `${componentName} Status: ${status}`,
      message: message || `${componentName} is currently experiencing issues.`,
      type: NotificationType.SYSTEM_STATUS,
      priority: status === 'outage' 
        ? NotificationPriority.URGENT 
        : status === 'degraded' 
          ? NotificationPriority.HIGH 
          : NotificationPriority.MEDIUM,
      metadata: {
        componentName,
        status,
        estimatedResolution
      }
    });
  }
  
  return currentStatus;
}

/**
 * Schedule a maintenance notification
 * @param component The component name
 * @param startTime The maintenance start time
 * @param endTime The maintenance end time
 * @param message Maintenance message
 * @returns The created notification
 */
export async function scheduleMaintenance(
  component: string,
  startTime: number,
  endTime: number,
  message: string
): Promise<Notification> {
  // Calculate when to send the notification (1 day before)
  const notificationTime = startTime - 24 * 60 * 60 * 1000;
  const now = Date.now();
  
  // Create the maintenance notification
  const notification: Omit<Notification, 'id' | 'timestamp' | 'status'> = {
    title: `Scheduled Maintenance: ${component}`,
    message,
    type: NotificationType.MAINTENANCE,
    priority: NotificationPriority.MEDIUM,
    metadata: {
      component,
      startTime,
      endTime
    },
    // Set expiration to after the maintenance ends
    expiresAt: endTime + 24 * 60 * 60 * 1000
  };
  
  // If the notification time is in the future, schedule it
  if (notificationTime > now) {
    // In a real implementation, this would use a backend scheduling system
    // For now, just store it to be shown later
    const scheduledNotifications = await getCache<Array<{
      notification: Omit<Notification, 'id' | 'timestamp' | 'status'>;
      scheduledTime: number;
    }>>('tn_scheduled_notifications') || [];
    
    scheduledNotifications.push({
      notification,
      scheduledTime: notificationTime
    });
    
    await setCache('tn_scheduled_notifications', scheduledNotifications, {
      storage: ['localStorage', 'indexedDB']
    });
    
    // Create a placeholder notification that we'll return
    return {
      ...notification,
      id: 'scheduled_' + generateId(),
      timestamp: notificationTime,
      status: NotificationStatus.UNREAD
    };
  } else {
    // If the notification time is now or in the past, send immediately
    return await addNotification(notification);
  }
}

// Private helper functions

/**
 * Generate a unique ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Send a notification to the appropriate channels based on settings
 */
async function sendToChannels(notification: Notification): Promise<void> {
  const settings = await getNotificationSettings();
  
  // If all notifications are disabled, only send urgent ones
  if (settings.preferences.disableAll && notification.priority !== NotificationPriority.URGENT) {
    return;
  }
  
  // If there's a priority threshold, check if this notification meets it
  if (
    getPriorityValue(notification.priority) < 
    getPriorityValue(settings.preferences.priorityThreshold)
  ) {
    return;
  }
  
  // If there's a mute period, check if it's active
  if (settings.preferences.muteUntil && Date.now() < settings.preferences.muteUntil) {
    // During mute period, only send urgent notifications
    if (notification.priority !== NotificationPriority.URGENT) {
      return;
    }
  }
  
  // Get the channels for this notification type
  const channels = settings.channels[notification.type] || [NotificationChannel.IN_APP];
  
  // In-app notifications are always handled locally
  if (!channels.includes(NotificationChannel.IN_APP)) {
    // Add IN_APP channel since we're storing it locally
    channels.push(NotificationChannel.IN_APP);
  }
  
  // For other channels, we'd make API calls to send the notification
  // For now, just simulate it
  
  if (channels.includes(NotificationChannel.EMAIL)) {
    console.log(`[SIMULATION] Sending email notification: ${notification.title}`);
    // In a real implementation, this would call an API to send an email
  }
  
  if (channels.includes(NotificationChannel.BROWSER_PUSH)) {
    console.log(`[SIMULATION] Sending browser push notification: ${notification.title}`);
    // In a real implementation, this would trigger a browser notification
  }
  
  if (channels.includes(NotificationChannel.SMS)) {
    console.log(`[SIMULATION] Sending SMS notification: ${notification.title}`);
    // In a real implementation, this would call an API to send an SMS
  }
}

/**
 * Get user notification preferences
 * @returns The notification preferences or default preferences if none exist
 */
export async function getUserPreferences(): Promise<NotificationPreference[]> {
  const preferences = await getCache<NotificationPreference[]>(USER_PREFERENCES_KEY);
  
  if (preferences) {
    return preferences;
  }
  
  // Default preferences if none exist
  const defaultPreferences: NotificationPreference[] = [
    {
      id: 'system-updates',
      category: 'system',
      name: 'System Updates',
      description: 'Notifications about platform updates and maintenance',
      channels: { app: true, email: true, sms: false },
      importance: 'medium',
    },
    {
      id: 'account-security',
      category: 'system',
      name: 'Account Security',
      description: 'Security alerts and suspicious activity notifications',
      channels: { app: true, email: true, sms: true },
      importance: 'high',
    },
    {
      id: 'trade-calculations',
      category: 'trade',
      name: 'Calculation Results',
      description: 'Notifications when calculations are completed',
      channels: { app: true, email: false, sms: false },
      importance: 'medium',
    },
    {
      id: 'trade-documents',
      category: 'trade',
      name: 'Document Updates',
      description: 'Notifications about trade document changes and updates',
      channels: { app: true, email: true, sms: false },
      importance: 'medium',
    },
    {
      id: 'market-alerts',
      category: 'market',
      name: 'Market Alerts',
      description: 'Important market changes that may affect your trade',
      channels: { app: true, email: true, sms: false },
      importance: 'high',
    },
    {
      id: 'market-reports',
      category: 'market',
      name: 'Market Reports',
      description: 'Weekly and monthly market trend reports',
      channels: { app: true, email: true, sms: false },
      importance: 'low',
    },
    {
      id: 'compliance-alerts',
      category: 'compliance',
      name: 'Compliance Alerts',
      description: 'Urgent notifications about compliance changes',
      channels: { app: true, email: true, sms: true },
      importance: 'high',
    },
    {
      id: 'compliance-updates',
      category: 'compliance',
      name: 'Regulatory Updates',
      description: 'Regular updates about changes in trade regulations',
      channels: { app: true, email: false, sms: false },
      importance: 'medium',
    },
  ];
  
  await setCache(USER_PREFERENCES_KEY, defaultPreferences, {
    storage: ['localStorage']
  });
  
  return defaultPreferences;
}

/**
 * Set user notification preferences
 * @param preferences The notification preferences to save
 * @returns The saved notification preferences
 */
export async function setUserPreferences(preferences: NotificationPreference[]): Promise<NotificationPreference[]> {
  await setCache(USER_PREFERENCES_KEY, preferences, {
    storage: ['localStorage']
  });
  
  return preferences;
}

/**
 * Convert priority enum to numeric value for comparison
 */
function getPriorityValue(priority: NotificationPriority): number {
  switch (priority) {
    case NotificationPriority.LOW:
      return 0;
    case NotificationPriority.MEDIUM:
      return 1;
    case NotificationPriority.HIGH:
      return 2;
    case NotificationPriority.URGENT:
      return 3;
    default:
      return 0;
  }
}
