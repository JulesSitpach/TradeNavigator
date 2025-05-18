import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import axios from 'axios';

interface Alert {
  id: string;
  ruleId: string;
  name: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'active' | 'resolved' | 'acknowledged';
  labels: Record<string, string>;
  startTime: string;
  lastUpdated: string;
  endTime?: string;
  value?: string;
}

interface AlertSummary {
  activeCount: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  categories: Record<string, number>;
  recentAlerts: Alert[];
}

export const AlertSummaryWidget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AlertSummary | null>(null);

  useEffect(() => {
    const fetchAlertSummary = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/alerts/summary');
        if (response.data && response.data.success) {
          setSummary(response.data.data);
        } else {
          setError('Failed to fetch alert summary');
        }
      } catch (err) {
        console.error('Error fetching alert summary:', err);
        setError('Error loading alerts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlertSummary();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchAlertSummary, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <span className="text-gray-500">Loading alerts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="text-gray-500">No alert data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>System Alerts</CardTitle>
          <div className="flex space-x-2">
            {summary.activeCount > 0 && (
              <Badge variant="destructive" className="flex items-center">
                {summary.activeCount} Active
              </Badge>
            )}
            {summary.activeCount === 0 && (
              <Badge variant="secondary" className="flex items-center">
                All Clear
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {summary.activeCount > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-2 border rounded-md text-center">
                <div className="text-sm text-gray-500">Critical</div>
                <div className="text-2xl font-bold text-red-500">{summary.criticalCount}</div>
              </div>
              <div className="p-2 border rounded-md text-center">
                <div className="text-sm text-gray-500">Warning</div>
                <div className="text-2xl font-bold text-amber-500">{summary.warningCount}</div>
              </div>
              <div className="p-2 border rounded-md text-center">
                <div className="text-sm text-gray-500">Info</div>
                <div className="text-2xl font-bold text-blue-500">{summary.infoCount}</div>
              </div>
            </div>
            
            {summary.recentAlerts.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Recent Alerts</h4>
                {summary.recentAlerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className="border rounded-md p-2 flex items-start"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 mr-2 ${getSeverityColor(alert.severity)}`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-sm">{alert.name}</div>
                        <Badge 
                          variant={alert.status === 'active' ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{alert.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-400">
                          {new Date(alert.startTime).toLocaleString()}
                        </div>
                        {alert.status === 'active' && (
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" className="text-sm">
                View All Alerts
              </Button>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="text-green-500 text-xl mb-2">✓</div>
            <h3 className="text-lg font-medium mb-1">All Systems Operational</h3>
            <p className="text-sm text-gray-500">No active alerts at this time</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertSummaryWidget;
