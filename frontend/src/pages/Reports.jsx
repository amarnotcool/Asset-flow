import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Reports = () => {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>
      
      <div className="flex gap-4 mb-6">
        {/* Mocking charts with CSS */}
        <Card className="flex-1 min-h-[200px] flex flex-col p-6">
          <h3 className="font-semibold text-lg mb-4">Utilization by department</h3>
          <div className="flex-1 bg-[#e0f2fe] rounded-lg flex items-end justify-center p-4 gap-2">
            <div className="w-[30px] h-[60%] bg-accent-primary rounded-sm"></div>
            <div className="w-[30px] h-[90%] bg-accent-primary rounded-sm"></div>
            <div className="w-[30px] h-[40%] bg-accent-primary rounded-sm"></div>
            <div className="w-[30px] h-[70%] bg-accent-primary rounded-sm"></div>
          </div>
        </Card>

        <Card className="flex-1 min-h-[200px] flex flex-col p-6">
          <h3 className="font-semibold text-lg mb-4">Maintenance frequency</h3>
          <div className="flex-1 bg-alert-success-bg relative rounded-lg overflow-hidden">
            <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full">
              <polyline fill="none" stroke="var(--color-alert-danger)" strokeWidth="2"
                points="0,40 20,45 40,30 60,35 80,10 100,5"/>
            </svg>
          </div>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <Card className="flex-1">
          <h3 className="font-semibold text-lg mb-2">Most-used assets</h3>
          <ul className="text-sm text-text-secondary list-none leading-relaxed">
            <li>Room B2: 30 bookings this month</li>
            <li>Van AF-312: 21 trips this month</li>
            <li>Projector AF-223: 15 uses</li>
          </ul>
        </Card>
        <Card className="flex-1">
          <h3 className="font-semibold text-lg mb-2">Idle assets</h3>
          <ul className="text-sm text-text-secondary list-none leading-relaxed">
            <li>Monitor AF-0251 - unused 120 days</li>
            <li>Chair AF-3410 - unused 45 days</li>
          </ul>
        </Card>
      </div>

      <Card className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Assets due for maintenance / nearing retirement</h3>
        <ul className="text-sm text-text-secondary list-none leading-relaxed mb-4">
          <li>Forklift AF-0097 - service due in 5 days</li>
          <li>Laptop AF-0120 - 4 years old - nearing retirement</li>
        </ul>
        <Button variant="outline">Export reports</Button>
      </Card>
    </div>
  );
};
export default Reports;
