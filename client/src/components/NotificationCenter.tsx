import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  AlertCircle,
  X,
  Clock,
  Archive
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotification';
import { 
  NotificationPriority,
  NotificationType,
  Notification
} from '../services/notification';

// Notification priority icons and colors
const priorityConfig = {
  [NotificationPriority.LOW]: {
    icon: Info,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  [NotificationPriority.MEDIUM]: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  [NotificationPriority.HIGH]: {
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  [NotificationPriority.URGENT]: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300'
  }
};

// Notification type labels
const typeLabels = {
  [NotificationType.GENERAL]: 'General',
  [NotificationType.TRADE_REGULATION]: 'Regulation Update',
  [NotificationType.TARIFF_CHANGE]: 'Tariff Change',
  [NotificationType.MARKET_OPPORTUNITY]: 'Market Opportunity',
  [NotificationType.SYSTEM_STATUS]: 'System Status',
  [NotificationType.MAINTENANCE]: 'Maintenance',
  [NotificationType.ACCOUNT]: 'Account',
  [NotificationType.CALCULATION]: 'Calculation'
};

// Component for each notification item
const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
}> = ({ notification, onMarkAsRead, onArchive }) => {
  const { id, title, message, type, priority, timestamp, status, actions } = notification;
  const PriorityIcon = priorityConfig[priority].icon;
  
  // Format timestamp
  const formattedTime = new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
  
  return (
    <div 
      className={`
        p-3 mb-2 rounded-lg border ${priorityConfig[priority].borderColor} 
        ${priorityConfig[priority].bgColor} 
        ${status === 'unread' ? 'font-medium' : 'opacity-80'}
      `}
    >
      <div className="flex items-start">
        <div className={`p-1 mr-3 ${priorityConfig[priority].color}`}>
          <PriorityIcon size={20} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{title}</h3>
              <span className="text-xs text-gray-600 block mb-1">
                {typeLabels[type]} • {formattedTime}
              </span>
            </div>
            <div className="flex space-x-1">
              {status === 'unread' && (
                <button 
                  onClick={() => onMarkAsRead(id)}
                  className="p-1 hover:bg-gray-200 rounded-full"
                  title="Mark as read"
                >
                  <CheckCircle size={16} />
                </button>
              )}
              <button 
                onClick={() => onArchive(id)}
                className="p-1 hover:bg-gray-200 rounded-full"
                title="Archive"
              >
                <Archive size={16} />
              </button>
            </div>
          </div>
          <p className="text-sm mb-2">{message}</p>
          
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  className="text-xs px-3 py-1 bg-white border rounded-full hover:bg-gray-50"
                  onClick={() => {
                    // In a real app, this would trigger the action
                    console.log('Action triggered:', action);
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Empty state component
const EmptyNotifications: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
      <CheckCircle size={40} className="mb-2 opacity-40" />
      <p className="text-center">You're all caught up!</p>
      <p className="text-center text-sm opacity-75">No new notifications</p>
    </div>
  );
};

// Main notification center component
const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread');
  
  // Use our notifications hook
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    archiveNotification,
    refresh
  } = useNotifications({
    status: activeTab === 'unread' ? 'unread' : undefined,
    limit: 20,
    refreshInterval: 30000 // 30 seconds
  });
  
  // Toggle notification panel
  const togglePanel = () => {
    setIsOpen(prev => !prev);
    
    // If opening and there are unread notifications, mark them as seen
    // (This could update a "seen" but not "read" state in a real app)
  };
  
  // Close the panel
  const closePanel = () => {
    setIsOpen(false);
  };
  
  // Mark all as read
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={togglePanel}
        className="relative p-2 rounded-full hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="flex justify-between items-center p-3 border-b">
            <h2 className="font-medium">Notifications</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                disabled={unreadCount === 0}
              >
                Mark all as read
              </button>
              <button
                onClick={closePanel}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'unread' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('unread')}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'all' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
          </div>
          
          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto p-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <Clock className="animate-spin text-gray-400" size={24} />
              </div>
            ) : notifications.length === 0 ? (
              <EmptyNotifications />
            ) : (
              notifications.map(notification => (
                <NotificationItem 
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onArchive={archiveNotification}
                />
              ))
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t p-2 text-center">
            <button 
              onClick={refresh}
              className="text-xs text-blue-600 hover:underline"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
