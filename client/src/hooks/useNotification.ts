import { useState, useEffect, useCallback } from 'react';
import {
  getNotifications,
  updateNotificationStatus,
  markAllAsRead,
  getUnreadCount,
  NotificationType,
  NotificationStatus,
  Notification,
  NotificationPriority,
  addNotification,
  getUserPreferences,
  setUserPreferences,
  NotificationPreference
} from '../services/notification';

/**
 * Custom hook for accessing the notification system
 * @param options Options for filtering notifications
 * @returns Notification data and management functions
 */
export function useNotifications(
  options: {
    type?: NotificationType | NotificationType[];
    status?: NotificationStatus | NotificationStatus[];
    limit?: number;
    refreshInterval?: number;
    priority?: NotificationPriority | NotificationPriority[];
  } = {}
) {
  const {
    type,
    status = NotificationStatus.UNREAD,
    limit,
    refreshInterval = 30000, // Default refresh every 30 seconds
    priority
  } = options;
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Load notifications
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    
    try {
      // Get notifications
      const result = await getNotifications({
        type,
        status,
        limit,
        priority
      });
      
      setNotifications(result);
      
      // Get unread count
      const count = await getUnreadCount();
      setUnreadCount(count);
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [type, status, limit, priority]);
  
  // Mark a notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await updateNotificationStatus(id, NotificationStatus.READ);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id
            ? { ...notification, status: NotificationStatus.READ }
            : notification
        )
      );
      
      // Update unread count
      const count = await getUnreadCount();
      setUnreadCount(count);
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, []);
  
  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async (specificType?: NotificationType) => {
    try {
      const count = await markAllAsRead(specificType);
      
      // Update local state if successful
      if (count > 0) {
        if (specificType) {
          setNotifications(prev => 
            prev.map(notification => 
              notification.type === specificType && notification.status === NotificationStatus.UNREAD
                ? { ...notification, status: NotificationStatus.READ }
                : notification
            )
          );
        } else {
          setNotifications(prev => 
            prev.map(notification => 
              notification.status === NotificationStatus.UNREAD
                ? { ...notification, status: NotificationStatus.READ }
                : notification
            )
          );
        }
        
        // Update unread count
        const newCount = await getUnreadCount();
        setUnreadCount(newCount);
      }
      
      return count;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return 0;
    }
  }, []);
  
  // Archive a notification
  const archiveNotification = useCallback(async (id: string) => {
    try {
      await updateNotificationStatus(id, NotificationStatus.ARCHIVED);
      
      // Update local state
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      // Update unread count if needed
      const notification = notifications.find(n => n.id === id);
      if (notification?.status === NotificationStatus.UNREAD) {
        const count = await getUnreadCount();
        setUnreadCount(count);
      }
      
      return true;
    } catch (error) {
      console.error('Error archiving notification:', error);
      return false;
    }
  }, [notifications]);
  
  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);
  
  // Set up refresh interval
  useEffect(() => {
    if (!refreshInterval) return;
    
    const intervalId = setInterval(() => {
      loadNotifications();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, loadNotifications]);
  
  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    archiveNotification,
    refresh: loadNotifications
  };
}

/**
 * Hook for displaying toast notifications
 * Uses the notification system under the hood
 */
/**
 * Hook for managing notification preferences
 */
export function useNotification() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load user preferences
  const loadPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const userPrefs = await getUserPreferences();
      setPreferences(userPrefs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user preferences
  const updatePreferences = useCallback(async (newPreferences: NotificationPreference[]) => {
    try {
      await setUserPreferences(newPreferences);
      setPreferences(newPreferences);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  }, []);

  // Initialize preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    error,
    getUserPreferences: loadPreferences,
    setUserPreferences: updatePreferences
  };
}

export function useToast() {
  // Show a success toast
  const success = useCallback((message: string, title: string = 'Success') => {
    return addNotification({
      title,
      message,
      type: NotificationType.GENERAL,
      priority: NotificationPriority.MEDIUM,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      metadata: {
        isToast: true,
        variant: 'success'
      }
    });
  }, []);
  
  // Show an error toast
  const error = useCallback((message: string, title: string = 'Error') => {
    return addNotification({
      title,
      message,
      type: NotificationType.GENERAL,
      priority: NotificationPriority.HIGH,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      metadata: {
        isToast: true,
        variant: 'error'
      }
    });
  }, []);
  
  // Show an info toast
  const info = useCallback((message: string, title: string = 'Information') => {
    return addNotification({
      title,
      message,
      type: NotificationType.GENERAL,
      priority: NotificationPriority.LOW,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      metadata: {
        isToast: true,
        variant: 'info'
      }
    });
  }, []);
  
  // Show a warning toast
  const warning = useCallback((message: string, title: string = 'Warning') => {
    return addNotification({
      title,
      message,
      type: NotificationType.GENERAL,
      priority: NotificationPriority.MEDIUM,
      expiresAt: Date.now() + 7 * 60 * 1000, // 7 minutes
      metadata: {
        isToast: true,
        variant: 'warning'
      }
    });
  }, []);
  
  // Show a system status toast
  const systemStatus = useCallback((
    status: 'operational' | 'degraded' | 'outage' | 'maintenance',
    component: string,
    message: string
  ) => {
    const titles = {
      operational: `${component} is Operational`,
      degraded: `${component} is Experiencing Issues`,
      outage: `${component} Outage`,
      maintenance: `${component} Maintenance`
    };
    
    const priorities = {
      operational: NotificationPriority.LOW,
      degraded: NotificationPriority.MEDIUM,
      outage: NotificationPriority.HIGH,
      maintenance: NotificationPriority.MEDIUM
    };
    
    return addNotification({
      title: titles[status],
      message,
      type: NotificationType.SYSTEM_STATUS,
      priority: priorities[status],
      expiresAt: Date.now() + (status === 'operational' ? 5 : 30) * 60 * 1000,
      metadata: {
        isToast: true,
        variant: status === 'operational' ? 'success' : 
                status === 'degraded' ? 'warning' : 
                status === 'maintenance' ? 'info' : 'error',
        component,
        status
      }
    });
  }, []);
  
  // Toast with action buttons
  const withActions = useCallback((
    message: string,
    title: string,
    actions: Array<{
      label: string;
      action: string;
      data?: any;
    }>,
    options?: {
      variant?: 'success' | 'error' | 'warning' | 'info';
      priority?: NotificationPriority;
      type?: NotificationType;
      expiresAt?: number;
    }
  ) => {
    const {
      variant = 'info',
      priority = NotificationPriority.MEDIUM,
      type = NotificationType.GENERAL,
      expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes
    } = options || {};
    
    return addNotification({
      title,
      message,
      type,
      priority,
      actions,
      expiresAt,
      metadata: {
        isToast: true,
        variant
      }
    });
  }, []);
  
  return {
    success,
    error,
    info,
    warning,
    systemStatus,
    withActions
  };
}
