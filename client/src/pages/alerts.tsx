import React from 'react';
import { AlertsDashboard } from '../components/alerts/AlertsDashboard';
import PageHeader from '../components/common/PageHeader';

const AlertsPage: React.FC = () => {
  return (
    <div className="container mx-auto">
      <PageHeader 
        title="System Alerts" 
        description="Monitor system performance and view active alerts"
      />
      <AlertsDashboard />
    </div>
  );
};

export default AlertsPage;
