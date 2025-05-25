import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { useMasterTranslation } from '@/utils/masterTranslation';
import { useNotification } from '@/hooks/useNotification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, MessageSquare, Smartphone, AlertTriangle, Info, FileText, BarChart } from 'lucide-react';

// Define notification category types
type NotificationCategory = 'system' | 'trade' | 'market' | 'compliance';

// Define notification channel types
type NotificationChannel = 'app' | 'email' | 'sms';

// Define notification preference interface
interface NotificationPreference {
  id: string;
  category: NotificationCategory;
  name: string;
  description: string;
  channels: {
    app: boolean;
    email: boolean;
    sms: boolean;
  };
  importance: 'high' | 'medium' | 'low';
}

// Default notification preferences
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

// Map icons to categories
const categoryIcons = {
  system: <Info className="h-5 w-5" />,
  trade: <FileText className="h-5 w-5" />,
  market: <BarChart className="h-5 w-5" />,
  compliance: <AlertTriangle className="h-5 w-5" />,
};

// Map icons to channels
const channelIcons = {
  app: <Bell className="h-5 w-5" />,
  email: <Mail className="h-5 w-5" />,
  sms: <Smartphone className="h-5 w-5" />,
};

const NotificationSettings: React.FC = () => {
  const { t } = useMasterTranslation();
  const { setUserPreferences, getUserPreferences } = useNotification();
  const [preferences, setPreferences] = useState<NotificationPreference[]>(defaultPreferences);
  const [activeTab, setActiveTab] = useState<NotificationCategory>('system');
  const [isDirty, setIsDirty] = useState(false);

  // Load user preferences on component mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const savedPreferences = await getUserPreferences();
        if (savedPreferences) {
          setPreferences(savedPreferences);
        }
      } catch (error) {
        console.error('Failed to load notification preferences', error);
      }
    };

    loadUserPreferences();
  }, [getUserPreferences]);

  // Handle toggling notification channels
  const handleChannelToggle = (prefId: string, channel: NotificationChannel) => {
    const updatedPreferences = preferences.map(pref => {
      if (pref.id === prefId) {
        return {
          ...pref,
          channels: {
            ...pref.channels,
            [channel]: !pref.channels[channel]
          }
        };
      }
      return pref;
    });

    setPreferences(updatedPreferences);
    setIsDirty(true);
  };

  // Handle changing notification importance
  const handleImportanceChange = (prefId: string, importance: 'high' | 'medium' | 'low') => {
    const updatedPreferences = preferences.map(pref => {
      if (pref.id === prefId) {
        return {
          ...pref,
          importance
        };
      }
      return pref;
    });

    setPreferences(updatedPreferences);
    setIsDirty(true);
  };

  // Save changes to notification preferences
  const handleSaveChanges = async () => {
    try {
      await setUserPreferences(preferences);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save notification preferences', error);
    }
  };

  // Filter preferences by active category
  const filteredPreferences = preferences.filter(pref => pref.category === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="mt-2 text-blue-100">
            Manage how and when you receive notifications from TradeNavigator
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose which notifications you want to receive and how you want to receive them
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as NotificationCategory)}>
              <TabsList className="mb-8">
                <TabsTrigger value="system" className="flex items-center gap-2">
                  {categoryIcons.system} System
                </TabsTrigger>
                <TabsTrigger value="trade" className="flex items-center gap-2">
                  {categoryIcons.trade} Trade
                </TabsTrigger>
                <TabsTrigger value="market" className="flex items-center gap-2">
                  {categoryIcons.market} Market
                </TabsTrigger>
                <TabsTrigger value="compliance" className="flex items-center gap-2">
                  {categoryIcons.compliance} Compliance
                </TabsTrigger>
              </TabsList>

              {['system', 'trade', 'market', 'compliance'].map((category) => (
                <TabsContent key={category} value={category} className="space-y-6">
                  {filteredPreferences.map((preference) => (
                    <div 
                      key={preference.id} 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="mb-4 sm:mb-0">
                        <h3 className="font-medium text-gray-900">{preference.name}</h3>
                        <p className="text-sm text-gray-500">{preference.description}</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 sm:items-center w-full sm:w-auto">
                        <div className="flex-1 sm:flex-none">
                          <Select 
                            value={preference.importance} 
                            onValueChange={(value) => handleImportanceChange(preference.id, value as 'high' | 'medium' | 'low')}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Importance" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High Priority</SelectItem>
                              <SelectItem value="medium">Medium Priority</SelectItem>
                              <SelectItem value="low">Low Priority</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex gap-4 mt-4 sm:mt-0">
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id={`${preference.id}-app`} 
                              checked={preference.channels.app}
                              onCheckedChange={() => handleChannelToggle(preference.id, 'app')}
                            />
                            <Label htmlFor={`${preference.id}-app`} className="flex items-center gap-1">
                              {channelIcons.app}
                              <span className="sr-only sm:not-sr-only">App</span>
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id={`${preference.id}-email`} 
                              checked={preference.channels.email}
                              onCheckedChange={() => handleChannelToggle(preference.id, 'email')}
                            />
                            <Label htmlFor={`${preference.id}-email`} className="flex items-center gap-1">
                              {channelIcons.email}
                              <span className="sr-only sm:not-sr-only">Email</span>
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id={`${preference.id}-sms`} 
                              checked={preference.channels.sms}
                              onCheckedChange={() => handleChannelToggle(preference.id, 'sms')}
                            />
                            <Label htmlFor={`${preference.id}-sms`} className="flex items-center gap-1">
                              {channelIcons.sms}
                              <span className="sr-only sm:not-sr-only">SMS</span>
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-8 flex justify-end">
              <Button 
                onClick={handleSaveChanges} 
                disabled={!isDirty}
                className={!isDirty ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationSettings;