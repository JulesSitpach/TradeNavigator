import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import axios from 'axios';

interface AlertItem {
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

interface AlertsResponse {
  alerts: AlertItem[];
  count: number;
  countBySeverity: {
    info: number;
    warning: number;
    critical: number;
  };
}

export const AlertsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<AlertsResponse | null>(null);
  const [historyAlerts, setHistoryAlerts] = useState<AlertItem[]>([]);
  const [currentTab, setCurrentTab] = useState('active');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        // Fetch active alerts
        const activeResponse = await axios.get('/api/alerts');
        if (activeResponse.data && activeResponse.data.success) {
          setActiveAlerts(activeResponse.data.data);
        } else {
          setError('Failed to fetch active alerts');
        }

        // Fetch alert history
        const historyResponse = await axios.get('/api/alerts/history');
        if (historyResponse.data && historyResponse.data.success) {
          setHistoryAlerts(historyResponse.data.data.alerts);
        }
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError('Error loading alerts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await axios.post(`/api/alerts/${alertId}/acknowledge`);
      if (response.data && response.data.success) {
        // Refresh alerts after acknowledgment
        const activeResponse = await axios.get('/api/alerts');
        if (activeResponse.data && activeResponse.data.success) {
          setActiveAlerts(activeResponse.data.data);
        }
      } else {
        setError('Failed to acknowledge alert');
      }
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      setError('Failed to acknowledge alert. Please try again.');
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge variant="warning" className="bg-amber-500">Warning</Badge>;
      case 'info':
        return <Badge variant="secondary" className="bg-blue-500 text-white">Info</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="destructive">Active</Badge>;
      case 'acknowledged':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Acknowledged</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatDuration = (start: string, end?: string) => {
    if (!end) return 'Ongoing';
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    
    const seconds = Math.floor(durationMs / 1000);
    
    if (seconds < 60) {
      return `${seconds} sec`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} min`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <span className="text-gray-500">Loading alerts...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
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
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Monitor and manage system alerts</CardDescription>
            </div>
            <div className="flex space-x-2">
              {activeAlerts && activeAlerts.countBySeverity.critical > 0 && (
                <Badge variant="destructive" className="flex items-center">
                  {activeAlerts.countBySeverity.critical} Critical
                </Badge>
              )}
              {activeAlerts && activeAlerts.countBySeverity.warning > 0 && (
                <Badge variant="warning" className="bg-amber-500 flex items-center">
                  {activeAlerts.countBySeverity.warning} Warning
                </Badge>
              )}
              {activeAlerts && activeAlerts.count === 0 && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  System Healthy
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" onValueChange={setCurrentTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="active">
                Active Alerts
                {activeAlerts && activeAlerts.count > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {activeAlerts.count}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history">Alert History</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              {activeAlerts && activeAlerts.alerts.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Severity</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Component</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeAlerts.alerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                          <TableCell className="font-medium">{alert.name}</TableCell>
                          <TableCell>{alert.description}</TableCell>
                          <TableCell>{formatDateTime(alert.startTime)}</TableCell>
                          <TableCell>{formatDuration(alert.startTime)}</TableCell>
                          <TableCell>{alert.labels.component || 'Unknown'}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center border rounded-md">
                  <div className="text-green-500 text-4xl mb-4">✓</div>
                  <h3 className="text-xl font-medium mb-2">All Systems Operational</h3>
                  <p className="text-gray-500">No active alerts at this time</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history">
              {historyAlerts.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Severity</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Resolved</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Component</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyAlerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                          <TableCell className="font-medium">{alert.name}</TableCell>
                          <TableCell>{getStatusBadge(alert.status)}</TableCell>
                          <TableCell>{formatDateTime(alert.startTime)}</TableCell>
                          <TableCell>{alert.endTime ? formatDateTime(alert.endTime) : 'N/A'}</TableCell>
                          <TableCell>{formatDuration(alert.startTime, alert.endTime)}</TableCell>
                          <TableCell>{alert.labels.component || 'Unknown'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center border rounded-md">
                  <p className="text-gray-500">No alert history available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="statistics">
              <Card>
                <CardHeader>
                  <CardTitle>Alert Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="border rounded-md p-4 text-center">
                      <div className="text-3xl font-bold text-red-500 mb-2">
                        {activeAlerts?.countBySeverity.critical || 0}
                      </div>
                      <div className="text-sm text-gray-500">Critical Alerts</div>
                    </div>
                    <div className="border rounded-md p-4 text-center">
                      <div className="text-3xl font-bold text-amber-500 mb-2">
                        {activeAlerts?.countBySeverity.warning || 0}
                      </div>
                      <div className="text-sm text-gray-500">Warning Alerts</div>
                    </div>
                    <div className="border rounded-md p-4 text-center">
                      <div className="text-3xl font-bold text-blue-500 mb-2">
                        {activeAlerts?.countBySeverity.info || 0}
                      </div>
                      <div className="text-sm text-gray-500">Info Alerts</div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium mb-4">Alert Categories</h3>
                  {activeAlerts && activeAlerts.count > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(
                        activeAlerts.alerts.reduce((acc, alert) => {
                          const category = alert.labels.category || 'uncategorized';
                          acc[category] = (acc[category] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([category, count]) => (
                        <div key={category} className="flex justify-between items-center p-2 border rounded-md">
                          <span className="capitalize">{category}</span>
                          <Badge>{count}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 border rounded-md">
                      <p className="text-gray-500">No active alerts to categorize</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsDashboard;
