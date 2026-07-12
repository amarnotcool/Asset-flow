import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Reports = () => {
  return (
    <div className="reports-page flex-col">
      <h1 className="page-title">Reports & Analytics</h1>
      
      <div className="flex gap-4 mb-6">
        {/* Mocking charts with CSS */}
        <Card className="flex-1" style={{minHeight: '200px', display: 'flex', flexDirection: 'column'}}>
          <h3 className="mb-4" style={{fontWeight: 600}}>Utilization by department</h3>
          <div className="flex-1 bg-primary-light" style={{borderRadius: '8px', display: 'flex', alignItems: 'flex-end', padding: '1rem', gap: '0.5rem', justifyContent: 'center'}}>
            <div style={{width: '30px', height: '60%', backgroundColor: 'var(--accent-primary)', borderRadius: '2px'}}></div>
            <div style={{width: '30px', height: '90%', backgroundColor: 'var(--accent-primary)', borderRadius: '2px'}}></div>
            <div style={{width: '30px', height: '40%', backgroundColor: 'var(--accent-primary)', borderRadius: '2px'}}></div>
            <div style={{width: '30px', height: '70%', backgroundColor: 'var(--accent-primary)', borderRadius: '2px'}}></div>
          </div>
        </Card>

        <Card className="flex-1" style={{minHeight: '200px', display: 'flex', flexDirection: 'column'}}>
          <h3 className="mb-4" style={{fontWeight: 600}}>Maintenance frequency</h3>
          <div className="flex-1 bg-success-light relative" style={{borderRadius: '8px', overflow: 'hidden'}}>
            <svg viewBox="0 0 100 50" preserveAspectRatio="none" style={{width: '100%', height: '100%'}}>
              <polyline fill="none" stroke="var(--alert-danger)" strokeWidth="2"
                points="0,40 20,45 40,30 60,35 80,10 100,5"/>
            </svg>
          </div>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <Card className="flex-1">
          <h3 className="mb-2" style={{fontWeight: 600}}>Most-used assets</h3>
          <ul className="text-sm text-secondary" style={{listStyle: 'none', lineHeight: 1.6}}>
            <li>Room B2: 30 bookings this month</li>
            <li>Van AF-312: 21 trips this month</li>
            <li>Projector AF-223: 15 uses</li>
          </ul>
        </Card>
        <Card className="flex-1">
          <h3 className="mb-2" style={{fontWeight: 600}}>Idle assets</h3>
          <ul className="text-sm text-secondary" style={{listStyle: 'none', lineHeight: 1.6}}>
            <li>Monitor AF-0251 - unused 120 days</li>
            <li>Chair AF-3410 - unused 45 days</li>
          </ul>
        </Card>
      </div>

      <Card className="mb-6">
        <h3 className="mb-2" style={{fontWeight: 600}}>Assets due for maintenance / nearing retirement</h3>
        <ul className="text-sm text-secondary mb-4" style={{listStyle: 'none', lineHeight: 1.6}}>
          <li>Forklift AF-0097 - service due in 5 days</li>
          <li>Laptop AF-0120 - 4 years old - nearing retirement</li>
        </ul>
        <Button variant="outline">Export reports</Button>
      </Card>
    </div>
  );
};
export default Reports;
