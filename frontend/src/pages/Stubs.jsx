import React from 'react';
import Card from '../components/ui/Card';

export const Audit = () => (
  <div>
    <h1 className="page-title mb-4">Audits</h1>
    <Card><p>Audit Cycles list and discrepancy reports will be built here.</p></Card>
  </div>
);

export const Reports = () => (
  <div>
    <h1 className="page-title mb-4">Reports & Analytics</h1>
    <Card><p>Pie charts and asset utilization graphs will be rendered here.</p></Card>
  </div>
);

export const Notifications = () => (
  <div>
    <h1 className="page-title mb-4">Activity Logs & Notifications</h1>
    <Card><p>System-wide audit trail and real-time alerts.</p></Card>
  </div>
);
