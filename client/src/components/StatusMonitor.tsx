import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import { getServiceStatus } from '../services/notification';

// Status types
type ComponentStatus = 'operational' | 'degraded' | 'outage' | 'maintenance';

interface ServiceComponent {
  name: string;
  status: ComponentStatus;
  lastUpdated: number;
  message?: string;
  estimatedResolution?: number;
}

// Configuration for status indicators
const statusConfig = {
  operational: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    label: 'Operational'
  },
  degraded: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    label: 'Degraded Performance'
  },
  outage: {
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    label: 'Service Outage'
  },
  maintenance: {
    icon: Clock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    label: 'Maintenance'
  }
};

// Component for individual service
const ServiceStatusItem: React.FC<{ component: ServiceComponent }> = ({ component }) => {
  const { name, status, lastUpdated, message, estimatedResolution } = component;
  const StatusIcon = statusConfig[status].icon;
  
  // Format time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  // Format estimated resolution time if provided
  const resolutionTime = estimatedResolution 
    ? formatTime(estimatedResolution)
    : null;
  
  return (
    <div className={`p-4 rounded-lg border mb-3 ${statusConfig[status].bgColor}`}>
      <div className="flex items-start">
        <div className={`p-1 mr-3 ${statusConfig[status].color}`}>
          <StatusIcon size={24} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{name}</h3>
              <div className="flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  status === 'operational' ? 'bg-green-500' :
                  status === 'degraded' ? 'bg-amber-500' :
                  status === 'maintenance' ? 'bg-blue-500' :
                  'bg-red-500'
                }`}></span>
                <span className="text-sm font-medium">
                  {statusConfig[status].label}
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              Updated: {formatTime(lastUpdated)}
            </span>
          </div>
          
          {message && (
            <p className="mt-2 text-sm">{message}</p>
          )}
          
          {resolutionTime && (
            <p className="mt-1 text-sm">
              <span className="font-medium">Estimated resolution:</span> {resolutionTime}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Main status monitor component
const StatusMonitor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [serviceComponents, setServiceComponents] = useState<ServiceComponent[]>([]);
  const [overallStatus, setOverallStatus] = useState<ComponentStatus>('operational');
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  
  // Load service status
  useEffect(() => {
    const loadStatus = async () => {
      try {
        setLoading(true);
        const statusData = await getServiceStatus();
        
        // Transform components into array
        const components: ServiceComponent[] = Object.entries(statusData.components).map(
          ([key, value]) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
            status: value.status,
            lastUpdated: value.lastUpdated,
            message: value.message,
            estimatedResolution: value.estimatedResolution
          })
        );
        
        // Sort by status severity (outage first, then degraded, then maintenance, then operational)
        const statusOrder: Record<ComponentStatus, number> = {
          outage: 0,
          degraded: 1,
          maintenance: 2,
          operational: 3
        };
        
        components.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        
        setServiceComponents(components);
        setOverallStatus(statusData.overallStatus);
        setLastUpdated(statusData.lastUpdated);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    loadStatus();
    
    // Refresh every 30 seconds
    const intervalId = setInterval(loadStatus, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Get appropriate background color for overall status
  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case 'operational':
        return 'bg-green-100 border-green-200';
      case 'degraded':
        return 'bg-amber-100 border-amber-200';
      case 'outage':
        return 'bg-red-100 border-red-200';
      case 'maintenance':
        return 'bg-blue-100 border-blue-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Clock className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error loading service status: {error.message}</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Overall status banner */}
      <div className={`p-4 rounded-lg border mb-6 ${getOverallStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={statusConfig[overallStatus].color}>
              {React.createElement(statusConfig[overallStatus].icon, { size: 24 })}
            </div>
            <div>
              <h2 className="font-bold text-lg">
                System Status: {statusConfig[overallStatus].label}
              </h2>
              <p className="text-sm text-gray-600">
                All systems are being monitored in real-time
              </p>
            </div>
          </div>
          <button 
            className="px-3 py-1 bg-white border rounded-md text-sm hover:bg-gray-50"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>
      
      {/* Individual components */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Component Status</h3>
        {serviceComponents.map((component, index) => (
          <ServiceStatusItem key={index} component={component} />
        ))}
      </div>
      
      {/* Incident history would go here in a real implementation */}
      <div className="mt-8">
        <h3 className="font-semibold text-lg mb-4">Recent Incidents</h3>
        <p className="text-gray-500 italic">No recent incidents to report.</p>
      </div>
    </div>
  );
};

export default StatusMonitor;
